import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAppContext } from '../../contexts/AppContext';
import { Customer } from '../../types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSave?: (customerId: string) => void;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, customer, onSave }) => {
  const { addCustomer, updateCustomer } = useAppContext();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone || '');
      setEmail(customer.email || '');
      setAddress(customer.address || '');
    } else {
      clearForm();
    }
  }, [customer, isOpen]);

  const clearForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Le nom du client est obligatoire.');
      return;
    }
    setIsSubmitting(true);
    try {
      const customerData = { name, phone, email, address };
      let savedCustomerId: string;

      if (customer) {
        await updateCustomer(customer.id, customerData);
        savedCustomerId = customer.id;
        alert('Client mis à jour avec succès !');
      } else {
        savedCustomerId = await addCustomer(customerData);
        alert('Client ajouté avec succès !');
      }
      
      if (onSave) {
        onSave(savedCustomerId);
      }
      
      clearForm();
      onClose();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement du client.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={customer ? 'Modifier le client' : 'Nouveau Client'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
          <Input id="address" value={address} onChange={e => setAddress(e.target.value)} />
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

export default CustomerModal;
