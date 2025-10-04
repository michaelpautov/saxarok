import type { FastifyInstance } from 'fastify';
import type { UserInfo } from '../../types/index.js';
import { loadDialog, listDialogUsers } from '../../services/storage.js';

export async function registerDialogRoutes(server: FastifyInstance) {
  // Get all users with dialog history
  server.get('/dialogs/users', async (request, reply) => {
    try {
      const userIds = await listDialogUsers();
      const users: UserInfo[] = [];

      for (const userId of userIds) {
        const dialog = await loadDialog(userId);
        if (dialog) {
          users.push({
            userId: dialog.userId,
            username: dialog.username,
            messageCount: dialog.messages.length,
            lastMessageAt: dialog.messages.length > 0
              ? dialog.lastCleanup
              : new Date().toISOString(),
          });
        }
      }

      // Sort by last message (most recent first)
      users.sort((a, b) =>
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );

      return { users };
    } catch (error) {
      request.log.error(error);
      return reply.internalServerError('Failed to load users');
    }
  });

  // Get dialog history for a specific user
  server.get<{ Params: { userId: string } }>('/dialogs/:userId', async (request, reply) => {
    try {
      const { userId } = request.params;

      const dialog = await loadDialog(userId);

      if (!dialog) {
        return reply.notFound('Dialog not found for this user');
      }

      return dialog;
    } catch (error) {
      request.log.error(error);
      return reply.internalServerError('Failed to load dialog');
    }
  });

  // Get statistics
  server.get('/dialogs/stats', async (request, reply) => {
    try {
      const userIds = await listDialogUsers();

      let totalMessages = 0;
      let totalUsers = userIds.length;
      let activeToday = 0;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      for (const userId of userIds) {
        const dialog = await loadDialog(userId);
        if (dialog) {
          totalMessages += dialog.messages.length;

          // Check if user was active today
          const lastActivity = new Date(dialog.lastCleanup);
          if (lastActivity >= todayStart) {
            activeToday++;
          }
        }
      }

      return {
        totalUsers,
        totalMessages,
        activeToday,
        averageMessagesPerUser: totalUsers > 0 ? Math.round(totalMessages / totalUsers) : 0,
      };
    } catch (error) {
      request.log.error(error);
      return reply.internalServerError('Failed to load statistics');
    }
  });
}
