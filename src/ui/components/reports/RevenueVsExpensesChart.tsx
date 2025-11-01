import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { useAppContext } from '../../contexts/AppContext';
import { formatCurrency } from '../../lib/utils';
import { subDays, startOfDay, format } from 'date-fns';
import { fr } from 'date-fns/locale';

const RevenueVsExpensesChart: React.FC = () => {
  const { sales, expenses } = useAppContext();

  const chartData = useMemo(() => {
    const days = 30;
    const labels = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      return format(date, 'dd/MM', { locale: fr });
    });

    const dailyData = Array.from({ length: days }, (_, i) => {
      const date = startOfDay(subDays(new Date(), days - 1 - i));
      return {
        revenue: sales
          .filter(s => startOfDay(new Date(s.createdAt)).getTime() === date.getTime())
          .reduce((sum, s) => sum + s.total, 0),
        expense: expenses
          .filter(e => startOfDay(new Date(e.createdAt)).getTime() === date.getTime())
          .reduce((sum, e) => sum + e.amount, 0),
      };
    });

    return {
      labels,
      revenues: dailyData.map(d => d.revenue),
      expenses: dailyData.map(d => d.expense),
    };
  }, [sales, expenses]);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    legend: {
      data: ['Revenus', 'Dépenses']
    },
    xAxis: [
      {
        type: 'category',
        data: chartData.labels,
        axisPointer: {
          type: 'shadow'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: 'Montant (Ar)',
        axisLabel: {
          formatter: (value: number) => formatCurrency(value, '').replace(/\s/g, '')
        }
      }
    ],
    series: [
      {
        name: 'Revenus',
        type: 'bar',
        tooltip: {
          valueFormatter: (value: any) => formatCurrency(value as number)
        },
        data: chartData.revenues,
        color: '#2563eb'
      },
      {
        name: 'Dépenses',
        type: 'line',
        smooth: true,
        tooltip: {
          valueFormatter: (value: any) => formatCurrency(value as number)
        },
        data: chartData.expenses,
        color: '#ef4444'
      }
    ]
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Revenus vs Dépenses (30 derniers jours)</h3>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: '400px' }} />
      </CardContent>
    </Card>
  );
};

export default RevenueVsExpensesChart;
