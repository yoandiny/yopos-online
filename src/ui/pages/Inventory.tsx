import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { formatCurrency } from '../lib/utils';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { motion } from 'framer-motion';

const Inventory: React.FC = () => {
  const { products } = useAppContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Liste des produits</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-4 font-semibold">Produit</th>
                  <th className="p-4 font-semibold">Prix</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold">Code-barres</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 flex items-center">
                      
                      {product.name}
                    </td>
                    <td className="p-4">{formatCurrency(product.price)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${product.stock > 20 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock} unités
                      </span>
                    </td>
                    <td className="p-4 font-mono text-gray-600">{product.barcode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Inventory;
