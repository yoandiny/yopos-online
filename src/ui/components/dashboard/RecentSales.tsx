import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { formatCurrency } from '../../lib/utils';
import { Card, CardHeader, CardContent } from '../ui/Card';
import Badge from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User } from 'lucide-react';

const RecentSales: React.FC = () => {
  const { sales } = useAppContext();
  const recentSales = sales.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Ventes Récentes</h3>
      </CardHeader>
      <CardContent>
        {recentSales.length > 0 ? (
          <ul className="space-y-4">
            {recentSales.map((sale) => (
              <li key={sale.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 mr-4">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Vente</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(sale.createdAt), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="font-bold text-sm">{formatCurrency(sale.total)}</p>
                    <Badge variant="success" className="mt-1">Complété</Badge>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-8">Aucune vente récente.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSales;
