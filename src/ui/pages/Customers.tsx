import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import CustomerModal from '../components/customers/CustomerModal';
import ConfirmationModal from '../components/cash-register/ConfirmationModal';
import Input from '../components/ui/Input';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Customer } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Customers: React.FC = () => {
  const { customers, deleteCustomer } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [customers, searchTerm]);

  const openNewModal = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (customer: Customer) => {
    setDeletingCustomer(customer);
  };

  const closeDeleteConfirm = () => {
    setDeletingCustomer(null);
  };

  const handleDelete = async () => {
    if (deletingCustomer) {
      // Note: This doesn't handle outstanding credits. A real app might prevent deletion or reassign sales.
      await deleteCustomer(deletingCustomer.id);
      closeDeleteConfirm();
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <div className="w-full max-w-xs">
            <Input 
              placeholder="Rechercher un client..."
              icon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={openNewModal}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Client
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-4 font-semibold text-sm text-slate-600">Nom</th>
                    <th className="p-4 font-semibold text-sm text-slate-600">Téléphone</th>
                    <th className="p-4 font-semibold text-sm text-slate-600">Email</th>
                    <th className="p-4 font-semibold text-sm text-slate-600">Ajouté le</th>
                    <th className="p-4 font-semibold text-sm text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-slate-50/50">
                      <td className="p-4 font-medium text-slate-800">{customer.name}</td>
                      <td className="p-4 text-slate-700">{customer.phone || 'N/A'}</td>
                      <td className="p-4 text-slate-700">{customer.email || 'N/A'}</td>
                      <td className="p-4 text-slate-600">{format(new Date(customer.createdAt), 'dd/MM/yyyy', { locale: fr })}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <button onClick={() => openEditModal(customer)} className="text-blue-600 hover:text-blue-800">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => openDeleteConfirm(customer)} className="text-red-600 hover:text-red-800">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                        <td colSpan={5} className="text-center p-8 text-slate-500">
                          {customers.length === 0 ? 'Aucun client trouvé.' : 'Aucun client ne correspond à votre recherche.'}
                        </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <CustomerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        customer={editingCustomer}
      />
      <ConfirmationModal
        isOpen={!!deletingCustomer}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer le client "${deletingCustomer?.name}" ? Les ventes à crédit associées ne seront plus liées. Cette action est irréversible.`}
      />
    </>
  );
};

export default Customers;
