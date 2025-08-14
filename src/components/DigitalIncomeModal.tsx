import React, { useState } from 'react';
import { X, DollarSign, Calculator, Edit3, Save, Eye } from 'lucide-react';

interface DigitalIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: string;
  totalAmount: number;
  isAdmin?: boolean;
  hasFullAccess?: boolean;
}

const DigitalIncomeModal: React.FC<DigitalIncomeModalProps> = ({
  isOpen,
  onClose,
  month,
  totalAmount,
  isAdmin = false,
  hasFullAccess = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    totalDigitalIncome: 13871,
    taxRate: 20,
    hozeShareRate: 30,
    usdToTryRate: 38.2
  });

  React.useEffect(() => {
    // Component mount olduğunda localStorage'dan yükle
    const storageKey = `digitalIncomeData_${month}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setEditData(parsedData);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        // Varsayılan değerleri ayarla
        const defaultData = {
          totalDigitalIncome: month === 'Haziran' ? 13871 : 0,
          taxRate: 20,
          hozeShareRate: 30,
          usdToTryRate: 38.2
        };
        setEditData(defaultData);
      }
    } else {
      // Ay bazlı varsayılan değerler
      const defaultData = {
        totalDigitalIncome: month === 'Haziran' ? 13871 : 0,
        taxRate: 20,
        hozeShareRate: 30,
        usdToTryRate: 38.2
      };
      setEditData(defaultData);
    }
  }, [month]);

  if (!isOpen) return null;

  const formatCurrency = (amount: number, currency: 'USD' | 'TRY' = 'TRY') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(amount);
    }
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Hesaplamalar
  const taxAmount = editData.totalDigitalIncome * (editData.taxRate / 100);
  const afterTax = editData.totalDigitalIncome - taxAmount;
  const hozeShare = afterTax * (editData.hozeShareRate / 100);
  const hozeShareTRY = hozeShare * editData.usdToTryRate;

  const handleSave = () => {
    // Ay bazlı localStorage'a kaydet
    const storageKey = `digitalIncomeData_${month}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(editData));
      console.log(`${month} ayı dijital gelir verileri kaydedildi:`, editData);
      
      // Dashboard'ı güncellemek için window event'i tetikle
      window.dispatchEvent(new Event('digitalIncomeUpdated'));
    } catch (error) {
      console.error('Veri kaydetme hatası:', error);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Ay bazlı orijinal değerleri geri yükle
    const storageKey = `digitalIncomeData_${month}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setEditData(parsedData);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        // Varsayılan değerleri ayarla
        const defaultData = {
          totalDigitalIncome: month === 'Haziran' ? 13871 : 0,
          taxRate: 20,
          hozeShareRate: 30,
          usdToTryRate: 38.2
        };
        setEditData(defaultData);
      }
    } else {
      // Ay bazlı varsayılan değerler
      const defaultData = {
        totalDigitalIncome: month === 'Haziran' ? 13871 : 0,
        taxRate: 20,
        hozeShareRate: 30,
        usdToTryRate: 38.2
      };
      setEditData(defaultData);
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h3 className="text-2xl font-bold text-white">Dijital Gelir Detayları</h3>
            <p className="text-green-200">{month} 2025 - Toplam: {formatCurrency(totalAmount)}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && isAdmin ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                title="Düzenle"
              >
                <Edit3 className="h-5 w-5" />
              </button>
            ) : !isEditing && hasFullAccess && !isAdmin ? (
              <button
                className="text-gray-600 cursor-not-allowed p-2 rounded-lg opacity-50"
                title="Sadece görüntüleme (düzenleme yetkiniz yok)"
              >
                <Eye className="h-5 w-5" />
              </button>
            ) : isEditing && isAdmin ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Kaydet
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                >
                  İptal
                </button>
              </div>
            ) : null}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Hesaplama Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Toplam Dijital Gelir */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <DollarSign className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-white font-medium">Toplam Dijital Gelir</span>
              </div>
              {isEditing && isAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">$</span>
                  <input
                    type="number"
                    value={editData.totalDigitalIncome}
                    onChange={(e) => setEditData(prev => ({ ...prev, totalDigitalIncome: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    step="0.01"
                  />
                </div>
              ) : (
                <p className="text-blue-400 font-bold text-xl">{formatCurrency(editData.totalDigitalIncome, 'USD')}</p>
              )}
            </div>

            {/* Vergi Oranı */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-500/20 p-2 rounded-lg">
                  <Calculator className="h-4 w-4 text-red-400" />
                </div>
                <span className="text-white font-medium">Gelir Vergisi Oranı</span>
              </div>
              {isEditing && isAdmin ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editData.taxRate}
                    onChange={(e) => setEditData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-red-500 w-20"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="text-red-400 font-bold text-xl">%</span>
                </div>
              ) : (
                <p className="text-red-400 font-bold text-xl">%{editData.taxRate}</p>
              )}
            </div>

            {/* USD/TRY Kuru */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-yellow-500/20 p-2 rounded-lg">
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                </div>
                <span className="text-white font-medium">USD/TRY Kuru</span>
              </div>
              {isEditing && isAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-300">1 USD =</span>
                  <input
                    type="number"
                    value={editData.usdToTryRate}
                    onChange={(e) => setEditData(prev => ({ ...prev, usdToTryRate: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500 w-20"
                    step="0.01"
                  />
                  <span className="text-yellow-400 font-bold">TL</span>
                </div>
              ) : (
                <p className="text-yellow-400 font-bold text-xl">1 USD = {editData.usdToTryRate} TL</p>
              )}
            </div>

            {/* Hoze Payı Oranı */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Calculator className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-white font-medium">Hoze Payı Oranı</span>
              </div>
              {isEditing && isAdmin ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editData.hozeShareRate}
                    onChange={(e) => setEditData(prev => ({ ...prev, hozeShareRate: parseFloat(e.target.value) || 0 }))}
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 w-20"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                  <span className="text-purple-400 font-bold text-xl">%</span>
                </div>
              ) : (
                <p className="text-purple-400 font-bold text-xl">%{editData.hozeShareRate}</p>
              )}
            </div>
          </div>

          {/* Hesaplama Detayları */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-green-400" />
              Hesaplama Detayları
            </h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Toplam Dijital Gelir:</span>
                <span className="text-blue-400 font-bold">{formatCurrency(editData.totalDigitalIncome, 'USD')}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">-%{editData.taxRate} Gelir Vergisi:</span>
                <span className="text-red-400 font-bold">-{formatCurrency(taxAmount, 'USD')}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Vergi Sonrası Kalan:</span>
                <span className="text-white font-bold">{formatCurrency(afterTax, 'USD')}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Hoze Payı (%{editData.hozeShareRate}):</span>
                <span className="text-purple-400 font-bold">{formatCurrency(hozeShare, 'USD')}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Kur (1 USD = {editData.usdToTryRate} TL):</span>
                <span className="text-yellow-400 font-bold">×{editData.usdToTryRate}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 bg-green-500/10 rounded-lg px-4 mt-4">
                <span className="text-white font-semibold">Toplam Hoze Payı (TL):</span>
                <span className="text-green-400 font-bold text-lg">{formatCurrency(hozeShareTRY)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalIncomeModal;