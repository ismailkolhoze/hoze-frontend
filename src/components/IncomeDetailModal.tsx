import React from 'react';
import { X, Calendar, DollarSign, Edit3, Save, Plus, Eye } from 'lucide-react';
import ConcertDetailModal from './ConcertDetailModal';

interface IncomeDetail {
  date: string;
  amount: number;
  description: string;
}

interface IncomeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  month: string;
  incomes: IncomeDetail[];
  total: number;
  onIncomesUpdate?: (incomes: IncomeDetail[]) => void;
  isAdmin?: boolean;
  hasFullAccess?: boolean;
}

const IncomeDetailModal: React.FC<IncomeDetailModalProps> = ({
  isOpen,
  onClose,
  category,
  month,
  incomes,
  total,
  onIncomesUpdate,
  isAdmin = false,
  hasFullAccess = false
}) => {
  const [selectedConcert, setSelectedConcert] = React.useState<{
    name: string;
    date: string;
    amount: number;
    details: any;
  } | null>(null);
  const [isConcertModalOpen, setIsConcertModalOpen] = React.useState(false);
  const [editingConcert, setEditingConcert] = React.useState<number | null>(null);
  const [tempConcertName, setTempConcertName] = React.useState('');
  const [editedIncomes, setEditedIncomes] = React.useState(incomes);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newConcert, setNewConcert] = React.useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    amount: ''
  });

  React.useEffect(() => {
    setEditedIncomes(incomes);
  }, [incomes]);

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  const getConcertDetails = (concertName: string) => {
    const concertDetailsMap: Record<string, any> = {
      'Büyükçekmece Konseri': {
        ekip: 122000,
        ulasim: 20000,
        reklam: 0,
        konaklama: 0,
        ekstra: 0,
        yemek: 0,
        kase: 350000,
        emre: 166400,
        hoze: 41600
      },
      'Kıbrıs Avlu Konseri': {
        ekip: 112000,
        ulasim: 10000,
        reklam: 0,
        konaklama: 0,
        ekstra: 0,
        yemek: 0,
        kase: 200000,
        emre: 62400,
        hoze: 15600
      },
      'Fethiye Hayal Konseri': {
        ekip: 117000,
        ulasim: 15000,
        reklam: 0,
        konaklama: 0,
        ekstra: 13500,
        yemek: 0,
        kase: 200000,
        emre: 43600,
        hoze: 10900
      },
      'Kocaeli Hayal Konseri': {
        ekip: 122000,
        ulasim: 0,
        reklam: 6200,
        konaklama: 0,
        ekstra: 0,
        yemek: 0,
        kase: 171400,
        emre: 34560,
        hoze: 8640
      },
      'Çorlu Lebi Derya Konseri': {
        ekip: 122000,
        ulasim: 0,
        reklam: 3000,
        konaklama: 0,
        ekstra: 0,
        yemek: 0,
        kase: 250000,
        emre: 100000,
        hoze: 25000
      },
      'Sancaktepe Nefes Konseri': {
        ekip: 122000,
        ulasim: 10000,
        reklam: 0,
        konaklama: 0,
        ekstra: 0,
        yemek: 0,
        kase: 350000,
        emre: 174400,
        hoze: 43600
      },
      'Kıbrıs Belediye Konseri': {
        ekip: 117000,
        ulasim: 10000,
        reklam: 20000,
        konaklama: 0,
        ekstra: 1600,
        yemek: 0,
        kase: 400000,
        emre: 201120,
        hoze: 50280
      },
      'İzmir Havagazi Konseri': {
        ekip: 122000,
        ulasim: 30000,
        reklam: 5000,
        konaklama: 0,
        ekstra: 0,
        yemek: 0,
        kase: 400000,
        emre: 194400,
        hoze: 48600
      },
      'Bahçelievler Bld. Konseri': {
        ekip: 127000,
        ulasim: 20000,
        reklam: 25000,
        konaklama: 0,
        ekstra: 0,
        yemek: 0,
        kase: 500000,
        emre: 262400,
        hoze: 65600
      },
      'Tuana Ankara IF Konseri': {
        ekip: 55100,
        ulasim: 0,
        reklam: 8567,
        konaklama: 0,
        ekstra: 0,
        yemek: 0,
        kase: 24090,
        tuana: 0,
        hoze: -39577
      },
      // Temmuz ayı konserleri
      'Denizli Fuar 3 Tem': {
        ekip: 130000,
        ulasim: 0,
        reklam: 0,
        konaklama: 0,
        ekstra: 0,
        yemek: 0,
        kase: 400000,
        emre: 216000,
        hoze: 54000
      },
      'Çanakkale Karabiga 5 Tem': {
        ekip: 127000,
        ulasim: 5000,
        reklam: 5000,
        konaklama: 0,
        ekstra: 0,
        yemek: 0,
        kase: 500000,
        emre: 290400,
        hoze: 72600
      },
      'Emre FYİ Büyükada 6 Tem': {
        ekip: 122000,
        ulasim: 0,
        reklam: 0,
        konaklama: 0,
        ekstra: 0,
        yemek: 0,
        kase: 225000,
        emre: 82400,
        hoze: 20600
      },
      'Tuana FYİ Büyükada 6 Tem': {
        ekip: 56500,
        ulasim: 0,
        reklam: 0,
        konaklama: 0,
        ekstra: 1000,
        yemek: 0,
        kase: 30000,
        tuana: 0,
        hoze: -27500
      },
      'Ankara IF 9 Tem': {
        ekip: 100000,
        ulasim: 0,
        reklam: 0,
        konaklama: 0,
        ekstra: 0,
        yemek: 0,
        kase: 176000,
        emre: 60800,
        hoze: 15200
      },
      'Dorock XL 10 Tem': {
        ekip: 123000,
        ulasim: 0,
        reklam: 12000,
        konaklama: 0,
        ekstra: 0,
        yemek: 0,
        kase: 186600,
        emre: 41280,
        hoze: 10320
      },
      'Emre Kuşadası 24 Tem': {
        ekip: 123000,
        ulasim: 10000,
        reklam: 0,
        konaklama: 0,
        ekstra: 5800,
        yemek: 0,
        kase: 250000,
        emre: 88960,
        hoze: 22240
      },
      'Tuana Kuşadası 27 Tem': {
        ekip: 57500,
        ulasim: 0,
        reklam: 0,
        konaklama: 0,
        ekstra: 1000,
        yemek: 0,
        kase: 80000,
        tuana: 21500,
        hoze: 0
      }
    };
    
    return concertDetailsMap[concertName] || {
      ekip: 0, ulasim: 0, reklam: 0, konaklama: 0, ekstra: 0, yemek: 0, kase: 0, emre: 0, hoze: 0
    };
  };

  const handleConcertClick = (income: IncomeDetail) => {
    const details = getConcertDetails(income.description);
    setSelectedConcert({
      name: income.description,
      date: income.date,
      amount: income.amount,
      details
    });
    setIsConcertModalOpen(true);
  };

  const handleEditConcertName = (index: number, currentName: string) => {
    setEditingConcert(index);
    setTempConcertName(currentName);
  };

  const handleSaveConcertName = (index: number) => {
    const updatedIncomes = [...editedIncomes];
    updatedIncomes[index] = { ...updatedIncomes[index], description: tempConcertName };
    setEditedIncomes(updatedIncomes);
    
    // Ana bileşene güncellenmiş verileri gönder
    if (onIncomesUpdate) {
      onIncomesUpdate(updatedIncomes);
    }
    
    setEditingConcert(null);
    setTempConcertName('');
  };

  const handleCancelEdit = () => {
    setEditingConcert(null);
    setTempConcertName('');
  };

  const handleAddConcert = () => {
    if (newConcert.name && newConcert.amount) {
      const concert = {
        date: newConcert.date,
        amount: parseFloat(newConcert.amount),
        description: newConcert.name
      };
      const updatedIncomes = [...editedIncomes, concert];
      setEditedIncomes(updatedIncomes);
      
      // Ana bileşene güncellenmiş verileri gönder
      if (onIncomesUpdate) {
        onIncomesUpdate(updatedIncomes);
      }
      
      setNewConcert({ name: '', date: new Date().toISOString().split('T')[0], amount: '' });
      setShowAddForm(false);
    }
  };

  const handleCancelAdd = () => {
    setNewConcert({ name: '', date: new Date().toISOString().split('T')[0], amount: '' });
    setShowAddForm(false);
  };

  const handleDeleteIncome = (index: number) => {
    if (window.confirm('Bu konseri silmek istediğinizden emin misiniz?')) {
      const updatedIncomes = editedIncomes.filter((_, i) => i !== index);
      setEditedIncomes(updatedIncomes);
      
      // Ana bileşene güncellenmiş verileri gönder
      if (onIncomesUpdate) {
        onIncomesUpdate(updatedIncomes);
      }
    }
  };

  return (
    <React.Fragment>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 w-full max-w-4xl max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div>
              <h3 className="text-2xl font-bold text-white">{category} - {month} 2025</h3>
              <p className="text-green-200">Toplam: {formatCurrency(total)}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Yeni Konser Ekleme Butonu */}
            {isAdmin && (
              <div className="mb-6">
                {!showAddForm ? (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Yeni Konser Ekle
                  </button>
                ) : (
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 space-y-4">
                    <h4 className="text-white font-medium">Yeni Konser Ekle</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Konser Adı</label>
                        <input
                          type="text"
                          value={newConcert.name}
                          onChange={(e) => setNewConcert(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Konser adını girin..."
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tarih</label>
                        <input
                          type="date"
                          value={newConcert.date}
                          onChange={(e) => setNewConcert(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">HOZE Payı (₺)</label>
                        <input
                          type="number"
                          value={newConcert.amount}
                          onChange={(e) => setNewConcert(prev => ({ ...prev, amount: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddConcert}
                        className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors font-medium"
                      >
                        <Save className="h-4 w-4" />
                        Kaydet
                      </button>
                      <button
                        onClick={handleCancelAdd}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              {editedIncomes.map((income, index) => {
                const isEditing = editingConcert === index;
                return (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500/20 p-2 rounded-lg">
                          <Calendar className="h-4 w-4 text-green-400" />
                        </div>
                        <div>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={tempConcertName}
                                onChange={(e) => setTempConcertName(e.target.value)}
                                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                autoFocus
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveConcertName(index);
                                  }
                                  if (e.key === 'Escape') {
                                    handleCancelEdit();
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleSaveConcertName(index)}
                                className="text-green-400 hover:text-green-300 transition-colors p-1 hover:bg-white/10 rounded"
                                title="Kaydet"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                                title="İptal"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <p 
                                className="text-white font-medium cursor-pointer hover:text-purple-300 transition-colors"
                                onClick={() => handleConcertClick(income)}
                              >
                                {income.description}
                              </p>
                              {isAdmin ? (
                                <>
                                  <button
                                    onClick={() => handleEditConcertName(index, income.description)}
                                    className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                                    title="Konser adını düzenle"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteIncome(index)}
                                    className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-white/10 rounded"
                                    title="Konseri sil"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </>
                              ) : hasFullAccess && !isAdmin ? (
                                <button
                                  className="text-gray-600 cursor-not-allowed p-1 rounded opacity-50"
                                  title="Sadece görüntüleme (düzenleme yetkiniz yok)"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                              ) : null}
                            </div>
                          )}
                          <p className="text-gray-400 text-sm">{formatDate(income.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 group">
                        {!isEditing && (
                          <span className={`font-bold text-lg ${income.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {income.amount >= 0 ? '+' : ''}{formatCurrency(income.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {editedIncomes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">Bu kategori için henüz gelir kaydı bulunmuyor.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/20 p-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Toplam {editedIncomes.length} işlem</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">Toplam Tutar:</span>
                <span className="text-green-400 font-bold text-xl">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Concert Detail Modal */}
      {selectedConcert && (
        <ConcertDetailModal
          isOpen={isConcertModalOpen}
          onClose={() => setIsConcertModalOpen(false)}
          concertName={selectedConcert.name}
          concertDate={selectedConcert.date}
          totalAmount={selectedConcert.amount}
          details={selectedConcert.details}
          isAdmin={isAdmin}
          hasFullAccess={hasFullAccess}
        />
      )}
    </React.Fragment>
  );
};

export default IncomeDetailModal;