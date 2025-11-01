import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { useAppContext } from '../../contexts/AppContext';

const ExpensesByCategoryChart: React.FC = () => {
  const { expenses } = useAppContext();

  const chartData = useMemo(() => {
    const expensesPerCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(expensesPerCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

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
        name: 'Dépenses par Catégorie',
        type: 'pie',
        radius: '70%',
        data: chartData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
    color: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'],
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <h3 className="text-lg font-semibold">Répartition des dépenses par catégorie</h3>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ReactECharts option={option} style={{ height: '350px' }} />
        ) : (
          <p className="text-center text-gray-500 py-16">Aucune dépense enregistrée.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpensesByCategoryChart;
