import React, { useState } from 'react';
import { QrCode, Users, Recycle, Info } from 'lucide-react';
import { ContentData } from '../types';

interface HowItWorksProps {
  content: ContentData;
}

const icons = [QrCode, Users, Recycle];

export const HowItWorks: React.FC<HowItWorksProps> = ({ content }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content.howItWorks.title}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {content.howItWorks.steps.map((step, index) => {
            const Icon = icons[index];
            return (
              <div key={index} className="text-center group">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
                  <Icon className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>

        {/* Example button */}
        <div className="text-center">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-lg transition-colors font-medium text-gray-700"
          >
            <Info className="w-4 h-4" />
            <span>View Example</span>
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Example Flow</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {content.howItWorks.modalExample}
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};