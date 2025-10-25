import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import SupplierModal from '../components/suppliers/SupplierModal';
import ConfirmationModal from '../components/cash-register/ConfirmationModal';
import Input from '../components/ui/Input';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { Supplier } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Suppliers: React.FC = () => {
  const { suppliers, deleteSupplier } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [suppliers, searchTerm]);

  const openNewModal = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (supplier: Supplier) => {
    setDeletingSupplier(supplier);
  };

  const closeDeleteConfirm = () => {
    setDeletingSupplier(null);
  };

  const handleDelete = async () => {
    if (deletingSupplier) {
      await deleteSupplier(deletingSupplier.id);
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
              placeholder="Rechercher un fournisseur..."
              icon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={openNewModal}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Fournisseur
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-4 font-semibold text-sm text-slate-600">Nom</th>
                    <th className="p-4 font-semibold text-sm text-slate-600">Contact</th>
                    <th className="p-4 font-semibold text-sm text-slate-600">Téléphone</th>
                    <th className="p-4 font-semibold text-sm text-slate-600">Email</th>
                    <th className="p-4 font-semibold text-sm text-slate-600">Ajouté le</th>
                    <th className="p-4 font-semibold text-sm text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.length > 0 ? filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="border-b hover:bg-slate-50/50">
                      <td className="p-4 font-medium text-slate-800">{supplier.name}</td>
                      <td className="p-4 text-slate-700">{supplier.contactPerson || 'N/A'}</td>
                      <td className="p-4 text-slate-700">{supplier.phone || 'N/A'}</td>
                      <td className="p-4 text-slate-700">{supplier.email || 'N/A'}</td>
                      <td className="p-4 text-slate-600">{format(new Date(supplier.createdAt), 'dd/MM/yyyy', { locale: fr })}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <button onClick={() => openEditModal(supplier)} className="text-blue-600 hover:text-blue-800">
                            <Pencil size={18} />
                          </button>
                          <button onClick={() => openDeleteConfirm(supplier)} className="text-red-600 hover:text-red-800">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                        <td colSpan={6} className="text-center p-8 text-slate-500">
                          {suppliers.length === 0 ? 'Aucun fournisseur trouvé.' : 'Aucun fournisseur ne correspond à votre recherche.'}
                        </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <SupplierModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        supplier={editingSupplier}
      />
      <ConfirmationModal
        isOpen={!!deletingSupplier}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer le fournisseur "${deletingSupplier?.name}" ? Les produits associés seront déliés. Cette action est irréversible.`}
      />
    </>
  );
};

export default Suppliers;
