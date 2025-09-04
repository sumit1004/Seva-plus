import { Content } from '../types';

export const content: Content = {
  en: {
    title: "Seva+ — Clean Ghats · Smart Sanitation & Crowd Management",
    description: "Seva+ is a low-cost, scalable sanitation and crowd-management solution for mega-events. QR-based facility maps, shift-based workforce allocation (1:8), eco-friendly composting, and real-time dashboards for management.",
    navbar: {
      links: ["Home", "How it works", "Problems & Solutions", "Features", "Impact", "Team", "Contact"],
      buttons: {
        pilot: "Request Pilot",
        admin: "Admin Login"
      }
    },
    hero: {
      headline: "Clean Ghats. Safe Pilgrims. Smart Management.",
      subhead: "Seva+ — Low-cost sanitation & crowd management for mega-events. QR maps, shift-based workforce, and on-site eco-processing.",
      primaryCTA: "Admin Login",
      secondaryCTA: "View Demo",
      trustRow: ["Pilot-ready", "Low-cost", "Govt-friendly"],
      microcopy: "Scan QR at ghats to find nearby toilets and water points — staff get dispatched automatically."
    },
    problems: [
      {
        title: "Massive Floral & Food Waste",
        problem: "Flowers, garlands and food offerings end up in rivers and on ghats, causing pollution.",
        solution: "River nets + Visarjan Kunds → on-site compost & biofuel"
      },
      {
        title: "Overflowing / Insufficient Toilets",
        problem: "Toilets overflow during peak hours and untreated sewage reaches waterways.",
        solution: "Bio-tank toilets + on-site greywater treatment"
      },
      {
        title: "Visitors Can't Find Facilities",
        problem: "Pilgrims struggle to locate the nearest toilet, water kiosk or dustbin.",
        solution: "QR-based real-time facility map — scan, locate, navigate"
      },
      {
        title: "Poor Workforce Deployment",
        problem: "Staff are often misallocated — too many in calm hours, too few at peaks.",
        solution: "1:8 worker-to-crowd ratio + Red/Orange/Green shifts for optimal coverage"
      }
    ],
    howItWorks: {
      title: "How Seva+ Works",
      steps: [
        {
          title: "Scan & Locate",
          description: "Visitors scan QR codes at ghats or posters — the map shows the nearest toilets, water points, and bins."
        },
        {
          title: "Dispatch Staff",
          description: "Dashboard auto-calculates staff required (1:8) and supervisors assign teams by shift."
        },
        {
          title: "Process Waste",
          description: "Collected organic waste is composted; plastics are routed to recycling units."
        }
      ],
      modalExample: "Scan QR at Ghat A → map shows Toilet T7 is available 120m away. Dashboard shows Zone A headcount 12,000 → required staff 1,500 (ceil(12000/8))."
    },
    features: [
      {
        title: "QR Facility Map",
        description: "Real-time status and directions for toilets, water kiosks and bins."
      },
      {
        title: "Workforce Allocation",
        description: "Auto 1:8 staff calculation with Red/Orange/Green shifts."
      },
      {
        title: "Bio-Tank Toilets",
        description: "Portable eco-friendly toilets with on-site greywater treatment."
      },
      {
        title: "River Nets & Compost",
        description: "Catch offerings before river entry; convert to compost & biofuel."
      },
      {
        title: "Alerts & Notifications",
        description: "SMS/WhatsApp alerts to supervisors & staff for urgent issues."
      },
      {
        title: "Reports & Analytics",
        description: "Daily reports, exportable CSVs, and KPI dashboards for officials."
      }
    ],
    impact: {
      title: "Impact & KPIs",
      kpis: [
        {
          metric: "30% less river-borne waste",
          description: "pilot estimate",
          tooltip: "Conservative estimate based on onsite composting & collection."
        },
        {
          metric: "45% faster cleaning response",
          description: "improved efficiency",
          tooltip: "Faster dispatch via QR + dashboard."
        },
        {
          metric: "24/7 operations visibility",
          description: "real-time monitoring",
          tooltip: "Real-time map + alerts for managers."
        },
        {
          metric: "Revenue potential",
          description: "sustainable economics",
          tooltip: "Compost sales + recycled plastic products."
        }
      ]
    },
    demo: {
      heading: "Try the quick demo: change headcount to see staffing need",
      sliderLabels: ["Low (2k)", "Medium (8k)", "High (20k)"],
      outputTemplate: "Headcount: {n} → Required staff: {staff}",
      qrModal: {
        facility: "Toilet T7",
        status: "Available",
        distance: "120m",
        buttons: ["Get Directions", "Report Issue"]
      }
    },
    management: {
      title: "Features for Management",
      description: "Full staff management, CSV upload, task assignment, QR manager, notifications & reports — all from one dashboard.",
      button: "View full features (Admin Login required)"
    },
    team: {
      title: "Team & Partners",
      members: [
        { name: "Kumari Shambhavi", role: "Project Lead" },
        { name: "Sumit", role: "Frontend & Map Engineer" },
        { name: "Pritish", role: "Backend & Notifications" },
        { name: "Arman Mishra", role: "Research & Insights Lead" }
      ],
      partnersLine: "Supported by local municipal authorities & NGOs"
    },
    cta: {
      heading: "Ready to pilot Seva+ at your event?",
      buttons: {
        pilot: "Request Pilot",
        download: "Download Brief"
      }
    },
    contact: {
      title: "Get in Touch",
      fields: ["Name", "Organization", "Email", "Phone", "Expected dates", "Message"],
      submit: "Request Pilot",
      success: "Thank you — your request has been received. We will contact you within 48 hours.",
      error: "Oops — something went wrong. Please try again later."
    },
    footer: {
      links: ["How it works", "Features", "Contact", "Privacy Policy"],
      copyright: "© 2025 Seva+. All rights reserved. Built for clean festivals."
    }
  },
  hi: {
    title: "Seva+ — Saaf Ghats · Smart Sanitation & Crowd Management",
    description: "Seva+ ek low-cost, scalable sanitation aur crowd-management solution hai. QR-based maps, staff allocation (1:8), eco composting aur real-time dashboard.",
    navbar: {
      links: ["Home", "Kaise Kaam Karta Hai", "Problems & Solutions", "Features", "Impact", "Team", "Contact"],
      buttons: {
        pilot: "Pilot Mange",
        admin: "Admin Login"
      }
    },
    hero: {
      headline: "Saaf Ghats. Surakshit Bhakts. Smart Management.",
      subhead: "Seva+ — Sasta aur scalable sanitation & crowd-management for bade events. QR maps, shift-based staff, aur on-site eco-processing.",
      primaryCTA: "Admin Login",
      secondaryCTA: "View Demo",
      trustRow: ["Pilot-ready", "Low-cost", "Govt-friendly"],
      microcopy: "Ghats par QR scan karein — nearest toilet/paani turant dikh jayega, staff dispatch automatic."
    },
    problems: [
      {
        title: "Phool aur Bhojan ka Kooda",
        problem: "Phool, mala aur prasad nadi aur ghats par pad jaate hain, jisse pollution hota hai.",
        solution: "River nets + Visarjan Kunds → on-site compost & biofuel"
      },
      {
        title: "Toilet overflow / kami",
        problem: "Peak time par toilets overflow kar jaate hain aur untreated sewage nadi tak pahunchti hai.",
        solution: "Bio-tank toilets + on-site greywater treatment"
      },
      {
        title: "Log facility dhoondh nahi paate",
        problem: "Bhakts ko nearest toilet, water kiosk ya dustbin dhoondhne mein problem hoti hai.",
        solution: "QR-based real-time facility map — scan karo, locate karo, navigate karo"
      },
      {
        title: "Staff ka galat vitaran",
        problem: "Kabhi zyada staff lagte hain, kabhi kam — peaks pe staffing problem hoti hai.",
        solution: "1:8 worker-to-crowd ratio + Red/Orange/Green shifts"
      }
    ],
    howItWorks: {
      title: "Seva+ Kaise Kaam Karta Hai",
      steps: [
        {
          title: "Scan karo aur dhoondo",
          description: "Log QR scan karte hain — map nearby toilets, water points aur bins show karta hai."
        },
        {
          title: "Staff bhejo",
          description: "Dashboard auto-calc karta hai (1:8) — supervisors shift ke hisaab se team assign karte hain."
        },
        {
          title: "Waste process karo",
          description: "Organic waste compost hota hai; plastic recycling ke liye alag kiya jaata hai."
        }
      ],
      modalExample: "Ghat A ka QR scan karte hi Toilet T7 available dikh raha hai — 120m. Dashboard me Zone A headcount 12,000 → required staff 1,500 (ceil)."
    },
    features: [
      {
        title: "QR Facility Map",
        description: "Toilet, paani aur dustbin ki live status aur directions."
      },
      {
        title: "Workforce Allocation",
        description: "Auto 1:8 staff calc + Red/Orange/Green shifts."
      },
      {
        title: "Bio-Tank Toilets",
        description: "Portable, on-site greywater treatment."
      },
      {
        title: "River Nets & Compost",
        description: "Offerings capture karke compost / biofuel banayenge."
      },
      {
        title: "Alerts & Notifications",
        description: "SMS/WhatsApp se staff aur supervisors ko alert bhejo."
      },
      {
        title: "Reports & Analytics",
        description: "Daily reports, CSV export aur KPI dashboard."
      }
    ],
    impact: {
      title: "Impact & KPIs",
      kpis: [
        {
          metric: "30% kam river waste",
          description: "pilot estimate",
          tooltip: "Onsite composting aur collection se conservative estimate."
        },
        {
          metric: "45% tez cleaning response",
          description: "sudhari efficiency",
          tooltip: "QR + dashboard se tez dispatch."
        },
        {
          metric: "24/7 operations visibility",
          description: "real-time monitoring",
          tooltip: "Managers ke liye real-time map + alerts."
        },
        {
          metric: "Revenue potential",
          description: "sustainable economics",
          tooltip: "Compost sales + recycled plastic products."
        }
      ]
    },
    demo: {
      heading: "Quick demo try karein: headcount change karke staffing need dekho",
      sliderLabels: ["Kam (2k)", "Medium (8k)", "Zyada (20k)"],
      outputTemplate: "Headcount: {n} → Required staff: {staff}",
      qrModal: {
        facility: "Toilet T7",
        status: "Available",
        distance: "120m",
        buttons: ["Directions", "Report karo"]
      }
    },
    management: {
      title: "Management ke liye Features",
      description: "Staff management, CSV upload, task assign, QR manager, notifications aur reports — sab ek dashboard se.",
      button: "Puri Features Dekho (Admin Login chahiye)"
    },
    team: {
      title: "Team & Partners",
      members: [
        { name: "Kumari Shambhavi", role: "Project Lead" },
        { name: "Sumit", role: "Developer" },
        { name: "Pritish", role: "Developer" },
        { name: "Arman Mishra", role: "Research & Insights lead" }
      ],
      partnersLine: "Nagar Nigam aur NGOs ke saath coordination."
    },
    cta: {
      heading: "Seva+ ka pilot chahte ho?",
      buttons: {
        pilot: "Pilot Mange",
        download: "Brief Download Karo"
      }
    },
    contact: {
      title: "Sampark Karein",
      fields: ["Naam", "Organization", "Email", "Phone", "Expected dates", "Message"],
      submit: "Pilot Mange",
      success: "Dhanyavaad — aapka request mil gaya. Hum 48 ghante mein sampark karenge.",
      error: "Kuch galat ho gaya — kripya baad mein koshish karein."
    },
    footer: {
      links: ["Kaise Kaam Karta Hai", "Features", "Contact", "Privacy Policy"],
      copyright: "© 2025 Seva+. All rights reserved. Saaf festivals ke liye banaya gaya."
    }
  }
};