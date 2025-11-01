import { db } from '../lib/db';
import api from '../lib/api';
import { authState } from './authService';

const tablesToSync = ['products', 'sales', 'stockMovements', 'expenses', 'suppliers', 'customers', 'creditPayments'];
let syncTimeout: number | null = null;

/**
 * Debounced version of the main sync function.
 * This prevents too many API calls in a short amount of time.
 */
export const syncDatabase = () => {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = window.setTimeout(async () => {
    console.log("Starting debounced database synchronization...");
    await pushChanges();
    console.log("Debounced database synchronization finished.");
    syncTimeout = null;
  }, 3000); // Debounce for 3 seconds
};

/**
 * Pushes all pending local changes to the remote API.
 */
async function pushChanges() {
  const { company, pos } = authState.getAuth();
  if (!company || !pos) {
    console.warn("Sync skipped: user not authenticated.");
    return;
  }

  const changes: { [key: string]: any[] } = {};
  let hasChanges = false;

  for (const tableName of tablesToSync) {
    const pendingItems = await db.table(tableName).where('syncStatus').equals('pending').toArray();
    if (pendingItems.length > 0) {
      changes[tableName] = pendingItems;
      hasChanges = true;
    }
  }

  if (!hasChanges) {
    // console.log("Sync: No pending changes to push.");
    return;
  }

  console.log("Sync: Pushing pending changes...", changes);

  try {
    const response = await api.post('/sync/push', {
      companyId: company.id,
      posId: pos.id,
      changes,
    });

    if (response.status === 200) {
      console.log("Sync: Push successful. Updating local status.");
      await db.transaction('rw', ...tablesToSync.map(t => db.table(t)), async () => {
        for (const tableName of Object.keys(changes)) {
          const items = changes[tableName];
          for (const item of items) {
            const primaryKey = item.id || item.paymentId; // Handle creditPayments which has paymentId as string key
            if (!primaryKey) continue; // Safety check

            if (item._deleted) {
              // For auto-incremented keys, we need to find the right record to delete
              if (tableName === 'creditPayments' || tableName === 'stockMovements') {
                 await db.table(tableName).where(tableName === 'creditPayments' ? 'paymentId' : 'movementId').equals(primaryKey).delete();
              } else {
                 await db.table(tableName).delete(primaryKey);
              }
            } else {
              const updateKey = tableName === 'creditPayments' ? 'paymentId' : (tableName === 'stockMovements' ? 'movementId' : 'id');
              await db.table(tableName).where(updateKey).equals(primaryKey).modify({ syncStatus: 'synced' });
            }
          }
        }
      });
    }
  } catch (error) {
    console.error("Sync: Error pushing changes:", error);
    // Optionally, mark items as 'error' to retry later
  }
}
