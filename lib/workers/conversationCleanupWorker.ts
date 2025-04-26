import { prisma } from '../prisma';

let cleanupWorkerStarted = false;
let cleanupInterval: NodeJS.Timeout | null = null;
let lastRun: Date | null = null;
let lastDeleted: number | null = null;

/**
 * Worker to clean up old conversations every 30 minutes
 */
export async function startConversationCleanupWorker() {
  if (cleanupWorkerStarted) return;
  cleanupWorkerStarted = true;

  const CLEANUP_INTERVAL_MS = 30 * 60 * 1000; // 30 phút

  async function cleanupConversations() {
    try {
      lastRun = new Date();
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 ngày trước
      const deleted = await prisma.conversation.deleteMany({
        where: {
          updatedAt: { lt: cutoff },
        },
      });
      lastDeleted = deleted.count;
      if (deleted.count > 0) {
        console.log(`[CleanupWorker] Deleted ${deleted.count} conversations older than 1 day`);
      }
    } catch (err) {
      console.error('[CleanupWorker] Error cleaning up conversations:', err);
    }
  }

  // Chạy ngay lần đầu và sau đó mỗi 30 phút
  await cleanupConversations();
  cleanupInterval = setInterval(cleanupConversations, CLEANUP_INTERVAL_MS);
}

export function stopConversationCleanupWorker() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    cleanupWorkerStarted = false;
    console.log('> Conversation cleanup worker stopped');
  }
}

export function getCleanupWorkerStatus() {
  return {
    enabled: cleanupWorkerStarted,
    status: cleanupWorkerStarted
      ? (cleanupInterval ? 'running' : 'stopped')
      : 'stopped',
    lastRun: lastRun ? lastRun.toISOString() : undefined,
    lastDeleted,
  };
}
