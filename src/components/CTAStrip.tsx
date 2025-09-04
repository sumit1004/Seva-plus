import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { ContentData } from '../types';
import { AdminLoginModal } from './AdminLoginModal';

interface CTAStripProps {
  content: ContentData;
}

export const CTAStrip: React.FC<CTAStripProps> = ({ content }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  return (
    <section className="py-20 bg-indigo-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">
          {content.cta.heading}
        </h2>
        
        <div className="flex justify-center">
          <button 
            onClick={() => setIsLoginModalOpen(true)}
            className="bg-white text-indigo-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-lg flex items-center justify-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>{content.cta.buttons.pilot}</span>
          </button>
          <AdminLoginModal 
            isOpen={isLoginModalOpen} 
            onClose={() => setIsLoginModalOpen(false)} 
          />
        </div>
      </div>
    </section>
  );
};