# Product Specification: Salon Depilation AI Tutor

## Product Overview

**Name**: Salon Depilation AI Tutor  
**Type**: Telegram Bot with Web Dashboard  
**Version**: 1.0.0  
**Target**: Employee training and support for depilation salon

## Target Users

**Primary Users**: Salon depilation specialists and staff  
**Usage Pattern**: ~30 minutes per day  
**Use Cases**:
- Learning depilation techniques and best practices
- Getting answers to procedural questions
- Training on client interaction
- Product knowledge and recommendations
- Safety and hygiene protocols

## Core Features

### 1. AI-Powered Telegram Bot
- **Integration**: Telegram Bot API via grammy.js
- **AI Engine**: Google Gemini (Generative Language API)
- **Context**: Maintains conversation history per user
- **Response Type**: Text-based conversational responses
- **Delivery**: Webhook-based (Railway HTTPS endpoint)

### 2. Conversation History Management
- **Storage**: File-based JSON per user
- **Retention**: Full history stored, last 10-20 messages sent to AI
- **Location**: `/data/dialogs/user-{telegram_id}.json`
- **Format**: Gemini-compatible Content[] structure with role/parts

### 3. Web Dashboard - Prompt Management
- **URL**: Railway-provided HTTPS domain
- **Features**:
  - View all available prompts
  - Create new prompt
  - Edit existing prompt
  - Delete prompt
  - Select active prompt (used by bot)
  - Visual indicator of currently active prompt
- **Access**: Simple authentication (optional)

### 4. Web Dashboard - Dialog History Viewer
- **Features**:
  - List all users who interacted with bot
  - Select user to view their conversation
  - Display full conversation history
  - Show timestamps
  - Show which prompt was active during conversation
- **Search**: Basic text search within conversations (optional)

## Technical Architecture

### Technology Stack

**Backend:**
- Runtime: Node.js 22 LTS
- Language: TypeScript (strict mode)
- Web Framework: Fastify 5+
- Telegram Bot: grammy.js
- AI SDK: @google/genai

**Storage:**
- Format: JSON files
- Location: `/data` directory (Railway persistent volume)
- Structure:
  - `/data/prompts/list.json` - All prompts
  - `/data/prompts/active.json` - Active prompt ID
  - `/data/dialogs/user-*.json` - Per-user conversation history

**Deployment:**
- Platform: Railway
- HTTPS: Automatic via Railway domain
- Environment: Production Node.js container
- Persistent Volume: Mounted at `/data`

**Development:**
- Package Manager: pnpm
- Module System: ES6 (ESM)
- Linter: ESLint
- Formatter: Prettier

### System Architecture

```
┌─────────────────┐
│  Telegram User  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│         Railway Server (Fastify)         │
│  ┌───────────────────────────────────┐  │
│  │   Telegram Webhook Handler        │  │
│  │   (grammy.js)                     │  │
│  └───────────┬───────────────────────┘  │
│              │                           │
│  ┌───────────▼───────────────────────┐  │
│  │   Gemini Service                  │  │
│  │   - Load conversation history     │  │
│  │   - Create chat session           │  │
│  │   - Send message to Gemini API    │  │
│  │   - Save updated history          │  │
│  └───────────┬───────────────────────┘  │
│              │                           │
│  ┌───────────▼───────────────────────┐  │
│  │   Storage Service                 │  │
│  │   - Read/write dialog files       │  │
│  │   - Read/write prompt files       │  │
│  └───────────────────────────────────┘  │
│                                          │
│  ┌───────────────────────────────────┐  │
│  │   Web Routes (API + HTML)         │  │
│  │   - GET /prompts (API)            │  │
│  │   - POST /prompts (API)           │  │
│  │   - GET /dialogs/:userId (API)    │  │
│  │   - GET / (HTML dashboard)        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         │                     │
         ▼                     ▼
┌──────────────────┐   ┌──────────────┐
│  Gemini API      │   │  File System │
│  (GCP)           │   │  (/data)     │
└──────────────────┘   └──────────────┘
```

### Data Models

#### Prompt
```typescript
interface Prompt {
  id: string;              // Unique identifier
  name: string;            // Display name
  content: string;         // Prompt text
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

#### Active Prompt
```typescript
interface ActivePrompt {
  activeId: string;        // ID of currently active prompt
}
```

#### Dialog History
```typescript
interface DialogFile {
  userId: string;          // Telegram user ID
  username: string;        // Telegram username
  messages: Content[];     // Gemini-compatible format
  lastCleanup: string;     // ISO timestamp
}

