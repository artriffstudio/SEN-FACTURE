"use client";

import { useState, useEffect } from "react";
import { WifiOff, RefreshCw, CheckCircle } from "lucide-react";
import { getPendingSyncQueue, flushSyncQueue } from "@/lib/services/offlineSyncService";
import toast from "react-hot-toast";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);
    setPendingCount(getPendingSyncQueue().length);

    const handleOnline = async () => {
      setIsOnline(true);
      toast.success("Connexion Internet rétablie !", { id: "net-status" });
      setIsSyncing(true);
      const res = await flushSyncQueue();
      setIsSyncing(false);
      if (res.syncedCount > 0) {
        toast.success(`${res.syncedCount} facture(s) synchronisée(s) avec succès !`, { id: "sync-done" });
      }
      setPendingCount(getPendingSyncQueue().length);
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Mode hors-ligne activé. Vos factures seront sauvegardées localement.", { id: "net-status" });
    };

    const handleQueueUpdate = (e: any) => {
      setPendingCount(e.detail || 0);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("sync-queue-updated", handleQueueUpdate);

    // Enregistrement du service worker PWA
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("ServiceWorker registration:", err);
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("sync-queue-updated", handleQueueUpdate);
    };
  }, []);

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in fade-in duration-200">
      {!isOnline ? (
        <div className="bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 border border-amber-500/50">
          <WifiOff size={15} />
          <span>Mode Hors-Ligne (Données sauvegardées en local)</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-800 rounded-md text-[10px]">
              {pendingCount} en attente
            </span>
          )}
        </div>
      ) : isSyncing ? (
        <div className="bg-sky-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 border border-sky-500/50">
          <RefreshCw size={15} className="animate-spin" />
          <span>Synchronisation automatique en cours...</span>
        </div>
      ) : pendingCount > 0 ? (
        <div className="bg-slate-900 text-slate-100 px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 border border-slate-800">
          <RefreshCw size={14} className="text-sky-400" />
          <span>{pendingCount} document(s) à synchroniser</span>
          <button
            onClick={() => flushSyncQueue()}
            className="px-2 py-0.5 bg-sky-500 hover:bg-sky-600 rounded text-[10px] text-white ml-1 cursor-pointer"
          >
            Sync
          </button>
        </div>
      ) : null}
    </div>
  );
}
