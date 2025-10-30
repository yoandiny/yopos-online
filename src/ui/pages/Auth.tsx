import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../assets/logo.png';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Building, Store } from 'lucide-react';
import { motion } from 'framer-motion';

const Auth: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [posName, setPosName] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim() && posName.trim()) {
      login(companyName.trim(), posName.trim());
    } else {
      alert('Veuillez remplir le nom de l\'entreprise et du point de vente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <img src={Logo} alt="YoPOS Logo" className="w-24 h-24 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800">Bienvenue sur YoPOS</h1>
            <p className="text-slate-500">Connectez-vous à votre session</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                Nom de l'entreprise
              </label>
              <Input
                id="company"
                placeholder="Ex: Mon Entreprise SARL"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                icon={<Building size={18} />}
                required
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="pos" className="block text-sm font-medium text-slate-700 mb-2">
                Nom du point de vente
              </label>
              <Input
                id="pos"
                placeholder="Ex: Magasin Principal"
                value={posName}
                onChange={(e) => setPosName(e.target.value)}
                icon={<Store size={18} />}
                required
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Démarrer la session
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
