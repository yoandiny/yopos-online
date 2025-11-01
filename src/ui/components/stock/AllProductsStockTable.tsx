import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { formatCurrency } from '../../lib/utils';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Download, Search, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import ProductModal from '../products/ProductModal';
import { Product } from '../../types';

interface AllProductsStockTableProps {
  products: Product[];
}

const AllProductsStockTable: React.FC<AllProductsStockTableProps> = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const totalStockValue = useMemo(() => {
    return filteredProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
  }, [filteredProducts]);

  const handleExport = () => {
    const dataToExport = filteredProducts.map(p => ({
      'Produit': p.name,
      'Code-barres': p.barcode,
      'En Stock (unités)': p.stock,
      'Prix Unitaire': p.price,
      'Valeur du Stock': p.price * p.stock,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Complet');

    worksheet['!cols'] = [
      { wch: 30 }, // Produit
      { wch: 15 }, // Code-barres
      { wch: 20 }, // En Stock (unités)
      { wch: 15 }, // Prix Unitaire
      { wch: 20 }, // Valeur du Stock
    ];

    XLSX.writeFile(workbook, `stock_complet_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <>
      <Card>
        <div className="p-4 border-b flex justify-between items-center">
          <div className="w-full max-w-xs">
            <Input 
              placeholder="Rechercher un produit..."
              icon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setIsModalOpen(true)} variant="secondary">
              <Plus size={18} className="mr-2" />
              Ajouter un article
            </Button>
            <Button onClick={handleExport} disabled={filteredProducts.length === 0}>
              <Download size={18} className="mr-2" />
              Exporter en XLSX
            </Button>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-4 font-semibold text-sm text-slate-600">Produit</th>
                  <th className="p-4 font-semibold text-sm text-slate-600">En Stock</th>
                  <th className="p-4 font-semibold text-sm text-slate-600">Prix</th>
                  <th className="p-4 font-semibold text-sm text-slate-600">Valeur</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-slate-50/50">
                    <td className="p-4 font-medium text-slate-800">{product.name}</td>
                    <td className="p-4 text-slate-700">{product.stock} unités</td>
                    <td className="p-4 text-slate-700">{formatCurrency(product.price)}</td>
                    <td className="p-4 font-semibold text-slate-800">{formatCurrency(product.stock * product.price)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-slate-500">
                      {products.length === 0 ? 'Aucun produit dans l\'inventaire.' : 'Aucun produit ne correspond à votre recherche.'}
                    </td>
                  </tr>
                )}
              </tbody>
              {filteredProducts.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 font-bold">
                    <td colSpan={3} className="p-4 text-right">Valeur Totale du Stock</td>
                    <td className="p-4">{formatCurrency(totalStockValue)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={null}
      />
    </>
  );
};

export default AllProductsStockTable;
