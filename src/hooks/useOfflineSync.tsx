import { useState, useEffect, useCallback } from 'react';
import {
  SyncStatus,
  addSyncListener,
  getSyncStatus,
  triggerSync,
  startAutoSync,
  stopAutoSync,
} from '@/lib/syncManager';
import { getPendingSyncCount, hasPendingSync } from '@/lib/offlineStorage';

/**
 * Hook for managing offline sync status
 *
 * Provides:
 * - Current online/offline status
 * - Sync status (idle, syncing, success, error)
 * - Pending operation count
 * - Manual sync trigger
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Listen for online/offline changes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to sync status changes
  useEffect(() => {
    const unsubscribe = addSyncListener((status, count) => {
      setSyncStatus(status);
      setPendingCount(count);
      if (status === 'success') {
        setLastSyncTime(new Date());
      }
    });

    // Get initial status
    getSyncStatus().then(status => {
      setPendingCount(status.pendingCount);
      setSyncStatus(status.isOnline ? 'idle' : 'offline');
    });

    return unsubscribe;
  }, []);

  // Start auto-sync on mount
  useEffect(() => {
    startAutoSync();
    return () => stopAutoSync();
  }, []);

  // Manual sync trigger
  const sync = useCallback(async () => {
    if (!isOnline) {
      console.log('Cannot sync while offline');
      return { success: 0, failed: 0 };
    }
    return triggerSync();
  }, [isOnline]);

  // Check for pending changes
  const checkPending = useCallback(async () => {
    const count = await getPendingSyncCount();
    setPendingCount(count);
    return count;
  }, []);

  return {
    isOnline,
    syncStatus,
    pendingCount,
    lastSyncTime,
    sync,
    checkPending,
    hasPendingChanges: pendingCount > 0,
  };
}

/**
 * Simple hook for just checking online status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
