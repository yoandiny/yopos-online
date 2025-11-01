import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAppContext } from '../../contexts/AppContext';
import { Product } from '../../types';
import Combobox from '../ui/Combobox';
import { cn } from '../../lib/utils';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product }) => {
  const { addProduct, updateProduct, suppliers } = useAppContext();
  const [name, setName] = useState('');
  const [type, setType] = useState<'product' | 'service'>('product');
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
      setType(product.type);
      setPrice(product.price);
      setStock(product.stock);
      setBarcode(product.barcode);
      setSupplierId(product.supplierId);
    } else {
      clearForm();
    }
  }, [product, isOpen]);

  useEffect(() => {
    if (type === 'service') {
      setStock(0);
      setBarcode('');
    }
  }, [type]);

  const clearForm = () => {
    setName('');
    setType('product');
    setPrice(0);
    setStock(0);
    setBarcode('');
    setSupplierId(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const productData = { 
        name, 
        type, 
        price, 
        stock, 
        barcode, 
        supplierId 
      };
      if (product) {
        await updateProduct(product.id, productData);
        alert('Article mis à jour avec succès !');
      } else {
        await addProduct(productData);
        alert('Article ajouté avec succès !');
      }
      clearForm();
      onClose();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement de l\'article.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Modifier l\'article' : 'Nouvel Article'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type d'article</label>
          <div className="flex space-x-2 rounded-lg bg-gray-100 p-1">
            <button type="button" onClick={() => setType('product')} className={cn('w-full rounded-md py-1.5 text-sm font-medium', type === 'product' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-white/50')}>Produit</button>
            <button type="button" onClick={() => setType('service')} className={cn('w-full rounded-md py-1.5 text-sm font-medium', type === 'service' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-white/50')}>Service</button>
          </div>
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom de l'article</label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Prix (Ar)</label>
            <Input id="price" type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required min="0" />
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock initial</label>
            <Input id="stock" type="number" value={stock} onChange={e => setStock(Number(e.target.value))} required min="0" disabled={type === 'service'} />
          </div>
        </div>
        <div>
          <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">Code-barres (Optionnel)</label>
          <Input id="barcode" value={barcode} onChange={e => setBarcode(e.target.value)} disabled={type === 'service'} />
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
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer l\'article'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
