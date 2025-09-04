import React from 'react';
import { TreePine } from 'lucide-react';
import { ContentData } from '../types';

interface FooterProps {
  content: ContentData;
}

export const Footer: React.FC<FooterProps> = ({ content }) => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <TreePine className="w-8 h-8 text-emerald-400" />
            <span className="text-xl font-bold">Seva+</span>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end gap-6 mb-4 md:mb-0">
            {content.footer.links.map((link, index) => (
              <a
                key={index}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">{content.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
};