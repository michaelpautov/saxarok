# JavaScript/TypeScript Style Guide

## Context

Code style guidelines for TypeScript and JavaScript in Agent OS projects.

## Language

- **Primary**: TypeScript (strict mode)
- **Runtime**: Node.js 22 LTS with ESM modules
- **Target**: ES2022+

## File Formatting

### Indentation
- Use **2 spaces** for indentation
- No tabs

### Line Length
- Soft limit: 80 characters
- Hard limit: 120 characters
- Break long lines logically

### Semicolons
- Always use semicolons
- Enable in ESLint/Prettier config

### Quotes
- Use single quotes `'` for strings
- Use backticks `` ` `` for template literals
- Use double quotes `"` only in JSON

## Naming Conventions

### Variables and Functions
```typescript
// camelCase for variables and functions
const userName = 'John';
const messageCount = 42;

function getUserName() { }
async function fetchDialogHistory() { }
```

### Constants
```typescript
// UPPER_SNAKE_CASE for true constants
const MAX_MESSAGES = 100;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_TIMEOUT = 5000;
```

### Types and Interfaces
```typescript
// PascalCase for types, interfaces, classes
interface UserSession {
  userId: string;
  username: string;
}

type MessageRole = 'user' | 'assistant';

class DialogManager { }
```

### Files and Directories
- Use kebab-case: `dialog-manager.ts`, `prompt-service.ts`
- Use index.ts for barrel exports
- Group related files in directories

## Type Annotations

### Explicit vs Inferred
```typescript
// Prefer type inference when obvious
const count = 0;              // Good: inferred as number
const name = 'John';          // Good: inferred as string

// Explicit when not obvious
const items: string[] = [];   // Good: empty array needs type
const user: User | null = getUser(); // Good: union needs clarity

// Always annotate function parameters and return types
function processMessage(text: string, userId: string): Promise<void> {
  // Implementation
}
```

### Interface vs Type
```typescript
// Prefer interfaces for object shapes
interface DialogFile {
  userId: string;
  messages: Message[];
}

// Use types for unions, intersections, primitives
type MessageRole = 'user' | 'assistant';
type ID = string | number;
```

### Avoid Any
```typescript
// Bad
function process(data: any) { }

// Good - use unknown and type guards
function process(data: unknown) {
  if (typeof data === 'string') {
    // data is string here
  }
}

// Good - use generics
function process<T>(data: T): T {
  return data;
}
```

## Functions

### Arrow Functions vs Function Declarations
```typescript
// Use arrow functions for callbacks and short functions
const numbers = [1, 2, 3].map(n => n * 2);

bot.on('message', async (ctx) => {
  await ctx.reply('Hello');
});

// Use function declarations for top-level named functions
async function startBot() {
  await bot.start();
}

function calculateSum(a: number, b: number): number {
  return a + b;
}
```

### Async/Await
```typescript
// Always use async/await over Promise chains
// Bad
function fetchUser(id: string) {
  return fetch(`/users/${id}`)
    .then(res => res.json())
    .then(data => processData(data))
    .catch(err => console.error(err));
}

// Good
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/users/${id}`);
    const data = await response.json();
    return processData(data);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}
```

### Function Parameters
```typescript
// Use object destructuring for multiple parameters
// Bad
function createMessage(role: string, content: string, timestamp: number, promptId: string) { }

// Good
function createMessage({ role, content, timestamp, promptId }: {
  role: string;
  content: string;
  timestamp: number;
  promptId: string;
}) { }

// Even better - define interface
interface MessageParams {
  role: string;
  content: string;
  timestamp: number;
  promptId: string;
}

function createMessage(params: MessageParams) { }
```

## Objects and Arrays

### Object Literals
```typescript
// Use shorthand properties
const name = 'John';
const age = 30;

const user = { name, age }; // Good
const user = { name: name, age: age }; // Verbose

// Use computed property names
const key = 'userId';
const obj = { [key]: '123' };
```

### Destructuring
```typescript
// Use destructuring for object properties
// Good
const { userId, username } = ctx.session;

// Use rest operator for remaining properties
const { id, ...rest } = user;

// Use default values
const { timeout = 5000 } = options;

// Array destructuring
const [first, second, ...remaining] = messages;
```

### Spread Operator
```typescript
// Use spread for copying/merging
const newUser = { ...user, updatedAt: Date.now() };
const allMessages = [...oldMessages, newMessage];

// Avoid mutating objects/arrays
// Bad
messages.push(newMessage);

// Good
const updated = [...messages, newMessage];
```

## Imports and Exports

### Import Style
```typescript
// Group imports: external, internal, types
// External dependencies
import { Bot } from 'grammy';
import { FastifyPluginAsync } from 'fastify';

// Internal modules
import { DialogManager } from './services/dialog-manager';
import { readDialogFile } from './utils/storage';

// Types
import type { UserSession, Message } from './types';
```

### Named vs Default Exports
```typescript
// Prefer named exports
// Good
export function processMessage() { }
export class DialogService { }

// Default exports for single-purpose modules
export default function createBot() { }

// Never mix default and named exports in same file
```

### Barrel Exports
```typescript
// Use index.ts for clean imports
// src/services/index.ts
export { DialogManager } from './dialog-manager';
export { PromptService } from './prompt-service';
export { StorageService } from './storage-service';

