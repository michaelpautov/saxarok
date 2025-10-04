import { startServer } from './server/index.js';
import { startBotPolling } from './bot/index.js';
import { env } from './config/env.js';

async function main() {
  console.log('Starting AI Tutor Bot...');
  console.log(`Environment: ${env.NODE_ENV}`);

  // Start web server
  await startServer();

  // Start bot in polling mode for development
  if (env.NODE_ENV === 'development') {
    console.log('Starting bot in polling mode (development)');
    await startBotPolling();
  } else {
    console.log('Bot running in webhook mode (production)');
  }

  console.log('AI Tutor Bot is ready!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
