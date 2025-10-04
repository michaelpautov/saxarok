import { Bot, webhookCallback } from 'grammy';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';
import { handleMessage, handleStart, handleClear, handleHelp } from './handlers.js';

const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

// Register command handlers
bot.command('start', handleStart);
bot.command('clear', handleClear);
bot.command('help', handleHelp);

// Register message handler
bot.on('message:text', handleMessage);

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

  // Register webhook endpoint
  server.post(webhookPath, webhookCallback(bot, 'fastify'));

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
