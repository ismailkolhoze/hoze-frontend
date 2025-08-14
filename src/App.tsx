import React, { useState } from 'react';
import Dashboard from './components/Dashboard'; // This will be renamed to Finans
import Home from './components/Home';
import Calendar from './components/Calendar';
import ProjectAnalysis from './components/ProjectAnalysis';
import Navigation from './components/Navigation';
import TransactionForm from './components/TransactionForm';
import UserBadge from './components/UserBadge';
import UserPermissionsModal from './components/UserPermissionsModal';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  
  // Herkes admin yetkisine sahip - direkt erişim
  const isAdmin = true;
  const hasFullAccess = true;
  const user = { username: 'Kullanıcı' };

  const handleAddTransaction = (transaction: any) => {
    setTransactions(prev => [...prev, { ...transaction, id: `manual-${Date.now()}` }]);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <Home />;
      case 'finans':
        return <Dashboard transactions={transactions} onTransactionsUpdate={setTransactions} isAdmin={isAdmin} hasFullAccess={hasFullAccess} />;
      case 'calendar':
        return <Calendar />;
      case 'settings':
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ayarlar</h2>
                <p className="text-gray-600">Sistem ayarları yakında eklenecek...</p>
                {isAdmin && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Kullanıcı Yönetimi</h3>
                      <p className="text-gray-600 mb-4">
                        Kullanıcı izinlerini yönetin ve hangi sayfalara erişebileceklerini belirleyin.
                      </p>
                      <button
                        onClick={() => {
                          setShowPermissionsModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-full transition-all duration-200 hover:scale-105"
                      >
                        Kullanıcı İzinlerini Yönet
                      </button>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        );
      default:
        return <Home />;
    }
  };

  return (
    <div className="relative bg-white min-h-screen">
      <Navigation
        currentView={currentView}
        onViewChange={handleViewChange}
        onAddTransaction={() => setShowTransactionForm(true)}
        isAdmin={isAdmin}
      />
      
      <div className="pt-12">
        {renderCurrentView()}
      </div>

      {showTransactionForm && (
        <TransactionForm
          onAddTransaction={handleAddTransaction}
          onClose={() => setShowTransactionForm(false)}
        />
      )}

      {showPermissionsModal && (
        <UserPermissionsModal
          isOpen={showPermissionsModal}
          onClose={() => {
            setShowPermissionsModal(false);
          }}
        />
      )}
    </div>
  );
}

export default App;