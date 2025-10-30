import React, { createContext, useContext, useState, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Company, PointOfSale } from '../types';

interface AuthContextType {
  company: Company | null;
  pos: PointOfSale | null;
  login: (companyName: string, posName: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useLocalStorage<Company | null>('session:company', null);
  const [pos, setPos] = useLocalStorage<PointOfSale | null>('session:pos', null);

  const login = (companyName: string, posName: string) => {
    // In a real app, you'd fetch or verify these against a remote DB.
    // For now, we generate IDs based on names for consistency.
    const companyId = `comp_${companyName.toLowerCase().replace(/\s+/g, '_')}`;
    const posId = `pos_${posName.toLowerCase().replace(/\s+/g, '_')}`;

    const newCompany: Company = { id: companyId, name: companyName };
    const newPos: PointOfSale = { id: posId, name: posName, companyId: companyId };

    setCompany(newCompany);
    setPos(newPos);
  };

  const logout = () => {
    setCompany(null);
    setPos(null);
    // Optionally, clear other local storage or state
  };

  const isAuthenticated = useMemo(() => !!company && !!pos, [company, pos]);

  const value = {
    company,
    pos,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
