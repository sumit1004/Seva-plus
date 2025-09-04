import React, { useState } from 'react';
import { Menu, X, TreePine, LogOut } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ContentData, Language } from '../types';
import { AdminLoginModal } from './AdminLoginModal';
import { logout, getCurrentUser, onAuthStateChanged } from '../firebase/auth';

interface NavbarProps {
  content: ContentData;
  currentLanguage: Language['code'];
  onLanguageChange: (lang: Language['code']) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ content, currentLanguage, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  // Listen for auth state changes
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await logout();
    if (error) {
      console.error('Error signing out:', error);
    }
    // Redirect to home
    window.location.href = '/';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <TreePine className="w-8 h-8 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900">Seva+</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {content.navbar.links.map((link, index) => (
              <a
                key={index}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <LanguageSwitcher 
              currentLanguage={currentLanguage} 
              onLanguageChange={onLanguageChange} 
            />
            <button className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              {content.navbar.buttons.pilot}
            </button>
            {currentUser ? (
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                {content.navbar.buttons.admin}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-4">
            <LanguageSwitcher 
              currentLanguage={currentLanguage} 
              onLanguageChange={onLanguageChange} 
            />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-3">
              {content.navbar.links.map((link, index) => (
                <a
                  key={index}
                  href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-gray-600 hover:text-indigo-600 transition-colors font-medium py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                <button className="text-indigo-600 hover:text-indigo-700 font-medium text-left">
                  {content.navbar.buttons.pilot}
                </button>
                {currentUser ? (
                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsOpen(false);
                    }}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    {content.navbar.buttons.admin}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <AdminLoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </nav>
  );
};