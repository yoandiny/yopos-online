import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Product, Sale, CartItem, StockMovement, Expense, Supplier } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { syncDatabase } from '../services/syncService';

interface AppContextType {
  products: Product[];
  sales: Sale[];
  stockMovements: StockMovement[];
  expenses: Expense[];
  suppliers: Supplier[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id'>>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  adjustStock: (productId: string, quantityChange: number, reason: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id'>>) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'>) => Promise<void>;
  updateSupplier: (id: string, updates: Partial<Omit<Supplier, 'id' | 'createdAt'>>) => Promise<void>;
  deleteSupplier: (supplierId: string) => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  isFirstLaunch: boolean;
  initialBalance: number;
  setupInitialBalance: (balance: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { company, pos } = useAuth();
  const companyId = company?.id;
  const posId = pos?.id;

  const liveQueryDeps = [companyId, posId];

  // Filter out soft-deleted items from live queries
  const products = useLiveQuery(() => companyId && posId ? db.products.where({ companyId, posId }).filter(p => !p._deleted).toArray() : [], liveQueryDeps, []);
  const sales = useLiveQuery(() => companyId && posId ? db.sales.where({ companyId, posId }).filter(s => !s._deleted).orderBy('createdAt').reverse().toArray() : [], liveQueryDeps, []);
  const stockMovements = useLiveQuery(() => companyId && posId ? db.stockMovements.where({ companyId, posId }).filter(sm => !sm._deleted).orderBy('createdAt').reverse().toArray() : [], liveQueryDeps, []);
  const expenses = useLiveQuery(() => companyId && posId ? db.expenses.where({ companyId, posId }).filter(e => !e._deleted).orderBy('createdAt').reverse().toArray() : [], liveQueryDeps, []);
  const suppliers = useLiveQuery(() => companyId && posId ? db.suppliers.where({ companyId, posId }).filter(s => !s._deleted).orderBy('name').toArray() : [], liveQueryDeps, []);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isFirstLaunch, setIsFirstLaunch] = useLocalStorage<boolean>(`isFirstLaunch:${companyId}:${posId}`, true);
  const [initialBalance, setInitialBalance] = useLocalStorage<number>(`initialBalance:${companyId}:${posId}`, 0);

  const setupInitialBalance = useCallback((balance: number) => {
    setInitialBalance(balance);
    setIsFirstLaunch(false);
  }, [setInitialBalance, setIsFirstLaunch]);

  const addToCart = useCallback((product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      const { syncStatus, companyId, posId, createdAt, updatedAt, _deleted, ...cartProduct } = product;
      return [...prevCart, { ...cartProduct, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => setCart(prevCart => prevCart.filter(item => item.id !== productId)), []);
  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    setCart(prevCart => prevCart.map(item => (item.id === productId ? { ...item, quantity } : item)).filter(item => item.quantity > 0));
  }, []);
  const clearCart = useCallback(() => setCart([]), []);

  const addEntity = useCallback(async <T>(tableName: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'>, prefix: string): Promise<string> => {
    if (!companyId || !posId) throw new Error("Session invalide.");
    const now = new Date().toISOString();
    const id = `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newEntity = {
      ...data,
      id,
      companyId,
      posId,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending' as const,
      _deleted: false,
    };
    await db.table(tableName).add(newEntity);
    syncDatabase(); // Trigger sync
    return id;
  }, [companyId, posId]);

  const updateEntity = useCallback(async (tableName: string, id: string, updates: any) => {
    const updateData = { ...updates, updatedAt: new Date().toISOString(), syncStatus: 'pending' as const };
    await db.table(tableName).update(id, updateData);
    syncDatabase(); // Trigger sync
  }, []);

  const deleteEntity = useCallback(async (tableName: string, id: string) => {
    await updateEntity(tableName, id, { _deleted: true });
  }, [updateEntity]);
  
  const addSale = useCallback(async (saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'>) => {
    if (!companyId || !posId) {
        alert("Session invalide. Impossible d'enregistrer la vente.");
        return;
    }

    try {
        await db.transaction('rw', db.sales, db.products, async () => {
            const now = new Date().toISOString();
            const saleId = `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const newSale: Sale = {
                ...saleData,
                id: saleId,
                companyId,
                posId,
                createdAt: now,
                updatedAt: now,
                syncStatus: 'pending',
                _deleted: false,
            };
            await db.sales.add(newSale);

            for (const item of saleData.items) {
                const product = await db.products.get(item.id);
                if (product) {
                    const newStock = product.stock - item.quantity;
                    await db.products.update(item.id, {
                        stock: newStock,
                        updatedAt: now,
                        syncStatus: 'pending'
                    });
                } else {
                    console.warn(`Product with id ${item.id} not found during sale processing.`);
                }
            }
        });

        clearCart();
        syncDatabase(); // Trigger sync AFTER the transaction is complete
        
    } catch (error) {
        console.error("Failed to process sale:", error);
        alert("Une erreur est survenue lors de l'enregistrement de la vente.");
    }
  }, [companyId, posId, clearCart]);

  const addProduct = useCallback((productData) => addEntity<Product>('products', productData, 'prod'), [addEntity]);
  const updateProduct = useCallback((id, updates) => updateEntity('products', id, updates), [updateEntity]);
  const deleteProduct = useCallback((productId: string) => deleteEntity('products', productId), [deleteEntity]);

  const adjustStock = useCallback(async (productId: string, quantityChange: number, reason: string) => {
    if (!companyId || !posId) throw new Error("Session invalide.");
    try {
      await db.transaction('rw', db.products, db.stockMovements, async () => {
        const product = await db.products.get(productId);
        if (!product) throw new Error("Produit non trouvé");
        
        const newStock = product.stock + quantityChange;
        if (newStock < 0) throw new Error("Le stock ne peut pas être négatif.");

        await db.products.update(productId, { stock: newStock, updatedAt: new Date().toISOString(), syncStatus: 'pending' });

        const movement: Omit<StockMovement, 'id'> = {
          movementId: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          productId,
          companyId,
          posId,
          quantityChange,
          reason,
          createdAt: new Date().toISOString(),
          syncStatus: 'pending',
          _deleted: false,
        };
        await db.stockMovements.add(movement);
      });
      syncDatabase();
    } catch (error) {
      console.error("Failed to adjust stock:", error);
      alert(`Une erreur est survenue: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }, [companyId, posId]);

  const addExpense = useCallback((expenseData) => addEntity<Expense>('expenses', expenseData, 'exp'), [addEntity]);
  const updateExpense = useCallback((id, updates) => updateEntity('expenses', id, updates), [updateEntity]);
  const deleteExpense = useCallback((expenseId: string) => deleteEntity('expenses', expenseId), [deleteEntity]);

  const addSupplier = useCallback((supplierData) => addEntity<Supplier>('suppliers', supplierData, 'sup'), [addEntity]);
  const updateSupplier = useCallback((id, updates) => updateEntity('suppliers', id, updates), [updateEntity]);
  const deleteSupplier = useCallback((supplierId: string) => deleteEntity('suppliers', supplierId), [deleteEntity]);

  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart]);

  const value = {
    products: products || [],
    sales: sales || [],
    stockMovements: stockMovements || [],
    expenses: expenses || [],
    suppliers: suppliers || [],
    addSale, addProduct, updateProduct, deleteProduct, adjustStock,
    addExpense, updateExpense, deleteExpense,
    addSupplier, updateSupplier, deleteSupplier,
    cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal,
    isFirstLaunch, initialBalance, setupInitialBalance,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
