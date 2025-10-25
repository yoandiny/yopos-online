import  { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useAppContext } from './contexts/AppContext';

import SplashScreen from './components/common/SplashScreen';
import AppLayout from './components/layout/AppLayout';
import InitialBalanceModal from './components/common/InitialBalanceModal';

import Dashboard from './pages/Dashboard';
import CashRegister from './pages/CashRegister';
import Products from './pages/Products';
import Stock from './pages/Stock';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Suppliers from './pages/Suppliers';

const AppRoutes: React.FC = () => (
  <Router>
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/caisse" element={<CashRegister />} />
        <Route path="/produits" element={<Products />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/ventes" element={<Sales />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/fournisseurs" element={<Suppliers />} />
      </Routes>
    </AppLayout>
  </Router>
);

const AppContent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { isFirstLaunch, setupInitialBalance } = useAppContext();
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      if (isFirstLaunch) {
        // A small delay to let the main UI render before showing the modal
        setTimeout(() => setIsBalanceModalOpen(true), 200);
      }
    }, 2000); // Keep existing splash screen time
    return () => clearTimeout(timer);
  }, [isFirstLaunch]);

  const handleSaveBalance = (balance: number) => {
    setupInitialBalance(balance);
    setIsBalanceModalOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {loading && <SplashScreen />}
      </AnimatePresence>
      {!loading && <AppRoutes />}
      <InitialBalanceModal
        isOpen={isBalanceModalOpen}
        onSave={handleSaveBalance}
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
