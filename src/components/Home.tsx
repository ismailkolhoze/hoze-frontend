import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Edit3, Trash2, Calendar, Clock, User } from 'lucide-react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  assignedTo?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
}

const Home: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('hoze_todos');
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (error) {
        console.error('Error loading todos:', error);
      }
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('hoze_todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: TodoItem = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        priority: 'medium'
      };
      setTodos(prev => [todo, ...prev]);
      setNewTodo('');
      setShowAddForm(false);
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const startEdit = (todo: TodoItem) => {
    setEditingTodo(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id: string) => {
    if (editText.trim()) {
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, text: editText.trim() } : todo
      ));
    }
    setEditingTodo(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setEditText('');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const completedTodos = todos.filter(todo => todo.completed);
  const pendingTodos = todos.filter(todo => !todo.completed);

  return (
    <div className="min-h-screen bg-white p-3">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-900 mb-1 tracking-tight">
            Görev Yönetimi
          </h1>
          <p className="text-sm text-gray-600 font-normal max-w-2xl">
            Görevlerinizi yönetin ve organize kalın
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">Toplam Görev</p>
                <p className="text-lg font-semibold text-gray-900">{todos.length}</p>
              </div>
              <div className="bg-blue-100 p-1.5 rounded">
                <Calendar className="h-3 w-3 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">Tamamlanan</p>
                <p className="text-lg font-semibold text-green-600">{completedTodos.length}</p>
              </div>
              <div className="bg-green-100 p-1.5 rounded">
                <Check className="h-3 w-3 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">Bekleyen</p>
                <p className="text-lg font-semibold text-orange-600">{pendingTodos.length}</p>
              </div>
              <div className="bg-orange-100 p-1.5 rounded">
                <Clock className="h-3 w-3 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Todo List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h2 className="text-base font-medium text-gray-900">Görev Listesi</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1"
            >
              <Plus className="h-2.5 w-2.5" />
              Görev Ekle
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Ne yapılması gerekiyor?"
                  className="flex-1 px-2.5 py-1.5 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTodo();
                    }
                    if (e.key === 'Escape') {
                      setShowAddForm(false);
                      setNewTodo('');
                    }
                  }}
                />
                <button
                  onClick={addTodo}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded font-medium transition-colors text-xs"
                >
                  Ekle
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTodo('');
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1.5 rounded font-medium transition-colors text-xs"
                >
                  İptal
                </button>
              </div>
            </div>
          )}

          {/* Todo Items */}
          <div className="divide-y divide-gray-200">
            {todos.length === 0 ? (
              <div className="p-6 text-center">
                <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-xs">Henüz görev yok. İlk görevinizi ekleyin!</p>
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`p-3 hover:bg-gray-50 transition-colors ${
                    todo.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        todo.completed
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {todo.completed && <Check className="h-2 w-2" />}
                    </button>

                    {/* Content */}
                    <div className="flex-1">
                      {editingTodo === todo.id ? (
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 px-2 py-1 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                            autoFocus
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                saveEdit(todo.id);
                              }
                              if (e.key === 'Escape') {
                                cancelEdit();
                              }
                            }}
                          />
                          <button
                            onClick={() => saveEdit(todo.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors"
                          >
                            <Check className="h-2.5 w-2.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-2 py-1 rounded text-xs transition-colors"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className={`text-xs font-medium ${
                            todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}>
                            {todo.text}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getPriorityColor(todo.priority)}`}>
                              {todo.priority === 'high' ? 'YÜKSEK' : todo.priority === 'medium' ? 'ORTA' : 'DÜŞÜK'}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {formatDate(todo.createdAt)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {editingTodo !== todo.id && (
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => startEdit(todo)}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-0.5 hover:bg-blue-50 rounded"
                          title="Düzenle"
                        >
                          <Edit3 className="h-2.5 w-2.5" />
                        </button>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-0.5 hover:bg-red-50 rounded"
                          title="Sil"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {todos.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-gray-600 text-xs">
              {todos.length} görevden {completedTodos.length} tanesi tamamlandı
              {todos.length > 0 && (
                <span className="ml-1 text-green-600 font-medium">
                  ({Math.round((completedTodos.length / todos.length) * 100)}%)
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;