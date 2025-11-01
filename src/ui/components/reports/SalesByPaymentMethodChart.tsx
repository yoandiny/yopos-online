import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { useAppContext } from '../../contexts/AppContext';

const SalesByPaymentMethodChart: React.FC = () => {
  const { sales } = useAppContext();

  const chartData = useMemo(() => {
    const paymentMethods = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod.replace('_', ' ');
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(paymentMethods).map(([name, value]) => ({ name, value }));
  }, [sales]);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ventes ({d}%)',
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        name: 'Méthode de paiement',
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
    color: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'],
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Ventes par méthode de paiement</h3>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ReactECharts option={option} style={{ height: '350px' }} />
        ) : (
          <p className="text-center text-gray-500 py-16">Aucune vente enregistrée.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesByPaymentMethodChart;
