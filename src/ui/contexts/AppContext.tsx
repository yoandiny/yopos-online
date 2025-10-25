import  { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Product, Sale, CartItem, StockMovement } from '../types';

interface AppContextType {
  products: Product[];
  sales: Sale[];
  stockMovements: StockMovement[];
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id'>>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  adjustStock: (productId: string, quantityChange: number, reason: string) => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const products = useLiveQuery(() => db.products.toArray(), []);
  const sales = useLiveQuery(() => db.sales.orderBy('createdAt').reverse().toArray(), []);
  const stockMovements = useLiveQuery(() => db.stockMovements.orderBy('createdAt').reverse().toArray(), []);
  const [cart, setCart] = useState<CartItem[]>([]);

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

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const value = {
    products: products || [],
    sales: sales || [],
    stockMovements: stockMovements || [],
    addSale,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
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
