import React, { useState, useEffect } from 'react';
import { X, Save, Users, Shield, Settings as SettingsIcon, Plus, Edit3, Trash2, Eye, EyeOff, Activity, Filter, Search } from 'lucide-react';
import { useAuth, ALL_PAGES } from '../hooks/useAuth';

interface User {
  username: string;
  password: string;
  isAdmin: boolean;
  hasFullAccess: boolean;
  permissions?: string[];
  createdAt?: string;
  lastLogin?: string;
}

interface ActivityLog {
  id: string;
  username: string;
  action: string;
  page?: string;
  timestamp: string;
  details?: string;
}

interface UserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserPermissionsModal: React.FC<UserPermissionsModalProps> = ({ isOpen, onClose }) => {
  const { getAllUsers, addUser, updateUser, deleteUser, getActivityLogs, logActivity } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'activity'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityFilter, setActivityFilter] = useState({
    username: '',
    action: '',
    dateFrom: '',
    dateTo: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Yeni kullanıcı formu
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    permissions: ['dashboard'] as string[]
  });

  // Düzenleme formu
  const [editForm, setEditForm] = useState({
    username: '',
    password: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadActivityLogs();
    }
  }, [isOpen]);

  const loadUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  const loadActivityLogs = () => {
    const logs = getActivityLogs();
    setActivityLogs(logs);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAddUser = () => {
    if (!newUser.username.trim()) {
      showMessage('error', 'Kullanıcı adı boş olamaz!');
      return;
    }

    if (!newUser.password.trim()) {
      showMessage('error', 'Şifre boş olamaz!');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      showMessage('error', 'Şifreler eşleşmiyor!');
      return;
    }

    if (newUser.permissions.length === 0) {
      showMessage('error', 'En az bir sayfa izni seçmelisiniz!');
      return;
    }

    const success = addUser({
      username: newUser.username,
      password: newUser.password,
      isAdmin: false,
      hasFullAccess: false,
      permissions: newUser.permissions
    });

    if (success) {
      showMessage('success', 'Kullanıcı başarıyla eklendi!');
      setNewUser({ username: '', password: '', confirmPassword: '', permissions: ['dashboard'] });
      setShowAddForm(false);
      loadUsers();
      logActivity('Yeni Kullanıcı Ekledi', 'settings', `Kullanıcı: ${newUser.username}`);
    } else {
      showMessage('error', 'Bu kullanıcı adı zaten mevcut!');
    }
  };

  const handleEditUser = (username: string) => {
    const user = users.find(u => u.username === username);
    if (user) {
      setEditForm({
        username: user.username,
        password: user.password,
        permissions: user.permissions || []
      });
      setEditingUser(username);
    }
  };

  const handleSaveEdit = () => {
    if (!editForm.password.trim()) {
      showMessage('error', 'Şifre boş olamaz!');
      return;
    }

    if (editForm.permissions.length === 0) {
      showMessage('error', 'En az bir sayfa izni seçmelisiniz!');
      return;
    }

    const success = updateUser(editingUser!, {
      password: editForm.password,
      permissions: editForm.permissions
    });

    if (success) {
      showMessage('success', 'Kullanıcı başarıyla güncellendi!');
      setEditingUser(null);
      loadUsers();
      logActivity('Kullanıcı Güncelledi', 'settings', `Kullanıcı: ${editingUser}`);
    } else {
      showMessage('error', 'Kullanıcı güncellenirken hata oluştu!');
    }
  };

  const handleDeleteUser = (username: string) => {
    if (window.confirm(`${username} kullanıcısını silmek istediğinizden emin misiniz?`)) {
      const success = deleteUser(username);
      if (success) {
        showMessage('success', 'Kullanıcı başarıyla silindi!');
        loadUsers();
        logActivity('Kullanıcı Sildi', 'settings', `Kullanıcı: ${username}`);
      } else {
        showMessage('error', 'Kullanıcı silinirken hata oluştu!');
      }
    }
  };

  const togglePasswordVisibility = (username: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  const handlePermissionToggle = (pageId: string, isNewUser: boolean = false) => {
    if (isNewUser) {
      setNewUser(prev => ({
        ...prev,
        permissions: prev.permissions.includes(pageId)
          ? prev.permissions.filter(p => p !== pageId)
          : [...prev.permissions, pageId]
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        permissions: prev.permissions.includes(pageId)
          ? prev.permissions.filter(p => p !== pageId)
          : [...prev.permissions, pageId]
      }));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('tr-TR');
  };

  const filteredLogs = activityLogs.filter(log => {
    const matchesUsername = !activityFilter.username || 
      log.username.toLowerCase().includes(activityFilter.username.toLowerCase());
    const matchesAction = !activityFilter.action || 
      log.action.toLowerCase().includes(activityFilter.action.toLowerCase());
    
    let matchesDate = true;
    if (activityFilter.dateFrom || activityFilter.dateTo) {
      const logDate = new Date(log.timestamp);
      if (activityFilter.dateFrom) {
        matchesDate = matchesDate && logDate >= new Date(activityFilter.dateFrom);
      }
      if (activityFilter.dateTo) {
        matchesDate = matchesDate && logDate <= new Date(activityFilter.dateTo + 'T23:59:59');
      }
    }
    
    return matchesUsername && matchesAction && matchesDate;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Kullanıcı Yönetimi</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mx-6 mt-4 p-3 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-500/20 border-green-500/30 text-green-300' 
              : 'bg-red-500/20 border-red-500/30 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-white/20">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Kullanıcılar
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'activity'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            Aktivite Logları
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'users' ? (
            <div className="space-y-6">
              {/* Add User Button */}
              <div className="flex justify-between items-center">
                <h4 className="text-white font-semibold">Kullanıcı Listesi</h4>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Yeni Kullanıcı Ekle
                </button>
              </div>

              {/* Add User Form */}
              {showAddForm && (
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                  <h5 className="text-white font-medium mb-4">Yeni Kullanıcı Ekle</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Kullanıcı Adı</label>
                      <input
                        type="text"
                        value={newUser.username}
                        onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Kullanıcı adı..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Şifre..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Şifre Tekrar</label>
                      <input
                        type="password"
                        value={newUser.confirmPassword}
                        onChange={(e) => setNewUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Şifre tekrar..."
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-3">Sayfa İzinleri</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {ALL_PAGES.map(page => (
                        <label key={page.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newUser.permissions.includes(page.id)}
                            onChange={() => handlePermissionToggle(page.id, true)}
                            className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                          />
                          <span className="text-gray-300 text-sm">{page.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddUser}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      Kullanıcı Ekle
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewUser({ username: '', password: '', confirmPassword: '', permissions: ['dashboard'] });
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}

              {/* Users Table */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/10">
                      <tr>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Kullanıcı Adı</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Şifre</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">İzinler</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Oluşturulma</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Son Giriş</th>
                        <th className="text-right py-3 px-4 text-gray-300 font-medium">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={user.username} className="border-b border-white/10 hover:bg-white/5">
                          <td className="py-3 px-4 text-white font-medium">{user.username}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-300 font-mono">
                                {showPasswords[user.username] ? user.password : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(user.username)}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                {showPasswords[user.username] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {user.permissions?.map(permission => {
                                const page = ALL_PAGES.find(p => p.id === permission);
                                return (
                                  <span key={permission} className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                                    {page?.label || permission}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-sm">
                            {user.createdAt ? formatDate(user.createdAt) : '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-sm">
                            {user.lastLogin ? formatDate(user.lastLogin) : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => handleEditUser(user.username)}
                                className="text-blue-400 hover:text-blue-300 transition-colors p-1 hover:bg-white/10 rounded"
                                title="Düzenle"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.username)}
                                className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-white/10 rounded"
                                title="Sil"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Edit User Modal */}
              {editingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-60">
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 w-full max-w-md">
                    <div className="p-6">
                      <h5 className="text-white font-medium mb-4">Kullanıcı Düzenle: {editingUser}</h5>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
                          <input
                            type="password"
                            value={editForm.password}
                            onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-3">Sayfa İzinleri</label>
                          <div className="space-y-2">
                            {ALL_PAGES.map(page => (
                              <label key={page.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editForm.permissions.includes(page.id)}
                                  onChange={() => handlePermissionToggle(page.id, false)}
                                  className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                                />
                                <span className="text-gray-300 text-sm">{page.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors font-medium"
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Activity Logs Tab */
            <div className="space-y-6">
              <h4 className="text-white font-semibold">Aktivite Logları</h4>

              {/* Filters */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Kullanıcı</label>
                    <input
                      type="text"
                      value={activityFilter.username}
                      onChange={(e) => setActivityFilter(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Kullanıcı ara..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Eylem</label>
                    <input
                      type="text"
                      value={activityFilter.action}
                      onChange={(e) => setActivityFilter(prev => ({ ...prev, action: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Eylem ara..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Başlangıç Tarihi</label>
                    <input
                      type="date"
                      value={activityFilter.dateFrom}
                      onChange={(e) => setActivityFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bitiş Tarihi</label>
                    <input
                      type="date"
                      value={activityFilter.dateTo}
                      onChange={(e) => setActivityFilter(prev => ({ ...prev, dateTo: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Activity Logs Table */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/10">
                      <tr>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Zaman</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Kullanıcı</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Eylem</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Sayfa</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Detaylar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="py-3 px-4 text-gray-300 text-sm">
                            {formatDate(log.timestamp)}
                          </td>
                          <td className="py-3 px-4 text-white font-medium">{log.username}</td>
                          <td className="py-3 px-4 text-blue-300">{log.action}</td>
                          <td className="py-3 px-4 text-purple-300">{log.page || '-'}</td>
                          <td className="py-3 px-4 text-gray-400 text-sm">{log.details || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredLogs.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Filtrelere uygun aktivite bulunamadı.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/20 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-300">
              {activeTab === 'users' 
                ? `Toplam ${users.length} kullanıcı`
                : `Toplam ${filteredLogs.length} aktivite (${activityLogs.length} toplam)`
              }
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionsModal;