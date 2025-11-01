import React, { useMemo, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { formatCurrency, cn } from '../lib/utils';
import { ShoppingCart, Wallet, TriangleAlert, Landmark, HandCoins } from 'lucide-react';
import { motion } from 'framer-motion';
import { subDays, isWithinInterval, startOfDay, endOfDay, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DashboardStatCard from '../components/dashboard/DashboardStatCard';
import RecentSales from '../components/dashboard/RecentSales';
import PopularProducts from '../components/dashboard/PopularProducts';
import SalesTrendChart from '../components/dashboard/SalesTrendChart';

const Dashboard: React.FC = () => {
  const { sales, products, expenses, initialBalance, creditPayments } = useAppContext();
  const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const stats = useMemo(() => {
    if (!sales || !products || !expenses || !creditPayments) return null;

    const now = new Date();
    const today = startOfDay(now);
    const yesterday = startOfDay(subDays(now, 1));

    const salesToday = sales.filter(s => new Date(s.createdAt) >= today);
    const salesYesterday = sales.filter(s => isWithinInterval(new Date(s.createdAt), { start: yesterday, end: endOfDay(yesterday) }));

    const revenueToday = salesToday.reduce((sum, s) => sum + s.total, 0);
    const revenueYesterday = salesYesterday.reduce((sum, s) => sum + s.total, 0);

    const revenueTodayComparison = revenueYesterday > 0 ? ((revenueToday - revenueYesterday) / revenueYesterday) * 100 : revenueToday > 0 ? 100 : 0;
    
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netBalance = initialBalance + totalRevenue - totalExpenses;
    
    const lowStockThreshold = 10;
    const lowStockProductsCount = products.filter(p => p.stock > 0 && p.stock <= lowStockThreshold).length;

    const unpaidSales = sales.filter(s => s.status === 'unpaid');
    const totalUnpaidAmount = unpaidSales.reduce((sum, s) => sum + s.total, 0);
    const totalPaidOnCredits = creditPayments.reduce((sum, p) => sum + p.amount, 0);
    const outstandingCredit = totalUnpaidAmount - totalPaidOnCredits;

    const daysCount = chartPeriod === 'weekly' ? 7 : 30;
    const salesTrendData = Array.from({ length: daysCount }).map((_, i) => {
        const date = subDays(today, (daysCount - 1) - i);
        const dailySales = sales.filter(s => startOfDay(new Date(s.createdAt)).getTime() === date.getTime());
        return {
            date: format(date, daysCount === 7 ? 'eee' : 'dd/MM', { locale: fr }),
            total: dailySales.reduce((sum, s) => sum + s.total, 0)
        };
    });

    return {
      revenueToday,
      transactionsToday: salesToday.length,
      revenueTodayComparison,
      totalRevenue,
      netBalance,
      lowStockProductsCount,
      outstandingCredit,
      salesTrendData,
    };
  }, [sales, products, expenses, chartPeriod, initialBalance, creditPayments]);

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

  const tabButtonClasses = (isActive: boolean) => cn(
    'px-3 py-1 text-sm font-medium rounded-md transition-colors',
    isActive
      ? 'bg-white text-blue-700 shadow-sm'
      : 'text-slate-600 hover:bg-slate-200/50'
  );

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
          title="Total des Crédits"
          value={formatCurrency(stats.outstandingCredit)}
          subtitle="Montant dû par les clients"
          icon={HandCoins}
          valueColor="text-orange-600"
        />
        <DashboardStatCard 
          title="Solde Net"
          value={formatCurrency(stats.netBalance)}
          subtitle="Rev. Total - Dépenses Totales"
          icon={Landmark}
          valueColor={stats.netBalance >= 0 ? "text-green-600" : "text-red-600"}
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
            <div className="flex justify-end mb-4">
                <div className="bg-slate-100 p-1 rounded-lg inline-flex items-center space-x-1">
                    <button className={tabButtonClasses(chartPeriod === 'weekly')} onClick={() => setChartPeriod('weekly')}>7 jours</button>
                    <button className={tabButtonClasses(chartPeriod === 'monthly')} onClick={() => setChartPeriod('monthly')}>30 jours</button>
                </div>
            </div>
            <SalesTrendChart 
                data={stats.salesTrendData} 
                title={`Tendance des Ventes (${chartPeriod === 'weekly' ? '7 derniers jours' : '30 derniers jours'})`}
            />
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
