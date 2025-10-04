import { GoogleGenAI } from '@google/genai';
import type { Content } from '../types/index.js';
import { env } from '../config/env.js';
import { loadDialog, saveDialog } from './storage.js';

const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

/**
 * Manages chat sessions with Gemini AI for individual users
 */
export class GeminiChatService {
  /**
   * Sends a message and gets AI response
   */
  async sendMessage(
    userId: string,
    username: string,
    userMessage: string,
    systemPrompt: string
  ): Promise<string> {
    // Load existing dialog
    let dialog = await loadDialog(userId);

    if (!dialog) {
      dialog = {
        userId,
        username,
        messages: [],
        lastCleanup: new Date().toISOString(),
      };
    }

    // Add user message
    const userContent: Content = {
      role: 'user',
      parts: [{ text: userMessage }],
    };
    dialog.messages.push(userContent);

    // Prepare context: recent messages
    const maxContext = env.MAX_CONTEXT_MESSAGES || 20;
    const recentMessages = dialog.messages.slice(-maxContext);

    const contents = recentMessages.map((msg) => ({
      role: msg.role,
      parts: msg.parts,
    }));

    // Generate content with history
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-pro',
      contents,
      config: {
        systemInstruction: systemPrompt,
        candidateCount: 1, // Generate only 1 response variant
        maxOutputTokens: 500, // Limit response length (~300-400 words)
        temperature: 0.7, // More predictable responses
      },
    });

    const responseText = result.text || '';

    // Add AI response to history
    const modelContent: Content = {
      role: 'model',
      parts: [{ text: responseText }],
    };
    dialog.messages.push(modelContent);

    // Cleanup old messages if needed
    const maxStored = env.MAX_STORED_MESSAGES || 100;
    if (dialog.messages.length > maxStored) {
      dialog.messages = dialog.messages.slice(-maxStored);
      dialog.lastCleanup = new Date().toISOString();
    }

    // Save updated dialog
    await saveDialog(dialog);

    return responseText;
  }

  /**
   * Clears conversation history for a user
   */
  async clearHistory(userId: string): Promise<void> {
    const dialog = await loadDialog(userId);
    if (dialog) {
      dialog.messages = [];
      dialog.lastCleanup = new Date().toISOString();
      await saveDialog(dialog);
    }
  }
}

export const geminiService = new GeminiChatService();
