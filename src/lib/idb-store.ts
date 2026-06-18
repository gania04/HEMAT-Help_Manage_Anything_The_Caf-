import { processOrder } from './pos-actions';

const DB_NAME = 'hemat-pos-db';
const STORE_NAME = 'offline_transactions';

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(new Error(String()));
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: unknown) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export async function saveOfflineTransaction(cartItems: unknown[], paymentMethod: string, totalAmount: number) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const data = {
      cartItems,
      paymentMethod,
      totalAmount,
      timestamp: new Date().toISOString()
    };

    const request = store.add(data);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(String()));
  });
}

export async function getOfflineTransactions(): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(String()));
  });
}

export async function deleteOfflineTransaction(id: number) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(String()));
  });
}

export async function syncOfflineTransactions() {
  try {
    const pendingTxs = await getOfflineTransactions();
    if (pendingTxs.length === 0) return;

    for (const tx of pendingTxs) {
      try {
        // Panggil Server Action untuk memproses ulang
        const result = await processOrder(tx.cartItems, tx.paymentMethod, tx.totalAmount);
        
        if (result.success) {
          // Jika sukses disinkronkan, hapus dari IndexedDB
          await deleteOfflineTransaction(tx.id);
        }
      } catch {
        
        // Biarkan di IndexedDB untuk dicoba lagi nanti
      }
    }
  } catch (_error: unknown) { console.error(_error); }
}
