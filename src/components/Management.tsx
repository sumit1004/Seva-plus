import React from 'react';
import { Shield, BarChart3, Settings } from 'lucide-react';
import { ContentData } from '../types';

interface ManagementProps {
  content: ContentData;
}

export const Management: React.FC<ManagementProps> = ({ content }) => {
  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <div className="flex justify-center space-x-4 mb-6">
            <div className="bg-indigo-600 p-3 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div className="bg-emerald-600 p-3 rounded-xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="bg-orange-600 p-3 rounded-xl">
              <Settings className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{content.management.title}</h2>
          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            {content.management.description}
          </p>
        </div>
        
        <button className="bg-white text-gray-900 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-lg">
          {content.management.button}
        </button>
      </div>
    </section>
  );
};