// Usage
import { DialogManager, PromptService } from './services';
```

## Error Handling

### Try/Catch
```typescript
// Always use try/catch with async/await
async function saveDialog(userId: string, messages: Message[]) {
  try {
    const filePath = getDialogPath(userId);
    await fs.writeFile(filePath, JSON.stringify({ userId, messages }, null, 2));
  } catch (error) {
    console.error('Failed to save dialog:', error);
    throw new Error(`Failed to save dialog for user ${userId}`);
  }
}
```

### Error Types
```typescript
// Create custom error classes
class DialogNotFoundError extends Error {
  constructor(userId: string) {
    super(`Dialog not found for user ${userId}`);
    this.name = 'DialogNotFoundError';
  }
}

// Use type guards for error handling
if (error instanceof DialogNotFoundError) {
  // Handle specific error
}
```

### Error Propagation
```typescript
// Let errors bubble up, handle at appropriate level
// Bad - swallowing errors
async function fetchData() {
  try {
    return await api.get('/data');
  } catch {
    return null; // Lost error context
  }
}

// Good - propagate with context
async function fetchData() {
  try {
    return await api.get('/data');
  } catch (error) {
    throw new Error('Failed to fetch data', { cause: error });
  }
}
```

## Control Flow

### Conditionals
```typescript
// Use early returns to reduce nesting
// Bad
function process(user: User) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        // Do something
      }
    }
  }
}

// Good
function process(user: User) {
  if (!user) return;
  if (!user.isActive) return;
  if (!user.hasPermission) return;
  
  // Do something
}
```

### Ternary Operators
```typescript
// Use for simple conditionals
const message = isError ? 'Failed' : 'Success';

// Avoid nesting
// Bad
const result = a ? b ? c : d : e;

// Good
const result = a && b ? c : (a ? d : e);
// Or better - use if/else
```

### Nullish Coalescing
```typescript
// Use ?? for null/undefined checks
const timeout = options.timeout ?? 5000;

// Use || for falsy checks
const name = user.name || 'Anonymous';

// Use optional chaining
const street = user?.address?.street;
```

## Comments

### When to Comment
```typescript
// Explain WHY, not WHAT
// Bad
// Increment counter
counter++;

// Good
// Track message count for rate limiting
counter++;

// Explain complex logic
// Use exponential backoff: 2^attempt * 1000ms
const delay = Math.pow(2, attempt) * 1000;
```

### JSDoc Comments
```typescript
/**
 * Saves dialog history to file with automatic cleanup.
 * 
 * @param userId - Telegram user ID
 * @param messages - Array of conversation messages
 * @throws {Error} If file write fails
 * @returns Promise that resolves when save is complete
 */
async function saveDialog(userId: string, messages: Message[]): Promise<void> {
  // Implementation
}
```

### TODO Comments
```typescript
// Use standardized format
// TODO: Implement retry logic for failed API calls
// FIXME: Race condition in concurrent file writes
// NOTE: This assumes userId is always numeric
```

## TypeScript Specific

### Strict Mode
```typescript
// Always use strict mode in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Type Guards
```typescript
// Use type guards for runtime checks
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isMessage(obj: unknown): obj is Message {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'role' in obj &&
    'content' in obj
  );
}
```

### Utility Types
```typescript
// Use built-in utility types
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type ReadonlyUser = Readonly<User>;
type UserKeys = keyof User;
type PickedUser = Pick<User, 'id' | 'name'>;
type OmittedUser = Omit<User, 'password'>;
```

### Declaration Merging
```typescript
// Extend third-party types
declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
}

// Use merged types
app.addHook('onRequest', async (request) => {
  request.userId = '123'; // TypeScript knows about this
});
```

## File Organization

### Module Structure
```typescript
// Order within file:
// 1. Imports
import { Bot } from 'grammy';
import type { Context } from './types';

// 2. Constants
const MAX_RETRIES = 3;

// 3. Types/Interfaces
interface Config {
  token: string;
}

// 4. Main logic
export function createBot(config: Config) {
  // Implementation
}

// 5. Helper functions (not exported)
function validate(config: Config) {
  // Implementation
}
```

## Best Practices

### Immutability
```typescript
// Prefer const over let
const messages: Message[] = [];

// Avoid mutating objects
const updated = { ...user, name: 'New Name' };

// Use readonly for immutable data
interface Config {
  readonly apiKey: string;
  readonly timeout: number;
}
```

### Null Safety
```typescript
// Always handle null/undefined
function getUsername(user: User | null): string {
  return user?.name ?? 'Anonymous';
}

// Use non-null assertion sparingly
const element = document.getElementById('app')!; // Only if certain
```

### Type Assertions
```typescript
// Avoid type assertions when possible
// Bad
const user = data as User;

// Good - validate at runtime
function isUser(data: unknown): data is User {
  // Validation logic
}

if (isUser(data)) {
  // data is User here
}
```

### Enums vs Union Types
```typescript
// Prefer union types over enums
// Good
type MessageRole = 'user' | 'assistant' | 'system';

// Use enums only for numeric or flag values
enum FilePermission {
  Read = 1,
  Write = 2,
  Execute = 4
}
```

## Formatting Tools

### Prettier Config
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100,
  "arrowParens": "always"
}
```

### ESLint Config
- Use `@typescript-eslint/recommended`
- Enable `no-unused-vars` (TypeScript version)
- Enable `no-explicit-any`
- Enable `prefer-const`
- Enable `no-var`
