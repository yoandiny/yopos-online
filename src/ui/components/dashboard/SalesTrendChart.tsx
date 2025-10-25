import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';
import { motion } from 'framer-motion';

interface SalesTrendChartProps {
  title: string;
  data: { date: string; total: number }[];
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ title, data }) => {
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const { name, value } = params[0];
        return `${name}<br/>Ventes: <strong>${formatCurrency(value)}</strong>`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(item => item.date),
      axisLine: {
        lineStyle: {
          color: '#cbd5e1'
        }
      },
      axisLabel: {
        color: '#64748b'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => formatCurrency(value, '').replace(/\s/g, ''),
        color: '#64748b'
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#e2e8f0'
        }
      }
    },
    series: [
      {
        name: 'Ventes',
        type: 'line',
        smooth: true,
        data: data.map(item => item.total),
        itemStyle: {
          color: '#3b82f6'
        },
        lineStyle: {
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
                offset: 0, color: 'rgba(59, 130, 246, 0.3)'
            }, {
                offset: 1, color: 'rgba(59, 130, 246, 0)'
            }]
          }
        },
        showSymbol: false,
      }
    ],
    responsive: true,
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full">
        <CardHeader>
          <h3 className="text-lg font-semibold">{title}</h3>
        </CardHeader>
        <CardContent>
          <ReactECharts option={option} style={{ height: '300px', width: '100%' }} />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SalesTrendChart;
