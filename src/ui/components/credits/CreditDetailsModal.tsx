import React, { useState, useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useAppContext } from '../../contexts/AppContext';
import { Customer, Sale, CreditPayment, PaymentMethod } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CreditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
}

const CreditDetailsModal: React.FC<CreditDetailsModalProps> = ({ isOpen, onClose, customer }) => {
  const { sales, creditPayments, addCreditPayment } = useAppContext();
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<Exclude<PaymentMethod, 'credit'>>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customerCreditInfo = useMemo(() => {
    const unpaidSales = sales.filter(s => s.status === 'unpaid' && s.customerId === customer.id);
    
    const paymentsBySaleId = creditPayments.reduce((acc, p) => {
      acc[p.saleId] = (acc[p.saleId] || 0) + p.amount;
      return acc;
    }, {} as Record<string, number>);

    const salesWithBalance = unpaidSales.map(sale => {
      const paidAmount = paymentsBySaleId[sale.id] || 0;
      const balance = sale.total - paidAmount;
      return { ...sale, balance, paidAmount };
    }).filter(s => s.balance > 0.01).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const totalDue = salesWithBalance.reduce((sum, s) => sum + s.balance, 0);

    return { salesWithBalance, totalDue };
  }, [sales, creditPayments, customer.id]);

  const handleAddPayment = async () => {
    if (amount <= 0) {
      alert("Veuillez entrer un montant valide.");
      return;
    }
    if (amount > customerCreditInfo.totalDue) {
      alert("Le montant ne peut pas dépasser le total dû.");
      return;
    }
    setIsSubmitting(true);
    
    let remainingAmountToApply = amount;
    
    try {
      for (const sale of customerCreditInfo.salesWithBalance) {
        if (remainingAmountToApply <= 0) break;
        
        const amountToApply = Math.min(remainingAmountToApply, sale.balance);
        await addCreditPayment(sale.id, amountToApply, paymentMethod);
        
        remainingAmountToApply -= amountToApply;
      }
      alert('Paiement enregistré avec succès !');
      setAmount(0);
      onClose();
    } catch (error) {
      // Error is already handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Crédits de ${customer.name}`} size="xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h4 className="font-semibold text-lg">Ventes impayées</h4>
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Total Vente</th>
                  <th className="p-3 font-medium">Montant Dû</th>
                </tr>
              </thead>
              <tbody>
                {customerCreditInfo.salesWithBalance.map(sale => (
                  <tr key={sale.id} className="border-b">
                    <td className="p-3">{format(new Date(sale.createdAt), 'dd/MM/yy', { locale: fr })}</td>
                    <td className="p-3">{formatCurrency(sale.total)}</td>
                    <td className="p-3 font-semibold text-red-600">{formatCurrency(sale.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-lg">Encaisser un paiement</h4>
          <div className="text-center my-4">
            <p className="text-gray-500">Total dû</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(customerCreditInfo.totalDue)}</p>
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Montant à encaisser</label>
            <Input id="amount" type="number" value={amount || ''} onChange={e => setAmount(Number(e.target.value))} min="0" />
          </div>
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement</label>
            <Select id="paymentMethod" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as Exclude<PaymentMethod, 'credit'>)}>
              <option value="cash">Espèces</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="card">Carte</option>
            </Select>
          </div>
          <Button className="w-full" onClick={handleAddPayment} disabled={isSubmitting || amount <= 0}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le paiement'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreditDetailsModal;
