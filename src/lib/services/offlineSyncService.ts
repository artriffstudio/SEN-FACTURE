/**
 * Gestionnaire de file d'attente hors-ligne & synchronisation automatique Facturim
 */

import { Invoice, Client } from "@/lib/types";
import { createInvoice } from "@/lib/services/invoiceService";
import { createClient } from "@/lib/services/clientService";

export interface PendingSyncItem {
  id: string;
  type: "invoice" | "client";
  payload: any;
  createdAt: string;
  retryCount: number;
}

const STORAGE_KEY_SYNC = "facturim_pending_sync_queue";

export function getPendingSyncQueue(): PendingSyncItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SYNC);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToSyncQueue(type: "invoice" | "client", payload: any): void {
  if (typeof window === "undefined") return;
  const queue = getPendingSyncQueue();
  queue.push({
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });
  localStorage.setItem(STORAGE_KEY_SYNC, JSON.stringify(queue));
  window.dispatchEvent(new CustomEvent("sync-queue-updated", { detail: queue.length }));
}

export async function flushSyncQueue(): Promise<{ syncedCount: number; failedCount: number }> {
  if (typeof window === "undefined" || !navigator.onLine) {
    return { syncedCount: 0, failedCount: 0 };
  }

  const queue = getPendingSyncQueue();
  if (queue.length === 0) return { syncedCount: 0, failedCount: 0 };

  const remaining: PendingSyncItem[] = [];
  let syncedCount = 0;

  for (const item of queue) {
    try {
      if (item.type === "invoice") {
        await createInvoice(item.payload);
        syncedCount++;
      } else if (item.type === "client") {
        await createClient(item.payload);
        syncedCount++;
      }
    } catch (err) {
      console.warn(`[Sync Queue] Échec de synchronisation pour l'élément ${item.id}:`, err);
      item.retryCount += 1;
      if (item.retryCount < 5) {
        remaining.push(item);
      }
    }
  }

  localStorage.setItem(STORAGE_KEY_SYNC, JSON.stringify(remaining));
  window.dispatchEvent(new CustomEvent("sync-queue-updated", { detail: remaining.length }));

  return { syncedCount, failedCount: remaining.length };
}
