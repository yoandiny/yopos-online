import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Product, Sale, CartItem, StockMovement, Expense, Supplier, Customer, CreditPayment, PaymentMethod } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from './AuthContext';
import { syncDatabase } from '../services/syncService';

// --- Internal Helper Functions ---

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

const updateEntity = async (tableName: string, id: string, updates: any) => {
  const updateData = { ...updates, updatedAt: new Date().toISOString(), syncStatus: 'pending' as const };
  await db.table(tableName).update(id, updateData);
  syncDatabase();
};

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
  customers: Customer[];
  creditPayments: CreditPayment[];

  addSale: (sale: Omit&lt;Sale, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'&gt;) => Promise&lt;void&gt;;
  
  addProduct: (product: Omit&lt;Product, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'&gt;) => Promise&lt;string&gt;;
  updateProduct: (id: string, updates: Partial&lt;Omit&lt;Product, 'id'&gt;&gt;)=> Promise&lt;void&gt;;
  deleteProduct: (productId: string) => Promise&lt;void&gt;;
  
  adjustStock: (productId: string, quantityChange: number, reason: string) => Promise&lt;void&gt;;
  
  addExpense: (expense: Omit&lt;Expense, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'&gt;) => Promise&lt;string&gt;;
  updateExpense: (id: string, updates: Partial&lt;Omit&lt;Expense, 'id'&gt;&gt;) => Promise&lt;void&gt;;
  deleteExpense: (expenseId: string) => Promise&lt;void&gt;;
  
  addSupplier: (supplier: Omit&lt;Supplier, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'&gt;) => Promise&lt;string&gt;;
  updateSupplier: (id: string, updates: Partial&lt;Omit&lt;Supplier, 'id' | 'createdAt'&gt;&gt;) => Promise&lt;void&gt;;
  deleteSupplier: (supplierId: string) => Promise&lt;void&gt;;

  addCustomer: (customer: Omit&lt;Customer, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'&gt;) => Promise&lt;string&gt;;
  updateCustomer: (id: string, updates: Partial&lt;Omit&lt;Customer, 'id' | 'createdAt'&gt;&gt;) => Promise&lt;void&gt;;
  deleteCustomer: (customerId: string) => Promise&lt;void&gt;;

  addCreditPayment: (saleId: string, amount: number, paymentMethod: Exclude&lt;PaymentMethod, 'credit'&gt;) => Promise&lt;void&gt;;

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

export const AppProvider: React.FC&lt;{ children: ReactNode }&gt; = ({ children }) => {
  const { company, pos } = useAuth();
  const companyId = company?.id;
  const posId = pos?.id;

  const liveQueryDeps = useMemo(() => [companyId, posId], [companyId, posId]);

  const products = useLiveQuery(() => companyId && posId ? db.products.where({ companyId, posId }).filter(p => !p._deleted).toArray() : [], liveQueryDeps, []);
  const sales = useLiveQuery(() => companyId && posId ? db.sales.where({ companyId, posId }).filter(s => !s._deleted).orderBy('createdAt').reverse().toArray() : [], liveQueryDeps, []);
  const stockMovements = useLiveQuery(() => companyId && posId ? db.stockMovements.where({ companyId, posId }).filter(sm => !sm._deleted).orderBy('createdAt').reverse().toArray() : [], liveQueryDeps, []);
  const expenses = useLiveQuery(() => companyId && posId ? db.expenses.where({ companyId, posId }).filter(e => !e._deleted).orderBy('createdAt').reverse().toArray() : [], liveQueryDeps, []);
  const suppliers = useLiveQuery(() => companyId && posId ? db.suppliers.where({ companyId, posId }).filter(s => !s._deleted).orderBy('name').toArray() : [], liveQueryDeps, []);
  const customers = useLiveQuery(() => companyId && posId ? db.customers.where({ companyId, posId }).filter(c => !c._deleted).orderBy('name').toArray() : [], liveQueryDeps, []);
  const creditPayments = useLiveQuery(() => companyId && posId ? db.creditPayments.where({ companyId, posId }).filter(cp => !cp._deleted).toArray() : [], liveQueryDeps, []);

  const [cart, setCart] = useState&lt;CartItem[]&gt;([]);
  const cartTotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart]);

  const addToCart = useCallback((product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      const { name, price, stock, barcode, id, supplierId, type } = product;
      return [...prevCart, { name, price, stock, barcode, id, supplierId, type, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => setCart(prevCart => prevCart.filter(item => item.id !== productId)), []);
  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    setCart(prevCart => prevCart.map(item => (item.id === productId ? { ...item, quantity } : item)).filter(item => item.quantity > 0));
  }, []);
  const clearCart = useCallback(() => setCart([]), []);

  const [isFirstLaunch, setIsFirstLaunch] = useLocalStorage&lt;boolean&gt;(`isFirstLaunch:${companyId}:${posId}`, true);
  const [initialBalance, setInitialBalance] = useLocalStorage&lt;number&gt;(`initialBalance:${companyId}:${posId}`, 0);

  const setupInitialBalance = useCallback((balance: number) => {
    setInitialBalance(balance);
    setIsFirstLaunch(false);
  }, [setInitialBalance, setIsFirstLaunch]);

  const ensureAuth = useCallback(() => {
    if (!companyId || !posId) {
      const errorMessage = "Session invalide. Impossible d'effectuer l'opération.";
      alert(errorMessage);
      throw new Error(errorMessage);
    }
    return { companyId, posId };
  }, [companyId, posId]);

  const addSale = useCallback(async (saleData: Omit&lt;Sale, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'&gt;) => {
    const { companyId, posId } = ensureAuth();
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
                if (item.type === 'product') {
                    const product = await db.products.get(item.id);
                    if (product) {
                        const newStock = product.stock - item.quantity;
                        await db.products.update(item.id, {
                            stock: newStock,
                            updatedAt: now,
                            syncStatus: 'pending'
                        });
                    } else {
                        throw new Error(`Produit "${item.name}" (ID: ${item.id}) non trouvé.`);
                    }
                }
            }
        });
        clearCart();
        syncDatabase();
    } catch (error) {
        console.error("Échec du traitement de la vente:", error);
        alert(`Une erreur est survenue: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [ensureAuth, clearCart]);

  const adjustStock = useCallback(async (productId: string, quantityChange: number, reason: string) => {
    const { companyId, posId } = ensureAuth();
    try {
      await db.transaction('rw', db.products, db.stockMovements, async () => {
        const product = await db.products.get(productId);
        if (!product) throw new Error("Produit non trouvé");
        if (product.type === 'service') throw new Error("Impossible d'ajuster le stock d'un service.");
        
        const newStock = product.stock + quantityChange;
        if (newStock &lt; 0) throw new Error("Le stock ne peut pas être négatif.");

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
  }, [ensureAuth]);

  const addCreditPayment = useCallback(async (saleId: string, amount: number, paymentMethod: Exclude&lt;PaymentMethod, 'credit'&gt;) => {
    const { companyId, posId } = ensureAuth();
    try {
      await db.transaction('rw', db.creditPayments, db.sales, async () => {
        const paymentId = `cp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newPayment: Omit&lt;CreditPayment, 'id'&gt; = {
          paymentId,
          companyId,
          posId,
          saleId,
          amount,
          paymentMethod,
          createdAt: new Date().toISOString(),
          syncStatus: 'pending',
          _deleted: false,
        };
        await db.creditPayments.add(newPayment);

        const sale = await db.sales.get(saleId);
        if (!sale) throw new Error("Vente non trouvée.");

        const paymentsForSale = await db.creditPayments.where({ saleId }).toArray();
        const totalPaid = paymentsForSale.reduce((sum, p) => sum + p.amount, 0);

        if (totalPaid >= sale.total) {
          await db.sales.update(saleId, { status: 'paid', syncStatus: 'pending', updatedAt: new Date().toISOString() });
        }
      });
      syncDatabase();
    } catch (error) {
      console.error("Échec de l'ajout du paiement de crédit:", error);
      alert(`Erreur: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }, [ensureAuth]);
  
  const addProduct = useCallback(async (productData: Omit&lt;Product, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'posId' | 'syncStatus' | '_deleted'&gt;) => {
    const { companyId, posId } = ensureAuth();
    const dataToSave = { ...productData };
    if (dataToSave.type === 'service') {
        dataToSave.stock = 0;
        dataToSave.barcode = '';
    }
    return addEntity&lt;Product&gt;('products', dataToSave, 'prod', companyId, posId);
  }, [ensureAuth]);

  const updateProduct = useCallback(async (id: string, updates: Partial&lt;Omit&lt;Product, 'id'&gt;&gt;) => {
      ensureAuth();
      const dataToUpdate = { ...updates };
      const finalType = dataToUpdate.type || (await db.products.get(id))?.type;
      if (finalType === 'service') {
          dataToUpdate.stock = 0;
          dataToUpdate.barcode = '';
      }
      await updateEntity('products', id, dataToUpdate);
  }, [ensureAuth]);

  const deleteProduct = useCallback(async (productId: string) => {
      ensureAuth();
      await deleteEntity('products', productId);
  }, [ensureAuth]);

  const crudHandler = useCallback((tableName: string, prefix: string) => {
    return {
      add: (data: any) => {
        const { companyId, posId } = ensureAuth();
        return addEntity(tableName, data, prefix, companyId, posId);
      },
      update: (id: string, updates: any) => {
        ensureAuth();
        return updateEntity(tableName, id, updates);
      },
      remove: (id: string) => {
        ensureAuth();
        return deleteEntity(tableName, id);
      },
    };
  }, [ensureAuth]);

  const expenseHandler = useMemo(() => crudHandler('expenses', 'exp'), [crudHandler]);
  const supplierHandler = useMemo(() => crudHandler('suppliers', 'sup'), [crudHandler]);
  const customerHandler = useMemo(() => crudHandler('customers', 'cust'), [crudHandler]);

  const value: AppContextType = useMemo(() => ({
    products: products || [],
    sales: sales || [],
    stockMovements: stockMovements || [],
    expenses: expenses || [],
    suppliers: suppliers || [],
    customers: customers || [],
    creditPayments: creditPayments || [],
    
    cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal,
    isFirstLaunch, initialBalance, setupInitialBalance,
    
    addSale,
    adjustStock,
    addCreditPayment,
    addProduct,
    updateProduct,
    deleteProduct,
    addExpense: expenseHandler.add,
    updateExpense: expenseHandler.update,
    deleteExpense: expenseHandler.remove,
    addSupplier: supplierHandler.add,
    updateSupplier: supplierHandler.update,
    deleteSupplier: supplierHandler.remove,
    addCustomer: customerHandler.add,
    updateCustomer: customerHandler.update,
    deleteCustomer: customerHandler.remove,
  }), [
    products, sales, stockMovements, expenses, suppliers, customers, creditPayments,
    cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal,
    isFirstLaunch, initialBalance, setupInitialBalance,
    addSale, adjustStock, addCreditPayment,
    addProduct, updateProduct, deleteProduct,
    expenseHandler, supplierHandler, customerHandler
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
