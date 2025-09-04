import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { ContentData } from '../types';
import { AdminLoginModal } from './AdminLoginModal';

interface HeroProps {
  content: ContentData;
}

export const Hero: React.FC<HeroProps> = ({ content }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <section className="relative bg-gradient-to-br from-indigo-50 via-white to-emerald-50 py-20 overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        {/* Main background image - Ujjain Mahakumbh */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{
            backgroundImage: `url('https://bharatexpress.com/wp-content/uploads/2024/12/Mahakumbh-2025-3.jpg')`,
          }}
        />
        
        {/* Darker overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Overlay pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/15 via-transparent to-emerald-600/15" />
        
        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-200/20 rounded-full blur-xl" />
        <div className="absolute top-20 right-20 w-24 h-24 bg-yellow-200/20 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-red-200/20 rounded-full blur-xl" />
        <div className="absolute bottom-10 right-1/3 w-28 h-28 bg-purple-200/20 rounded-full blur-xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Background blur container */}
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/30 shadow-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-6 leading-tight drop-shadow-lg">
              {content.hero.headline}
            </h1>
            <p className="text-xl md:text-2xl text-black/90 mb-8 leading-relaxed drop-shadow-md font-medium">
              {content.hero.subhead}
            </p>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
              {content.hero.trustRow.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/70">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-gray-800">{item}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex justify-center mb-8">
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl hover:bg-indigo-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-xl backdrop-blur-sm border border-white/20"
              >
                {content.hero.primaryCTA}
              </button>
            </div>

            {/* Microcopy */}
            <p className="text-white/80 text-lg max-w-2xl mx-auto font-medium drop-shadow-sm">
              {content.hero.microcopy}
            </p>
          </div>
        </div>
      </div>

      {/* Admin Login Modal */}
      <AdminLoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </section>
  );
};