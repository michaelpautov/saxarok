# Technical Stack

## Core Technologies

- **Application Framework:** Fastify 5.2.0
- **Language:** TypeScript 5.7+
- **Runtime:** Node.js 22 LTS
- **Module System:** ES Modules (ESM)
- **Package Manager:** pnpm 9.0+

## Bot & AI

- **Telegram Bot Framework:** grammy 1.38+
- **AI Platform:** Google Gemini (Generative Language API - GCP Paid Tier)
- **AI SDK:** @google/genai 0.3+
- **AI Model:** gemini-2.0-flash
- **Context Management:** Chat Sessions with automatic history

## Web Framework & Plugins

- **Web Server:** Fastify 5.2+
- **Static Files:** @fastify/static 8.0+
- **CORS:** @fastify/cors 10.0+
- **Security:** @fastify/helmet 12.0+
- **Rate Limiting:** @fastify/rate-limit 10.1+
- **Compression:** @fastify/compress 8.0+
- **HTTP Errors:** @fastify/sensible 6.0+
- **Cookies:** @fastify/cookie 11.0+

## Data Storage

- **Database System:** n/a (file-based)
- **Storage Format:** JSON files
- **Storage Location:** /data directory (persistent volume)
- **File Structure:**
  - /data/prompts/list.json - All prompts
  - /data/prompts/active.json - Active prompt ID
  - /data/dialogs/user-*.json - Per-user conversation history

## Frontend

- **JavaScript Framework:** Vanilla JavaScript (no framework)
- **CSS Framework:** Custom CSS
- **UI Components:** Native HTML elements
- **Font Provider:** System fonts
- **Icon Library:** n/a

## Deployment & Hosting

- **Application Hosting:** Railway
- **Hosting Region:** Auto-assigned by Railway
- **Database Hosting:** n/a
- **Asset Hosting:** Railway (served via @fastify/static)
- **CDN:** Railway Edge Network
- **Deployment Solution:** Git push to Railway
- **CI/CD:** Automatic Railway deployment on push

## Development Tools

- **Build Tool:** TypeScript Compiler (tsc)
- **Dev Server:** tsx (watch mode)
- **Code Quality:** ESLint + Prettier
- **Type Checking:** TypeScript strict mode
- **Testing:** n/a (manual testing)

## Repository

- **Code Repository URL:** [To be added]
- **Version Control:** Git
- **Branch Strategy:** main (production), development (staging)

## Environment Configuration

### Required Variables
- `TELEGRAM_BOT_TOKEN` - From @BotFather
- `GEMINI_API_KEY` - From GCP Console (Generative Language API)
- `WEBHOOK_DOMAIN` - Railway app domain
- `PORT` - Auto-assigned by Railway (3000 local)
- `NODE_ENV` - production/development

### Optional Variables
- `LOG_LEVEL` - info (default)
- `MAX_CONTEXT_MESSAGES` - 20 (default)
- `MAX_STORED_MESSAGES` - 100 (default)

## Architecture Notes

### Telegram Integration
- **Mode:** Webhook (production) / Polling (development)
- **Webhook URL:** https://{WEBHOOK_DOMAIN}/webhook/telegram
- **Message Handler:** grammy.js middleware pipeline

### AI Integration
- **Authentication:** API Key (GCP)
- **Context Strategy:** Last 20 messages sent to API, full history stored locally
- **Cost Optimization:** gemini-2.0-flash model, limited context window
- **Session Management:** In-memory cache of active chat sessions

### File Storage Strategy
- **Concurrency:** Single-process writes (Railway single instance)
- **Backup:** Railway persistent volume snapshots
- **Cleanup:** Automatic rolling window (last 100 messages per user)
- **Migration:** Ready to migrate to PostgreSQL if > 100 users

### Web Dashboard
- **API Routes:** RESTful JSON endpoints
- **Static Routes:** HTML pages served via Fastify
- **Authentication:** None (v1.0) - to be added in v2.0
- **Session Management:** None required

## Performance Targets

- **Bot Response Time:** < 5 seconds (depends on Gemini API)
- **Web Dashboard Load:** < 2 seconds
- **Concurrent Users:** 50+ simultaneous users
- **Uptime:** > 99% (Railway reliability)

## Cost Estimate

- **Railway:** ~$5/month (beyond free tier)
- **Gemini API:** ~$3-5/month (50 users × 30 min/day)
- **Total:** ~$8-10/month
