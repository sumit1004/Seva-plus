export interface Language {
  code: 'en' | 'hi';
  name: string;
}

export interface Content {
  en: ContentData;
  hi: ContentData;
}

export interface ContentData {
  title: string;
  description: string;
  navbar: {
    links: string[];
    buttons: {
      pilot: string;
      admin: string;
    };
  };
  hero: {
    headline: string;
    subhead: string;
    primaryCTA: string;
    secondaryCTA: string;
    trustRow: string[];
    microcopy: string;
  };
  problems: Array<{
    title: string;
    problem: string;
    solution: string;
  }>;
  howItWorks: {
    title: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
    modalExample: string;
  };
  features: Array<{
    title: string;
    description: string;
  }>;
  impact: {
    title: string;
    kpis: Array<{
      metric: string;
      description: string;
      tooltip: string;
    }>;
  };
  demo: {
    heading: string;
    sliderLabels: string[];
    outputTemplate: string;
    qrModal: {
      facility: string;
      status: string;
      distance: string;
      buttons: string[];
    };
  };
  management: {
    title: string;
    description: string;
    button: string;
  };
  team: {
    title: string;
    members: Array<{
      name: string;
      role: string;
    }>;
    partnersLine: string;
  };
  cta: {
    heading: string;
    buttons: {
      pilot: string;
      download: string;
    };
  };
  contact: {
    title: string;
    fields: string[];
    submit: string;
    success: string;
    error: string;
  };
  footer: {
    links: string[];
    copyright: string;
  };
}