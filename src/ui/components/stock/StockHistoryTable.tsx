import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '../ui/Card';

const StockHistoryTable: React.FC = () => {
  const { stockMovements, products } = useAppContext();

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Produit inconnu';
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="p-4 font-semibold text-sm text-slate-600">Date</th>
                <th className="p-4 font-semibold text-sm text-slate-600">Produit</th>
                <th className="p-4 font-semibold text-sm text-slate-600">Changement</th>
                <th className="p-4 font-semibold text-sm text-slate-600">Raison</th>
              </tr>
            </thead>
            <tbody>
              {stockMovements.length > 0 ? stockMovements.map((move) => (
                <tr key={move.id} className="border-b hover:bg-slate-50/50">
                  <td className="p-4 text-slate-700">{format(new Date(move.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}</td>
                  <td className="p-4 font-medium text-slate-800">{getProductName(move.productId)}</td>
                  <td className={`p-4 font-bold ${move.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {move.quantityChange > 0 ? `+${move.quantityChange}` : move.quantityChange}
                  </td>
                  <td className="p-4 text-slate-600">{move.reason}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center p-8 text-slate-500">Aucun mouvement de stock enregistré.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockHistoryTable;
