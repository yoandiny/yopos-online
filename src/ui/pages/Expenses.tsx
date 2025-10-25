import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { formatCurrency } from '../lib/utils';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, Download, TrendingDown } from 'lucide-react';
import { Expense } from '../types';
import ExpenseModal from '../components/expenses/ExpenseModal';
import ConfirmationModal from '../components/cash-register/ConfirmationModal';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as XLSX from 'xlsx';

const Expenses: React.FC = () => {
  const { expenses, deleteExpense } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e =>
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [expenses, searchTerm]);

  const summary = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const totalThisMonth = expenses
      .filter(e => isWithinInterval(new Date(e.createdAt), { start: monthStart, end: monthEnd }))
      .reduce((sum, e) => sum + e.amount, 0);

    const totalOverall = expenses.reduce((sum, e) => sum + e.amount, 0);

    return { totalThisMonth, totalOverall };
  }, [expenses]);

  const openNewModal = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (expense: Expense) => {
    setDeletingExpense(expense);
  };

  const closeDeleteConfirm = () => {
    setDeletingExpense(null);
  };

  const handleDelete = async () => {
    if (deletingExpense) {
      await deleteExpense(deletingExpense.id);
      closeDeleteConfirm();
    }
  };

  const handleExport = () => {
    const dataToExport = filteredExpenses.map(e => ({
      'Date': format(new Date(e.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr }),
      'Description': e.description,
      'Catégorie': e.category,
      'Montant (Ar)': e.amount,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dépenses');

    worksheet['!cols'] = [
      { wch: 20 }, // Date
      { wch: 40 }, // Description
      { wch: 25 }, // Catégorie
      { wch: 15 }, // Montant
    ];

    XLSX.writeFile(workbook, `rapport_depenses_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <h3 className="text-sm font-medium text-gray-500">Dépenses (ce mois-ci)</h3>
                    <TrendingDown className="h-5 w-5 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalThisMonth)}</div>
                    <p className="text-xs text-gray-500">Total pour {format(new Date(), 'MMMM yyyy', { locale: fr })}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <h3 className="text-sm font-medium text-gray-500">Dépenses (Total)</h3>
                    <TrendingDown className="h-5 w-5 text-gray-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(summary.totalOverall)}</div>
                    <p className="text-xs text-gray-500">Depuis le début</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <div className="p-4 border-b flex flex-wrap gap-4 justify-between items-center">
                <div className="w-full max-w-xs">
                    <Input 
                        placeholder="Rechercher une dépense..."
                        icon={<Search size={18} />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleExport} variant="secondary" disabled={filteredExpenses.length === 0}>
                        <Download size={18} className="mr-2" />
                        Exporter
                    </Button>
                    <Button onClick={openNewModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvelle Dépense
                    </Button>
                </div>
            </div>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                    <tr className="border-b bg-slate-50">
                        <th className="p-4 font-semibold text-sm text-slate-600">Date</th>
                        <th className="p-4 font-semibold text-sm text-slate-600">Description</th>
                        <th className="p-4 font-semibold text-sm text-slate-600">Catégorie</th>
                        <th className="p-4 font-semibold text-sm text-slate-600">Montant</th>
                        <th className="p-4 font-semibold text-sm text-slate-600">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredExpenses.length > 0 ? filteredExpenses.map((expense) => (
                        <tr key={expense.id} className="border-b hover:bg-slate-50/50">
                        <td className="p-4 text-slate-700">{format(new Date(expense.createdAt), 'dd/MM/yy HH:mm', { locale: fr })}</td>
                        <td className="p-4 font-medium text-slate-800">{expense.description}</td>
                        <td className="p-4 text-slate-700">{expense.category}</td>
                        <td className="p-4 font-semibold text-red-600">{formatCurrency(expense.amount)}</td>
                        <td className="p-4">
                            <div className="flex items-center space-x-3">
                            <button onClick={() => openEditModal(expense)} className="text-blue-600 hover:text-blue-800">
                                <Pencil size={18} />
                            </button>
                            <button onClick={() => openDeleteConfirm(expense)} className="text-red-600 hover:text-red-800">
                                <Trash2 size={18} />
                            </button>
                            </div>
                        </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="text-center p-8 text-slate-500">
                            {expenses.length === 0 ? 'Aucune dépense enregistrée.' : 'Aucune dépense ne correspond à votre recherche.'}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </CardContent>
        </Card>
      </motion.div>
      <ExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        expense={editingExpense}
      />
      <ConfirmationModal
        isOpen={!!deletingExpense}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer cette dépense ? Cette action est irréversible.`}
      />
    </>
  );
};

export default Expenses;
