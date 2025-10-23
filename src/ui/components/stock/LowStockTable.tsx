import React, { useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { formatCurrency } from '../../lib/utils';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { Download, TriangleAlert } from 'lucide-react';
import * as XLSX from 'xlsx';

const LOW_STOCK_THRESHOLD = 10;

const LowStockTable: React.FC = () => {
  const { products } = useAppContext();

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD)
                   .sort((a,b) => a.stock - b.stock);
  }, [products]);

  const handleExport = () => {
    const dataToExport = lowStockProducts.map(p => ({
      'Produit': p.name,
      'Code-barres': p.barcode,
      'Stock Restant': p.stock,
      'Prix Unitaire': p.price
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Faible');

    worksheet['!cols'] = [
      { wch: 30 }, // Produit
      { wch: 15 }, // Code-barres
      { wch: 15 }, // Stock Restant
      { wch: 15 }, // Prix Unitaire
    ];

    XLSX.writeFile(workbook, `stock_faible_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Card>
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center text-yellow-700">
          <TriangleAlert size={20} className="mr-2" />
          <h3 className="text-lg font-semibold">Produits en stock faible (inférieur ou égal à {LOW_STOCK_THRESHOLD} unités)</h3>
        </div>
        <Button onClick={handleExport} disabled={lowStockProducts.length === 0}>
          <Download size={18} className="mr-2" />
          Exporter en XLSX
        </Button>
      </div>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-4 font-semibold text-sm text-slate-600">Produit</th>
                <th className="p-4 font-semibold text-sm text-slate-600">Stock Restant</th>
                <th className="p-4 font-semibold text-sm text-slate-600">Prix</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.length > 0 ? lowStockProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-slate-50/50">
                  <td className="p-4 font-medium text-slate-800">{product.name}</td>
                  <td className="p-4 font-bold text-red-600">{product.stock} unités</td>
                  <td className="p-4 text-slate-700">{formatCurrency(product.price)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-slate-500">
                    Aucun produit en stock faible.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LowStockTable;
