import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { useAppContext } from '../../contexts/AppContext';
import { Expense } from '../../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: Expense | null;
}

const expenseCategories = [
  'Loyer',
  'Salaires',
  'Fournitures',
  'Marketing',
  'Services Publics (JIRAMA, etc.)',
  'Transport',
  'Maintenance',
  'Impôts et Taxes',
  'Autre'
];

const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, expense }) => {
  const { addExpense, updateExpense } = useAppContext();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState(expenseCategories[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(expense.amount);
      setCategory(expense.category);
    } else {
      clearForm();
    }
  }, [expense, isOpen]);

  const clearForm = () => {
    setDescription('');
    setAmount(0);
    setCategory(expenseCategories[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }
    setIsSubmitting(true);
    try {
      const expenseData = { description, amount, category };
      if (expense) {
        await updateExpense(expense.id, expenseData);
        alert('Dépense mise à jour avec succès !');
      } else {
        await addExpense(expenseData);
        alert('Dépense ajoutée avec succès !');
      }
      clearForm();
      onClose();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement de la dépense.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={expense ? 'Modifier la dépense' : 'Nouvelle Dépense'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <Input id="description" value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Montant (Ar)</label>
          <Input id="amount" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} required min="0" />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <Select id="category" value={category} onChange={e => setCategory(e.target.value)}>
            {expenseCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </div>
        <div className="flex justify-end pt-4 space-x-3">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseModal;
