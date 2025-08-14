import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Filter, Download } from 'lucide-react';
import IncomeDetailModal from './IncomeDetailModal';
import ExpenseDetailModal from './ExpenseDetailModal';
import DigitalIncomeModal from './DigitalIncomeModal';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  project?: string;
  artist?: string;
}

interface DashboardProps {
  transactions: Transaction[];
  onTransactionsUpdate: (transactions: Transaction[]) => void;
  isAdmin?: boolean;
  hasFullAccess?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  transactions, 
  onTransactionsUpdate, 
  isAdmin = false, 
  hasFullAccess = false 
}) => {
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState<string | null>(null);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [showDigitalModal, setShowDigitalModal] = useState(false);
  const [digitalIncomeData, setDigitalIncomeData] = useState<Record<string, number>>({});

  // Dijital gelir verilerini yükle
  useEffect(() => {
    const loadDigitalIncomeData = () => {
      const months = ['Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      const data: Record<string, number> = {};
      
      months.forEach(month => {
        const storageKey = `digitalIncomeData_${month}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const parsedData = JSON.parse(saved);
            const taxAmount = parsedData.totalDigitalIncome * (parsedData.taxRate / 100);
            const afterTax = parsedData.totalDigitalIncome - taxAmount;
            const hozeShare = afterTax * (parsedData.hozeShareRate / 100);
            const hozeShareTRY = hozeShare * parsedData.usdToTryRate;
            data[month] = Math.round(hozeShareTRY);
          } catch (error) {
            console.error(`${month} dijital gelir verisi yükleme hatası:`, error);
            data[month] = month === 'Haziran' ? 159000 : 0;
          }
        } else {
          data[month] = month === 'Haziran' ? 159000 : 0;
        }
      });
      
      setDigitalIncomeData(data);
    };

    loadDigitalIncomeData();
    
    // Dijital gelir güncellemelerini dinle
    const handleDigitalIncomeUpdate = () => {
      loadDigitalIncomeData();
    };
    
    window.addEventListener('digitalIncomeUpdated', handleDigitalIncomeUpdate);
    return () => window.removeEventListener('digitalIncomeUpdated', handleDigitalIncomeUpdate);
  }, []);

  // Mock data - gerçek uygulamada API'den gelecek
  const monthlyData = {
    'Haziran': {
      incomes: {
        'Konser Gelirleri': [
          { date: '2025-06-05', amount: 43600, description: 'Büyükçekmece Konseri' },
          { date: '2025-06-12', amount: 15600, description: 'Kıbrıs Avlu Konseri' },
          { date: '2025-06-19', amount: 10900, description: 'Fethiye Hayal Konseri' },
          { date: '2025-06-26', amount: 8640, description: 'Kocaeli Hayal Konseri' }
        ],
        'Dijital Gelir': digitalIncomeData['Haziran'] ? [
          { date: '2025-06-30', amount: digitalIncomeData['Haziran'], description: 'Aylık Dijital Gelir Payı' }
        ] : []
      },
      expenses: {
        'Personel Maaş': [
          { date: '2025-06-01', amount: 45000, description: 'Aylık Maaş Ödemeleri' }
        ],
        'Kira': [
          { date: '2025-06-01', amount: 25000, description: 'Ofis Kirası' }
        ],
        'Reklam': [
          { date: '2025-06-15', amount: 34200, description: 'Sosyal Medya Reklamları', link: 'https://ads.facebook.com' }
        ]
      }
    },
    'Temmuz': {
      incomes: {
        'Konser Gelirleri': [
          { date: '2025-07-03', amount: 54000, description: 'Denizli Fuar 3 Tem' },
          { date: '2025-07-05', amount: 72600, description: 'Çanakkale Karabiga 5 Tem' },
          { date: '2025-07-06', amount: 20600, description: 'Emre FYİ Büyükada 6 Tem' },
          { date: '2025-07-06', amount: -27500, description: 'Tuana FYİ Büyükada 6 Tem' },
          { date: '2025-07-09', amount: 15200, description: 'Ankara IF 9 Tem' },
          { date: '2025-07-10', amount: 10320, description: 'Dorock XL 10 Tem' },
          { date: '2025-07-24', amount: 22240, description: 'Emre Kuşadası 24 Tem' },
          { date: '2025-07-27', amount: 0, description: 'Tuana Kuşadası 27 Tem' }
        ],
        'Dijital Gelir': digitalIncomeData['Temmuz'] ? [
          { date: '2025-07-31', amount: digitalIncomeData['Temmuz'], description: 'Aylık Dijital Gelir Payı' }
        ] : []
      },
      expenses: {
        'Personel Maaş': [
          { date: '2025-07-01', amount: 45000, description: 'Aylık Maaş Ödemeleri' }
        ],
        'Kira': [
          { date: '2025-07-01', amount: 25000, description: 'Ofis Kirası' }
        ]
      }
    }
  };

  const currentMonth = 'Haziran';
  const currentData = monthlyData[currentMonth] || { incomes: {}, expenses: {} };

  // Toplam hesaplamaları
  const totalIncome = Object.values(currentData.incomes).flat().reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = Object.values(currentData.expenses).flat().reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleIncomeClick = (category: string, month: string) => {
    if (category === 'Dijital Gelir') {
      setShowDigitalModal(true);
      setSelectedMonth(month);
    } else {
      setSelectedIncomeCategory(category);
      setSelectedMonth(month);
    }
  };

  const handleExpenseClick = (category: string, month: string) => {
    setSelectedExpenseCategory(category);
    setSelectedMonth(month);
  };

  const handleIncomesUpdate = (category: string, updatedIncomes: any[]) => {
    // Bu fonksiyon gelir güncellemelerini handle eder
    console.log(`${category} gelirleri güncellendi:`, updatedIncomes);
  };

  const handleExpensesUpdate = (category: string, updatedExpenses: any[]) => {
    // Bu fonksiyon gider güncellemelerini handle eder
    console.log(`${category} giderleri güncellendi:`, updatedExpenses);
  };

  return (
    <div className="min-h-screen bg-white p-3">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 mb-1 tracking-tight">Finans</h1>
            <p className="text-xs text-gray-600">Finansal durumunuzu takip edin</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Filtrele
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1">
              <Download className="h-3 w-3" />
              Rapor Al
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">Toplam Gelir</p>
                <p className="text-base font-semibold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
              <div className="bg-green-100 p-1.5 rounded">
                <TrendingUp className="h-3 w-3 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">Toplam Gider</p>
                <p className="text-base font-semibold text-red-600">{formatCurrency(totalExpense)}</p>
              </div>
              <div className="bg-red-100 p-1.5 rounded">
                <TrendingDown className="h-3 w-3 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">Net Kar/Zarar</p>
                <p className={`text-base font-semibold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netProfit)}
                </p>
              </div>
              <div className={`p-1.5 rounded ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`h-3 w-3 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Gelir Kategorileri */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-green-600" />
                Gelir Kategorileri
              </h3>
            </div>
            <div className="p-3">
              <div className="space-y-2">
                {Object.entries(currentData.incomes).map(([category, items]) => {
                  const total = items.reduce((sum, item) => sum + item.amount, 0);
                  return (
                    <div
                      key={category}
                      onClick={() => handleIncomeClick(category, currentMonth)}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="text-xs font-medium text-gray-900">{category}</p>
                        <p className="text-xs text-gray-500">{items.length} işlem</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-green-600">{formatCurrency(total)}</p>
                        <p className="text-xs text-gray-400">
                          {totalIncome > 0 ? ((total / totalIncome) * 100).toFixed(1) : '0'}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Gider Kategorileri */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                <TrendingDown className="h-3 w-3 text-red-600" />
                Gider Kategorileri
              </h3>
            </div>
            <div className="p-3">
              <div className="space-y-2">
                {Object.entries(currentData.expenses).map(([category, items]) => {
                  const total = items.reduce((sum, item) => sum + item.amount, 0);
                  return (
                    <div
                      key={category}
                      onClick={() => handleExpenseClick(category, currentMonth)}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                    >
                      <div>
                        <p className="text-xs font-medium text-gray-900">{category}</p>
                        <p className="text-xs text-gray-500">{items.length} işlem</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-red-600">{formatCurrency(total)}</p>
                        <p className="text-xs text-gray-400">
                          {totalExpense > 0 ? ((total / totalExpense) * 100).toFixed(1) : '0'}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedIncomeCategory && (
        <IncomeDetailModal
          isOpen={true}
          onClose={() => setSelectedIncomeCategory(null)}
          category={selectedIncomeCategory}
          month={selectedMonth}
          incomes={currentData.incomes[selectedIncomeCategory] || []}
          total={currentData.incomes[selectedIncomeCategory]?.reduce((sum, item) => sum + item.amount, 0) || 0}
          onIncomesUpdate={(incomes) => handleIncomesUpdate(selectedIncomeCategory, incomes)}
          isAdmin={isAdmin}
          hasFullAccess={hasFullAccess}
        />
      )}

      {selectedExpenseCategory && (
        <ExpenseDetailModal
          isOpen={true}
          onClose={() => setSelectedExpenseCategory(null)}
          category={selectedExpenseCategory}
          month={selectedMonth}
          expenses={currentData.expenses[selectedExpenseCategory] || []}
          total={currentData.expenses[selectedExpenseCategory]?.reduce((sum, item) => sum + item.amount, 0) || 0}
          onExpensesUpdate={(expenses) => handleExpensesUpdate(selectedExpenseCategory, expenses)}
          isAdmin={isAdmin}
          hasFullAccess={hasFullAccess}
        />
      )}

      {showDigitalModal && (
        <DigitalIncomeModal
          isOpen={showDigitalModal}
          onClose={() => setShowDigitalModal(false)}
          month={selectedMonth}
          totalAmount={digitalIncomeData[selectedMonth] || 0}
          isAdmin={isAdmin}
          hasFullAccess={hasFullAccess}
        />
      )}
    </div>
  );
};

export default Dashboard;