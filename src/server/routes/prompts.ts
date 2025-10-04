import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import type { CreatePromptRequest, UpdatePromptRequest, Prompt } from '../../types/index.js';
import {
  loadPrompts,
  savePrompts,
  getActivePromptId,
  setActivePromptId,
} from '../../services/storage.js';

export async function registerPromptRoutes(server: FastifyInstance) {
  // Get all prompts
  server.get('/prompts', async (request, reply) => {
    try {
      const prompts = await loadPrompts();
      const activeId = await getActivePromptId();

      return {
        prompts,
        activeId,
      };
    } catch (error) {
      request.log.error(error);
      return reply.internalServerError('Failed to load prompts');
    }
  });

  // Get single prompt
  server.get<{ Params: { id: string } }>('/prompts/:id', async (request, reply) => {
    try {
      const prompts = await loadPrompts();
      const prompt = prompts.find((p) => p.id === request.params.id);

      if (!prompt) {
        return reply.notFound('Prompt not found');
      }

      return prompt;
    } catch (error) {
      request.log.error(error);
      return reply.internalServerError('Failed to load prompt');
    }
  });

  // Create prompt
  server.post<{ Body: CreatePromptRequest }>('/prompts', async (request, reply) => {
    try {
      const { name, content } = request.body;

      if (!name || !content) {
        return reply.badRequest('Name and content are required');
      }

      const prompts = await loadPrompts();

      const newPrompt: Prompt = {
        id: randomUUID(),
        name,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      prompts.push(newPrompt);
      await savePrompts(prompts);

      // If this is the first prompt, set it as active
      if (prompts.length === 1) {
        await setActivePromptId(newPrompt.id);
      }

      return reply.code(201).send(newPrompt);
    } catch (error) {
      request.log.error(error);
      return reply.internalServerError('Failed to create prompt');
    }
  });

  // Update prompt
  server.put<{ Params: { id: string }; Body: UpdatePromptRequest }>(
    '/prompts/:id',
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { name, content } = request.body;

        const prompts = await loadPrompts();
        const promptIndex = prompts.findIndex((p) => p.id === id);

        if (promptIndex === -1) {
          return reply.notFound('Prompt not found');
        }

        const prompt = prompts[promptIndex]!;
        if (name) prompt.name = name;
        if (content) prompt.content = content;
        prompt.updatedAt = new Date().toISOString();

        await savePrompts(prompts);

        return prompts[promptIndex];
      } catch (error) {
        request.log.error(error);
        return reply.internalServerError('Failed to update prompt');
      }
    }
  );

  // Delete prompt
  server.delete<{ Params: { id: string } }>('/prompts/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      const prompts = await loadPrompts();
      const filteredPrompts = prompts.filter((p) => p.id !== id);

      if (filteredPrompts.length === prompts.length) {
        return reply.notFound('Prompt not found');
      }

      await savePrompts(filteredPrompts);

      // If deleted prompt was active, clear active or set to first available
      const activeId = await getActivePromptId();
      if (activeId === id) {
        const newActiveId = filteredPrompts.length > 0 ? filteredPrompts[0]!.id : '';
        await setActivePromptId(newActiveId);
      }

      return reply.code(204).send();
    } catch (error) {
      request.log.error(error);
      return reply.internalServerError('Failed to delete prompt');
    }
  });

  // Set active prompt
  server.post<{ Params: { id: string } }>('/prompts/:id/activate', async (request, reply) => {
    try {
      const { id } = request.params;

      const prompts = await loadPrompts();
      const prompt = prompts.find((p) => p.id === id);

      if (!prompt) {
        return reply.notFound('Prompt not found');
      }

      await setActivePromptId(id);

      return { success: true, activeId: id };
    } catch (error) {
      request.log.error(error);
      return reply.internalServerError('Failed to set active prompt');
    }
  });
}