// Gemini Content format
interface Content {
  role: 'user' | 'model';
  parts: [{ text: string }];
}
```

### File Structure

```
saxarok/
├── .agent-os/              # Agent OS workflow (existing)
├── src/
│   ├── bot/
│   │   ├── index.ts        # Bot initialization and webhook setup
│   │   ├── handlers.ts     # Message handlers
│   │   └── middleware.ts   # Logging, error handling
│   ├── web/
│   │   ├── server.ts       # Fastify server setup
│   │   ├── routes/
│   │   │   ├── prompts.ts  # Prompt CRUD API
│   │   │   └── dialogs.ts  # Dialog history API
│   │   └── views/
│   │       ├── index.html  # Prompt management UI
│   │       └── dialogs.html # Dialog viewer UI
│   ├── services/
│   │   ├── gemini.ts       # Gemini API client + chat management
│   │   ├── storage.ts      # File read/write operations
│   │   └── prompt-manager.ts # Active prompt logic
│   ├── types/
│   │   └── index.ts        # TypeScript interfaces
│   ├── config/
│   │   └── env.ts          # Environment validation
│   └── index.ts            # Main entry point
├── data/                   # Persistent storage (gitignored)
│   ├── prompts/
│   │   ├── active.json
│   │   └── list.json
│   └── dialogs/
│       └── .gitkeep
├── public/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
├── .env                    # Environment variables (gitignored)
├── .env.example            # Template
├── .gitignore
├── package.json
├── tsconfig.json
├── railway.json            # Railway configuration
├── README.md
└── pnpm-lock.yaml
```

## Environment Variables

### Required
- `TELEGRAM_BOT_TOKEN` - From @BotFather
- `GEMINI_API_KEY` - From GCP Console (Generative Language API)
- `PORT` - Railway auto-assigns (default: 3000 locally)
- `NODE_ENV` - production/development
- `WEBHOOK_DOMAIN` - Railway app URL (e.g., saxarok.up.railway.app)

### Optional
- `LOG_LEVEL` - info/debug/warn/error (default: info)
- `MAX_CONTEXT_MESSAGES` - Messages sent to AI (default: 20)
- `MAX_STORED_MESSAGES` - Total messages per user (default: 100)

## API Endpoints

### Prompt Management
- `GET /api/prompts` - List all prompts
- `GET /api/prompts/active` - Get active prompt
- `POST /api/prompts` - Create new prompt
- `PUT /api/prompts/:id` - Update prompt
- `DELETE /api/prompts/:id` - Delete prompt
- `POST /api/prompts/:id/activate` - Set as active

### Dialog History
- `GET /api/users` - List all users with dialog history
- `GET /api/dialogs/:userId` - Get user's conversation history

### Web UI
- `GET /` - Prompt management dashboard
- `GET /dialogs` - Dialog history viewer

### Telegram Webhook
- `POST /webhook/telegram` - Telegram bot webhook endpoint

## User Stories

### As a salon employee:
1. I can send a message to the Telegram bot with a question about depilation techniques
2. I receive an AI-generated response based on the active prompt
3. The bot remembers our previous conversation context
4. I can have natural back-and-forth conversations

### As a salon administrator:
1. I can access the web dashboard to view all prompts
2. I can create a new training prompt for specific topics
3. I can edit existing prompts to improve responses
4. I can switch the active prompt based on training focus
5. I can view all employee conversations for quality review
6. I can see conversation history with timestamps

## Non-Functional Requirements

### Performance
- Bot response time: < 5 seconds (depends on Gemini API)
- Web dashboard load time: < 2 seconds
- Concurrent users: Support 50+ simultaneous users

### Security
- API key stored in environment variables only
- No hardcoded secrets in codebase
- Telegram webhook validation
- Web dashboard authentication (future enhancement)
- User data privacy compliance

### Reliability
- Graceful error handling (bot continues working)
- File corruption recovery
- Automatic retry for transient failures
- Proper logging for debugging

### Cost Optimization
- Limit context to 10-20 messages per request
- Use gemini-2.0-flash (cost-effective model)
- Monitor GCP billing
- Set up cost alerts

### Scalability
- File-based storage sufficient for < 100 users
- Easy migration to database if needed
- Session caching in memory for performance

## Success Metrics

### Usage Metrics
- Daily active users (salon employees)
- Average conversation length
- Message volume per day
- Response time averages

### Business Metrics
- Employee satisfaction with answers
- Reduction in trainer workload
- Knowledge retention improvements
- Time saved on repetitive questions

### Technical Metrics
- API error rate < 1%
- Uptime > 99%
- Average response latency
- GCP API costs per month

## Future Enhancements (Out of Scope v1.0)

- Multi-language support
- Voice message handling
- Image upload for technique questions
- Web dashboard authentication
- Analytics dashboard
- Scheduled prompt switching
- Admin notifications for new users
- Export conversation history (CSV/PDF)
- Search functionality in dialogs
- Database migration for > 100 users

## Constraints & Assumptions

### Constraints
- Railway free tier limitations (if applicable)
- GCP billing budget
- File storage limits on Railway volume
- Single active prompt at a time

### Assumptions
- Employees have Telegram installed
- Stable internet connection
- Administrator has access to Railway dashboard
- GCP billing is set up and active
- Employees understand Russian/Ukrainian (or prompt language)

## Deployment Plan

### Phase 1: Initial Setup
1. Initialize project with package.json, tsconfig
2. Create directory structure
3. Set up environment variables

### Phase 2: Core Bot Development
1. Implement Gemini service with chat sessions
2. Implement storage service for file operations
3. Create Telegram bot handlers
4. Test bot locally with ngrok

### Phase 3: Web Dashboard
1. Create Fastify server with routes
2. Build prompt management API
3. Build dialog history API
4. Create HTML/CSS/JS for UI

### Phase 4: Railway Deployment
1. Create railway.json configuration
2. Set up persistent volume for /data
3. Configure environment variables
4. Deploy and test webhook
5. Set up custom domain (optional)

### Phase 5: Testing & Launch
1. Load test with sample conversations
2. Admin training on dashboard usage
3. Employee onboarding
4. Monitor logs and costs
5. Iterate based on feedback

## Support & Maintenance

### Monitoring
- Railway logs for errors
- GCP Console for API usage
- File storage size monitoring
- Weekly cost reports

### Updates
- Prompt updates via web dashboard
- Code updates via git push to Railway
- Dependency updates monthly
- Security patches as needed

## Project Timeline (Estimate)

- **Phase 1**: 1-2 hours (setup)
- **Phase 2**: 4-6 hours (core bot)
- **Phase 3**: 4-6 hours (web dashboard)
- **Phase 4**: 2-3 hours (deployment)
- **Phase 5**: 2-3 hours (testing)

**Total**: 13-20 hours development time

---

**Document Version**: 1.0  
**Created**: 2025-10-03  
**Last Updated**: 2025-10-03  
**Status**: Ready for Implementation
