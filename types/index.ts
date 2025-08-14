// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Types
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'income' | 'expense';
  userId: string;
  createdAt: Date;
}

export type TransactionFormData = Omit<Transaction, 'id' | 'userId' | 'createdAt'>;

// App State Types
export type AppView = 'home' | 'finans' | 'calendar' | 'settings';

export interface AppState {
  currentView: AppView;
  user: User | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

// Modal Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Permission Types
export interface Permission {
  id: string;
  name: string;
  description: string;
  allowedRoles: User['role'][];
}

export interface UserPermission {
  userId: string;
  permissionId: string;
  grantedAt: Date;
}

// Component Props Types
export interface DashboardProps {
  transactions: Transaction[];
  onTransactionsUpdate: (transactions: Transaction[]) => void;
  isAdmin: boolean;
  hasFullAccess: boolean;
}

export interface NavigationProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onAddTransaction: () => void;
  isAdmin: boolean;
}

export interface TransactionFormProps {
  onAddTransaction: (transaction: TransactionFormData) => void;
  onClose: () => void;
  initialData?: Partial<TransactionFormData>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  details?: unknown;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'date';
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
  options?: Array<{ value: string; label: string }>;
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  description?: string;
  type: 'meeting' | 'deadline' | 'reminder';
  color?: string;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeState {
  theme: Theme;
  systemTheme: 'light' | 'dark';
}