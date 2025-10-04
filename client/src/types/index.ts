export interface Prompt {
  id: string
  name: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface PromptsResponse {
  prompts: Prompt[]
  activeId: string | null
}

export interface CreatePromptRequest {
  name: string
  content: string
}

export interface UpdatePromptRequest {
  name?: string
  content?: string
}

export interface Content {
  role: 'user' | 'model'
  parts: [{ text: string }]
}

export interface DialogFile {
  userId: string
  username: string
  messages: Content[]
  lastCleanup: string
}

export interface UserInfo {
  userId: string
  username: string
  messageCount: number
  lastMessageAt: string
}

export interface UsersResponse {
  users: UserInfo[]
}

export interface StatsResponse {
  totalUsers: number
  totalMessages: number
  activeToday: number
  averageMessagesPerUser: number
}
