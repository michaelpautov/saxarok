# Tech Stack

## Context

Global tech stack defaults for Agent OS projects, overridable in project-specific `.agent-os/product/tech-stack.md`.

## Core Stack

- **Language**: TypeScript
- **Runtime**: Node.js 22 LTS
- **Web Framework**: Fastify 5+
- **Telegram Bot Framework**: grammy.js (TypeScript-native)
- **AI Platform**: Google Gemini via Vertex AI
- **Storage**: File-based (JSON files)
- **Package Manager**: pnpm
- **Import Strategy**: ES6 modules (ESM)

## Fastify Ecosystem

- **Plugin System**: fastify-plugin for encapsulation
- **Static Files**: @fastify/static
- **CORS**: @fastify/cors
- **Rate Limiting**: @fastify/rate-limit
- **Helmet**: @fastify/helmet (security headers)
- **Sensible**: @fastify/sensible (useful defaults)
- **Environment**: @fastify/env (environment variables)
- **Cookie Support**: @fastify/cookie

## Telegram Bot

- **Framework**: grammy.js (latest stable)
- **Session Management**: @grammyjs/storage-file or in-memory
- **Conversations**: @grammyjs/conversations (for multi-step dialogs)
- **Router**: Built-in grammy router
- **Rate Limiting**: @grammyjs/ratelimiter
- **Webhook Mode**: Preferred over polling for production

## AI & Machine Learning

- **AI SDK**: @google/genai (Google Gen AI JavaScript SDK)
- **Platform**: Generative Language API (Google Cloud Platform - Paid Tier)
- **Authentication**: API Key (from Google Cloud Console)
- **Models**: gemini-2.0-flash (recommended for cost/performance)
- **Context Management**: Chat Sessions with automatic history management
- **Features**: Streaming responses, function calling, multimodal support, conversation history
- **Pricing**: Pay-per-token (no rate limits)

## File Storage

- **Format**: JSON files
- **Location**: `/data` directory (persistent volume on Railway)
- **Structure**:
  - `/data/prompts/` - AI prompts configuration
  - `/data/dialogs/` - Per-user conversation history
- **Operations**: Node.js fs/promises API
- **Concurrency**: File locking for write operations
- **Cleanup**: Automatic rolling window (last 10-20 messages per user for AI context)

## Deployment

- **Platform**: Railway
- **Runtime Environment**: Node.js container
- **Persistent Storage**: Railway Volume mounted at `/data`
- **HTTPS**: Automatic via Railway
- **Environment Variables**: Railway dashboard or railway.json
- **Webhook Domain**: Railway-provided HTTPS URL

## Development Tools

- **Build Tool**: tsc (TypeScript compiler)
- **Package Scripts**: npm scripts for start/dev/build
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode
- **Testing**: Vitest (optional)

## Environment Configuration

**Required Environment Variables:**
- `TELEGRAM_BOT_TOKEN` - Telegram Bot API token (from @BotFather)
- `GEMINI_API_KEY` - Generative Language API key (from GCP Console)
- `PORT` - HTTP server port (Railway auto-assigns)
- `NODE_ENV` - production/development
- `WEBHOOK_DOMAIN` - Railway app domain for Telegram webhook

**Optional Environment Variables:**
- `LOG_LEVEL` - Logging verbosity (info/debug/warn/error)
- `MAX_CONTEXT_MESSAGES` - Messages sent to AI for context (default: 20)
- `MAX_STORED_MESSAGES` - Total messages stored per user (default: 100)
- `RATE_LIMIT_MAX` - Max requests per window
- `RATE_LIMIT_WINDOW` - Rate limit time window

## File Structure

```
project/
├── src/
│   ├── bot/
│   │   ├── index.ts              # Bot initialization
│   │   ├── handlers.ts           # Message handlers
│   │   └── middleware.ts         # Bot middleware
│   ├── web/
│   │   ├── server.ts             # Fastify server
│   │   ├── routes/
│   │   │   ├── prompts.ts        # Prompt management API
│   │   │   └── dialogs.ts        # Dialog history API
│   │   └── views/
│   │       ├── index.html        # Web UI
│   │       └── dialogs.html
│   ├── services/
│   │   ├── gemini.ts             # Gemini API client
│   │   ├── storage.ts            # File operations
│   │   └── prompt-manager.ts    # Prompt selection
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   └── index.ts                  # Main entry point
├── data/                         # Persistent storage (gitignore)
│   ├── prompts/
│   │   ├── active.json
│   │   └── list.json
│   └── dialogs/
│       └── user-*.json
├── public/                       # Static assets
├── package.json
├── tsconfig.json
└── railway.json                  # Railway configuration
```

## Version Requirements

- **Node.js**: >= 22.0.0 LTS
- **TypeScript**: >= 5.0
- **Fastify**: >= 5.0
- **grammy**: Latest stable
- **@google/genai**: Latest stable

## Production Considerations

- Enable persistent volume in Railway for `/data`
- Use webhook mode for Telegram (not polling)
- Implement proper error handling and logging
- Limit context messages to 10-20 for cost optimization
- Monitor API usage in GCP Console
- Set up billing alerts in GCP
- Use environment variables for all secrets
- Enable CORS only for trusted origins
- Implement rate limiting on web endpoints
- Monitor file storage usage
- Set up graceful shutdown handlers
- Cache active chat sessions in memory for performance
