import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { formatCurrency } from '../../lib/utils';

interface InitialBalanceModalProps {
  isOpen: boolean;
  onSave: (balance: number) => void;
}

const InitialBalanceModal: React.FC<InitialBalanceModalProps> = ({ isOpen, onSave }) => {
  const [balance, setBalance] = useState<number>(0);

  const handleSave = () => {
    onSave(balance);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {}} // Prevent closing by clicking overlay
      title="Bienvenue ! Configurez votre solde initial"
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Pour commencer, veuillez entrer le montant de votre solde de caisse initial (fond de caisse). Si vous n'en avez pas, vous pouvez laisser la valeur à 0.
        </p>
        <div>
          <label htmlFor="initial-balance" className="block text-sm font-medium text-gray-700 mb-1">
            Solde initial (Ar)
          </label>
          <Input 
            id="initial-balance"
            type="number" 
            value={balance}
            onChange={e => setBalance(Number(e.target.value))}
            min="0"
            placeholder="0"
            autoFocus
          />
        </div>
        <p className="text-sm text-gray-500">
          Vous entrez : {formatCurrency(balance)}.
        </p>
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={balance < 0}>
            Enregistrer et Démarrer
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InitialBalanceModal;
