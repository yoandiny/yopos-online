import React from 'react';
import { motion } from 'framer-motion';
import RevenueByProductChart from '../components/reports/RevenueByProductChart';
import ExpensesByCategoryChart from '../components/reports/ExpensesByCategoryChart';
import RevenueVsExpensesChart from '../components/reports/RevenueVsExpensesChart';
import SalesByPaymentMethodChart from '../components/reports/SalesByPaymentMethodChart';

const Reports: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <RevenueVsExpensesChart />
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <RevenueByProductChart />
        </motion.div>
        <motion.div variants={itemVariants}>
          <ExpensesByCategoryChart />
        </motion.div>
      </div>
      <motion.div variants={itemVariants}>
        <SalesByPaymentMethodChart />
      </motion.div>
    </motion.div>
  );
};

export default Reports;
