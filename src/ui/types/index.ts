export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export type PaymentMethod = 'cash' | 'mobile_money' | 'card';

export type MobileMoneyProvider = 'orange_money' | 'mvola' | 'airtel_money';

export interface Sale {
  id: string;
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
  createdAt: string;
}

export interface StockMovement {
  id?: number;
  productId: string;
  quantityChange: number;
  reason: string;
  createdAt: string;
}
