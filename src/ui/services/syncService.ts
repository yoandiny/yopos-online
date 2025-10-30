import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { db } from '../lib/db';

let supabase: SupabaseClient | null = null;

// --- PLACEHOLDER: Will be implemented when Supabase is connected ---
// This file contains the structure for data synchronization.
// The actual logic is commented out and will be implemented
// once you connect your Supabase project.

/**
 * Initializes the Supabase client.
 * This should be called once when the application starts.
 */
export const initializeSupabase = (url: string, anonKey: string) => {
  if (!url || !anonKey) {
    console.warn("Supabase URL or anon key is missing. Sync service is disabled.");
    return;
  }
  supabase = createClient(url, anonKey);
  console.log("Supabase client initialized. Sync service is ready.");
};

/**
 * Pushes pending changes from a local Dexie table to a remote Supabase table.
 * @param tableName The name of the table to sync (e.g., 'products').
 */
async function pushChanges<T extends { id: string }>(tableName: string) {
  if (!supabase) return;

  const pendingItems = await db.table(tableName).where('syncStatus').equals('pending').toArray();
  
  if (pendingItems.length === 0) {
    return; // Nothing to push
  }

  console.log(`Pushing ${pendingItems.length} pending changes for ${tableName}...`);
  
  // const { error } = await supabase.from(tableName).upsert(pendingItems);

  // if (error) {
  //   console.error(`Error pushing ${tableName} changes:`, error);
  //   // Optionally mark items as 'error'
  // } else {
  //   const idsToUpdate = pendingItems.map(item => item.id);
  //   await db.table(tableName).where('id').anyOf(idsToUpdate).modify({ syncStatus: 'synced' });
  //   console.log(`Successfully pushed ${tableName} changes.`);
  // }
}

/**
 * Pulls new or updated records from a Supabase table to the local Dexie table.
 * @param tableName The name of the table to sync.
 */
async function pullChanges(tableName: string) {
    if (!supabase) return;

    // const lastSyncTime = await getLastSyncTime(tableName);
    // console.log(`Pulling changes for ${tableName} since ${lastSyncTime}`);
    
    // const { data, error } = await supabase
    //     .from(tableName)
    //     .select('*')
    //     .gt('updated_at', lastSyncTime); // Assumes you have 'updated_at' on your Supabase table

    // if (error) {
    //     console.error(`Error pulling ${tableName} changes:`, error);
    // } else if (data && data.length > 0) {
    //     await db.table(tableName).bulkPut(data);
    //     await setLastSyncTime(tableName, new Date().toISOString());
    //     console.log(`Successfully pulled and stored ${data.length} items for ${tableName}.`);
    // }
}

/**
 * Main synchronization function.
 * Triggers push and pull operations for all relevant tables.
 */
export const syncDatabase = async () => {
    if (!supabase) {
        console.log("Sync skipped: Supabase not initialized.");
        return;
    }
    console.log("Starting database synchronization...");
    
    const tablesToSync = ['products', 'suppliers', 'expenses', 'sales', 'stockMovements'];

    for (const table of tablesToSync) {
        await pushChanges(table);
        // await pullChanges(table); // Pull changes after pushing
    }

    console.log("Database synchronization finished.");
};

// --- Helper functions for managing sync timestamps (placeholders) ---
async function getLastSyncTime(tableName: string): Promise<string> {
    // In a real implementation, you'd store this in localStorage or a dedicated Dexie table.
    return localStorage.getItem(`lastSync:${tableName}`) || new Date(0).toISOString();
}

async function setLastSyncTime(tableName: string, time: string) {
    localStorage.setItem(`lastSync:${tableName}`, time);
}
