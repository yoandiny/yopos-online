import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAppContext } from '../../contexts/AppContext';
import { Supplier } from '../../types';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, onClose, supplier }) => {
  const { addSupplier, updateSupplier } = useAppContext();
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (supplier) {
      setName(supplier.name);
      setContactPerson(supplier.contactPerson || '');
      setPhone(supplier.phone || '');
      setEmail(supplier.email || '');
      setAddress(supplier.address || '');
    } else {
      clearForm();
    }
  }, [supplier, isOpen]);

  const clearForm = () => {
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Le nom du fournisseur est obligatoire.');
      return;
    }
    setIsSubmitting(true);
    try {
      const supplierData = { name, contactPerson, phone, email, address };
      if (supplier) {
        await updateSupplier(supplier.id, supplierData);
        alert('Fournisseur mis à jour avec succès !');
      } else {
        await addSupplier(supplierData);
        alert('Fournisseur ajouté avec succès !');
      }
      clearForm();
      onClose();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement du fournisseur.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={supplier ? 'Modifier le fournisseur' : 'Nouveau Fournisseur'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom du fournisseur</label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">Personne à contacter</label>
                <Input id="contactPerson" value={contactPerson} onChange={e => setContactPerson(e.target.value)} />
            </div>
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
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

export default SupplierModal;
