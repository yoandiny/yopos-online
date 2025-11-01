import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import StockAdjustmentForm from '../components/stock/StockAdjustmentForm';
import AllProductsStockTable from '../components/stock/AllProductsStockTable';
import LowStockTable from '../components/stock/LowStockTable';
import StockValueCard from '../components/stock/StockValueCard';
import { useAppContext } from '../contexts/AppContext';
import { Product } from '../types';

type StockTab = 'all' | 'low' | 'adjustment';

const Stock: React.FC = () => {
  const [activeTab, setActiveTab] = useState<StockTab>('all');
  const { products } = useAppContext();

  const stockableProducts = useMemo(() => {
    return products.filter(p => p.type === 'product');
  }, [products]);

  const stockStats = useMemo(() => {
    const totalProducts = stockableProducts.length;
    const totalUnits = stockableProducts.reduce((sum, p) => sum + p.stock, 0);
    const totalValue = stockableProducts.reduce((sum, p) => sum + p.price * p.stock, 0);
    return { totalProducts, totalUnits, totalValue };
  }, [stockableProducts]);

  const tabButtonClasses = (tabName: StockTab) => cn(
    'px-4 py-2 text-sm font-medium rounded-md transition-colors',
    activeTab === tabName
      ? 'bg-white text-blue-700 shadow-sm'
      : 'text-slate-600 hover:bg-slate-200/50'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <StockValueCard 
        totalProducts={stockStats.totalProducts}
        totalUnits={stockStats.totalUnits}
        totalValue={stockStats.totalValue}
      />
      
      <div className="bg-slate-100 p-1.5 rounded-lg inline-flex items-center space-x-2">
        <button className={tabButtonClasses('all')} onClick={() => setActiveTab('all')}>
          Tous les produits
        </button>
        <button className={tabButtonClasses('low')} onClick={() => setActiveTab('low')}>
          Stock Faible
        </button>
        <button className={tabButtonClasses('adjustment')} onClick={() => setActiveTab('adjustment')}>
          Ajustement de stock
        </button>
      </div>

      <div>
        {activeTab === 'all' && <AllProductsStockTable products={stockableProducts} />}
        {activeTab === 'low' && <LowStockTable products={stockableProducts} />}
        {activeTab === 'adjustment' && <StockAdjustmentForm products={stockableProducts} />}
      </div>
    </motion.div>
  );
};

export default Stock;
