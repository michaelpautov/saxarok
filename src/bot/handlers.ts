import type { Context } from 'grammy';
import { geminiService } from '../services/gemini.js';
import { speechService } from '../services/speech.js';
import { loadPrompts, getActivePromptId } from '../services/storage.js';
import { env } from '../config/env.js';

// Track messages currently being processed to avoid duplicates from Telegram retries
const processingMessages = new Set<number>();

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

  const messageId = ctx.message.message_id;

  // Check if this message is already being processed (duplicate webhook)
  if (processingMessages.has(messageId)) {
    console.log(`[DUPLICATE] Message ${messageId} already being processed, ignoring`);
    return;
  }

  // Mark message as being processed
  processingMessages.add(messageId);

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

    // DEBUG: Log full response from Gemini
    console.log('=== GEMINI RESPONSE ===');
    console.log('Length:', response.length);
    console.log('Content:', response);
    console.log('======================');

    // TEMPORARILY DISABLED: Detect if AI generated multiple messages
    // const messageSeparators = response.split(/\n\n(?=👋|🤔|💡|⚠️|✅|❌|❓)/);
    // if (messageSeparators.length > 1) {
    //   response = messageSeparators[0]!.trim();
    //   console.log(
    //     `[WARNING] AI generated ${messageSeparators.length} messages. Sending only first one.`
    //   );
    // }

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
  } finally {
    // Remove from processing set when done
    processingMessages.delete(messageId);
  }
}

/**
 * Handles /start command
 */
export async function handleStart(ctx: Context): Promise<void> {
  await ctx.reply(
    `👋 Здравствуйте! Я ваш личный тьютор по сервису и коммуникации для мастеров шугаринга.\n\n` +
      `🎯 Чем могу помочь:\n` +
      `🔸 Научу общаться с Гостьями\n` +
      `🔸 Покажу, как создать комфортную атмосферу\n` +
      `🔸 Помогу выстроить профессиональные границы\n` +
      `🔸 Расскажу о консультировании по уходу за кожей\n\n` +
      `💬 Задавайте любые вопросы - начнем обучение!\n\n` +
      `✨ Тренер по Сервису — цель обучения: сделать сервис мастера ТОП-уровня, чтобы каждая Гостья при общении получала ВАУ-эффект и хотела вернуться именно к этому мастеру.\n\n` +
      `📌 Режимы использования Тренера:\n\n` +
      `🪜 Пошаговое обучение сервису — Тренер будет вести Вас шаг за шагом: от простого к сложному (напишите - Обучи меня сервису пошагало).\n\n` +
      `💬 Вопросы по ситуациям — можно задавать любые вопросы о работе с Гостьями или по процедуре шугаринга (пишите простыми словами).\n\n` +
      `⚡ Важно:\n\n` +
      `Тренер понимает только текст ✍️\n` +
      `Пишите всё в одном сообщении\n` +
      `После отправки нужно немного подождать ⏳ — Тренер сформирует ответ.\n\n` +
      `👤 Напишите Ваше имя и Филиал.`,
    { parse_mode: 'HTML' }
  );
}

/**
 * Handles incoming voice messages from users
 */
export async function handleVoiceMessage(ctx: Context): Promise<void> {
  if (!ctx.message?.voice || !ctx.from) {
    return;
  }

  const messageId = ctx.message.message_id;

  // Check if this message is already being processed (duplicate webhook)
  if (processingMessages.has(messageId)) {
    console.log(`[DUPLICATE] Voice message ${messageId} already being processed, ignoring`);
    return;
  }

  // Mark message as being processed
  processingMessages.add(messageId);

  const userId = ctx.from.id.toString();
  const username = ctx.from.username || ctx.from.first_name || 'User';

  try {
    console.log('[VOICE] Received voice message from user:', username);
    console.log('[VOICE] Duration:', ctx.message.voice.duration, 'seconds');

    // Show typing indicator
    await ctx.replyWithChatAction('typing');

    // Step 1: Download audio file from Telegram
    console.log('[VOICE] Downloading audio from Telegram...');
    const file = await ctx.getFile();
    const fileUrl = `https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.statusText}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    console.log('[VOICE] Audio downloaded, size:', audioBuffer.length, 'bytes');

    // Step 2: Transcribe audio using Google Speech-to-Text
    console.log('[VOICE] Transcribing audio...');
    await ctx.replyWithChatAction('typing'); // Keep typing indicator active

    const transcribedText = await speechService.transcribeAudio(
      audioBuffer,
      ctx.message.voice.mime_type || 'audio/ogg'
    );

    console.log('[VOICE] Transcription successful:', transcribedText);

    // Step 3: Get active prompt
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

    // Step 4: Process transcribed text with Gemini AI
    console.log('[VOICE] Processing with Gemini AI...');
    await ctx.replyWithChatAction('typing');

    const aiResponse = await geminiService.sendMessage(
      userId,
      username,
      transcribedText,
      activePrompt.content
    );

    console.log('[VOICE] AI response received, length:', aiResponse.length);

    // Step 5: Send response to user
    const messageParts = splitMessage(aiResponse);

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

    console.log('[VOICE] Voice message processing completed successfully');
  } catch (error) {
    console.error('[VOICE] Error handling voice message:', error);
    await ctx.reply(
      '❌ Не удалось обработать голосовое сообщение. Пожалуйста, попробуйте ещё раз или отправьте текстовое сообщение.',
      {
        parse_mode: 'HTML',
      }
    );
  } finally {
    // Remove from processing set when done
    processingMessages.delete(messageId);
  }
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
