import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyCompress from '@fastify/compress';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySensible from '@fastify/sensible';
import { join } from 'node:path';
import { env } from '../config/env.js';
import { setupBotWebhook } from '../bot/index.js';
import { registerPromptRoutes } from './routes/prompts.js';
import { registerDialogRoutes } from './routes/dialogs.js';

export async function createServer() {
  const server = Fastify({
    logger: {
      level: env.LOG_LEVEL || 'info',
      transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
    },
  });

  // Security & Performance plugins
  await server.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  await server.register(fastifyCors, {
    origin: env.NODE_ENV === 'production' ? env.WEBHOOK_DOMAIN : true,
  });

  await server.register(fastifyCompress);
  await server.register(fastifySensible);

  await server.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Static files - serve React build
  const clientDistPath = join(process.cwd(), 'client', 'dist');
  await server.register(fastifyStatic, {
    root: clientDistPath,
    prefix: '/',
  });

  // API Routes
  await server.register(registerPromptRoutes, { prefix: '/api' });
  await server.register(registerDialogRoutes, { prefix: '/api' });

  // Health check
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Setup Telegram webhook
  if (env.NODE_ENV === 'production') {
    await setupBotWebhook(server);
  }

  return server;
}

export async function startServer() {
  const server = await createServer();

  try {
    await server.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    console.log(`Server listening on port ${env.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}
