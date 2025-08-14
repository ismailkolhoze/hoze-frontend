import { useState, useEffect } from 'react';

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

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'hoze2025'
};

// Varsayılan kullanıcılar - Sadece admin
const DEFAULT_USERS: User[] = [];

export const ALL_PAGES = [
  { id: 'home', label: 'Ana Sayfa' },
  { id: 'finans', label: 'Finans' },
  { id: 'calendar', label: 'Takvim' },
  { id: 'settings', label: 'Ayarlar' },
];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // localStorage'dan kullanıcı bilgilerini yükle
    const savedUser = localStorage.getItem('hoze_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
        localStorage.removeItem('hoze_user');
      }
    }

    // İlk kez çalıştırılıyorsa varsayılan kullanıcıları kaydet
    const savedUsers = localStorage.getItem('system_users');
    if (!savedUsers) {
      localStorage.setItem('system_users', JSON.stringify(DEFAULT_USERS));
    }
  }, []);

  // Tüm kullanıcıları getir
  const getAllUsers = (): User[] => {
    try {
      const savedUsers = localStorage.getItem('system_users');
      if (savedUsers) {
        return JSON.parse(savedUsers);
      }
      return DEFAULT_USERS;
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      return DEFAULT_USERS;
    }
  };

  // Kullanıcıları kaydet
  const saveUsers = (users: User[]) => {
    try {
      localStorage.setItem('system_users', JSON.stringify(users));
    } catch (error) {
      console.error('Kullanıcılar kaydedilirken hata:', error);
    }
  };

  // Yeni kullanıcı ekle
  const addUser = (userData: Omit<User, 'createdAt'>): boolean => {
    try {
      const users = getAllUsers();
      const existingUser = users.find(u => u.username === userData.username);
      
      if (existingUser) {
        return false; // Kullanıcı zaten var
      }
      
      const newUser: User = {
        ...userData,
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      saveUsers(users);
      return true;
    } catch (error) {
      console.error('Kullanıcı eklenirken hata:', error);
      return false;
    }
  };

  // Kullanıcı güncelle
  const updateUser = (username: string, updates: Partial<User>): boolean => {
    try {
      const users = getAllUsers();
      const userIndex = users.findIndex(u => u.username === username);
      
      if (userIndex === -1) {
        return false;
      }
      
      users[userIndex] = { ...users[userIndex], ...updates };
      saveUsers(users);
      return true;
    } catch (error) {
      console.error('Kullanıcı güncellenirken hata:', error);
      return false;
    }
  };

  // Kullanıcı sil
  const deleteUser = (username: string): boolean => {
    try {
      const users = getAllUsers();
      const filteredUsers = users.filter(u => u.username !== username);
      saveUsers(filteredUsers);
      return true;
    } catch (error) {
      console.error('Kullanıcı silinirken hata:', error);
      return false;
    }
  };

  // Aktivite logu ekle
  const logActivity = (action: string, page?: string, details?: string) => {
    if (!user) return;
    
    try {
      const logs = getActivityLogs();
      const newLog: ActivityLog = {
        id: Date.now().toString(),
        username: user.username,
        action,
        page,
        timestamp: new Date().toISOString(),
        details
      };
      
      logs.unshift(newLog); // En yeniler başta
      
      // Son 1000 logu sakla
      const trimmedLogs = logs.slice(0, 1000);
      localStorage.setItem('activity_logs', JSON.stringify(trimmedLogs));
    } catch (error) {
      console.error('Aktivite logu kaydedilirken hata:', error);
    }
  };

  // Aktivite loglarını getir
  const getActivityLogs = (): ActivityLog[] => {
    try {
      const savedLogs = localStorage.getItem('activity_logs');
      if (savedLogs) {
        return JSON.parse(savedLogs);
      }
      return [];
    } catch (error) {
      console.error('Aktivite logları yüklenirken hata:', error);
      return [];
    }
  };

  // Kullanıcının belirli bir sayfaya erişim iznini kontrol et
  const hasPageAccess = (pageId: string): boolean => {
    if (!user) return false;
    if (user.isAdmin) return true; // Admin her şeye erişebilir
    return user.permissions?.includes(pageId) || false;
  };

  const login = (username: string, password: string): boolean => {
    // Admin kontrolü
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const userData: User = {
        username: 'Admin',
        password: ADMIN_CREDENTIALS.password,
        isAdmin: true,
        hasFullAccess: true,
        permissions: ALL_PAGES.map(page => page.id),
        lastLogin: new Date().toISOString()
      };
      setUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem('hoze_user', JSON.stringify(userData));
      return true;
    }

    // Kayıtlı kullanıcıları kontrol et
    const users = getAllUsers();
    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      const userData: User = {
        ...foundUser,
        lastLogin: new Date().toISOString()
      };
      
      // Son giriş zamanını güncelle
      updateUser(username, { lastLogin: userData.lastLogin });
      
      setUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem('hoze_user', JSON.stringify(userData));
      return true;
    }

    return false;
  };

  const logout = () => {
    if (user) {
      logActivity('Çıkış Yaptı');
    }
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('hoze_user');
  };

  return {
    user,
    isLoggedIn,
    isAdmin: user?.isAdmin || false,
    hasFullAccess: user?.hasFullAccess || false,
    hasPageAccess,
    getAllUsers,
    addUser,
    updateUser,
    deleteUser,
    logActivity,
    getActivityLogs,
    login,
    logout
  };
};