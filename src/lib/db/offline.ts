/**
 * Offline-First Sync Layer
 * Uses Dexie.js for IndexedDB — queued actions, optimistic UI
 */

import Dexie, { type Table } from 'dexie';

// ── Types ───────────────────────────────────────────────────
export interface OfflineAction {
  id?:         number;
  type:        'bid' | 'order' | 'message' | 'vault_save' | 'measurement_save';
  table:       string;
  data:        Record<string, any>;
  retries:     number;
  created_at:  number;
  synced_at?:  number;
}

export interface CachedMeasurement {
  id?:        number;
  user_id:    string;
  data:       Record<string, any>;
  updated_at: number;
}

export interface DraftCommission {
  id?:        number;
  user_id:    string;
  step:       number;
  data:       Record<string, any>;
  updated_at: number;
}

export interface CachedMedia {
  id:          string; // youtube_id
  data:        Record<string, any>;
  cached_at:   number;
  expires_at:  number;
}

// ── Dexie Database ──────────────────────────────────────────
class HDOfflineDB extends Dexie {
  offlineActions!:    Table<OfflineAction>;
  measurements!:      Table<CachedMeasurement>;
  draftCommissions!:  Table<DraftCommission>;
  cachedMedia!:       Table<CachedMedia>;
  vaultDrafts!:       Table<{ id?: number; user_id: string; data: Record<string, any>; created_at: number }>;
  chatDrafts!:        Table<{ id?: number; auction_id: string; message: string }>;

  constructor() {
    super('HDOfflineDB');
    this.version(1).stores({
      offlineActions:   '++id, type, table, created_at, synced_at',
      measurements:     '++id, user_id, updated_at',
      draftCommissions: '++id, user_id, updated_at',
      cachedMedia:      'id, cached_at, expires_at',
      vaultDrafts:      '++id, user_id, created_at',
      chatDrafts:       '++id, auction_id',
    });
  }
}

export const offlineDB = new HDOfflineDB();

// ── Queue an action for background sync ─────────────────────
export async function queueAction(action: Omit<OfflineAction, 'id' | 'retries' | 'created_at'>) {
  await offlineDB.offlineActions.add({ ...action, retries: 0, created_at: Date.now() });
}

// ── Save measurement draft locally ─────────────────────────
export async function saveMeasurementLocal(userId: string, data: Record<string, any>) {
  // Upsert — one record per user
  const existing = await offlineDB.measurements.where('user_id').equals(userId).first();
  if (existing?.id) {
    await offlineDB.measurements.update(existing.id, { data, updated_at: Date.now() });
  } else {
    await offlineDB.measurements.add({ user_id: userId, data, updated_at: Date.now() });
  }
}

// ── Save commission draft locally ───────────────────────────
export async function saveCommissionDraft(userId: string, step: number, data: Record<string, any>) {
  const existing = await offlineDB.draftCommissions.where('user_id').equals(userId).first();
  if (existing?.id) {
    await offlineDB.draftCommissions.update(existing.id, { step, data, updated_at: Date.now() });
  } else {
    await offlineDB.draftCommissions.add({ user_id: userId, step, data, updated_at: Date.now() });
  }
}

// ── Cache media items ───────────────────────────────────────
export async function cacheMediaItem(youtubeId: string, data: Record<string, any>) {
  await offlineDB.cachedMedia.put({
    id: youtubeId,
    data,
    cached_at:  Date.now(),
    expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24h TTL
  });
}

// ── Get cached media ────────────────────────────────────────
export async function getCachedMedia() {
  const now = Date.now();
  return offlineDB.cachedMedia.where('expires_at').above(now).toArray();
}

// ── Process the offline queue ───────────────────────────────
export async function processOfflineQueue(supabase: any) {
  const pending = await offlineDB.offlineActions
    .where('synced_at').equals(undefined as any)
    .and(a => a.retries < 3)
    .toArray();

  for (const action of pending) {
    try {
      const { error } = await supabase.from(action.table).insert(action.data);
      if (!error) {
        await offlineDB.offlineActions.update(action.id!, { synced_at: Date.now() });
      } else {
        await offlineDB.offlineActions.update(action.id!, { retries: action.retries + 1 });
      }
    } catch {
      await offlineDB.offlineActions.update(action.id!, { retries: action.retries + 1 });
    }
  }
}

// ── Online/offline detection ────────────────────────────────
export function onlineStatus() {
  if (typeof window === 'undefined') return { online: true, offline: false };
  return {
    online:  navigator.onLine,
    offline: !navigator.onLine,
  };
}
