# Saxarok - AI Tutor for Salon Depilation

Telegram bot with AI-powered training assistant for salon depilation specialists, featuring a web dashboard for prompt management and conversation history viewing.

## Features

- 🤖 **AI-Powered Bot**: Telegram bot using Google Gemini API for conversational AI
- 💬 **Conversation History**: Maintains context across conversations
- 🎛️ **Prompt Management**: Web dashboard to create, edit, and switch prompts
- 📊 **Dialog Viewer**: View all user conversations with timestamps
- 📁 **File-Based Storage**: Simple JSON file storage (no database required)
- 🚀 **Railway Deployment**: One-click deploy to Railway with persistent storage

## Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js 22 LTS
- **Web Framework**: Fastify 5+
- **Telegram Bot**: grammy.js
- **AI**: Google Gemini (Generative Language API)
- **Storage**: JSON files
- **Deployment**: Railway

## Prerequisites

- Node.js 22 or higher
- pnpm package manager
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Gemini API Key (from [Google Cloud Console](https://console.cloud.google.com))

## Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd saxarok
   pnpm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in:
   - `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
   - `GEMINI_API_KEY` - Your Gemini API key
   - `WEBHOOK_DOMAIN` - Your Railway app domain (for production)

3. **Build the project**:
   ```bash
   pnpm run build
   ```

## Development

Run in development mode with hot reload:

```bash
pnpm run dev
```

The server will start on `http://localhost:3000`

### Local Testing with Telegram

For local development, use long polling instead of webhooks:
1. Comment out webhook setup in `src/bot/index.ts`
2. Use `bot.start()` for polling mode
3. Test your bot in Telegram

## Deployment

### Railway Deployment

1. **Create a Railway project**:
   - Go to [Railway.app](https://railway.app)
   - Create new project from GitHub repo

2. **Add environment variables** in Railway dashboard:
   - `TELEGRAM_BOT_TOKEN`
   - `GEMINI_API_KEY`
   - `NODE_ENV=production`
   - `WEBHOOK_DOMAIN` (your Railway app domain)

3. **Add persistent volume**:
   - Go to your service settings
   - Add volume: mount path `/data`
   - This persists prompts and conversation history

4. **Deploy**:
   - Railway auto-deploys on git push
   - Set webhook: `https://your-app.up.railway.app/webhook/telegram`

## Project Structure

```
saxarok/
├── src/
│   ├── bot/              # Telegram bot logic
│   │   ├── index.ts      # Bot setup & webhook
│   │   └── handlers.ts   # Message handlers
│   ├── server/           # Fastify server & routes
│   │   ├── index.ts      # Server setup
│   │   └── routes/       # API routes
│   │       ├── prompts.ts   # Prompt management
│   │       └── dialogs.ts   # Dialog history
│   ├── services/         # Business logic
│   │   ├── storage.ts    # File operations
│   │   └── gemini.ts     # AI chat service
│   ├── types/            # TypeScript types
│   ├── config/           # Configuration
│   │   └── env.ts        # Environment validation
│   └── index.ts          # Entry point
├── data/                 # File storage (gitignored)
│   ├── prompts/          # Prompt configurations
│   └── dialogs/          # Conversation histories
├── public/               # Static web UI
│   ├── index.html        # Dashboard
│   ├── css/              # Styles
│   └── js/               # Frontend logic
└── dist/                 # Compiled JavaScript
```

## API Endpoints

### Prompt Management
- `GET /api/prompts` - List all prompts with active ID
- `GET /api/prompts/:id` - Get single prompt
- `POST /api/prompts` - Create new prompt
- `PUT /api/prompts/:id` - Update prompt
- `DELETE /api/prompts/:id` - Delete prompt
- `POST /api/prompts/:id/activate` - Set as active prompt

### Dialog History
- `GET /api/dialogs/users` - List all users with message counts
- `GET /api/dialogs/:userId` - Get user conversation history
- `GET /api/dialogs/stats` - Get platform statistics

### Web UI
- `GET /` - Admin dashboard (prompts, dialogs, stats)
- `GET /health` - Health check endpoint

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TELEGRAM_BOT_TOKEN` | Yes | - | Telegram bot token |
| `GEMINI_API_KEY` | Yes | - | Gemini API key |
| `WEBHOOK_DOMAIN` | Yes | - | Railway app domain |
| `PORT` | No | 3000 | HTTP server port |
| `NODE_ENV` | No | development | Environment mode |
| `LOG_LEVEL` | No | info | Logging verbosity |
| `MAX_CONTEXT_MESSAGES` | No | 20 | Messages sent to AI |
| `MAX_STORED_MESSAGES` | No | 100 | Total stored per user |

## Configuration

### Prompt Management
1. Access web dashboard: `https://your-app.up.railway.app`
2. Create your training prompt
3. Set it as active
4. Bot will use this prompt for all conversations

### Context Management
- Bot maintains last 20 messages for AI context
- Full history stored up to 100 messages
- Automatic cleanup of old messages

## Development Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Compile TypeScript
- `pnpm run start` - Start production server
- `pnpm run lint` - Lint code
- `pnpm run format` - Format code

## Troubleshooting

### Bot not responding
- Check Railway logs for errors
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Ensure webhook is properly set

### Gemini API errors
- Check `GEMINI_API_KEY` is valid
- Verify GCP billing is active
- Check API quota in GCP Console

### Conversation not saving
- Check `/data` volume is mounted
- Verify write permissions
- Check Railway logs for file errors

## Cost Estimation

### Gemini API (50 users × 30 min/day)
- ~3,000 requests/day
- Input: ~500 tokens/request
- Output: ~200 tokens/request
- **Estimated**: $3-5/month

### Railway
- Free tier: 500 hours/month
- Beyond free: ~$5/month
- Storage: 1GB included

**Total**: ~$8-10/month

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
