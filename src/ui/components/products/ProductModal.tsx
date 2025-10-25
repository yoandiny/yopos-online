import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAppContext } from '../../contexts/AppContext';
import { Product } from '../../types';
import Combobox from '../ui/Combobox';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product }) => {
  const { addProduct, updateProduct, suppliers } = useAppContext();
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [barcode, setBarcode] = useState('');
  const [supplierId, setSupplierId] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supplierItems = useMemo(() => suppliers.map(s => ({ id: s.id, name: s.name })), [suppliers]);
  const selectedSupplier = useMemo(() => supplierItems.find(s => s.id === supplierId) || null, [supplierId, supplierItems]);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price);
      setStock(product.stock);
      setBarcode(product.barcode);
      setSupplierId(product.supplierId);
    } else {
      clearForm();
    }
  }, [product, isOpen]);

  const clearForm = () => {
    setName('');
    setPrice(0);
    setStock(0);
    setBarcode('');
    setSupplierId(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const productData = { name, price, stock, barcode, supplierId };
      if (product) {
        await updateProduct(product.id, productData);
        alert('Produit mis à jour avec succès !');
      } else {
        await addProduct(productData);
        alert('Produit ajouté avec succès !');
      }
      clearForm();
      onClose();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement du produit.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Modifier le produit' : 'Nouveau Produit'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Prix (Ar)</label>
            <Input id="price" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required min="0" />
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock initial</label>
            <Input id="stock" type="number" value={stock} onChange={e => setStock(Number(e.target.value))} required min="0" />
          </div>
        </div>
        <div>
          <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">Code-barres</label>
          <Input id="barcode" value={barcode} onChange={e => setBarcode(e.target.value)} />
        </div>
        <div>
          <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">Fournisseur (Optionnel)</label>
          <Combobox
            items={supplierItems}
            selected={selectedSupplier}
            onChange={(s) => setSupplierId(s?.id)}
            placeholder="Sélectionner un fournisseur..."
            disabled={suppliers.length === 0}
          />
        </div>
        <div className="flex justify-end pt-4 space-x-3">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le produit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
