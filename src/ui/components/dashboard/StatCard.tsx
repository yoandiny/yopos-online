import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease';
  iconBgClass: string;
  iconColorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, changeType, iconBgClass, iconColorClass }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={cn("flex items-center justify-center h-8 w-8 rounded-full", iconBgClass)}>
            <div className={cn("h-5 w-5", iconColorClass)}>
                {icon}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            {changeType === 'increase' ? (
              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={cn(changeType === 'increase' ? 'text-green-600' : 'text-red-600', 'font-semibold')}>
              {change}
            </span>
            &nbsp;vs hier
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
