import React from 'react';
import { Home, DollarSign, Calendar, Settings, Plus } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onAddTransaction: () => void;
  isAdmin: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, onAddTransaction, isAdmin }) => {

  const navItems = [
    { id: 'home', label: 'Ana Sayfa', icon: Home },
    { id: 'finans', label: 'Finans', icon: DollarSign },
    { id: 'calendar', label: 'Takvim', icon: Calendar },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  // Herkes tüm sayfalara erişebilir
  const filteredNavItems = navItems;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/6B739661-0D34-4EB5-B43F-DE7596A15033 (2).png" 
              alt="HOZE" 
              className="h-6 w-auto"
            />
          </div>
          
          {/* Navigation Items */}
          <div className="flex items-center gap-8">
            {filteredNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  currentView === item.id
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Add Transaction Button */}
          <div className="flex items-center">
            <button
              onClick={onAddTransaction}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Yeni İşlem
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;