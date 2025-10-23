import React from 'react';
import { formatCurrency } from '../../lib/utils';
import { BarChartBig } from 'lucide-react';
import { motion } from 'framer-motion';

interface StockValueCardProps {
  totalProducts: number;
  totalUnits: number;
  totalValue: number;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const StockValueCard: React.FC<StockValueCardProps> = ({ totalProducts, totalUnits, totalValue }) => {
  return (
    <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm h-full">
      <div className="p-5 border-b border-slate-200">
        <h3 className="text-base font-semibold flex items-center">
          <BarChartBig className="h-5 w-5 mr-2 text-blue-600" />
          Valeur du stock
        </h3>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-center text-sm bg-slate-100/80 p-3 rounded-lg">
          <span className="font-medium text-slate-600">Total produits</span>
          <span className="font-bold">{totalProducts}</span>
        </div>
        <div className="flex justify-between items-center text-sm bg-slate-100/80 p-3 rounded-lg">
          <span className="font-medium text-slate-600">Total unités</span>
          <span className="font-bold">{totalUnits}</span>
        </div>
        <div className="flex justify-between items-center text-sm bg-green-100 p-3 rounded-lg">
          <span className="font-medium text-green-800">Valeur totale</span>
          <span className="font-bold text-green-800">{formatCurrency(totalValue)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StockValueCard;
