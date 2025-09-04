import React from 'react';
import { TreePine, Droplets, MapPin, Users } from 'lucide-react';
import { ContentData } from '../types';

interface ProblemsAndSolutionsProps {
  content: ContentData;
}

const icons = [TreePine, Droplets, MapPin, Users];

export const ProblemsAndSolutions: React.FC<ProblemsAndSolutionsProps> = ({ content }) => {
  return (
    <section id="problems-&-solutions" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Problems & Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Addressing the core challenges of festival management with innovative, scalable solutions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {content.problems.map((item, index) => {
            const Icon = icons[index];
            return (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="bg-red-100 p-3 rounded-xl">
                    <Icon className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{item.problem}</p>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <p className="text-emerald-800 font-medium">{item.solution}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};