 
'use client';

import { useEffect, useState } from 'react';
import { syncOfflineTransactions } from '@/lib/idb-store';

export function OfflineSyncManager() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Unregister semua Service Worker untuk mencegah error offline pada Vercel
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for (const registration of registrations) {
          registration.unregister();
        }
      }).catch(function() {
        // Abaikan error saat unregister
      });
    }

    // Fungsi untuk handle online/offline status
    const handleOnline = async () => {
      setIsOffline(false);
      
      await syncOfflineTransactions();
    };

    const handleOffline = () => {
      setIsOffline(true);
      
    };

    // Set status awal
     
    setIsOffline(!navigator.onLine);

    globalThis.addEventListener('online', handleOnline);
    globalThis.addEventListener('offline', handleOffline);

    // Coba sync saat aplikasi pertama kali dimuat jika online
    if (navigator.onLine) {
      syncOfflineTransactions();
    }

    return () => {
      globalThis.removeEventListener('online', handleOnline);
      globalThis.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-yellow-500 text-yellow-900 px-6 py-3 rounded-full font-bold shadow-lg shadow-yellow-500/20 flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-100 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
      </span>
      <span>Anda sedang Offline. Transaksi disimpan di perangkat.</span>
    </div>
  );
}

