import React from 'react';
import { User, Heart } from 'lucide-react';
import { ContentData } from '../types';

interface TeamProps {
  content: ContentData;
}

export const Team: React.FC<TeamProps> = ({ content }) => {
  return (
    <section id="team" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {content.team.title}
          </h2>
        </div>

        {/* Team members */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {content.team.members.map((member, index) => (
            <div key={index} className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>

        {/* Partners */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="w-6 h-6 text-red-500" />
            <h3 className="text-xl font-bold text-gray-900">Partners</h3>
          </div>
          <p className="text-gray-600">{content.team.partnersLine}</p>
        </div>
      </div>
    </section>
  );
};