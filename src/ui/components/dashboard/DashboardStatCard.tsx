import React from 'react';
import { LucideProps, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface DashboardStatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<LucideProps>;
  valueColor?: string;
  comparisonValue?: number;
  comparisonText?: string;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({ title, value, subtitle, icon: Icon, valueColor = 'text-slate-800', comparisonValue, comparisonText }) => {
  const hasComparison = comparisonValue !== undefined;
  const isPositive = hasComparison && comparisonValue > 0;
  const isNegative = hasComparison && comparisonValue < 0;

  const ComparisonIcon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus;
  const comparisonColor = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-slate-500';

  return (
    <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm p-5 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="bg-slate-100 rounded-full p-2">
          <Icon className="h-5 w-5 text-slate-500" />
        </div>
      </div>
      <div>
        <p className={cn("text-2xl font-bold mt-1", valueColor)}>{value}</p>
        <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-slate-400">{subtitle}</p>
            {hasComparison && (
                <span className={cn("flex items-center text-xs font-semibold", comparisonColor)}>
                    <ComparisonIcon className="h-3 w-3 mr-0.5" />
                    {comparisonValue.toFixed(0)}% {comparisonText}
                </span>
            )}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardStatCard;
