import { supabase } from "@/integrations/supabase/client";
import {
  getPendingSyncItems,
  removeSyncItem,
  incrementSyncRetry,
  PendingSyncItem,
  hasPendingSync,
  getPendingSyncCount,
} from "./offlineStorage";

/**
 * Sync Manager - Handles background synchronization of offline data
 *
 * Features:
 * - Automatic sync when online
 * - Background sync via Service Worker
 * - Retry logic with exponential backoff
 * - Conflict resolution (server wins)
 */

// Maximum retry attempts before giving up
const MAX_RETRIES = 5;

// Sync status for UI feedback
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

// Event for sync status changes
type SyncEventCallback = (status: SyncStatus, pendingCount: number) => void;
const listeners = new Set<SyncEventCallback>();

export function addSyncListener(callback: SyncEventCallback): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners(status: SyncStatus, pendingCount: number) {
  listeners.forEach(cb => cb(status, pendingCount));
}

/**
 * Singleton Sync Manager
 */
class SyncManager {
  private static instance: SyncManager;
  private isSyncing = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());

      // Register for background sync if available
      this.registerBackgroundSync();
    }
  }

  static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  /**
   * Handle coming back online
   */
  private async handleOnline() {
    console.log('Network: Online - triggering sync');
    await this.syncPendingOperations();
  }

  /**
   * Handle going offline
   */
  private handleOffline() {
    console.log('Network: Offline');
    notifyListeners('offline', 0);
  }

  /**
   * Register for background sync via Service Worker
   */
  private async registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // @ts-ignore - TypeScript doesn't know about sync API
        await registration.sync.register('special-caring-sync');
        console.log('Background sync registered');
      } catch (error) {
        console.log('Background sync not available:', error);
      }
    }
  }

  /**
   * Start periodic sync checking
   */
  startPeriodicSync(intervalMs: number = 30000) {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(async () => {
      if (navigator.onLine && await hasPendingSync()) {
        await this.syncPendingOperations();
      }
    }, intervalMs);
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sync all pending operations to the server
   */
  async syncPendingOperations(): Promise<{ success: number; failed: number }> {
    if (this.isSyncing || !navigator.onLine) {
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    let successCount = 0;
    let failedCount = 0;

    try {
      const pending = await getPendingSyncItems();

      if (pending.length === 0) {
        notifyListeners('idle', 0);
        return { success: 0, failed: 0 };
      }

      notifyListeners('syncing', pending.length);

      for (const item of pending) {
        // Skip items that have exceeded max retries
        if (item.retryCount >= MAX_RETRIES) {
          console.error('Sync item exceeded max retries:', item.id);
          failedCount++;
          continue;
        }

        try {
          await this.executeOperation(item);
          await removeSyncItem(item.id);
          successCount++;
        } catch (error) {
          console.error('Sync failed for operation:', item.id, error);
          await incrementSyncRetry(item.id);
          failedCount++;
        }
      }

      const remainingCount = await getPendingSyncCount();
      notifyListeners(failedCount > 0 ? 'error' : 'success', remainingCount);

    } catch (error) {
      console.error('Sync manager error:', error);
      const pendingCount = await getPendingSyncCount();
      notifyListeners('error', pendingCount);
    } finally {
      this.isSyncing = false;
    }

    return { success: successCount, failed: failedCount };
  }

  /**
   * Execute a single sync operation
   */
  private async executeOperation(item: PendingSyncItem): Promise<void> {
    const { operation, table, data } = item;

    switch (operation) {
      case 'insert': {
        const { error } = await supabase.from(table as any).insert(data as any);
        if (error) throw error;
        break;
      }

      case 'update': {
        if (!data.id) throw new Error('Update requires id');
        const { id, ...updateData } = data as { id: string } & Record<string, unknown>;
        const { error } = await supabase.from(table as any).update(updateData).eq('id', id);
        if (error) throw error;
        break;
      }

      case 'delete': {
        if (!data.id) throw new Error('Delete requires id');
        const { error } = await supabase.from(table as any).delete().eq('id', data.id);
        if (error) throw error;
        break;
      }

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  /**
   * Force sync now (for manual trigger)
   */
  async forceSync(): Promise<{ success: number; failed: number }> {
    return this.syncPendingOperations();
  }

  /**
   * Get current sync status
   */
  async getStatus(): Promise<{ isSyncing: boolean; pendingCount: number; isOnline: boolean }> {
    return {
      isSyncing: this.isSyncing,
      pendingCount: await getPendingSyncCount(),
      isOnline: navigator.onLine,
    };
  }
}

// Export singleton instance
export const syncManager = SyncManager.getInstance();

/**
 * Hook-friendly sync status
 */
export async function getSyncStatus() {
  return syncManager.getStatus();
}

/**
 * Trigger a manual sync
 */
export async function triggerSync() {
  return syncManager.forceSync();
}

/**
 * Start automatic background syncing
 */
export function startAutoSync(intervalMs?: number) {
  syncManager.startPeriodicSync(intervalMs);
}

/**
 * Stop automatic background syncing
 */
export function stopAutoSync() {
  syncManager.stopPeriodicSync();
}
