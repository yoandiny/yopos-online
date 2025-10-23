import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { formatCurrency } from '../lib/utils';
import { ShoppingCart, Wallet, TriangleAlert, HandCoins } from 'lucide-react';
import { motion } from 'framer-motion';
import { subDays, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DashboardStatCard from '../components/dashboard/DashboardStatCard';
import RecentSales from '../components/dashboard/RecentSales';
import PopularProducts from '../components/dashboard/PopularProducts';
import SalesTrendChart from '../components/dashboard/SalesTrendChart';

const Dashboard: React.FC = () => {
  const { sales, products } = useAppContext();

  const stats = useMemo(() => {
    if (!sales || !products) return null;

    const now = new Date();
    const today = startOfDay(now);
    const yesterday = startOfDay(subDays(now, 1));

    const salesToday = sales.filter(s => new Date(s.createdAt) >= today);
    const salesYesterday = sales.filter(s => isWithinInterval(new Date(s.createdAt), { start: yesterday, end: endOfDay(yesterday) }));

    const revenueToday = salesToday.reduce((sum, s) => sum + s.total, 0);
    const revenueYesterday = salesYesterday.reduce((sum, s) => sum + s.total, 0);

    const revenueTodayComparison = revenueYesterday > 0 ? ((revenueToday - revenueYesterday) / revenueYesterday) * 100 : revenueToday > 0 ? 100 : 0;
    
    const averageTransactionToday = salesToday.length > 0 ? revenueToday / salesToday.length : 0;

    const generalBalance = sales.reduce((sum, s) => sum + s.total, 0);
    
    const lowStockThreshold = 10;
    const lowStockProductsCount = products.filter(p => p.stock > 0 && p.stock <= lowStockThreshold).length;

    // Data for sales trend chart (last 7 days)
    const salesTrendData = Array.from({ length: 7 }).map((_, i) => {
        const date = subDays(today, 6 - i);
        const dailySales = sales.filter(s => startOfDay(new Date(s.createdAt)).getTime() === date.getTime());
        return {
            date: format(date, 'eee', { locale: fr }),
            total: dailySales.reduce((sum, s) => sum + s.total, 0)
        };
    });

    return {
      revenueToday,
      transactionsToday: salesToday.length,
      revenueTodayComparison,
      averageTransactionToday,
      generalBalance,
      lowStockProductsCount,
      salesTrendData,
    };
  }, [sales, products]);

  if (!stats) {
    return <div className="text-center p-8">Chargement des données stratégiques...</div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardStatCard 
          title="Ventes du jour"
          value={formatCurrency(stats.revenueToday)}
          subtitle={`${stats.transactionsToday} transactions`}
          icon={ShoppingCart}
          comparisonValue={stats.revenueTodayComparison}
          comparisonText="vs hier"
        />
        <DashboardStatCard 
          title="Panier Moyen (jour)"
          value={formatCurrency(stats.averageTransactionToday)}
          subtitle="Valeur par transaction"
          icon={HandCoins}
        />
        <DashboardStatCard 
          title="Solde général"
          value={formatCurrency(stats.generalBalance)}
          subtitle="Chiffre d'affaires total"
          icon={Wallet}
        />
        <DashboardStatCard 
          title="Alertes Stock"
          value={stats.lowStockProductsCount.toString()}
          subtitle="Produits en stock faible"
          icon={TriangleAlert}
          valueColor={stats.lowStockProductsCount > 0 ? "text-red-500" : "text-slate-800"}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <SalesTrendChart data={stats.salesTrendData} />
        </div>
        <RecentSales />
      </div>
      <div className="grid grid-cols-1 gap-6">
        <PopularProducts />
      </div>
    </motion.div>
  );
};

export default Dashboard;
