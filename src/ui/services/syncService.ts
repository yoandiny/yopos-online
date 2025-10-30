import { db } from '../lib/db';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const tablesToSync = ['products', 'sales', 'stockMovements', 'expenses', 'suppliers'];

/**
 * Pushes all pending local changes to the remote API.
 */
async function pushChanges() {
  const { company, pos } = useAuth.getState();
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
    console.log("Sync: No pending changes to push.");
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
      // On success, update local status
      await db.transaction('rw', ...tablesToSync.map(t => db.table(t)), async () => {
        for (const tableName of Object.keys(changes)) {
          const items = changes[tableName];
          for (const item of items) {
            if (item._deleted) {
              // If item was marked for deletion and sync was successful, permanently delete it locally
              await db.table(tableName).delete(item.id || item.movementId);
            } else {
              // Otherwise, just mark it as synced
              await db.table(tableName).where({ id: item.id }).modify({ syncStatus: 'synced' });
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

/**
 * Main synchronization function.
 * For now, it only pushes local changes. Pulling can be added later.
 */
export const syncDatabase = async () => {
  console.log("Starting database synchronization...");
  await pushChanges();
  // await pullChanges(); // Future implementation
  console.log("Database synchronization finished.");
};
