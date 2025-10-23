import React from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles: { [key: string]: string } = {
  '/': 'Tableau de bord',
  '/caisse': 'Caisse Enregistreuse',
  '/inventaire': 'Gestion de l\'Inventaire',
  '/historique': 'Historique des Ventes',
};

const Header: React.FC = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'YoPOS';

  return (
    <header className="bg-white shadow-sm h-20 flex items-center px-8">
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
    </header>
  );
};

export default Header;
