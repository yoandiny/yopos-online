import Dexie, { Table } from 'dexie';
import { Product, Sale, StockMovement, Expense, Supplier, Customer, CreditPayment } from '../types';

export class KessDB extends Dexie {
  products!: Table<Product, string>;
  sales!: Table<Sale, string>;
  stockMovements!: Table<StockMovement, number>;
  expenses!: Table<Expense, string>;
  suppliers!: Table<Supplier, string>;
  customers!: Table<Customer, string>;
  creditPayments!: Table<CreditPayment, number>;

  constructor() {
    super('KessDB');
    this.version(8).stores({
      products: 'id, [companyId+posId], name, barcode, supplierId, syncStatus, _deleted',
      sales: 'id, [companyId+posId], createdAt, status, customerId, syncStatus, _deleted',
      stockMovements: '++id, movementId, [companyId+posId], productId, createdAt, syncStatus, _deleted',
      expenses: 'id, [companyId+posId], createdAt, category, syncStatus, _deleted',
      suppliers: 'id, [companyId+posId], name, syncStatus, _deleted',
      customers: 'id, [companyId+posId], name, syncStatus, _deleted',
      creditPayments: '++id, paymentId, [companyId+posId], saleId, syncStatus, _deleted',
    });
    
    // Keep previous versions for migration path
    this.version(7).stores({
      products: 'id, [companyId+posId], name, barcode, supplierId, syncStatus, _deleted',
      sales: 'id, [companyId+posId], createdAt, syncStatus, _deleted',
      stockMovements: '++id, movementId, [companyId+posId], productId, createdAt, syncStatus, _deleted',
      expenses: 'id, [companyId+posId], createdAt, category, syncStatus, _deleted',
      suppliers: 'id, [companyId+posId], name, syncStatus, _deleted',
    });
    this.version(6).stores({
      products: 'id, [companyId+posId], name, barcode, supplierId, syncStatus',
      sales: 'id, [companyId+posId], createdAt, syncStatus',
      stockMovements: '++id, movementId, [companyId+posId], productId, createdAt, syncStatus',
      expenses: 'id, [companyId+posId], createdAt, category, syncStatus',
      suppliers: 'id, [companyId+posId], name, syncStatus',
    });
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
