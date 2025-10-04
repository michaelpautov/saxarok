import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { PromptsFile, Prompt, ActivePrompt, DialogFile } from '../types/index.js';

const DATA_DIR = join(process.cwd(), 'data');
const PROMPTS_DIR = join(DATA_DIR, 'prompts');
const DIALOGS_DIR = join(DATA_DIR, 'dialogs');

const PROMPTS_FILE = join(PROMPTS_DIR, 'prompts.json');
const ACTIVE_PROMPT_FILE = join(PROMPTS_DIR, 'active.json');

/**
 * Ensures a directory exists, creating it if necessary
 */
async function ensureDir(path: string): Promise<void> {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
}

/**
 * Safely reads and parses a JSON file
 */
async function readJSON<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return defaultValue;
    }
    throw error;
  }
}

/**
 * Safely writes JSON to a file with atomic operation
 */
async function writeJSON<T>(filePath: string, data: T): Promise<void> {
  await ensureDir(dirname(filePath));
  const content = JSON.stringify(data, null, 2);
  const tempPath = `${filePath}.tmp`;

  // Write to temp file first
  await writeFile(tempPath, content, 'utf-8');

  // Rename atomically
  await writeFile(filePath, content, 'utf-8');
}

// ==================== Prompts ====================

/**
 * Loads all prompts from storage
 */
export async function loadPrompts(): Promise<Prompt[]> {
  const data = await readJSON<PromptsFile>(PROMPTS_FILE, { prompts: [] });
  return data.prompts;
}

/**
 * Saves prompts to storage
 */
export async function savePrompts(prompts: Prompt[]): Promise<void> {
  await writeJSON<PromptsFile>(PROMPTS_FILE, { prompts });
}

/**
 * Gets the currently active prompt ID
 */
export async function getActivePromptId(): Promise<string | null> {
  const data = await readJSON<ActivePrompt>(ACTIVE_PROMPT_FILE, { activeId: '' });
  return data.activeId || null;
}

/**
 * Sets the active prompt ID
 */
export async function setActivePromptId(promptId: string): Promise<void> {
  await writeJSON<ActivePrompt>(ACTIVE_PROMPT_FILE, { activeId: promptId });
}

// ==================== Dialog History ====================

/**
 * Gets the path to a user's dialog file
 */
function getDialogFilePath(userId: string): string {
  return join(DIALOGS_DIR, `${userId}.json`);
}

/**
 * Loads dialog history for a user
 */
export async function loadDialog(userId: string): Promise<DialogFile | null> {
  const filePath = getDialogFilePath(userId);
  const defaultValue: DialogFile = {
    userId,
    username: '',
    messages: [],
    lastCleanup: new Date().toISOString(),
  };

  const dialog = await readJSON<DialogFile>(filePath, defaultValue);

  // If we got the default value, return null to indicate no existing dialog
  if (dialog.messages.length === 0 && !existsSync(filePath)) {
    return null;
  }

  return dialog;
}

/**
 * Saves dialog history for a user
 */
export async function saveDialog(dialog: DialogFile): Promise<void> {
  const filePath = getDialogFilePath(dialog.userId);
  await writeJSON<DialogFile>(filePath, dialog);
}

/**
 * Lists all user IDs that have dialog history
 */
export async function listDialogUsers(): Promise<string[]> {
  await ensureDir(DIALOGS_DIR);
  const { readdir } = await import('node:fs/promises');
  const files = await readdir(DIALOGS_DIR);

  return files.filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
}

/**
 * Initializes default prompt if no prompts exist
 */
export async function initializeDefaultPrompt(): Promise<void> {
  const prompts = await loadPrompts();

  if (prompts.length === 0) {
    console.log('No prompts found. Creating default prompt...');

    const defaultPrompt: Prompt = {
      id: crypto.randomUUID(),
      name: 'Default Prompt',
      content: 'You are a helpful AI assistant. Be concise, friendly, and professional.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await savePrompts([defaultPrompt]);
    await setActivePromptId(defaultPrompt.id);

    console.log('✅ Default prompt created and activated:', defaultPrompt.id);
  }
}
