import Dexie, { Table } from 'dexie';
import { Product, Sale, StockMovement, Expense } from '../types';

export class KessDB extends Dexie {
  products!: Table<Product, string>;
  sales!: Table<Sale, string>;
  stockMovements!: Table<StockMovement, number>;
  expenses!: Table<Expense, string>;

  constructor() {
    super('KessDB');
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
      products: 'id, name, barcode, imageUrl', // imageUrl existed here
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
