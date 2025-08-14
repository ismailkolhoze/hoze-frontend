import React, { useState, useCallback, useMemo } from 'react';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import Calendar from './components/Calendar';
import Navigation from './components/Navigation';
import TransactionForm from './components/TransactionForm';
import UserPermissionsModal from './components/UserPermissionsModal';
import Navbar from './components/Navbar';

// Types
interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'income' | 'expense';
}

interface User {
  username: string;
  role: 'admin' | 'user' | 'viewer';
}

type AppView = 'home' | 'finans' | 'calendar' | 'settings';

interface AppState {
  currentView: AppView;
  showTransactionForm: boolean;
  showPermissionsModal: boolean;
  transactions: Transaction[];
}

// Constants
const STRINGS = {
  SETTINGS: 'Ayarlar',
  USER_MANAGEMENT: 'Kullanıcı Yönetimi',
  COMING_SOON: 'Sistem ayarları yakında eklenecek...',
  MANAGE_PERMISSIONS: 'Kullanıcı İzinlerini Yönet',
  PERMISSIONS_DESC: 'Kullanıcı izinlerini yönetin ve hangi sayfalara erişebileceklerini belirleyin.',
} as const;

function App() {
  // State Management
  const [appState, setAppState] = useState<AppState>({
    currentView: 'home',
    showTransactionForm: false,
    showPermissionsModal: false,
    transactions: [],
  });

  // Mock user data (gerçek uygulamada context/state management'ten gelecek)
  const user: User = useMemo(() => ({ 
    username: 'Kullanıcı', 
    role: 'admin' 
  }), []);

  const isAdmin = useMemo(() => user.role === 'admin', [user.role]);
  const hasFullAccess = useMemo(() => 
    user.role === 'admin' || user.role === 'user', 
    [user.role]
  );

  // Event Handlers
  const handleAddTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `manual-${Date.now()}`,
    };
    
    setAppState(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTransaction],
      showTransactionForm: false,
    }));
  }, []);

  const handleViewChange = useCallback((view: AppView) => {
    setAppState(prev => ({ ...prev, currentView: view }));
  }, []);

  const handleShowTransactionForm = useCallback(() => {
    setAppState(prev => ({ ...prev, showTransactionForm: true }));
  }, []);

  const handleCloseTransactionForm = useCallback(() => {
    setAppState(prev => ({ ...prev, showTransactionForm: false }));
  }, []);

  const handleShowPermissionsModal = useCallback(() => {
    setAppState(prev => ({ ...prev, showPermissionsModal: true }));
  }, []);

  const handleClosePermissionsModal = useCallback(() => {
    setAppState(prev => ({ ...prev, showPermissionsModal: false }));
  }, []);

  const handleTransactionsUpdate = useCallback((transactions: Transaction[]) => {
    setAppState(prev => ({ ...prev, transactions }));
  }, []);

  // Settings Page Component
  const SettingsPage = useCallback(() => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {STRINGS.SETTINGS}
            </h2>
            <p className="text-gray-600">
              {STRINGS.COMING_SOON}
            </p>
          </div>

          {isAdmin && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {STRINGS.USER_MANAGEMENT}
                </h3>
                <p className="text-gray-600 mb-4">
                  {STRINGS.PERMISSIONS_DESC}
                </p>
                <button
                  onClick={handleShowPermissionsModal}
                  className={`
                    bg-blue-600 hover:bg-blue-700 text-white font-medium
                    py-3 px-6 rounded-full
                    transition-all duration-200 hover:scale-105
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                  `}
                  type="button"
                  aria-label={STRINGS.MANAGE_PERMISSIONS}
                >
                  {STRINGS.MANAGE_PERMISSIONS}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  ), [isAdmin, handleShowPermissionsModal]);

  // View Renderer
  const renderCurrentView = useCallback(() => {
    const { currentView, transactions } = appState;

    switch (currentView) {
      case 'home':
        return <Home />;
      
      case 'finans':
        return (
          <Dashboard
            transactions={transactions}
            onTransactionsUpdate={handleTransactionsUpdate}
            isAdmin={isAdmin}
            hasFullAccess={hasFullAccess}
          />
        );
      
      case 'calendar':
        return <Calendar />;
      
      case 'settings':
        return <SettingsPage />;
      
      default:
        return <Home />;
    }
  }, [
    appState.currentView, 
    appState.transactions, 
    handleTransactionsUpdate, 
    isAdmin, 
    hasFullAccess, 
    SettingsPage
  ]);

  // Render
  return (
    <div className={`
      relative bg-white dark:bg-black min-h-screen
      text-gray-900 dark:text-white
      transition-colors duration-200
    `}>
      <Navbar />

      <Navigation
        currentView={appState.currentView}
        onViewChange={handleViewChange}
        onAddTransaction={handleShowTransactionForm}
        isAdmin={isAdmin}
      />

      <main className="pt-12">
        {renderCurrentView()}
      </main>

      {/* Modals */}
      {appState.showTransactionForm && (
        <TransactionForm
          onAddTransaction={handleAddTransaction}
          onClose={handleCloseTransactionForm}
        />
      )}

      {appState.showPermissionsModal && (
        <UserPermissionsModal
          isOpen={appState.showPermissionsModal}
          onClose={handleClosePermissionsModal}
        />
      )}
    </div>
  );
}

export default App;