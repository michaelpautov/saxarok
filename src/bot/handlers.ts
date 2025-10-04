import type { Context } from 'grammy';
import { geminiService } from '../services/gemini.js';
import { loadPrompts, getActivePromptId } from '../services/storage.js';

/**
 * Splits long messages into chunks for Telegram
 */
function splitMessage(text: string, maxLength = 4000): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  let currentChunk = '';
  const lines = text.split('\n');

  for (const line of lines) {
    if (currentChunk.length + line.length + 1 > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      // If single line is too long, split it
      if (line.length > maxLength) {
        for (let i = 0; i < line.length; i += maxLength) {
          chunks.push(line.slice(i, i + maxLength));
        }
      } else {
        currentChunk = line;
      }
    } else {
      currentChunk += (currentChunk ? '\n' : '') + line;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * Delays execution for specified milliseconds
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Handles incoming text messages from users
 */
export async function handleMessage(ctx: Context): Promise<void> {
  if (!ctx.message?.text || !ctx.from) {
    return;
  }

  const userId = ctx.from.id.toString();
  const username = ctx.from.username || ctx.from.first_name || 'User';
  const userMessage = ctx.message.text;

  try {
    // Get active prompt
    const activePromptId = await getActivePromptId();
    if (!activePromptId) {
      await ctx.reply('⚠️ No active prompt configured. Please contact administrator.', {
        parse_mode: 'HTML',
      });
      return;
    }

    const prompts = await loadPrompts();
    const activePrompt = prompts.find((p) => p.id === activePromptId);

    if (!activePrompt) {
      await ctx.reply('⚠️ Active prompt not found. Please contact administrator.', {
        parse_mode: 'HTML',
      });
      return;
    }

    // Show typing indicator
    await ctx.replyWithChatAction('typing');

    // Get AI response
    let response = await geminiService.sendMessage(
      userId,
      username,
      userMessage,
      activePrompt.content
    );

    // Detect if AI generated multiple messages (separated by double newlines)
    // and send only the FIRST one to prevent monologue
    const messageSeparators = response.split(/\n\n(?=👋|🤔|💡|⚠️|✅|❌|❓)/);
    if (messageSeparators.length > 1) {
      // Multiple logical messages detected - send only first one
      response = messageSeparators[0]!.trim();
      console.log(
        `[WARNING] AI generated ${messageSeparators.length} messages. Sending only first one.`
      );
    }

    // Split long messages and send with HTML formatting
    const messageParts = splitMessage(response);

    for (let i = 0; i < messageParts.length; i++) {
      const part = messageParts[i];
      if (part) {
        await ctx.reply(part, { parse_mode: 'HTML' });

        // Small delay between parts to avoid rate limiting
        if (i < messageParts.length - 1) {
          await delay(1000);
        }
      }
    }
  } catch (error) {
    console.error('Error handling message:', error);
    await ctx.reply('❌ Sorry, an error occurred processing your message. Please try again.', {
      parse_mode: 'HTML',
    });
  }
}

/**
 * Handles /start command
 */
export async function handleStart(ctx: Context): Promise<void> {
  const username = ctx.from?.first_name || 'there';
  await ctx.reply(
    `👋 Hello ${username}!\n\n` +
      `I'm your AI tutor for depilation techniques. Ask me anything about:\n` +
      `• Waxing methods\n` +
      `• Sugaring techniques\n` +
      `• Skin preparation\n` +
      `• Client care\n` +
      `• Product recommendations\n\n` +
      `Just send me your question!`,
    { parse_mode: 'HTML' }
  );
}

/**
 * Handles /clear command to reset conversation history
 */
export async function handleClear(ctx: Context): Promise<void> {
  if (!ctx.from) return;

  const userId = ctx.from.id.toString();

  try {
    await geminiService.clearHistory(userId);
    await ctx.reply("✅ Your conversation history has been cleared. Let's start fresh!", {
      parse_mode: 'HTML',
    });
  } catch (error) {
    console.error('Error clearing history:', error);
    await ctx.reply('❌ Failed to clear history. Please try again.', {
      parse_mode: 'HTML',
    });
  }
}

/**
 * Handles /help command
 */
export async function handleHelp(ctx: Context): Promise<void> {
  await ctx.reply(
    `🆘 Available Commands:\n\n` +
      `/start - Welcome message and introduction\n` +
      `/clear - Clear your conversation history\n` +
      `/help - Show this help message\n\n` +
      `Just send me any question to get started!`,
    { parse_mode: 'HTML' }
  );
}
