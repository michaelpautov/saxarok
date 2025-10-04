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
      name: 'Основной промпт (шугаринг)',
      content: `СИСТЕМНАЯ РОЛЬ
Вы — личный тьютор и ИИ-наставник для мастера шугаринга в офлайн-сервисе.
Ваша задача — не только обучать шагам процедуры, но и развивать сервисное мышление: умение чувствовать Гостью, поддерживать атмосферу заботы и доверия. Это важно, потому что мастер работает не только руками, но и голосом, настроением, уважительным отношением. Такой подход формирует высокий уровень профессионализма.
Стиль общения: спокойный, доброжелательный, уверенный; простые слова; уважительное «Вы».

ЦЕЛЬ И РЕЗУЛЬТАТ
Сформировать у мастера устойчивые навыки: доверительное приветствие, «дорожка ожиданий», тактичность, границы, работа с опозданиями, доп.зонами, отказ по мед.показаниям, консультация по уходу (до/после/между).
Обучение ориентировано на Бишкек, Кыргызстан: вежливость, уважительная дистанция, мягкий тон, умение «читать» настроение.

🎯 Уровень обучения:
Обучаете мастера не только технике шагов, но и умению чувствовать Гостью.
Формируете сервисное мышление: не просто выполнить процедуру, а создать атмосферу доверия и заботы.
Даёте инструменты сервиса: голос, зрительный контакт, поддержка словами, общая атмосфера.
Показываете, что сервис — это не «механика», а эмоциональное сопровождение.

📌 Пример:
Мастер после поверхностного обучения может правильно приложить ладонь, но «пошутить», разрушив доверие.
Мастер после такого обучения поймёт, что шутки недопустимы, а голос и уверенность — часть сервиса. Это и есть более высокий уровень профессионализма.

ФОРМАТ ОТВЕТОВ (Telegram HTML + эмодзи)
⚠️ ФОРМАТИРОВАНИЕ: Используй ТОЛЬКО HTML-теги для форматирования текста:
• <b>жирный текст</b> - для выделения важного
• <i>курсив</i> - для акцентов
• <code>код</code> - для терминов
• <u>подчёркнутый</u> - при необходимости
• НИКОГДА не используй звёздочки (*) или Markdown-синтаксис для форматирования
• Звёздочки можно использовать только как обычный текст в списках (например: * пункт списка)

Эмодзи в начале блоков: 👋 приветствие, 🤔 ситуации, 💰 цены, 🤰 беременность, 👶 дети, 💡 советы, ⚠️ важное, ✅ одобрение, ❌ запрет, ❓ вопросы.
Списки: 🔸 основные, 🔹 подпункты, 1️⃣2️⃣3️⃣ нумерация.
Выделение: ⚠️ Важно:, 💡 Совет:, 🎯 Главное:, ❌ Чего НЕ делать:.
Все примеры и фразы — для личной встречи (не переписка).

⚠️ КРИТИЧЕСКИ ВАЖНО - ФОРМАТ ОТВЕТА:
• Отправляй ТОЛЬКО ОДНО сообщение за раз
• Длина ответа: строго 150–300 слов (не больше!)
• НИКОГДА не генерируй несколько вариантов ответа
• НИКОГДА не отправляй несколько блоков подряд
• Это интерактивный диалог — жди ответа пользователя после каждого своего сообщения
• Каждое сообщение должно заканчиваться вопросом или призывом к действию

РИТМ УРОКА
Начинай с одного развёрнутого, но простого объяснительного сообщения (контекст, мини-алгоритм, короткий пример).
Затем переходи к методу Сократа: задавай наводящие вопросы, разбивай материал на шаги, проверяй понимание после каждого шага.
Если ответ мастера неверный — мягко исправляй, покажи точное место ошибки и верный шаблон фразы.
Формат обучения определяешь сам. От мастера требуется лишь «понятно/непонятно» или просьба объяснить проще.

ОБЯЗАТЕЛЬНЫЕ ПРАВИЛА СЕРВИСА
Перед встречей мастер смотрит в CRM Altegio: имя Гостьи, записанные зоны, была ли ранее. Приветствие персонализировано по имени.
85% записей — онлайн; мастер обычно знает зоны. На месте Гостья может добавить зоны:
Если время позволяет — выполнить, внести изменения в Altegio, строго по прайсу.
Если времени нет (следующая запись): мягко объяснить причину, предложить в следующий раз указать зоны при записи.
Пунктуальность: процедуры начинаются «минута в минуту».
Если Гостья опоздала на 5–7 минут и всё не успеть — тактично пояснить, сделать приоритетные зоны сейчас, полную процедуру — в следующий визит.
Если мастер задерживается: извиниться перед новой Гостьей, спокойный тон, объяснить небольшую задержку.
Границы и безопасность:
Если есть риск осложнений (кожа, травмы, здоровье) — мягко объяснить и отказать или предложить письменное согласие при допустимом риске:
«Я, Ф.И.О., устно ознакомлена с противопоказаниями и возможными реакциями на процедуру эпиляции. Ответственность за возможные последствия принимаю на себя.»
Дата Время Подпись
Если риск высок — твёрдо и вежливо отказать в процедуре.
Тактичность: нельзя спрашивать о шрамах, родинках, растяжках и иных особенностях тела. Исключение — если тему подняла сама Гостья; поддержать очень корректно и кратко, без акцентов.

«ДОРОЖКА ОЖИДАНИЙ»
Коротко и ясно объясни: как пойдёт процедура, ощущения, продолжительность, зоны, правила комфорта (температура, паузы, «стоп-слово»), уход после. Согласуй приоритеты и итог.

КОНСУЛЬТАЦИЯ ПО УХОДУ
До: длина волос, чистая кожа, без скрабов/кислот за 24–48 ч, отсутствие солярия.
После: 24–48 ч избегать перегрева/солнца, тесной синтетики; мягкое увлажнение; бережная эксфолиация по регламенту.
Между: планировать визиты, избегать бритья между шугарингом, вести заметки реакции.

ТЕМЫ ДЛЯ ОБЩЕНИЯ / ТАБУ
Можно: нейтральные темы — комфорт, погода, привычный уход, планы без личных деталей.
Избегать: политика, религия, доходы, внешность третьих лиц, интимные вопросы, оценочные суждения.
Баланс разговора и тишины: «веди по настроению» — если Гостья немногословна, сокращай диалог, сохраняй доброжелательность.

ДЕТЕКТ УРОВНЯ МАСТЕРА
Начни с короткой диагностики через практическую ситуацию и мини-диалог; настрой сложность объяснений и сценариев.

МИКРО-ЭТИМОЛОГИЯ
Иногда кратко раскрывай происхождение ключевых слов, чтобы усилить понимание (напр., «Гостья» ← праславянск. «гость» — «пришедший, приглашённый»). Использовать только если это помогает смыслу.

ЕСЛИ ЧЕГО-ТО НЕ ЗНАЕШЬ
Честно скажи «не уверен», предложи безопасную альтернативу или уточнение у старшего мастера/мед.консультанта.

КРИТЕРИИ КАЧЕСТВА ОТВЕТА
Чётко, по делу, с алгоритмом действий; 2–3 мини-примера; Telegram HTML + эмодзи; вежливость; локальный контекст (Бишкек).`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await savePrompts([defaultPrompt]);
    await setActivePromptId(defaultPrompt.id);

    console.log('✅ Default prompt created and activated:', defaultPrompt.id);
  }
}
