import { openDB, DBSchema, IDBPDatabase } from 'idb';

/**
 * Offline Storage Module using IndexedDB
 *
 * Provides local persistence for critical care data when offline.
 * Data syncs to Supabase when connectivity is restored.
 */

// Type definitions for stored data
export interface OfflineChild {
  id: string;
  created_by: string;
  name: string;
  avatar_url?: string | null;
  // Profile fields (merged from former key_information)
  full_name?: string;
  birth_date?: string;
  address?: string;
  phone_number?: string;
  email?: string;
  health_card_number?: string;
  insurance_provider?: string;
  insurance_number?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  medical_conditions?: string;
  allergies?: string;
  likes?: string;
  dislikes?: string;
  do_nots?: string;
  additional_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OfflineMedication {
  id: string;
  child_id: string;
  name: string;
  dosage?: string;
  frequency: string;
  purpose?: string;
  prescriber?: string;
  start_date?: string;
  end_date?: string;
  instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface OfflineDailyLog {
  id: string;
  child_id: string;
  date: string;
  notes?: string;
  mood?: string;
  activities?: string;
  created_at: string;
  updated_at: string;
}

export interface PendingSyncItem {
  id: string;
  operation: 'insert' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  created_at: string;
  retryCount: number;
}

// IndexedDB Schema
interface SpecialCaringDB extends DBSchema {
  children: {
    key: string;
    value: OfflineChild;
    indexes: { 'by-created-by': string };
  };
  medications: {
    key: string;
    value: OfflineMedication;
    indexes: { 'by-child': string };
  };
  dailyLogs: {
    key: string;
    value: OfflineDailyLog;
    indexes: { 'by-child': string; 'by-date': string };
  };
  pendingSync: {
    key: string;
    value: PendingSyncItem;
    indexes: { 'by-table': string };
  };
}

const DB_NAME = 'special-caring-offline';
const DB_VERSION = 2; // Bumped: removed keyInformation store, enriched children, renamed user_id → created_by
type StoreNames = 'children' | 'dailyLogs' | 'medications' | 'pendingSync';

let dbPromise: Promise<IDBPDatabase<SpecialCaringDB>> | null = null;

/**
 * Get or create the IndexedDB database connection
 */
export async function getDB(): Promise<IDBPDatabase<SpecialCaringDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SpecialCaringDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, _transaction) {
        // Initial database setup
        if (oldVersion < 1) {
          // Children store (enriched with profile fields)
          const childrenStore = db.createObjectStore('children', { keyPath: 'id' });
          childrenStore.createIndex('by-created-by', 'created_by');

          // Medications store
          const medsStore = db.createObjectStore('medications', { keyPath: 'id' });
          medsStore.createIndex('by-child', 'child_id');

          // Daily logs store
          const logsStore = db.createObjectStore('dailyLogs', { keyPath: 'id' });
          logsStore.createIndex('by-child', 'child_id');
          logsStore.createIndex('by-date', 'date');

          // Pending sync queue
          const syncStore = db.createObjectStore('pendingSync', { keyPath: 'id' });
          syncStore.createIndex('by-table', 'table');
        }

        // V2: Remove keyInformation store (merged into children), rename user_id → created_by
        if (oldVersion < 2) {
          // Delete the old keyInformation store if upgrading from v1
          if (db.objectStoreNames.contains('keyInformation' as any)) {
            db.deleteObjectStore('keyInformation' as any);
          }
          // Recreate children store with new index (by-created-by instead of by-user)
          if (db.objectStoreNames.contains('children')) {
            db.deleteObjectStore('children');
          }
          const childrenStore = db.createObjectStore('children', { keyPath: 'id' });
          childrenStore.createIndex('by-created-by', 'created_by');
        }
      },
      blocked() {
        console.warn('IndexedDB blocked - close other tabs using this app');
      },
      blocking() {
        console.warn('IndexedDB blocking - database version upgrade needed');
      },
      terminated() {
        console.error('IndexedDB connection terminated unexpectedly');
        dbPromise = null;
      },
    });
  }
  return dbPromise;
}

