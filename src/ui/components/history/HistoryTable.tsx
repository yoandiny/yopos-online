import React from 'react';
import { Sale } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Button from '../ui/Button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface HistoryTableProps {
  sales: Sale[];
}

const HistoryTable: React.FC<HistoryTableProps> = ({ sales }) => {

  const handleExport = () => {
    const dataToExport = sales.map(sale => ({
      'ID Vente': sale.id,
      'Date': format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr }),
      'Sous-total (Ar)': sale.subtotal,
      'Remise (Ar)': sale.discount,
      'TVA (Ar)': sale.vat,
      'Total (Ar)': sale.total,
      'Méthode de Paiement': sale.paymentMethod.replace('_', ' '),
      'Détails Paiement': sale.paymentMethod === 'cash' 
        ? `Reçu: ${formatCurrency(sale.paymentDetails.amountGiven || 0)}, Rendu: ${formatCurrency(sale.paymentDetails.change || 0)}`
        : sale.paymentMethod === 'mobile_money'
        ? `${sale.paymentDetails.provider?.replace('_', ' ')} - Réf: ${sale.paymentDetails.reference}`
        : 'Paiement par carte',
      'Produits': sale.items.map(item => `${item.name} (x${item.quantity})`).join('; '),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historique des Ventes');

    worksheet['!cols'] = [
      { wch: 30 }, // ID Vente
      { wch: 20 }, // Date
      { wch: 15 }, // Sous-total
      { wch: 15 }, // Remise
      { wch: 15 }, // TVA
      { wch: 15 }, // Total
      { wch: 20 }, // Méthode de Paiement
      { wch: 40 }, // Détails Paiement
      { wch: 50 }, // Produits
    ];

    XLSX.writeFile(workbook, `historique_ventes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleExport} disabled={sales.length === 0}>
          <Download size={18} className="mr-2" />
          Exporter en XLSX
        </Button>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Total</th>
              <th className="p-4 font-semibold">Paiement</th>
              <th className="p-4 font-semibold">Produits</th>
            </tr>
          </thead>
          <tbody>
            {sales.length > 0 ? (
              sales.slice().reverse().map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}</td>
                  <td className="p-4 font-semibold">{formatCurrency(sale.total)}</td>
                  <td className="p-4 capitalize">{sale.paymentMethod.replace('_', ' ')}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {sale.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center p-8 text-gray-500">Aucune vente enregistrée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
