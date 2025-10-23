import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, Archive, BarChart2, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Tableau de bord' },
  { to: '/caisse', icon: ShoppingCart, label: 'Caisse' },
  { to: '/inventaire', icon: Archive, label: 'Inventaire' },
  { to: '/historique', icon: BarChart2, label: 'Historique' },
];

const Sidebar: React.FC = () => {
  const linkClasses = "flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200";
  const activeLinkClasses = "bg-gray-800 font-semibold text-white";

  return (
    <aside className="w-64 bg-gray-900 text-white flex-col h-screen hidden md:flex">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <ShoppingCart size={32} className="text-white" />
        <h1 className="text-2xl font-bold ml-3">YoPOS</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) => cn(linkClasses, isActive && activeLinkClasses)}
          >
            <item.icon className="mr-3" size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <a href="#" className={linkClasses}>
          <LogOut className="mr-3" size={20} />
          Déconnexion
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
