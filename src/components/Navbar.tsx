import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sayfa yüklendiğinde mevcut temayı kontrol et
  useEffect(() => {
    const html = document.documentElement;
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      html.classList.add('dark');
      setIsDarkMode(true);
    } else {
      html.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <nav className="w-full px-4 py-3 flex items-center justify-between bg-white/80 dark:bg-black/30 backdrop-blur-lg border-b border-gray-200 dark:border-white/10">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white font-sf-pro">
        HOZE Dashboard
      </h1>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
      >
        {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-800" />}
      </button>
    </nav>
  );
};

export default Navbar;
