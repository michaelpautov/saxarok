import { config } from 'dotenv';
import type { EnvConfig } from '../types/index.js';

// Load .env file
config();

const REQUIRED_ENV_VARS = ['TELEGRAM_BOT_TOKEN', 'GEMINI_API_KEY', 'WEBHOOK_DOMAIN'] as const;

export function validateEnv(): EnvConfig {
  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }

  // Parse PORT with default
  const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3000;
  if (isNaN(port)) {
    throw new Error('PORT must be a valid number');
  }

  // Parse NODE_ENV with default
  const nodeEnv = process.env['NODE_ENV'] === 'production' ? 'production' : 'development';

  // Parse optional numbers
  const maxContextMessages = process.env['MAX_CONTEXT_MESSAGES']
    ? parseInt(process.env['MAX_CONTEXT_MESSAGES'], 10)
    : 20;

  const maxStoredMessages = process.env['MAX_STORED_MESSAGES']
    ? parseInt(process.env['MAX_STORED_MESSAGES'], 10)
    : 100;

  return {
    TELEGRAM_BOT_TOKEN: process.env['TELEGRAM_BOT_TOKEN']!,
    GEMINI_API_KEY: process.env['GEMINI_API_KEY']!,
    GOOGLE_CLOUD_API_KEY: process.env['GOOGLE_CLOUD_API_KEY'] || process.env['GEMINI_API_KEY']!,
    PORT: port,
    NODE_ENV: nodeEnv,
    WEBHOOK_DOMAIN: process.env['WEBHOOK_DOMAIN']!,
    LOG_LEVEL: (process.env['LOG_LEVEL'] as EnvConfig['LOG_LEVEL']) || 'info',
    MAX_CONTEXT_MESSAGES: maxContextMessages,
    MAX_STORED_MESSAGES: maxStoredMessages,
  };
}

export const env = validateEnv();
