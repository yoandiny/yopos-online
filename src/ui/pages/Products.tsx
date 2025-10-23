import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { formatCurrency } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProductModal from '../components/products/ProductModal';
import ConfirmationModal from '../components/cash-register/ConfirmationModal';
import Input from '../components/ui/Input';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Product } from '../types';

const Products: React.FC = () => {
  const { products, deleteProduct } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const openNewModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (product: Product) => {
    setDeletingProduct(product);
  };

  const closeDeleteConfirm = () => {
    setDeletingProduct(null);
  };

  const handleDelete = async () => {
    if (deletingProduct) {
      await deleteProduct(deletingProduct.id);
      closeDeleteConfirm();
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <div className="w-full max-w-xs">
            <Input 
              placeholder="Rechercher un produit..."
              icon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={openNewModal}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Produit
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-4 font-semibold text-sm text-slate-600">Produit</th>
                    <th className="p-4 font-semibold text-sm text-slate-600">Prix</th>
                    <th className="p-4 font-semibold text-sm text-slate-600">Stock</th>
                    <th className="p-4 font-semibold text-sm text-slate-600">Code-barres</th>
                    <th className="p-4 font-semibold text-sm text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-slate-50/50">
                      <td className="p-4">
                        <span className="font-medium text-slate-800">{product.name}</span>
                      </td>
                      <td className="p-4 text-slate-700">{formatCurrency(product.price)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 20 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {product.stock} unités
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-600">{product.barcode}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-800">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => openDeleteConfirm(product)} className="text-red-600 hover:text-red-800">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                        <td colSpan={5} className="text-center p-8 text-slate-500">
                          {products.length === 0 ? 'Aucun produit trouvé. Cliquez sur "Nouveau Produit" pour commencer.' : 'Aucun produit ne correspond à votre recherche.'}
                        </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={editingProduct}
      />
      <ConfirmationModal
        isOpen={!!deletingProduct}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer le produit "${deletingProduct?.name}" ? Cette action est irréversible.`}
      />
    </>
  );
};

export default Products;
