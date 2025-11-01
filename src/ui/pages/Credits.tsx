import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { motion } from 'framer-motion';
import { Search, Download, HandCoins, Users } from 'lucide-react';
import { Customer, Sale, CreditPayment } from '../types';
import { formatCurrency } from '../lib/utils';
import CreditDetailsModal from '../components/credits/CreditDetailsModal';
import * as XLSX from 'xlsx';

interface CustomerCreditInfo {
  customer: Customer;
  totalDue: number;
  unpaidSalesCount: number;
}

const Credits: React.FC = () => {
  const { customers, sales, creditPayments } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const creditData = useMemo(() => {
    const unpaidSales = sales.filter(s => s.status === 'unpaid');
    const paymentsBySaleId = creditPayments.reduce((acc, p) => {
      acc[p.saleId] = (acc[p.saleId] || 0) + p.amount;
      return acc;
    }, {} as Record<string, number>);

    const salesByCustomerId = unpaidSales.reduce((acc, sale) => {
      if (sale.customerId) {
        if (!acc[sale.customerId]) {
          acc[sale.customerId] = [];
        }
        acc[sale.customerId].push(sale);
      }
      return acc;
    }, {} as Record<string, Sale[]>);

    const customerCreditInfo: CustomerCreditInfo[] = customers
      .map(customer => {
        const customerSales = salesByCustomerId[customer.id] || [];
        if (customerSales.length === 0) return null;

        const totalDue = customerSales.reduce((sum, sale) => {
          const paidAmount = paymentsBySaleId[sale.id] || 0;
          const remaining = sale.total - paidAmount;
          return sum + (remaining > 0 ? remaining : 0);
        }, 0);

        if (totalDue <= 0) return null;

        return {
          customer,
          totalDue,
          unpaidSalesCount: customerSales.length,
        };
      })
      .filter((c): c is CustomerCreditInfo => c !== null)
      .sort((a, b) => b.totalDue - a.totalDue);
    
    const totalOutstanding = customerCreditInfo.reduce((sum, c) => sum + c.totalDue, 0);

    return {
      customersWithCredit: customerCreditInfo,
      totalOutstanding,
      customersWithCreditCount: customerCreditInfo.length,
    };
  }, [customers, sales, creditPayments]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return creditData.customersWithCredit;
    return creditData.customersWithCredit.filter(c =>
      c.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [creditData, searchTerm]);

  const handleExport = () => {
    const dataToExport = filteredData.map(c => ({
      'Client': c.customer.name,
      'Téléphone': c.customer.phone || 'N/A',
      'Total Dû (Ar)': c.totalDue,
      'Ventes Impayées': c.unpaidSalesCount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Crédits Clients');
    worksheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
    XLSX.writeFile(workbook, `rapport_credits_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <h3 className="text-sm font-medium text-gray-500">Total des crédits</h3>
                    <HandCoins className="h-5 w-5 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{formatCurrency(creditData.totalOutstanding)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <h3 className="text-sm font-medium text-gray-500">Clients avec crédits</h3>
                     <Users className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{creditData.customersWithCreditCount}</div>
                </CardContent>
            </Card>
        </div>

        <Card>
            <div className="p-4 border-b flex flex-wrap gap-4 justify-between items-center">
                <div className="w-full max-w-xs">
                    <Input 
                        placeholder="Rechercher un client..."
                        icon={<Search size={18} />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={handleExport} variant="secondary" disabled={filteredData.length === 0}>
                    <Download size={18} className="mr-2" />
                    Exporter la liste
                </Button>
            </div>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                    <tr className="border-b bg-slate-50">
                        <th className="p-4 font-semibold text-sm text-slate-600">Client</th>
                        <th className="p-4 font-semibold text-sm text-slate-600">Total Dû</th>
                        <th className="p-4 font-semibold text-sm text-slate-600">Ventes Impayées</th>
                        <th className="p-4 font-semibold text-sm text-slate-600">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredData.length > 0 ? filteredData.map(({customer, totalDue, unpaidSalesCount}) => (
                        <tr key={customer.id} className="border-b hover:bg-slate-50/50">
                            <td className="p-4 font-medium text-slate-800">{customer.name}</td>
                            <td className="p-4 font-semibold text-orange-600">{formatCurrency(totalDue)}</td>
                            <td className="p-4 text-slate-700">{unpaidSalesCount}</td>
                            <td className="p-4">
                                <Button size="sm" onClick={() => setSelectedCustomer(customer)}>Voir détails</Button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="text-center p-8 text-slate-500">
                                {creditData.customersWithCredit.length === 0 ? 'Aucun crédit en cours.' : 'Aucun client ne correspond à votre recherche.'}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </CardContent>
        </Card>
      </motion.div>
      {selectedCustomer && (
        <CreditDetailsModal 
            isOpen={!!selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            customer={selectedCustomer}
        />
      )}
    </>
  );
};

export default Credits;
