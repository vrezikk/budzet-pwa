import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

// Schemat transakcji definiujący strukturę danych na urządzeniu
const transactionSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    type: { type: 'string' },
    amount: { type: 'number' },
    category: { type: 'string' },
    date: { type: 'number' },
    deleted_at: { type: 'number' },
    version: { type: 'number' },
    title: { type: 'string' },
    // Nowe pola dla funkcji OCR i rachunków
    receipt_image: { type: 'string' }, 
    splits: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          amount: { type: 'number' }
        }
      }
    }
  },
  required: ['id', 'type', 'amount', 'date', 'version']
};

// ... (schemat pozostaje bez zmian)

let dbPromise: Promise<any> | null = null;

// ... (transactionSchema pozostaje bez zmian)

export const getDB = async () => {
  // Przypisujemy obietnicę do obiektu window, aby przetrwała przeładowania Vite (HMR)
  if (!(window as any).dbPromise) {
    (window as any).dbPromise = (async () => {
      const db = await createRxDatabase({
        name: 'budzet_pwa_db_v5', // <--- v5 dla czystego startu
        storage: getRxStorageDexie(),
        ignoreDuplicate: true
      });

      await db.addCollections({
        transactions: {
          schema: transactionSchema
        }
      });

      return db;
    })();
  }
  return (window as any).dbPromise;
};

export const generateUUID = () => crypto.randomUUID();