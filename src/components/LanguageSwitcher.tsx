import React from 'react';
import { Languages } from 'lucide-react';
import { Language } from '../types';

interface LanguageSwitcherProps {
  currentLanguage: Language['code'];
  onLanguageChange: (lang: Language['code']) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Languages className="w-4 h-4 text-gray-600" />
      <button
        onClick={() => onLanguageChange('en')}
        className={`px-2 py-1 text-sm rounded transition-colors ${
          currentLanguage === 'en'
            ? 'bg-indigo-100 text-indigo-800 font-medium'
            : 'text-gray-600 hover:text-indigo-600'
        }`}
      >
        EN
      </button>
      <span className="text-gray-400">|</span>
      <button
        onClick={() => onLanguageChange('hi')}
        className={`px-2 py-1 text-sm rounded transition-colors ${
          currentLanguage === 'hi'
            ? 'bg-indigo-100 text-indigo-800 font-medium'
            : 'text-gray-600 hover:text-indigo-600'
        }`}
      >
        हिं
      </button>
    </div>
  );
};