import React, { useState } from 'react';
import { QrCode, MapPin } from 'lucide-react';
import { ContentData } from '../types';

interface InteractiveDemoProps {
  content: ContentData;
}

export const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ content }) => {
  const [headcount, setHeadcount] = useState(8000);
  const [showQRModal, setShowQRModal] = useState(false);

  const requiredStaff = Math.ceil(headcount / 8);

  const getSliderValue = (count: number) => {
    if (count <= 2000) return 0;
    if (count <= 8000) return 1;
    return 2;
  };

  const getCountFromSlider = (value: number) => {
    const values = [2000, 8000, 20000];
    return values[value];
  };

  return (
    <section className="py-20 bg-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content.demo.heading}
          </h2>
        </div>

        {/* Headcount Slider */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              {content.demo.sliderLabels.map((label, index) => (
                <span key={index}>{label}</span>
              ))}
            </div>
            <input
              type="range"
              min={2000}
              max={20000}
              step={1000}
              value={headcount}
              onChange={(e) => setHeadcount(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {content.demo.outputTemplate
                .replace('{n}', headcount.toLocaleString())
                .replace('{staff}', requiredStaff.toLocaleString())}
            </p>
          </div>
        </div>

        {/* QR Demo */}
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">QR Facility Map Demo</h3>
          <button
            onClick={() => setShowQRModal(true)}
            className="bg-gray-900 text-white p-6 rounded-xl hover:bg-gray-800 transition-colors inline-block"
          >
            <QrCode className="w-12 h-12 mx-auto" />
          </button>
          <p className="text-gray-600 mt-4">Click to simulate QR scan</p>
        </div>

        {/* QR Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <MapPin className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Nearest Facility</h3>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Facility:</span>
                  <span className="font-medium">{content.demo.qrModal.facility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-emerald-600">{content.demo.qrModal.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-medium">{content.demo.qrModal.distance}</span>
                </div>
              </div>

              <div className="space-y-3">
                {content.demo.qrModal.buttons.map((button, index) => (
                  <button
                    key={index}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      index === 0
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'border border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {button}
                  </button>
                ))}
                <button
                  onClick={() => setShowQRModal(false)}
                  className="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};