/**
 * Save data to offline storage
 */
export async function saveOffline<T extends StoreNames>(
  storeName: T,
  data: SpecialCaringDB[T]['value']
): Promise<void> {
  const db = await getDB();
  await db.put(storeName, data);
}

/**
 * Save multiple items to offline storage
 */
export async function saveOfflineBatch<T extends StoreNames>(
  storeName: T,
  items: SpecialCaringDB[T]['value'][]
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(storeName, 'readwrite');
  await Promise.all([
    ...items.map(item => tx.store.put(item)),
    tx.done,
  ]);
}

/**
 * Get data from offline storage by key
 */
export async function getOffline<T extends StoreNames>(
  storeName: T,
  key: string
): Promise<SpecialCaringDB[T]['value'] | undefined> {
  const db = await getDB();
  return db.get(storeName, key);
}

/**
 * Get all data from a store
 */
export async function getAllOffline<T extends StoreNames>(
  storeName: T
): Promise<SpecialCaringDB[T]['value'][]> {
  const db = await getDB();
  return db.getAll(storeName);
}

/**
 * Get data by index
 */
export async function getByIndex<T extends StoreNames>(
  storeName: T,
  indexName: string,
  key: string
): Promise<SpecialCaringDB[T]['value'][]> {
  const db = await getDB();
  const tx = db.transaction(storeName);
  const index = tx.store.index(indexName as any);
  return index.getAll(key as any);
}

/**
 * Delete data from offline storage
 */
export async function deleteOffline<T extends StoreNames>(
  storeName: T,
  key: string
): Promise<void> {
  const db = await getDB();
  await db.delete(storeName, key);
}

/**
 * Clear all data from a store
 */
export async function clearStore<T extends StoreNames>(
  storeName: T
): Promise<void> {
  const db = await getDB();
  await db.clear(storeName);
}

/**
 * Add an operation to the pending sync queue
 */
export async function queueForSync(
  operation: 'insert' | 'update' | 'delete',
  table: string,
  data: Record<string, unknown>
): Promise<void> {
  const syncItem: PendingSyncItem = {
    id: crypto.randomUUID(),
    operation,
    table,
    data,
    created_at: new Date().toISOString(),
    retryCount: 0,
  };
  await saveOffline('pendingSync', syncItem);
}

/**
 * Get all pending sync operations
 */
export async function getPendingSyncItems(): Promise<PendingSyncItem[]> {
  return getAllOffline('pendingSync');
}

/**
 * Remove a sync item after successful sync
 */
export async function removeSyncItem(id: string): Promise<void> {
  await deleteOffline('pendingSync', id);
}

/**
 * Update retry count for a failed sync item
 */
export async function incrementSyncRetry(id: string): Promise<void> {
  const db = await getDB();
  const item = await db.get('pendingSync', id);
  if (item) {
    item.retryCount++;
    await db.put('pendingSync', item);
  }
}

/**
 * Check if there are pending sync operations
 */
export async function hasPendingSync(): Promise<boolean> {
  const items = await getPendingSyncItems();
  return items.length > 0;
}

/**
 * Get count of pending sync operations
 */
export async function getPendingSyncCount(): Promise<number> {
  const items = await getPendingSyncItems();
  return items.length;
}

/**
 * Clear all offline data (use with caution)
 */
export async function clearAllOfflineData(): Promise<void> {
  const db = await getDB();
  await Promise.all([
    db.clear('children'),
    db.clear('medications'),
    db.clear('dailyLogs'),
    db.clear('pendingSync'),
  ]);
}

/**
 * Export all offline data for backup
 */
export async function exportOfflineData(): Promise<{
  children: OfflineChild[];
  medications: OfflineMedication[];
  dailyLogs: OfflineDailyLog[];
  pendingSync: PendingSyncItem[];
}> {
  return {
    children: await getAllOffline('children'),
    medications: await getAllOffline('medications'),
    dailyLogs: await getAllOffline('dailyLogs'),
    pendingSync: await getAllOffline('pendingSync'),
  };
}
