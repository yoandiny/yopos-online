import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import HistoryTable from '../components/history/HistoryTable';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { motion } from 'framer-motion';

const Sales: React.FC = () => {
  const { sales } = useAppContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Historique des ventes</h2>
        </CardHeader>
        <CardContent>
          <HistoryTable sales={sales} />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Sales;
