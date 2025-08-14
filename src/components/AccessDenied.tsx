import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

interface AccessDeniedProps {
  onGoBack: () => void;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ onGoBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          {/* Icon */}
          <div className="bg-red-500/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Shield className="h-10 w-10 text-red-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-4">
            Erişim Engellendi
          </h1>

          {/* Message */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            Bu sayfaya erişim yetkiniz bulunmuyor. Lütfen sistem yöneticisi ile iletişime geçin.
          </p>

          {/* Action Button */}
          <button
            onClick={onGoBack}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </button>

          {/* Additional Info */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-gray-400">
              Eğer bu sayfaya erişmeniz gerektiğini düşünüyorsanız, 
              lütfen sistem yöneticisinden gerekli izinleri talep edin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;