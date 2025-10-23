import React from 'react';
import { Product } from '../../types';
import { Box } from 'lucide-react';
import { motion } from 'framer-motion';

interface StockByProductCardProps {
  products: Product[];
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const StockByProductCard: React.FC<StockByProductCardProps> = ({ products }) => {
    const sortedProducts = [...products].sort((a, b) => a.stock - b.stock).slice(0, 5);

  return (
    <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm h-full">
      <div className="p-5 border-b border-slate-200">
        <h3 className="text-base font-semibold flex items-center">
          <Box className="h-5 w-5 mr-2 text-blue-600" />
          Stock par produit (5 plus bas)
        </h3>
      </div>
      <div className="p-5">
        {products.length > 0 ? (
            <ul className="space-y-3">
                {sortedProducts.map(product => (
                    <li key={product.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            
                            <span className="font-medium text-slate-700">{product.name}</span>
                        </div>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.stock} unités
                        </span>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-center text-slate-500 py-8">Aucun produit dans l'inventaire.</p>
        )}
      </div>
    </motion.div>
  );
};

export default StockByProductCard;
