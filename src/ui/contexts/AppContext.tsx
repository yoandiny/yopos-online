import  { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Product, Sale, CartItem, StockMovement, Expense, Supplier } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface AppContextType {
  products: Product[];
  sales: Sale[];
  stockMovements: StockMovement[];
  expenses: Expense[];
  suppliers: Supplier[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id'>>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  adjustStock: (productId: string, quantityChange: number, reason: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id'>>) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Promise<void>;
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
  const products = useLiveQuery(() => db.products.toArray(), []);
  const sales = useLiveQuery(() => db.sales.orderBy('createdAt').reverse().toArray(), []);
  const stockMovements = useLiveQuery(() => db.stockMovements.orderBy('createdAt').reverse().toArray(), []);
  const expenses = useLiveQuery(() => db.expenses.orderBy('createdAt').reverse().toArray(), []);
  const suppliers = useLiveQuery(() => db.suppliers.orderBy('name').toArray(), []);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isFirstLaunch, setIsFirstLaunch] = useLocalStorage<boolean>('isFirstLaunch', true);
  const [initialBalance, setInitialBalance] = useLocalStorage<number>('initialBalance', 0);

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
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item => (item.id === productId ? { ...item, quantity } : item))
        .filter(item => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const addSale = useCallback(async (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...saleData,
      id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    try {
      await db.transaction('rw', db.sales, db.products, async () => {
        await db.sales.add(newSale);
        for (const item of newSale.items) {
          await db.products.where('id').equals(item.id).modify(product => {
            product.stock -= item.quantity;
          });
        }
      });
      clearCart();
    } catch (error) {
      console.error("Failed to process sale:", error);
      alert("Une erreur est survenue lors de l'enregistrement de la vente.");
    }
  }, [clearCart]);

  const addProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    await db.products.add(newProduct);
  }, []);
  
  const updateProduct = useCallback(async (id: string, updates: Partial<Omit<Product, 'id'>>) => {
    await db.products.update(id, updates);
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    await db.products.delete(productId);
  }, []);

  const adjustStock = useCallback(async (productId: string, quantityChange: number, reason: string) => {
    try {
      await db.transaction('rw', db.products, db.stockMovements, async () => {
        const product = await db.products.get(productId);
        if (!product) throw new Error("Produit non trouvé");
        
        const newStock = product.stock + quantityChange;
        if (newStock < 0) {
          throw new Error("Le stock ne peut pas être négatif.");
        }

        await db.products.update(productId, { stock: newStock });

        const movement: StockMovement = {
          productId,
          quantityChange,
          reason,
          createdAt: new Date().toISOString(),
        };
        await db.stockMovements.add(movement);
      });
    } catch (error) {
      console.error("Failed to adjust stock:", error);
      alert(`Une erreur est survenue: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }, []);

  const addExpense = useCallback(async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    await db.expenses.add(newExpense);
  }, []);

  const updateExpense = useCallback(async (id: string, updates: Partial<Omit<Expense, 'id'>>) => {
    await db.expenses.update(id, updates);
  }, []);

  const deleteExpense = useCallback(async (expenseId: string) => {
    await db.expenses.delete(expenseId);
  }, []);

  const addSupplier = useCallback(async (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    await db.suppliers.add(newSupplier);
  }, []);

  const updateSupplier = useCallback(async (id: string, updates: Partial<Omit<Supplier, 'id' | 'createdAt'>>) => {
    await db.suppliers.update(id, updates);
  }, []);

  const deleteSupplier = useCallback(async (supplierId: string) => {
    await db.transaction('rw', db.suppliers, db.products, async () => {
        await db.suppliers.delete(supplierId);
        const productsToUpdate = await db.products.where({ supplierId }).toArray();
        for (const product of productsToUpdate) {
            await db.products.update(product.id, { supplierId: undefined });
        }
    });
    alert('Fournisseur supprimé et produits déliés avec succès.');
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const value = {
    products: products || [],
    sales: sales || [],
    stockMovements: stockMovements || [],
    expenses: expenses || [],
    suppliers: suppliers || [],
    addSale,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    addExpense,
    updateExpense,
    deleteExpense,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
    isFirstLaunch,
    initialBalance,
    setupInitialBalance,
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
