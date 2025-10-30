import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, ShoppingCart, Package, BarChart, History, BanknoteArrowUp, Truck, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import Logo from '../../assets/logo.png';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

const navItems = [
  { to: '/', icon: LayoutGrid, label: 'Tableau' },
  { to: '/caisse', icon: ShoppingCart, label: 'Caisse' },
  { to: '/produits', icon: Package, label: 'Produits' },
  { to: '/fournisseurs', icon: Truck, label: 'Fournisseurs' },
  { to: '/stock', icon: BarChart, label: 'Stock' },
  { to: '/ventes', icon: History, label: 'Ventes' },
  {to: '/expenses', icon: BanknoteArrowUp, label: 'Dépenses' },
];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { company, pos, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-lg rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <img src={Logo} className="w-16 h-16 mr-4" alt="logo"/>
            <div>
              <h1 className="text-lg font-bold text-slate-800">{company?.name}</h1>
              <p className="text-sm text-slate-500">{pos?.name}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Changer
          </Button>
        </header>

        {/* Navigation */}
        <nav className="bg-white rounded-xl shadow-sm p-2 mb-6 flex items-center flex-wrap gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-2.5 rounded-lg font-medium text-sm transition-colors',
                  isActive
                    ? 'bg-slate-100 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                )
              }
            >
              <item.icon className="mr-2 h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Main Content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
