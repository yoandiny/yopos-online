import React from 'react';
import ProductSearch from '../components/cash-register/ProductSearch';
import Cart from '../components/cash-register/Cart';
import { motion } from 'framer-motion';

const CashRegister: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col lg:flex-row"
    >
      <div className="flex-1 lg:w-2/3 bg-white rounded-l-lg border border-r-0 border-gray-200 shadow-sm">
        <ProductSearch />
      </div>
      <div className="w-full lg:w-1/3">
        <Cart />
      </div>
    </motion.div>
  );
};

export default CashRegister;
