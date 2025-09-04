import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { ProblemsAndSolutions } from './ProblemsAndSolutions';
import { Features } from './Features';
import { Impact } from './Impact';
import { InteractiveDemo } from './InteractiveDemo';
import { Team } from './Team';
import { Contact } from './Contact';
import { Footer } from './Footer';
import { content } from '../data/content';
import { Language } from '../types';

export const LandingPage: React.FC = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language['code']>('en');
  
  const contentData = content[currentLanguage];

  return (
    <div className="min-h-screen">
      <Navbar 
        content={contentData} 
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />
      <Hero content={contentData} />
      <HowItWorks content={contentData} />
      <ProblemsAndSolutions content={contentData} />
      <Features content={contentData} />
      <Impact content={contentData} />
      <InteractiveDemo content={contentData} />
      <Team content={contentData} />
      <Contact content={contentData} />
      <Footer content={contentData} />
    </div>
  );
};
