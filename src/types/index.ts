// Gemini API Types (from @google/genai)
export interface Content {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

// Prompt Management
export interface Prompt {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivePrompt {
  activeId: string;
}

export interface PromptsFile {
  prompts: Prompt[];
}

// Dialog History
export interface DialogFile {
  userId: string;
  username: string;
  messages: Content[];
  lastCleanup: string;
}

// Environment Configuration
export interface EnvConfig {
  // Required
  TELEGRAM_BOT_TOKEN: string;
  GEMINI_API_KEY: string;
  PORT: number;
  NODE_ENV: 'development' | 'production';
  WEBHOOK_DOMAIN: string;

  // Optional
  LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
  MAX_CONTEXT_MESSAGES?: number;
  MAX_STORED_MESSAGES?: number;
}

// API Request/Response Types
export interface CreatePromptRequest {
  name: string;
  content: string;
}

export interface UpdatePromptRequest {
  name?: string;
  content?: string;
}

export interface UserInfo {
  userId: string;
  username: string;
  messageCount: number;
  lastMessageAt: string;
}
