import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAppContext } from '../../contexts/AppContext';
import { Plus, Minus } from 'lucide-react';
import Combobox from '../ui/Combobox';
import { Product } from '../../types';

const StockAdjustmentForm: React.FC = () => {
  const { products, adjustStock } = useAppContext();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState<string>('Réception fournisseur');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (adjustmentType: 'add' | 'remove') => {
    if (!selectedProduct || !selectedProduct.id || quantity <= 0) {
      alert("Veuillez sélectionner un produit et entrer une quantité valide.");
      return;
    }
    setIsSubmitting(true);
    const quantityChange = adjustmentType === 'add' ? quantity : -quantity;
    try {
      await adjustStock(selectedProduct.id, quantityChange, reason);
      alert('Stock mis à jour avec succès !');
      setSelectedProduct(null);
      setQuantity(0);
      setReason('Réception fournisseur');
    } catch (error) {
      // Error is already alerted in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Gestion du Stock</h3>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
          <Combobox
            items={products}
            selected={selectedProduct}
            onChange={setSelectedProduct}
            placeholder="Rechercher un produit..."
            disabled={products.length === 0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
          <Input 
            type="number" 
            value={quantity || ''}
            onChange={e => setQuantity(Number(e.target.value))}
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Raison</label>
          <Input 
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Ex: Réception, Perte, Inventaire..."
          />
        </div>
        <div className="flex space-x-4 pt-2">
          <Button 
            className="w-full" 
            onClick={() => handleSubmit('add')}
            disabled={isSubmitting || !selectedProduct}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter Stock
          </Button>
          <Button 
            className="w-full" 
            variant="secondary"
            onClick={() => handleSubmit('remove')}
            disabled={isSubmitting || !selectedProduct}
          >
             <Minus className="mr-2 h-4 w-4" />
            Retirer Stock
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockAdjustmentForm;
