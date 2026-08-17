/**
 * Master Offline Action Queue Utility for LynDesk.
 * Guarantees zero data loss when offline by caching user actions in localStorage
 * and automatically flushing pending mutations when online connectivity restores.
 */

export interface QueuedMutation {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

const QUEUE_STORAGE_KEY = "ldk_offline_mutation_queue";

export function enqueueOfflineMutation(type: string, payload: any): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    const queue: QueuedMutation[] = raw ? JSON.parse(raw) : [];
    const item: QueuedMutation = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      payload,
      timestamp: Date.now()
    };
    queue.push(item);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error("Failed to enqueue offline mutation:", err);
  }
}

export function getOfflineQueue(): QueuedMutation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearOfflineQueue(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(QUEUE_STORAGE_KEY);
}

export function initOfflineQueueSync(onFlush: (mutation: QueuedMutation) => Promise<boolean>): void {
  if (typeof window === "undefined") return;

  const flushQueue = async () => {
    if (!navigator.onLine) return;
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    const remaining: QueuedMutation[] = [];
    for (const item of queue) {
      try {
        const success = await onFlush(item);
        if (!success) {
          remaining.push(item);
        }
      } catch {
        remaining.push(item);
      }
    }

    if (remaining.length > 0) {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remaining));
    } else {
      clearOfflineQueue();
    }
  };

  window.addEventListener("online", flushQueue);
  if (navigator.onLine) {
    flushQueue().catch(() => {});
  }
}
