import React from 'react';
import { X, Calendar, DollarSign, Edit3, Save, Link, ExternalLink, Plus, Minus, User } from 'lucide-react';

interface ExpenseDetail {
  date: string;
  amount: number;
  description: string;
  link?: string;
  includeInCost?: boolean;
  costPercentage?: number;
}

interface ExpenseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  month: string;
  expenses: ExpenseDetail[];
  total: number;
  onExpensesUpdate?: (expenses: ExpenseDetail[]) => void;
  isAdmin?: boolean;
  hasFullAccess?: boolean;
}

const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  isOpen,
  onClose,
  category,
  month,
  expenses,
  total,
  onExpensesUpdate,
  isAdmin = false,
  hasFullAccess = false
}) => {
  const [editingExpense, setEditingExpense] = React.useState<number | null>(null);
  const [tempLink, setTempLink] = React.useState('');
  const [editedExpenses, setEditedExpenses] = React.useState(expenses);
  const [editingNote, setEditingNote] = React.useState<number | null>(null);
  const [tempNote, setTempNote] = React.useState('');
  const [tempExpenseName, setTempExpenseName] = React.useState('');
  const [tempExpenseAmount, setTempExpenseAmount] = React.useState('');
  const [tempExpenseDate, setTempExpenseDate] = React.useState('');
  
  const [expenseNotes, setExpenseNotes] = React.useState<Record<number, string>>({});
  const [tempIncludeInCost, setTempIncludeInCost] = React.useState(true);
  const [tempCostPercentage, setTempCostPercentage] = React.useState('100');
  
  const [structuredNotes, setStructuredNotes] = React.useState<Record<number, Array<{person: string, amount: string, description: string}>>>({});
  const [editingStructuredNote, setEditingStructuredNote] = React.useState<number | null>(null);
  const [tempStructuredNotes, setTempStructuredNotes] = React.useState<Array<{person: string, amount: string, description: string}>>([]);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newExpense, setNewExpense] = React.useState({
    description: '',
    date: new Date().toISOString().split('T')[0],
    amount: ''
  });

  React.useEffect(() => {
    setEditedExpenses(expenses);
    
    // localStorage'dan notları yükle
    if (isOpen && category) {
      try {
        const savedExpenseNotes = localStorage.getItem(`expenseNotes_${category.replace(/\s+/g, '_')}`);
        if (savedExpenseNotes) {
          setExpenseNotes(JSON.parse(savedExpenseNotes));
        } else {
          setExpenseNotes({});
        }
        
        const savedStructuredNotes = localStorage.getItem(`structuredNotes_${category.replace(/\s+/g, '_')}`);
        if (savedStructuredNotes) {
          setStructuredNotes(JSON.parse(savedStructuredNotes));
        } else {
          setStructuredNotes({});
        }
      } catch (error) {
        console.error('Not yükleme hatası:', error);
        setExpenseNotes({});
        setStructuredNotes({});
      }
    }
  }, [expenses, isOpen, category]);

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

  const handleAddLink = (index: number) => {
    setEditingExpense(index);
    setTempLink(editedExpenses[index]?.link || '');
  };

  const handleSaveLink = (index: number) => {
    const updatedExpenses = [...editedExpenses];
    updatedExpenses[index] = { ...updatedExpenses[index], link: tempLink };
    setEditedExpenses(updatedExpenses);
    setEditingExpense(null);
    setTempLink('');
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setTempLink('');
    setEditingNote(null);
    setTempNote('');
    setTempExpenseName('');
    setTempExpenseAmount('');
    setTempExpenseDate('');
    setEditingStructuredNote(null);
    setTempStructuredNotes([]);
    setTempIncludeInCost(true);
    setTempCostPercentage('100');
  };

  const handleAddNote = (index: number) => {
    setEditingNote(index);
    setTempNote(expenseNotes[index] || '');
  };

  const handleSaveNote = (index: number) => {
    const newNotes = { ...expenseNotes, [index]: tempNote };
    setExpenseNotes(newNotes);
    // localStorage'a kaydet
    try {
      localStorage.setItem(`expenseNotes_${category.replace(/\s+/g, '_')}`, JSON.stringify(newNotes));
    } catch (error) {
      console.error('Not kaydetme hatası:', error);
    }
    setEditingNote(null);
    setTempNote('');
  };

  const handleAddStructuredNote = (index: number) => {
    setEditingStructuredNote(index);
    setTempStructuredNotes(structuredNotes[index] || [{person: '', amount: '', description: ''}]);
  };

  const handleSaveStructuredNote = (index: number) => {
    const validNotes = tempStructuredNotes.filter(note => note.person.trim() || note.amount.trim() || note.description.trim());
    const newStructuredNotes = { ...structuredNotes, [index]: validNotes };
    setStructuredNotes(newStructuredNotes);
    // localStorage'a kaydet
    try {
      localStorage.setItem(`structuredNotes_${category.replace(/\s+/g, '_')}`, JSON.stringify(newStructuredNotes));
    } catch (error) {
      console.error('Yapılandırılmış not kaydetme hatası:', error);
    }
    setEditingStructuredNote(null);
    setTempStructuredNotes([]);
  };

  const addNoteRow = () => {
    setTempStructuredNotes(prev => [...prev, {person: '', amount: '', description: ''}]);
  };

  const removeNoteRow = (rowIndex: number) => {
    setTempStructuredNotes(prev => prev.filter((_, i) => i !== rowIndex));
  };

  const updateNoteRow = (rowIndex: number, field: string, value: string) => {
    setTempStructuredNotes(prev => prev.map((note, i) => 
      i === rowIndex ? { ...note, [field]: value } : note
    ));
  };

  const handleAddExpense = () => {
    if (newExpense.description && newExpense.amount) {
      const expense = {
        date: newExpense.date,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        ...(isAdvertisement && {
          includeInCost: true,
          costPercentage: 100
        })
      };
      const updatedExpenses = [...editedExpenses, expense];
      setEditedExpenses(updatedExpenses);
      
      // Ana bileşene güncellenmiş verileri gönder
      if (onExpensesUpdate) {
        onExpensesUpdate(updatedExpenses);
      }
      
      setNewExpense({ description: '', date: new Date().toISOString().split('T')[0], amount: '' });
      setShowAddForm(false);
    }
  };

  const handleCancelAdd = () => {
    setNewExpense({ description: '', date: new Date().toISOString().split('T')[0], amount: '' });
    setShowAddForm(false);
  };

  const handleDeleteExpense = (index: number) => {
    if (window.confirm('Bu harcamayı silmek istediğinizden emin misiniz?')) {
      const updatedExpenses = editedExpenses.filter((_, i) => i !== index);
      setEditedExpenses(updatedExpenses);
      
      // Ana bileşene güncellenmiş verileri gönder
      if (onExpensesUpdate) {
        onExpensesUpdate(updatedExpenses);
      }
    }
  };

  const handleEditExpense = (index: number) => {
    setEditingExpense(index);
    setTempExpenseName(editedExpenses[index].description);
    setTempExpenseAmount(editedExpenses[index].amount.toString());
    setTempExpenseDate(editedExpenses[index].date);
    setTempNote(expenseNotes[index] || '');
    setTempStructuredNotes(structuredNotes[index] || [{person: '', amount: '', description: ''}]);
    if (isAdvertisement) {
      setTempLink(editedExpenses[index].link || '');
      setTempIncludeInCost(editedExpenses[index].includeInCost ?? true);
      setTempCostPercentage((editedExpenses[index].costPercentage ?? 100).toString());
    }
  };

  const handleSaveExpense = (index: number) => {
    const updatedExpenses = [...editedExpenses];
    updatedExpenses[index] = { 
      ...updatedExpenses[index], 
      description: tempExpenseName,
      amount: parseFloat(tempExpenseAmount) || 0,
      date: tempExpenseDate,
      ...(isAdvertisement && { 
        link: tempLink,
        includeInCost: tempIncludeInCost,
        costPercentage: parseFloat(tempCostPercentage) || 100
      })
    };
    setEditedExpenses(updatedExpenses);
    
    // Notları kaydet
    if (tempNote.trim()) {
      const newExpenseNotes = { ...expenseNotes, [index]: tempNote };
      setExpenseNotes(newExpenseNotes);
      // localStorage'a kaydet
      try {
        localStorage.setItem(`expenseNotes_${category.replace(/\s+/g, '_')}`, JSON.stringify(newExpenseNotes));
      } catch (error) {
        console.error('Not kaydetme hatası:', error);
      }
    }
    
    // Yapılandırılmış notları kaydet
    const validStructuredNotes = tempStructuredNotes.filter(note => 
      note.person.trim() || note.amount.trim() || note.description.trim()
    );
    if (validStructuredNotes.length > 0) {
      const newStructuredNotes = { ...structuredNotes, [index]: validStructuredNotes };
      setStructuredNotes(newStructuredNotes);
      // localStorage'a kaydet
      try {
        localStorage.setItem(`structuredNotes_${category.replace(/\s+/g, '_')}`, JSON.stringify(newStructuredNotes));
      } catch (error) {
        console.error('Yapılandırılmış not kaydetme hatası:', error);
      }
    }
    
    // Ana bileşene güncellenmiş verileri gönder
    if (onExpensesUpdate) {
      onExpensesUpdate(updatedExpenses);
    }
    
    setEditingExpense(null);
    setTempExpenseName('');
    setTempExpenseAmount('');
    setTempExpenseDate('');
    setTempNote('');
    setTempStructuredNotes([]);
    setTempIncludeInCost(true);
    setTempCostPercentage('100');
    setTempLink('');
  };

  const handleExpenseClick = (expense: ExpenseDetail) => {
    if (expense.link && category.toLowerCase().includes('reklam')) {
      window.open(expense.link, '_blank');
    }
  };

  const isAdvertisement = category.toLowerCase().includes('reklam');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h3 className="text-2xl font-bold text-white">{category} - {month} 2025</h3>
            <p className="text-purple-200">Toplam: {formatCurrency(total)}</p>
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
          {/* Yeni Harcama Ekleme Butonu - Üstte */}
          {isAdmin && (
            <div className="mb-6">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                <Plus className="h-4 w-4" />
                Yeni Harcama Ekle
              </button>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 space-y-4">
                <h4 className="text-white font-medium">Yeni Harcama Ekle</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Açıklama</label>
                    <input
                      type="text"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Harcama açıklaması..."
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Tarih</label>
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Tutar (₺)</label>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddExpense}
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
            {editedExpenses.map((expense, index) => {
              const isEditingThis = editingExpense === index;
              const isEditingNoteThis = editingNote === index;
              const isEditingStructuredThis = editingStructuredNote === index;
              const hasNote = expenseNotes[index];
              const hasStructuredNote = structuredNotes[index] && structuredNotes[index].length > 0;
              return (
              <div
                key={index}
                className={`bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200 ${
                  isAdvertisement && expense.link ? 'cursor-pointer hover:border-purple-400' : ''
                } space-y-3 group`}
                onClick={() => handleExpenseClick(expense)}
              >
                {isEditingThis ? (
                  // Düzenleme modu
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">Harcama Düzenle</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveExpense(index)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                        >
                          <Save className="h-4 w-4" />
                          Kaydet
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                        >
                          İptal
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(index)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Açıklama</label>
                        <input
                          type="text"
                          value={tempExpenseName}
                          onChange={(e) => setTempExpenseName(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tarih</label>
                        <input
                          type="date"
                          value={tempExpenseDate}
                          onChange={(e) => setTempExpenseDate(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Tutar (₺)</label>
                        <input
                          type="number"
                          value={tempExpenseAmount}
                          onChange={(e) => setTempExpenseAmount(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    {/* Reklam Linki - Sadece reklam kategorilerinde göster */}
                    {isAdvertisement && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Reklam Linki</label>
                          <input
                            type="url"
                            value={tempLink}
                            onChange={(e) => setTempLink(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="https://..."
                          />
                        </div>
                        
                        <div className="bg-white/5 rounded-lg p-4 space-y-3">
                          <h4 className="text-white font-medium text-sm">Masraf Hesaplama</h4>
                          
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id="includeInCost"
                              checked={tempIncludeInCost}
                              onChange={(e) => setTempIncludeInCost(e.target.checked)}
                              className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                            />
                            <label htmlFor="includeInCost" className="text-gray-300 text-sm">
                              Bu reklam masraf olarak hesaplansın
                            </label>
                          </div>
                          
                          {tempIncludeInCost && (
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-1">
                                Masraf Yüzdesi (%)
                              </label>
                              <input
                                type="number"
                                value={tempCostPercentage}
                                onChange={(e) => setTempCostPercentage(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="100"
                                min="0"
                                max="100"
                                step="1"
                              />
                              <p className="text-xs text-gray-400 mt-1">
                                Örnek: %50 yazarsanız {formatCurrency(parseFloat(tempExpenseAmount) * 0.5)} masraf olarak hesaplanır
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Not Alanı */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Not</label>
                      <textarea
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={3}
                        placeholder="Bu harcama için not ekleyin..."
                      />
                    </div>
                    
                    {/* Yapılandırılmış Notlar - Sadece reklam dışı kategorilerde göster */}
                    {!isAdvertisement && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-300">Detay Notları</label>
                          <button
                            type="button"
                            onClick={addNoteRow}
                            className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                            Satır Ekle
                          </button>
                        </div>
                        
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {tempStructuredNotes.map((note, rowIndex) => (
                            <div key={rowIndex} className="grid grid-cols-12 gap-2 items-center bg-white/5 p-2 rounded-lg">
                              <div className="col-span-3">
                                <input
                                  type="text"
                                  value={note.person}
                                  onChange={(e) => updateNoteRow(rowIndex, 'person', e.target.value)}
                                  placeholder="Kişi/Firma"
                                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                              </div>
                              <div className="col-span-2">
                                <input
                                  type="text"
                                  value={note.amount}
                                  onChange={(e) => updateNoteRow(rowIndex, 'amount', e.target.value)}
                                  placeholder="Tutar"
                                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                              </div>
                              <div className="col-span-6">
                                <input
                                  type="text"
                                  value={note.description}
                                  onChange={(e) => updateNoteRow(rowIndex, 'description', e.target.value)}
                                  placeholder="Açıklama"
                                  className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                                />
                              </div>
                              <div className="col-span-1">
                                <button
                                  type="button"
                                  onClick={() => removeNoteRow(rowIndex)}
                                  className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-white/10 rounded"
                                  title="Satırı sil"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Normal görünüm
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-500/20 p-2 rounded-lg">
                        {isAdvertisement && expense.link ? (
                          <ExternalLink className="h-4 w-4 text-red-400" />
                        ) : (
                          <Calendar className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-white font-medium ${
                            isAdvertisement && expense.link ? 'hover:text-purple-300 transition-colors' : ''
                          }`}>
                            {expense.description}
                          </p>
                          {isAdvertisement && expense.link && (
                            <ExternalLink className="h-3 w-3 text-purple-400" />
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{formatDate(expense.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-bold text-lg">
                        {isAdvertisement ? (
                          <div className="text-right">
                            <div className="text-red-400 font-bold text-lg">
                              {formatCurrency(expense.amount)}
                            </div>
                            {expense.includeInCost === false ? (
                              <div className="text-xs text-gray-400">
                                (Masraf değil)
                              </div>
                            ) : expense.costPercentage !== undefined && expense.costPercentage < 100 ? (
                              <div className="text-xs text-gray-400">
                                Masraf: {formatCurrency(expense.amount * (expense.costPercentage / 100))} (%{expense.costPercentage})
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          formatCurrency(expense.amount)
                        )}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditExpense(index);
                          }}
                          className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                          title="Düzenle"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Yapılandırılmış not ekleme/düzenleme formu - Sadece reklam dışı kategorilerde */}
                {!isAdvertisement && isEditingStructuredThis && isAdmin && (
                  <div className="space-y-3 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">Detay Notları</h4>
                      <button
                        onClick={addNoteRow}
                        className="flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        Satır Ekle
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {tempStructuredNotes.map((note, rowIndex) => (
                        <div key={rowIndex} className="grid grid-cols-12 gap-2 items-center bg-white/5 p-2 rounded-lg">
                          <div className="col-span-3">
                            <input
                              type="text"
                              value={note.person}
                              onChange={(e) => updateNoteRow(rowIndex, 'person', e.target.value)}
                              placeholder="Kişi/Firma"
                              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="text"
                              value={note.amount}
                              onChange={(e) => updateNoteRow(rowIndex, 'amount', e.target.value)}
                              placeholder="Tutar"
                              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                          <div className="col-span-6">
                            <input
                              type="text"
                              value={note.description}
                              onChange={(e) => updateNoteRow(rowIndex, 'description', e.target.value)}
                              placeholder="Açıklama"
                              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                          <div className="col-span-1">
                            <button
                              onClick={() => removeNoteRow(rowIndex)}
                              className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-white/10 rounded"
                              title="Satırı sil"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleSaveStructuredNote(index)}
                        className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors font-medium"
                      >
                        <Save className="h-4 w-4" />
                        Kaydet
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}

                {/* Kaydedilmiş yapılandırılmış notlar - Sadece reklam dışı kategorilerde */}
                {!isAdvertisement && hasStructuredNote && !isEditingStructuredThis && (
                  <div className="bg-white/5 rounded-lg p-3 border-l-2 border-blue-400">
                    <h5 className="text-white font-medium mb-2 text-sm">Detay Notları:</h5>
                    <div className="space-y-1">
                      {structuredNotes[index].map((note, noteIndex) => (
                        <div key={noteIndex} className="text-xs text-gray-300 flex items-center gap-2">
                          {note.person && <span className="text-blue-300 font-medium">{note.person}</span>}
                          {note.amount && <span className="text-green-300">→ {note.amount}</span>}
                          {note.description && <span className="text-gray-300">({note.description})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Not ekleme/düzenleme formu */}
                {isEditingNoteThis && isAdmin && (
                  <div className="space-y-3 border-t border-white/10 pt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Not Ekle
                      </label>
                      <textarea
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                        placeholder="Bu gider için not ekleyin..."
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={3}
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            handleSaveNote(index);
                          }
                          if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                      />
                      <p className="text-xs text-gray-400 mt-1">Ctrl+Enter ile kaydet</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveNote(index)}
                        className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors font-medium"
                      >
                        <Save className="h-4 w-4" />
                        Kaydet
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}

                {/* Kaydedilmiş not */}
                {hasNote && !isEditingNoteThis && (
                  <div className="bg-white/5 rounded-lg p-3 border-l-2 border-purple-400">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{expenseNotes[index]}</p>
                  </div>
                )}
              </div>
            );
            })}
          </div>

          {editedExpenses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">Bu kategori için henüz harcama kaydı bulunmuyor.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/20 p-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Toplam {editedExpenses.length} işlem</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">Toplam Tutar:</span>
              <span className="text-red-400 font-bold text-xl">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailModal;