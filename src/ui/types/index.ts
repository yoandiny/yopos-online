// Base interface for all entities that need to be synced
interface BaseEntity {
  id: string;
  companyId: string;
  posId: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
  _deleted?: boolean; // Flag for soft deletion
}

export interface Product extends BaseEntity {
  name: string;
  barcode: string;
  price: number;
  stock: number;
  supplierId?: string;
}

export interface CartItem extends Omit<Product, 'syncStatus' | 'companyId' | 'posId' | 'createdAt' | 'updatedAt' | '_deleted'> {
  quantity: number;
}

export type PaymentMethod = 'cash' | 'mobile_money' | 'card';

export type MobileMoneyProvider = 'orange_money' | 'mvola' | 'airtel_money';

export interface Sale extends BaseEntity {
  items: CartItem[];
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentDetails: {
    provider?: MobileMoneyProvider;
    reference?: string;
    amountGiven?: number;
    change?: number;
  };
}

export interface StockMovement {
  id?: number; // Dexie auto-incrementing primary key
  movementId: string; // A unique string ID for syncing
  productId: string;
  companyId: string;
  posId: string;
  quantityChange: number;
  reason: string;
  createdAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
  _deleted?: boolean;
}

export interface Expense extends BaseEntity {
  description: string;
  amount: number;
  category: string;
}

export interface Supplier extends BaseEntity {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}

// For session management
export interface Company {
    id: string;
    name: string;
}

export interface PointOfSale {
    id: string;
    name: string;
    companyId: string;
}
