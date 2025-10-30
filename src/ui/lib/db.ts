import Dexie, { Table } from 'dexie';
import { Product, Sale, StockMovement, Expense, Supplier } from '../types';

export class KessDB extends Dexie {
  products!: Table<Product, string>;
  sales!: Table<Sale, string>;
  stockMovements!: Table<StockMovement, number>;
  expenses!: Table<Expense, string>;
  suppliers!: Table<Supplier, string>;

  constructor() {
    super('KessDB');
    this.version(6).stores({
      products: 'id, [companyId+posId], name, barcode, supplierId, syncStatus',
      sales: 'id, [companyId+posId], createdAt, syncStatus',
      stockMovements: '++id, movementId, [companyId+posId], productId, createdAt, syncStatus',
      expenses: 'id, [companyId+posId], createdAt, category, syncStatus',
      suppliers: 'id, [companyId+posId], name, syncStatus',
    }).upgrade(tx => {
        // This upgrade function will only run if the user had version 5.
        // For new users, version 6 is created directly.
        // We don't need to migrate data for this specific change,
        // as the new fields will be populated by the app logic going forward.
        console.log("Upgrading database to version 6 for multi-tenancy.");
    });
    
    // Keep previous versions for migration path
    this.version(5).stores({
      products: 'id, name, barcode, supplierId',
      sales: 'id, createdAt',
      stockMovements: '++id, productId, createdAt',
      expenses: 'id, createdAt, category',
      suppliers: 'id, name',
    });
    this.version(4).stores({
      products: 'id, name, barcode',
      sales: 'id, createdAt',
      stockMovements: '++id, productId, createdAt',
      expenses: 'id, createdAt, category'
    });
    this.version(3).stores({
      products: 'id, name, barcode',
      sales: 'id, createdAt',
      stockMovements: '++id, productId, createdAt'
    });
    this.version(2).stores({
      products: 'id, name, barcode, imageUrl',
      sales: 'id, createdAt',
      stockMovements: '++id, productId, createdAt'
    });
    this.version(1).stores({
      products: 'id, name, barcode, imageUrl',
      sales: 'id, createdAt',
    });
  }
}

export const db = new KessDB();
