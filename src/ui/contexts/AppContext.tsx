import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Product, Sale, CartItem, StockMovement, Expense, Supplier } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { syncDatabase } from '../services/syncService';

// --- Internal Helper Functions ---

/**
 * Creates a new entity in the database with standard metadata.
 */
const addEntity = async &lt;T extends { id: string }&gt;(
  tableName: string,
  data: Omit&lt;T, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'&gt;,
  prefix: string,
  companyId: string,
  posId: string
): Promise&lt;string&gt; => {
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
  syncDatabase();
  return id;
};

/**
 * Updates an existing entity in the database.
 */
const updateEntity = async (tableName: string, id: string, updates: any) => {
  const updateData = { ...updates, updatedAt: new Date().toISOString(), syncStatus: 'pending' as const };
  await db.table(tableName).update(id, updateData);
  syncDatabase();
};

/**
 * Soft deletes an entity by marking it as deleted.
 */
const deleteEntity = async (tableName: string, id: string) => {
  await updateEntity(tableName, id, { _deleted: true });
};


// --- Context Definition ---

interface AppContextType {
  products: Product[];
  sales: Sale[];
  stockMovements: StockMovement[];
  expenses: Expense[];
  suppliers: Supplier[];
  addSale: (sale: Omit&lt;Sale, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'&gt;) => Promise&lt;void&gt;;
  addProduct: (product: Omit&lt;Product, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'&gt;) => Promise&lt;void&gt;;
  updateProduct: (id: string, updates: Partial&lt;Omit&lt;Product, 'id'&gt;&gt;) => Promise&lt;void&gt;;
  deleteProduct: (productId: string) => Promise&lt;void&gt;;
  adjustStock: (productId: string, quantityChange: number, reason: string) => Promise&lt;void&gt;;
  addExpense: (expense: Omit&lt;Expense, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'&gt;) => Promise&lt;void&gt;;
  updateExpense: (id: string, updates: Partial&lt;Omit&lt;Expense, 'id'&gt;&gt;) => Promise&lt;void&gt;;
  deleteExpense: (expenseId: string) => Promise&lt;void&gt;;
  addSupplier: (supplier: Omit&lt;Supplier, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'&gt;) => Promise&lt;void&gt;;
  updateSupplier: (id: string, updates: Partial&lt;Omit&lt;Supplier, 'id' | 'createdAt'&gt;&gt;) => Promise&lt;void&gt;;
  deleteSupplier: (supplierId: string) => Promise&lt;void&gt;;
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

const AppContext = createContext&lt;AppContextType | undefined&gt;(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { company, pos } = useAuth();
  const companyId = company?.id;
  const posId = pos?.id;

  // --- Live Queries for Data ---
  const liveQueryDeps = useMemo(() => [companyId, posId], [companyId, posId]);

  const products = useLiveQuery(() => companyId && posId ? db.products.where({ companyId, posId }).filter(p => !p._deleted).toArray() : [], liveQueryDeps, []);
  const sales = useLiveQuery(() => companyId && posId ? db.sales.where({ companyId, posId }).filter(s => !s._deleted).orderBy('createdAt').reverse().toArray() : [], liveQueryDeps, []);
  const stockMovements = useLiveQuery(() => companyId && posId ? db.stockMovements.where({ companyId, posId }).filter(sm => !sm._deleted).orderBy('createdAt').reverse().toArray() : [], liveQueryDeps, []);
  const expenses = useLiveQuery(() => companyId && posId ? db.expenses.where({ companyId, posId }).filter(e => !e._deleted).orderBy('createdAt').reverse().toArray() : [], liveQueryDeps, []);
  const suppliers = useLiveQuery(() => companyId && posId ? db.suppliers.where({ companyId, posId }).filter(s => !s._deleted).orderBy('name').toArray() : [], liveQueryDeps, []);
  
  // --- Cart State Management ---
  const [cart, setCart] = useState&lt;CartItem[]&gt;([]);
  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart]);

  const addToCart = useCallback((product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Keep only necessary properties for the cart item
      const { name, price, stock, barcode, id, supplierId } = product;
      return [...prevCart, { name, price, stock, barcode, id, supplierId, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => setCart(prevCart => prevCart.filter(item => item.id !== productId)), []);
  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    setCart(prevCart => prevCart.map(item => (item.id === productId ? { ...item, quantity } : item)).filter(item => item.quantity > 0));
  }, []);
  const clearCart = useCallback(() => setCart([]), []);

  // --- Initial Setup State ---
  const [isFirstLaunch, setIsFirstLaunch] = useLocalStorage&lt;boolean&gt;(`isFirstLaunch:${companyId}:${posId}`, true);
  const [initialBalance, setInitialBalance] = useLocalStorage&lt;number&gt;(`initialBalance:${companyId}:${posId}`, 0);

  const setupInitialBalance = useCallback((balance: number) => {
    setInitialBalance(balance);
    setIsFirstLaunch(false);
  }, [setInitialBalance, setIsFirstLaunch]);

  // --- Data Mutation Functions ---

  const addSale = useCallback(async (saleData: Omit&lt;Sale, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'&gt;) => {
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
                    // This will abort the transaction
                    throw new Error(`Produit "${item.name}" (ID: ${item.id}) non trouvé dans la base de données.`);
                }
            }
        });
        clearCart();
        syncDatabase(); // Trigger sync AFTER the transaction is complete
    } catch (error) {
        console.error("Échec du traitement de la vente:", error);
        alert(`Une erreur est survenue lors de l'enregistrement de la vente: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [companyId, posId, clearCart]);

  const adjustStock = useCallback(async (productId: string, quantityChange: number, reason: string) => {
    if (!companyId || !posId) throw new Error("Session invalide.");
    try {
      await db.transaction('rw', db.products, db.stockMovements, async () => {
        const product = await db.products.get(productId);
        if (!product) throw new Error("Produit non trouvé");
        
        const newStock = product.stock + quantityChange;
        if (newStock < 0) throw new Error("Le stock ne peut pas être négatif.");

        await db.products.update(productId, { stock: newStock, updatedAt: new Date().toISOString(), syncStatus: 'pending' });

        const movement: Omit&lt;StockMovement, 'id'&gt; = {
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
      console.error("Échec de l'ajustement du stock:", error);
      alert(`Une erreur est survenue: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }, [companyId, posId]);
  
  // Generic CRUD wrappers
  const crudHandler = useCallback((tableName: string, prefix: string) => {
    if (!companyId || !posId) return null;
    return {
      add: (data: any) => addEntity(tableName, data, prefix, companyId, posId),
      update: (id: string, updates: any) => updateEntity(tableName, id, updates),
      remove: (id: string) => deleteEntity(tableName, id),
    };
  }, [companyId, posId]);

  const productHandler = useMemo(() => crudHandler('products', 'prod'), [crudHandler]);
  const expenseHandler = useMemo(() => crudHandler('expenses', 'exp'), [crudHandler]);
  const supplierHandler = useMemo(() => crudHandler('suppliers', 'sup'), [crudHandler]);

  // --- Context Value ---
  const value: AppContextType = useMemo(() => ({
    products: products || [],
    sales: sales || [],
    stockMovements: stockMovements || [],
    expenses: expenses || [],
    suppliers: suppliers || [],
    
    // Cart
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
    
    // Initial Setup
    isFirstLaunch,
    initialBalance,
    setupInitialBalance,
    
    // Data Mutations
    addSale,
    adjustStock,
    addProduct: (data) => productHandler?.add(data) as Promise&lt;void&gt;,
    updateProduct: (id, updates) => productHandler?.update(id, updates) as Promise&lt;void&gt;,
    deleteProduct: (id) => productHandler?.remove(id) as Promise&lt;void&gt;,
    addExpense: (data) => expenseHandler?.add(data) as Promise&lt;void&gt;,
    updateExpense: (id, updates) => expenseHandler?.update(id, updates) as Promise&lt;void&gt;,
    deleteExpense: (id) => expenseHandler?.remove(id) as Promise&lt;void&gt;,
    addSupplier: (data) => supplierHandler?.add(data) as Promise&lt;void&gt;,
    updateSupplier: (id, updates) => supplierHandler?.update(id, updates) as Promise&lt;void&gt;,
    deleteSupplier: (id) => supplierHandler?.remove(id) as Promise&lt;void&gt;,
  }), [
    products, sales, stockMovements, expenses, suppliers,
    cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal,
    isFirstLaunch, initialBalance, setupInitialBalance,
    addSale, adjustStock,
    productHandler, expenseHandler, supplierHandler
  ]);

  return &lt;AppContext.Provider value={value}&gt;{children}&lt;/AppContext.Provider&gt;;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
