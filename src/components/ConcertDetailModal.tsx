import React from 'react';
import { X, Calendar, DollarSign, Users, MapPin, Edit3, Save, Plus, ChevronDown, ChevronRight, Eye, Calculator } from 'lucide-react';

interface ConcertDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  concertName: string;
  concertDate: string;
  totalAmount: number;
  details: {
    ekip: number;
    ulasim: number;
    reklam: number;
    konaklama: number;
    ekstra: number;
    yemek: number;
    kase: number;
    emre: number;
    hoze: number;
  };
  isAdmin?: boolean;
  hasFullAccess?: boolean;
}

const ConcertDetailModal: React.FC<ConcertDetailModalProps> = ({
  isOpen,
  onClose,
  concertName,
  concertDate,
  totalAmount,
  details,
  isAdmin = false,
  hasFullAccess = false
}) => {
  const [editingCategory, setEditingCategory] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [tempNote, setTempNote] = React.useState('');
  const [expandedCategories, setExpandedCategories] = React.useState<Record<string, boolean>>({});
  const [categoryDetails, setCategoryDetails] = React.useState<Record<string, Array<{name: string, amount: number}>>>({
    'Ekip': [
      { name: 'Elibol', amount: 12000 },
      { name: 'Emin', amount: 12000 },
      { name: 'Ömer', amount: 10000 },
      { name: 'Özgür', amount: 10000 },
      { name: 'Safa', amount: 15000 },
      { name: 'Kara', amount: 10000 },
      { name: 'Hüseyin', amount: 10000 },
      { name: 'Mert', amount: 9000 },
      { name: 'Emlik', amount: 7000 },
      { name: 'Rodi1', amount: 6000 },
      { name: 'Rodi2', amount: 6000 },
      { name: 'Sidal', amount: 10000 },
      { name: 'Naz', amount: 5000 }
    ]
  });
  const [editingDetail, setEditingDetail] = React.useState<{category: string, index: number} | null>(null);
  const [tempDetailName, setTempDetailName] = React.useState('');
  const [tempDetailAmount, setTempDetailAmount] = React.useState('');
  const [editingCategoryAmount, setEditingCategoryAmount] = React.useState<string | null>(null);
  const [tempCategoryAmount, setTempCategoryAmount] = React.useState('');
  const [editedCategoryAmounts, setEditedCategoryAmounts] = React.useState<Record<string, number>>({});

  // localStorage'dan kategori tutarlarını yükle
  React.useEffect(() => {
    if (isOpen && concertName) {
      try {
        const storageKey = `concertAmounts_${concertName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`;
        const savedAmounts = localStorage.getItem(storageKey);
        if (savedAmounts) {
          setEditedCategoryAmounts(JSON.parse(savedAmounts));
        } else {
          // Konser için ilk kez açılıyorsa, mevcut değerleri kaydet
          const initialAmounts = {
            'Kaşe': details.kase,
            'Ulaşım': details.ulasim,
            'Reklam': details.reklam,
            'Konaklama': details.konaklama,
            'Ekstra': details.ekstra,
            'Yemek': details.yemek
          };
          setEditedCategoryAmounts(initialAmounts);
          localStorage.setItem(storageKey, JSON.stringify(initialAmounts));
        }
      } catch (error) {
        console.error('Konser tutarları yükleme hatası:', error);
        setEditedCategoryAmounts({});
      }
    }
  }, [isOpen, concertName]);

  // Dinamik toplam hesaplama fonksiyonu
  const calculateCategoryTotal = (categoryLabel: string) => {
    // Önce düzenlenmiş tutarları kontrol et
    if (editedCategoryAmounts[categoryLabel] !== undefined) {
      return editedCategoryAmounts[categoryLabel];
    }
    
    const currentCategoryDetails = categoryDetails[categoryLabel];
    if (currentCategoryDetails && currentCategoryDetails.length > 0) {
      return currentCategoryDetails.reduce((sum, detail) => sum + detail.amount, 0);
    }
    // Varsayılan değerleri details prop'undan döndür
    switch (categoryLabel) {
      case 'Ekip': return details.ekip;
      case 'Ulaşım': return details.ulasim;
      case 'Reklam': return details.reklam;
      case 'Konaklama': return details.konaklama;
      case 'Ekstra': return details.ekstra;
      case 'Yemek': return details.yemek;
      case 'Kaşe': return details.kase;
      default: return 0;
    }
  };

  // Konser gelir hesaplama formülü
  const calculateConcertShares = () => {
    const totalExpenses = 
      (editedCategoryAmounts['Ekip'] !== undefined ? editedCategoryAmounts['Ekip'] : details.ekip) +
      (editedCategoryAmounts['Ulaşım'] !== undefined ? editedCategoryAmounts['Ulaşım'] : details.ulasim) +
      (editedCategoryAmounts['Reklam'] !== undefined ? editedCategoryAmounts['Reklam'] : details.reklam) +
      (editedCategoryAmounts['Konaklama'] !== undefined ? editedCategoryAmounts['Konaklama'] : details.konaklama) +
      (editedCategoryAmounts['Ekstra'] !== undefined ? editedCategoryAmounts['Ekstra'] : details.ekstra) +
      (editedCategoryAmounts['Yemek'] !== undefined ? editedCategoryAmounts['Yemek'] : details.yemek);
    
    const kase = editedCategoryAmounts['Kaşe'] !== undefined ? editedCategoryAmounts['Kaşe'] : details.kase;
    const netProfit = kase - totalExpenses;
    
    // Formül: [Kaşe - Masraflar] / 5
    // Emre = Net Kar / 5 * 4
    // Hoze = Net Kar / 5 * 1
    const emreShare = (netProfit / 5) * 4;
    const hozeShare = (netProfit / 5) * 1;
    
    return {
      emre: emreShare,
      hoze: hozeShare,
      netProfit,
      totalExpenses,
      kase
    };
  };

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const detailItems = [
    { label: 'Ekip', amount: details.ekip, icon: Users, color: 'text-blue-400' },
    { label: 'Ulaşım', amount: details.ulasim, icon: MapPin, color: 'text-purple-400' },
    { label: 'Reklam', amount: details.reklam, icon: Calendar, color: 'text-pink-400' },
    { label: 'Konaklama', amount: details.konaklama, icon: Calendar, color: 'text-orange-400' },
    { label: 'Ekstra', amount: details.ekstra, icon: DollarSign, color: 'text-gray-400' },
    { label: 'Yemek', amount: details.yemek, icon: Calendar, color: 'text-yellow-400' },
    { label: 'Kaşe', amount: details.kase, icon: DollarSign, color: 'text-green-400' },
    { label: 'Emre', amount: Math.round(calculateConcertShares().emre), icon: Users, color: 'text-indigo-400' },
    { label: 'Hoze', amount: Math.round(calculateConcertShares().hoze), icon: DollarSign, color: 'text-cyan-400' },
  ];

  const handleEditNote = (category: string) => {
    setEditingCategory(category);
    setTempNote(notes[category] || '');
  };

  const handleSaveNote = (category: string) => {
    setNotes(prev => ({ ...prev, [category]: tempNote }));
    setEditingCategory(null);
    setTempNote('');
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setTempNote('');
  };

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleAddDetail = (category: string) => {
    const newDetail = { name: 'Yeni Kişi', amount: 0 };
    setCategoryDetails(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), newDetail]
    }));
  };

  const handleEditDetail = (category: string, index: number) => {
    const detail = categoryDetails[category]?.[index];
    if (detail) {
      setEditingDetail({ category, index });
      setTempDetailName(detail.name);
      setTempDetailAmount(detail.amount.toString());
    }
  };

  const handleSaveDetail = () => {
    if (editingDetail) {
      const { category, index } = editingDetail;
      setCategoryDetails(prev => ({
        ...prev,
        [category]: prev[category].map((detail, i) => 
          i === index 
            ? { name: tempDetailName, amount: parseFloat(tempDetailAmount) || 0 }
            : detail
        )
      }));
      setEditingDetail(null);
      setTempDetailName('');
      setTempDetailAmount('');
    }
  };

  const handleDeleteDetail = (category: string, index: number) => {
    setCategoryDetails(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const handleEditCategoryAmount = (category: string) => {
    setEditingCategoryAmount(category);
    const currentAmount = editedCategoryAmounts[category] !== undefined 
      ? editedCategoryAmounts[category] 
      : calculateCategoryTotal(category);
    setTempCategoryAmount(currentAmount.toString());
  };

  const handleSaveCategoryAmount = () => {
    if (editingCategoryAmount) {
      const newAmount = parseFloat(tempCategoryAmount) || 0;
      const newAmounts = {
        ...editedCategoryAmounts,
        [editingCategoryAmount]: newAmount
      };
      
      setEditedCategoryAmounts(newAmounts);
      
      // localStorage'a kaydet
      try {
        const storageKey = `concertAmounts_${concertName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`;
        localStorage.setItem(storageKey, JSON.stringify(newAmounts));
      } catch (error) {
        console.error('Konser tutarları kaydetme hatası:', error);
      }
      
      setEditingCategoryAmount(null);
      setTempCategoryAmount('');
    }
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategoryAmount(null);
    setTempCategoryAmount('');
  };

  const handleSaveCategoryAmountOld = () => {
    if (editingCategoryAmount) {
      const newAmount = parseFloat(tempCategoryAmount) || 0;
      const newAmounts = {
        ...prev,
        [editingCategoryAmount]: newAmount
      };
      
      setEditedCategoryAmounts(newAmounts);
      setEditingCategoryAmount(null);
      setTempCategoryAmount('');
    }
  };

  // Eski fonksiyonu kaldır - yukarıda yenisi var

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h3 className="text-2xl font-bold text-white">{concertName}</h3>
            <p className="text-green-200">{formatDate(concertDate)} - Toplam: {formatCurrency(totalAmount)}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detailItems.map((item) => {
              const Icon = item.icon;
              const isEditing = editingCategory === item.label;
              const hasNote = notes[item.label];
              const hasDetails = categoryDetails[item.label] && categoryDetails[item.label].length > 0;
              const isExpanded = expandedCategories[item.label];
              const isEditingAmount = editingCategoryAmount === item.label;
              const canEditAmount = ['Kaşe', 'Ulaşım', 'Reklam', 'Konaklama', 'Ekstra', 'Yemek', 'Ekip'].includes(item.label);
              const isCalculated = ['Emre', 'Hoze'].includes(item.label);
              
              return (
                <div
                  key={item.label}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200 space-y-3 col-span-full"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {hasDetails && (
                        <button
                          onClick={() => toggleCategoryExpansion(item.label)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                      )}
                      <div className="bg-white/10 p-2 rounded-lg">
                        <Icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                      <span className="text-white font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditingAmount && isAdmin ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={tempCategoryAmount}
                            onChange={(e) => setTempCategoryAmount(e.target.value)}
                            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-24"
                            step="0.01"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveCategoryAmount}
                            className="text-green-400 hover:text-green-300 transition-colors p-1 hover:bg-white/10 rounded"
                            title="Kaydet"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelCategoryEdit}
                            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                            title="İptal"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-lg ${item.color}`}>
                            {isCalculated ? formatCurrency(item.amount) : formatCurrency(calculateCategoryTotal(item.label))}
                          </span>
                          {canEditAmount && isAdmin && !isCalculated && (
                            <button
                              onClick={() => handleEditCategoryAmount(item.label)}
                              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                              title="Tutarı düzenle"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                      {hasDetails && (
                        <button
                          onClick={() => handleAddDetail(item.label)}
                          className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                          title="Yeni kişi ekle"
                          disabled={!isAdmin}
                          style={{ display: !isAdmin ? 'none' : 'block' }}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      )}
                      {isAdmin ? (
                        <button
                          onClick={() => handleEditNote(item.label)}
                          className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                          title="Not ekle/düzenle"
                        >
                          {hasNote ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </button>
                      ) : hasFullAccess ? (
                        <button
                          className="text-gray-600 cursor-not-allowed p-1 rounded opacity-50"
                          title="Sadece görüntüleme (düzenleme yetkiniz yok)"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Alt detaylar */}
                  {hasDetails && isExpanded && (
                    <div className="bg-white/5 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-white font-medium">Detay Dökümü</h5>
                        <span className="text-sm text-gray-400">
                          Toplam: {formatCurrency(calculateCategoryTotal(item.label))}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {categoryDetails[item.label].map((detail, index) => {
                          const isEditingThis = editingDetail?.category === item.label && editingDetail?.index === index;
                          
                          return (
                            <div key={index} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                              {isEditingThis ? (
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={tempDetailName}
                                    onChange={(e) => setTempDetailName(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    placeholder="İsim"
                                  />
                                  <input
                                    type="number"
                                    value={tempDetailAmount}
                                    onChange={(e) => setTempDetailAmount(e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    placeholder="Tutar"
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      onClick={handleSaveDetail}
                                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                                    >
                                      Kaydet
                                    </button>
                                    <button
                                      onClick={() => setEditingDetail(null)}
                                      className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                                    >
                                      İptal
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDetail(item.label, index)}
                                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                                    >
                                      Sil
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex-1">
                                    <span className="text-white text-sm font-medium">{detail.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-green-400 font-bold text-sm">
                                      {formatCurrency(detail.amount)}
                                    </span>
                                    <button
                                      onClick={() => handleEditDetail(item.label, index)}
                                      className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                                      style={{ display: !isAdmin ? 'none' : 'block' }}
                                    >
                                      <Edit3 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Not ekleme/düzenleme alanı */}
                  {isEditing && isAdmin && (
                    <div className="space-y-2">
                      <textarea
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                        placeholder="Bu kategori için not ekleyin..."
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveNote(item.label)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                        >
                          <Save className="h-3 w-3" />
                          Kaydet
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Kaydedilmiş not */}
                  {hasNote && !isEditing && (
                    <div className="bg-white/5 rounded-lg p-3 border-l-2 border-purple-400">
                      <p className="text-gray-300 text-sm leading-relaxed">{notes[item.label]}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/20 p-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Konser Gider Detayları</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">Toplam Masraf:</span>
              <span className="text-green-400 font-bold text-xl">
                {formatCurrency(detailItems.reduce((sum, item) => sum + calculateCategoryTotal(item.label), 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConcertDetailModal;