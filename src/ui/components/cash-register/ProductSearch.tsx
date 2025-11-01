import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { formatCurrency } from '../../lib/utils';
import Input from '../ui/Input';
import { Search, ConciergeBell } from 'lucide-react';
import { Package } from 'lucide-react';

const ProductSearch: React.FC = () => {
  const { products, addToCart } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Input 
          placeholder="Rechercher par nom ou code-barres..."
          icon={<Search size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts.map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.type === 'product' && product.stock <= 0}
              className="border rounded-lg p-3 text-center hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-between bg-white aspect-square"
            >
              <div className="flex-1 flex flex-col justify-center items-center">
                {product.type === 'service' ? 
                    <ConciergeBell className="h-8 w-8 text-blue-500 mb-2" /> : 
                    <Package className="h-8 w-8 text-slate-500 mb-2" />
                }
                <span className="text-sm font-semibold text-gray-800 leading-tight">{product.name}</span>
              </div>
              <div className="w-full mt-2">
                <span className="text-xs text-gray-500">{formatCurrency(product.price)}</span>
                {product.type === 'product' && product.stock <= 0 && <span className="block text-xs text-red-500 mt-1">Épuisé</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSearch;
