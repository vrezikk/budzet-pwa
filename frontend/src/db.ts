import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

// Schemat transakcji definiujący strukturę danych na urządzeniu
const transactionSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 36 // Standardowa długość UUID (np. 550e8400-e29b-41d4-a716-446655440000)
    },
    type: {
      type: 'string' // 'INCOME', 'EXPENSE', 'TRANSFER'
    },
    amount: {
      type: 'number'
    },
    category: {
      type: 'string'
    },
    date: {
      type: 'number' // Timestamp ułatwiający sortowanie offline
    },
    deleted_at: {
      type: 'number' // Miękkie usuwanie - jeśli wypełnione, serwer usunie rekord u wszystkich
    },
    version: {
      type: 'number' // Rośnie o 1 przy każdej edycji, chroni przed nadpisaniem nowszych zmian starymi
    }
  },
  required: ['id', 'type', 'amount', 'date', 'version']
};

let dbInstance: any = null;

export const getDB = async () => {
  if (!dbInstance) {
    dbInstance = await createRxDatabase({
      name: 'budzet_pwa_db',
      storage: getRxStorageDexie() // Zapisuje dane bezpośrednio w przeglądarce (IndexedDB)
    });

    await dbInstance.addCollections({
      transactions: {
        schema: transactionSchema
      }
    });
  }
  return dbInstance;
};

// Funkcja pomocnicza do bezpiecznego generowania UUID offline
export const generateUUID = () => crypto.randomUUID();