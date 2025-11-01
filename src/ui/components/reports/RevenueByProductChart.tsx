import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { useAppContext } from '../../contexts/AppContext';
import { formatCurrency } from '../../lib/utils';

const RevenueByProductChart: React.FC = () => {
  const { sales } = useAppContext();

  const chartData = useMemo(() => {
    const revenuePerProduct = sales
      .flatMap(sale => sale.items)
      .reduce((acc, item) => {
        const revenue = item.price * item.quantity;
        acc[item.name] = (acc[item.name] || 0) + revenue;
        return acc;
      }, {} as { [key: string]: number });

    return Object.entries(revenuePerProduct)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [sales]);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      type: 'scroll',
    },
    series: [
      {
        name: 'Revenus par Article',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '20',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData,
      },
    ],
    color: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-lg font-semibold">Répartition des revenus par article</h3>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ReactECharts option={option} style={{ height: '350px' }} />
        ) : (
          <p className="text-center text-gray-500 py-16">Pas assez de données pour afficher le graphique.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueByProductChart;
