import { Bot } from 'grammy';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';
import {
  handleMessage,
  handleVoiceMessage,
  handleStart,
  handleClear,
  handleHelp,
} from './handlers.js';

const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

// Register command handlers
bot.command('start', handleStart);
bot.command('clear', handleClear);
bot.command('help', handleHelp);

// Register message handlers
bot.on('message:text', handleMessage);
bot.on('message:voice', handleVoiceMessage);

// Error handler
bot.catch((err) => {
  console.error('Bot error:', err);
});

/**
 * Sets up the Telegram bot webhook with Fastify
 */
export async function setupBotWebhook(server: FastifyInstance): Promise<void> {
  const webhookPath = '/telegram/webhook';
  const webhookUrl = `${env.WEBHOOK_DOMAIN}${webhookPath}`;

  // Initialize bot before setting up webhook handler
  await bot.init();

  // Register webhook endpoint with custom handler
  // Returns 200 immediately to prevent Telegram retries
  server.post(webhookPath, async (request, reply) => {
    // Send immediate response to Telegram to prevent timeout retries
    reply.code(200).send('OK');

    // Process update asynchronously in background
    bot.handleUpdate(request.body as any).catch((error) => {
      console.error('Error processing webhook update:', error);
    });
  });

  // Set webhook
  await bot.api.setWebhook(webhookUrl, {
    drop_pending_updates: true,
  });

  console.log(`Bot webhook set to: ${webhookUrl}`);
}

/**
 * Starts the bot in polling mode (for development)
 */
export async function startBotPolling(): Promise<void> {
  await bot.api.deleteWebhook();
  bot.start({
    onStart: () => {
      console.log('Bot started in polling mode');
    },
  });
}

export { bot };
