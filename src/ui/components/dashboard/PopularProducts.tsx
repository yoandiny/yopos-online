import React, { useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { formatCurrency } from '../../lib/utils';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Package } from 'lucide-react';

const PopularProducts: React.FC = () => {
  const { sales, products } = useAppContext();

  const popularProducts = useMemo(() => {
    if (!sales || !products) return [];
    
    const productSalesCount = sales
      .flatMap(sale => sale.items)
      .reduce((acc, item) => {
        acc[item.id] = (acc[item.id] || 0) + item.quantity;
        return acc;
      }, {} as { [key: string]: number });

    return Object.entries(productSalesCount)
      .map(([productId, quantitySold]) => {
        const product = products.find(p => p.id === productId);
        return product ? { ...product, quantitySold } : null;
      })
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);
  }, [sales, products]);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Produits Populaires</h3>
      </CardHeader>
      <CardContent>
        {popularProducts.length > 0 ? (
          <ul className="space-y-4">
            {popularProducts.map(product => (
              <li key={product.id} className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center mr-4">
                  <Package className="h-5 w-5 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(product.price)}</p>
                </div>
                <p className="text-sm font-medium">{product.quantitySold} vendus</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-8">Pas assez de données pour afficher les produits populaires.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PopularProducts;
