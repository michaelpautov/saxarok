# Development Best Practices

## Context

Global development guidelines for Agent OS projects focused on TypeScript, Fastify, grammy.js, and Gemini AI.

## Core Principles

### Keep It Simple
- Implement code in the fewest lines possible
- Avoid over-engineering solutions
- Choose straightforward approaches over clever ones

### Optimize for Readability
- Prioritize code clarity over micro-optimizations
- Write self-documenting code with clear variable names
- Add comments for "why" not "what"

### DRY (Don't Repeat Yourself)
- Extract repeated business logic to utilities
- Create reusable functions for common operations
- Use middleware for repeated Fastify/grammy logic

## Fastify Best Practices

### Route Organization
- Group routes by feature in separate files
- Use plugins to encapsulate route groups
- Apply `fastify-plugin` wrapper for proper encapsulation
- Use route prefixes for API versioning

### Plugin Structure
```typescript
// routes/prompts.ts
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const promptsRoute: FastifyPluginAsync = async (fastify) => {
  fastify.get('/prompts', async (request, reply) => {
    // Handler logic
  });
};

export default fp(promptsRoute);
```

### TypeScript Type Safety
- Use generics for route typing: `<{ Querystring, Body, Reply }>`
- Define interfaces for request/response shapes
- Use JSON Schema for validation when possible
- Leverage Fastify's built-in TypeScript support

### Error Handling
- Use `@fastify/sensible` for standard HTTP errors
- Implement global error handler
- Return consistent error response format
- Log errors with appropriate levels

### Performance
- Use `@fastify/helmet` for security headers
- Enable `@fastify/compress` for response compression
- Implement `@fastify/rate-limit` to prevent abuse
- Use `@fastify/cors` with specific origins only
- Set proper timeout configurations

### Lifecycle Hooks
- Use `onRequest` for authentication/logging
- Use `preHandler` for route-specific validation
- Use `onResponse` for response logging
- Implement graceful shutdown with `onClose`

## grammy Best Practices

### Bot Structure
- Separate handlers into logical modules
- Use middleware for common operations (logging, auth, rate limiting)
- Implement error boundaries for bot handlers
- Use composition over large handler functions

### Message Handling
```typescript
// Prefer specific filters over catch-all
bot.on('message:text', handler);        // Good
bot.on('message', handler);             // Less specific

// Use command decorators
bot.command('start', startHandler);

// Use conversation plugin for multi-step flows
bot.use(createConversation(orderFlow));
```

### Context Management
- Extend context type with custom properties using declaration merging
- Use session storage for user state
- Prefer `@grammyjs/storage-file` for file-based sessions
- Clean up old sessions periodically

### Error Handling
```typescript
bot.catch((err) => {
  console.error('Bot error:', err);
  // Optionally notify admin
});

// Handle specific errors in handlers
bot.on('message:text', async (ctx) => {
  try {
    // Handler logic
  } catch (error) {
    await ctx.reply('Sorry, something went wrong');
    console.error('Handler error:', error);
  }
});
```

### Webhook vs Polling
- Use webhooks in production (Railway provides HTTPS)
- Use polling only for local development
- Set webhook on bot startup
- Validate webhook requests

### Performance
- Use `bot.on()` with specific filters to reduce processing
- Implement rate limiting per user
- Avoid blocking operations in handlers (use async)
- Batch API calls when possible

## Gemini AI Best Practices

### SDK Initialization
```typescript
import { GoogleGenAI } from '@google/genai';

// Generative Language API (GCP Paid Tier)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY, // From GCP Console
});
```

### Chat Session Management
```typescript
// Create chat with conversation history
import type { Content } from '@google/genai';

// Load saved history from file
const savedHistory: Content[] = await loadDialogHistory(userId);

// Create chat session with history
const chat = ai.chats.create({
  model: 'gemini-2.0-flash',
  history: savedHistory, // Previous conversation
  config: {
    temperature: 0.7,
    maxOutputTokens: 1024,
  }
});

// Send new message (context is automatic)
const response = await chat.sendMessage({ message: userText });

// Get updated history and save
const updatedHistory = chat.getHistory();
await saveDialogHistory(userId, updatedHistory);
```

### History Format
```typescript
// Gemini uses 'model' role instead of 'assistant'
const history: Content[] = [
  {
    role: 'user',
    parts: [{ text: 'Hello!' }]
  },
  {
    role: 'model', // Not 'assistant'!
    parts: [{ text: 'Hi! How can I help?' }]
  }
];
```

### Streaming Responses
```typescript
// For real-time feel in Telegram
const chat = ai.chats.create({ model: 'gemini-2.0-flash' });
const stream = await chat.sendMessageStream({ message: userText });

for await (const chunk of stream) {
  // Send chunk to Telegram incrementally
  await ctx.reply(chunk.text);
}
```

### Error Handling
```typescript
try {
  const response = await chat.sendMessage({ message: userText });
  return response.text;
} catch (error) {
  if (error.message.includes('API key')) {
    // Invalid or missing API key
  }
  if (error.message.includes('quota')) {
    // Billing issue or quota exceeded
  }
  console.error('Gemini API error:', error);
  throw error;
}
```

### Cost Optimization
- **Limit context**: Send only last 10-20 messages to AI (not all history)
- **Use Flash model**: gemini-2.0-flash is 10x cheaper than Pro
- **Monitor usage**: Check GCP Console billing dashboard regularly
- **Set billing alerts**: Get notified when costs exceed threshold
- **Cache prompts**: Reuse system instructions across sessions

