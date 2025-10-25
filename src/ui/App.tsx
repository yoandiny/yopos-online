import  { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider } from './contexts/AppContext';

import SplashScreen from './components/common/SplashScreen';
import AppLayout from './components/layout/AppLayout';

import Dashboard from './pages/Dashboard';
import CashRegister from './pages/CashRegister';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Stock from './pages/Stock';
import Expenses  from './pages/Expenses';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppProvider>
      <AnimatePresence>
        {loading && <SplashScreen />}
      </AnimatePresence>
      {!loading && (
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/caisse" element={<CashRegister />} />
              <Route path="/produits" element={<Products />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/ventes" element={<Sales />} />
              <Route path="/expenses" element={<Expenses />} />
            </Routes>
          </AppLayout>
        </Router>
      )}
    </AppProvider>
  );
};

export default App;
