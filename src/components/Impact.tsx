import React, { useState } from 'react';
import { TrendingUp, Clock, Eye, DollarSign, Info } from 'lucide-react';
import { ContentData } from '../types';

interface ImpactProps {
  content: ContentData;
}

const icons = [TrendingUp, Clock, Eye, DollarSign];

export const Impact: React.FC<ImpactProps> = ({ content }) => {
  const [hoveredKPI, setHoveredKPI] = useState<number | null>(null);

  return (
    <section id="impact" className="py-20 bg-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content.impact.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Measurable impact on cleanliness, efficiency, and management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.impact.kpis.map((kpi, index) => {
            const Icon = icons[index];
            return (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-all relative group"
                onMouseEnter={() => setHoveredKPI(index)}
                onMouseLeave={() => setHoveredKPI(null)}
              >
                <div className="bg-emerald-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{kpi.metric}</h3>
                <p className="text-gray-600 text-sm">{kpi.description}</p>
                
                {/* Tooltip */}
                {hoveredKPI === index && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white p-3 rounded-lg text-sm w-64 z-10">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{kpi.tooltip}</span>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};