### Context Window Management
```typescript
// Keep full history in file, send only recent to API
const MAX_CONTEXT_MESSAGES = 20;

async function getContextHistory(userId: string): Promise<Content[]> {
  const fullHistory = await loadDialogHistory(userId);
  
  // Take only last N messages for API
  return fullHistory.slice(-MAX_CONTEXT_MESSAGES);
}

// Use trimmed history
const chat = ai.chats.create({
  model: 'gemini-2.0-flash',
  history: await getContextHistory(userId),
});
```

### Safety & Privacy
- Never log full API responses (may contain sensitive data)
- Sanitize user inputs before sending to API
- Set safety filters appropriately
- Comply with Gemini API usage policies
- Don't send API key to client (server-side only)

## File Storage Best Practices

### File Operations
- Always use `fs/promises` for async operations
- Implement atomic writes (write to temp, then rename)
- Use file locking for concurrent access
- Handle ENOENT errors gracefully

### Data Structure
```typescript
// Consistent JSON structure
interface DialogFile {
  userId: string;
  username: string;
  messages: Message[];
  lastCleanup: string;
}

// Always validate structure when reading
async function readDialogFile(userId: string): Promise<DialogFile> {
  const data = await fs.readFile(path, 'utf-8');
  const parsed = JSON.parse(data);
  // Validate schema
  return parsed;
}
```

### Cleanup Strategy
- Implement rolling window (keep last N messages)
- Run cleanup on every write
- Archive old data instead of deleting
- Monitor disk usage

### Error Handling
- Handle file not found (create default)
- Handle JSON parse errors (corrupted files)
- Implement retry logic for transient errors
- Log file operation errors

### Concurrency
- Use file locks to prevent race conditions
- Implement queue for write operations
- Avoid simultaneous reads/writes
- Use proper-lockfile package if needed

### Performance
- Avoid reading entire file for small updates
- Cache frequently accessed data in memory
- Use streams for large files
- Implement background cleanup jobs

## TypeScript Best Practices

### Type Safety
- Use strict TypeScript configuration (`strict: true`)
- Prefer interfaces over types for object shapes
- Use union types for controlled values
- Avoid `any` type - use `unknown` when needed

### Declaration Merging
```typescript
// Extend Fastify types
declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
  }
}

// Extend grammy types
declare module 'grammy' {
  interface Context {
    session: SessionData;
  }
}
```

### Async/Await
- Always use async/await over Promise chains
- Handle errors with try/catch
- Avoid mixing callbacks and promises
- Use Promise.all() for parallel operations

## Security

### Data Protection
- Validate all user inputs
- Use environment variables for secrets
- Never commit secrets to version control
- Use HTTPS in production (Railway provides this)

### API Security
- Implement proper CORS configuration
- Use helmet for security headers
- Validate Telegram webhook requests
- Implement rate limiting for all endpoints

### File System Security
- Never use user input directly in file paths
- Sanitize file names
- Restrict file access to `/data` directory
- Validate file sizes before reading

## Testing

### Test Strategy
- Write tests for business logic
- Mock external APIs (Gemini, Telegram)
- Test file operations with temp directories
- Use vitest for TypeScript projects

### Test Organization
- Place tests next to code: `storage.test.ts`
- Use descriptive test names
- Group related tests in describe blocks
- Keep tests simple and focused

## Logging

### Log Levels
- **error**: Application errors, API failures
- **warn**: Deprecated usage, missing data
- **info**: Startup, shutdown, key events
- **debug**: Detailed debugging information

### Logging Best Practices
- Use Fastify's built-in logger (pino)
- Log all errors with context
- Never log sensitive data (API keys, user messages)
- Include request IDs for tracing
- Use structured logging (JSON)

## Environment Management

### Environment Variables
- Use `.env` file for local development
- Never commit `.env` to git
- Validate required env vars on startup
- Provide sensible defaults where appropriate
- Document all env vars in README

### Configuration
```typescript
// Validate environment on startup
const requiredEnvVars = [
  'TELEGRAM_BOT_TOKEN',
  'GOOGLE_CLOUD_PROJECT',
  'GOOGLE_CLOUD_LOCATION'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required env var: ${envVar}`);
  }
}
```

## Railway Deployment

### Persistent Storage
- Mount volume at `/data` in Railway dashboard
- Never store data outside `/data` directory
- Implement data migration scripts
- Backup important data regularly

### Environment Variables
- Set all secrets in Railway dashboard
- Use railway.json for non-secret config
- Reference env vars in code via `process.env`
- Test with production-like env vars locally

### Graceful Shutdown
```typescript
// Handle shutdown signals
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await fastify.close();
  process.exit(0);
});
```

### Monitoring
- Log startup and shutdown events
- Monitor memory usage
- Track file storage size
- Set up error alerting
- Use Railway metrics dashboard

## Code Organization

### File Structure
- Group by feature, not by type
- Keep related files close together
- Use index files for clean imports
- Separate types into dedicated files

### Naming Conventions
- Use PascalCase for types/interfaces
- Use camelCase for variables/functions
- Use UPPER_SNAKE_CASE for constants
- Use descriptive names (avoid abbreviations)

### Imports
- Group imports: external, internal, types
- Use absolute imports when configured
- Avoid circular dependencies
- Import only what you need
