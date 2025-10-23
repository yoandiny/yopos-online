import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { formatCurrency } from '../../lib/utils';
import Button from '../ui/Button';
import { Trash2, XCircle } from 'lucide-react';
import PaymentModal from './PaymentModal';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, cartTotal } = useAppContext();
  const [discount, setDiscount] = useState(0);
  const [isVatApplied, setIsVatApplied] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  const vatRate = 0.20; // 20%
  const subtotal = cartTotal;
  const discountAmount = (subtotal * discount) / 100;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const vatAmount = isVatApplied ? subtotalAfterDiscount * vatRate : 0;
  const total = subtotalAfterDiscount + vatAmount;

  return (
    <div className="bg-white h-full flex flex-col shadow-lg rounded-r-lg">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-bold text-lg">Panier</h3>
        <button onClick={clearCart} className="text-sm text-red-500 hover:underline flex items-center">
          <XCircle size={16} className="mr-1" /> Vider
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <p className="text-gray-500 text-center p-8">Le panier est vide.</p>
        ) : (
          <ul className="divide-y">
            {cart.map(item => (
              <li key={item.id} className="p-3 flex items-center">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center">
                  <input 
                    type="number" 
                    value={item.quantity}
                    onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value, 10))}
                    className="w-12 text-center border rounded-md mx-2"
                    min="1"
                  />
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Sous-total</span><span>{formatCurrency(subtotal)}</span></div>
          
          <div className="flex items-center justify-between">
            <label htmlFor="discount">Remise (%)</label>
            <input 
              type="number" 
              id="discount"
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
              className="w-20 text-right border rounded-md px-2"
            />
          </div>
          {discount > 0 && <div className="flex justify-between text-red-600"><span>Remise appliquée</span><span>- {formatCurrency(discountAmount)}</span></div>}
          
          <div className="flex items-center justify-between">
            <label htmlFor="vat" className="flex items-center">
              <input 
                type="checkbox"
                id="vat"
                checked={isVatApplied}
                onChange={(e) => setIsVatApplied(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
              />
              TVA (20%)
            </label>
            <span>{formatCurrency(vatAmount)}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between font-bold text-xl">
            <span>TOTAL</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        
        <Button 
          className="w-full mt-4" 
          size="lg"
          disabled={cart.length === 0}
          onClick={() => setPaymentModalOpen(true)}
        >
          Procéder au paiement
        </Button>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        totalAmount={total}
        cartItems={cart}
        discountAmount={discountAmount}
        vatAmount={vatAmount}
        subtotal={subtotal}
      />
    </div>
  );
};

export default Cart;
