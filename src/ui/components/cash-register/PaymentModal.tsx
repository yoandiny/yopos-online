import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { formatCurrency } from '../../lib/utils';
import { useAppContext } from '../../contexts/AppContext';
import { CartItem, MobileMoneyProvider, PaymentMethod, Sale } from '../../types';
import ConfirmationModal from './ConfirmationModal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  cartItems: CartItem[];
  subtotal: number;
  discountAmount: number;
  vatAmount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, totalAmount, cartItems, subtotal, discountAmount, vatAmount }) => {
  const { addSale } = useAppContext();
  const [activeTab, setActiveTab] = useState<PaymentMethod>('cash');
  const [amountGiven, setAmountGiven] = useState<number>(0);
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<MobileMoneyProvider>('orange_money');
  const [transactionRef, setTransactionRef] = useState('');
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [saleData, setSaleData] = useState<Omit<Sale, 'id' | 'createdAt'> | null>(null);

  const change = amountGiven - totalAmount;

  const handlePayment = () => {
    let details: Sale['paymentDetails'] = {};
    if (activeTab === 'cash') {
      if (amountGiven < totalAmount) {
        alert("Le montant reçu est insuffisant.");
        return;
      }
      details = { amountGiven, change };
    } else if (activeTab === 'mobile_money') {
      if (!transactionRef) {
        alert("Veuillez renseigner la référence de la transaction.");
        return;
      }
      details = { provider: mobileMoneyProvider, reference: transactionRef };
    }

    const currentSaleData: Omit<Sale, 'id' | 'createdAt'> = {
      items: cartItems,
      subtotal: subtotal,
      discount: discountAmount,
      vat: vatAmount,
      total: totalAmount,
      paymentMethod: activeTab,
      paymentDetails: details,
    };
    setSaleData(currentSaleData);
    setConfirmOpen(true);
  };

  const confirmPayment = () => {
    if (saleData) {
      addSale(saleData);
      setConfirmOpen(false);
      onClose();
    }
  };

  const renderCashPayment = () => (
    <div className="space-y-4">
      <Input
        type="number"
        placeholder="Montant reçu"
        value={amountGiven || ''}
        onChange={(e) => setAmountGiven(Number(e.target.value))}
      />
      <div className="flex justify-between text-lg">
        <span>Reste à rendre:</span>
        <span className="font-bold">{formatCurrency(change > 0 ? change : 0)}</span>
      </div>
    </div>
  );

  const renderMobileMoneyPayment = () => (
    <div className="space-y-4">
      <div className="flex space-x-2">
        {['orange_money', 'mvola', 'airtel_money'].map((p) => (
          <Button
            key={p}
            variant={mobileMoneyProvider === p ? 'primary' : 'secondary'}
            onClick={() => setMobileMoneyProvider(p as MobileMoneyProvider)}
          >
            {p.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Button>
        ))}
      </div>
      <Input
        placeholder="Référence de transaction"
        value={transactionRef}
        onChange={(e) => setTransactionRef(e.target.value)}
      />
    </div>
  );

  const renderCardPayment = () => (
    <p className="text-gray-600">Confirmez que le paiement par carte a été approuvé par le terminal.</p>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Finaliser le paiement" size="lg">
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-500">Montant à payer</p>
            <p className="text-4xl font-bold">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
              <button onClick={() => setActiveTab('cash')} className={`${activeTab === 'cash' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Espèces</button>
              <button onClick={() => setActiveTab('mobile_money')} className={`${activeTab === 'mobile_money' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Mobile Money</button>
              <button onClick={() => setActiveTab('card')} className={`${activeTab === 'card' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Carte</button>
            </nav>
          </div>
          <div>
            {activeTab === 'cash' && renderCashPayment()}
            {activeTab === 'mobile_money' && renderMobileMoneyPayment()}
            {activeTab === 'card' && renderCardPayment()}
          </div>
          <Button className="w-full" size="lg" onClick={handlePayment}>
            Valider le paiement de {formatCurrency(totalAmount)}
          </Button>
        </div>
      </Modal>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmPayment}
        title="Confirmer la vente"
        message="Êtes-vous sûr de vouloir finaliser cette vente ? Cette action est irréversible."
      />
    </>
  );
};

export default PaymentModal;
