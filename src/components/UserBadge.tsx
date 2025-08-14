import React from 'react';
import { User, Shield, Eye, LogOut } from 'lucide-react';

interface UserBadgeProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  hasFullAccess: boolean;
  username?: string;
  onLogin: () => void;
  onLogout: () => void;
}

const UserBadge: React.FC<UserBadgeProps> = ({ 
  isLoggedIn, 
  isAdmin, 
  hasFullAccess,
  username, 
  onLogin, 
  onLogout 
}) => {
  return (
    <div className="fixed top-3 right-4 z-40">
      <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xl rounded border border-gray-200 px-2 py-1 shadow-sm">
        <div className="flex items-center gap-1">
          <div className={`p-1 rounded ${isAdmin ? 'bg-green-100' : 'bg-blue-100'}`}>
            {isAdmin ? (
              <Shield className="h-2.5 w-2.5 text-green-600" />
            ) : (
              <Eye className="h-2.5 w-2.5 text-blue-600" />
            )}
          </div>
          <div>
            <p className="text-gray-900 text-xs font-medium">{username}</p>
            <p className={`text-xs ${isAdmin ? 'text-green-600' : hasFullAccess ? 'text-purple-600' : 'text-blue-600'}`}>
              {isAdmin ? 'Yönetici' : hasFullAccess ? 'Tam Erişim' : 'Görüntüleyici'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBadge;