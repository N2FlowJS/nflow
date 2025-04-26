import { prisma } from '../prisma';
import fs from 'fs';
import path from 'path';

let cleanupWorkerStarted = false;
let cleanupInterval: NodeJS.Timeout | null = null;
let lastRun: Date | null = null;
let lastDeleted: number | null = null;

const STATUS_FILE = path.resolve(process.cwd(), "logs", 'cleanup-worker.json');

function writeStatusToFile() {
  const status = {
    enabled: cleanupWorkerStarted,
    status: cleanupWorkerStarted
      ? (cleanupInterval ? 'running' : 'stopped')
      : 'stopped',
    lastRun: lastRun ? lastRun.toISOString() : undefined,
    lastDeleted,
  };
  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2), 'utf-8');
  } catch (err) {
    console.error('[CleanupWorker] Error writing status file:', err);
  }
}

function readStatusFromFile() {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      const raw = fs.readFileSync(STATUS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[CleanupWorker] Error reading status file:', err);
  }
  return {
    enabled: false,
    status: 'stopped',
    lastRun: undefined,
    lastDeleted: undefined,
  };
}

/**
 * Worker to clean up old conversations every 30 minutes
 */
export async function startConversationCleanupWorker() {
  if (cleanupWorkerStarted) return;
  cleanupWorkerStarted = true;
  writeStatusToFile(); // Ghi trạng thái ngay khi bắt đầu

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
      writeStatusToFile();
    } catch (err) {
      console.error('[CleanupWorker] Error cleaning up conversations:', err);
    }
  }

  // Chạy ngay lần đầu và sau đó mỗi 30 phút
  await cleanupConversations();
  cleanupInterval = setInterval(cleanupConversations, CLEANUP_INTERVAL_MS);
  writeStatusToFile();
}

export function stopConversationCleanupWorker() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    cleanupWorkerStarted = false;
    console.log('> Conversation cleanup worker stopped');
    writeStatusToFile();
  }
}

export function getCleanupWorkerStatus() {
  // Đọc trạng thái từ file JSON
  return readStatusFromFile();
}
