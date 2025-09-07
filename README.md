 Seva+ — Smart Sanitation & Crowd Management Platform
 Built for Simhastha 2028 Hackathon

Seva+ is a realtime sanitation and crowd management system designed to handle the massive scale of the Simhastha festival in Ujjain, where millions of pilgrims gather.
Our platform empowers admins, staff, and the public to work together — keeping the city cleaner, safer, and smarter.

 Problem We Solve
The Simhastha festival puts extreme pressure on Ujjain’s infrastructure:

 River Pollution → Floral waste, plastics, and bottles pollute the Kshipra.
 Sanitation Worker Overload → Current ratio is 1 worker per 18 toilets (ideal is 1:8).
 Unclean Toilets & Waste → Overflowing bins and poor maintenance.
 Water Shortages → Locals face scarcity, pilgrims struggle to find water points.
 
 Our Solution — Seva+
Seva+ combines technology + realtime data to address these problems:

 Admin Dashboard → Manage staff, teams, shifts, facilities, and issues in one place.
 Realtime Analytics → Live charts for crowd density, tasks, facilities, and emergencies.
 Staff & Team Management → Bulk upload, assign work, send instant notifications.
 QR-Enabled Maps → Public can scan QR codes to find toilets, water kiosks, dustbins, and routes.
 Issue & Emergency Reporting → Pilgrims report problems instantly; admins dispatch staff.
 Notification Center → Send alerts via SMS/WhatsApp/Email to individuals or teams.
 Announcements & Ads → Publish festival updates and sponsor ads.
 
📌 Key Features

For Admins
Secure login with Firebase Authentication.
Dashboard with live KPIs (staff count, issues, emergencies).
Staff & team management with shift allocation.
Facility management (toilets, bins, water kiosks, routes).
Task assignment with proof upload & supervisor verification.
QR Code generator for facilities, tasks, and attendance.
Realtime analytics with graphs & reports export.

For Public Users
Mobile-friendly web app (no downloads needed).
QR scan → See nearest toilets, water kiosks, dustbins, routes.
Facility status: clean/dirty, full/empty, working/faulty.
Report issues with photos in realtime.
Access announcements, safety info, and sponsor ads.


🛠️ Tech Stack
Frontend: React.js + TypeScript + TailwindCSS
Backend & Database: Firebase (Firestore, Auth, Storage)
Automation & AI Integration: n8n workflows
Visualization: Recharts / Chart.js (for realtime graphs)
Deployment: Netlify 


🚀 How to Run Locally

Clone this repo:
```
git clone https://github.com/yourusername/seva-plus.git
cd seva-plus
```

Install dependencies:
```
npm install
```

Add your Firebase config → create a .env file with:
```
VITE_FIREBASE_API_KEY=xxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxx
VITE_FIREBASE_PROJECT_ID=xxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxx
VITE_FIREBASE_APP_ID=xxxx
```

Start development server:
```
npm run dev
```

Open http://localhost:5173
 in your browser.

 Deployment

Deploy frontend to Netlify/Vercel.
Ensure Firebase config is set in environment variables.
For n8n workflows, host n8n (self-hosted or cloud) and connect with Firebase.

 Demo Video
 Link to Demo Video
(https://youtu.be/ZVxflaM80RU)

 Live Website link:- 
 (https://seva-plus.netlify.app/landing)

 Future Scope
AI-powered crowd prediction from CCTV feeds.
AR navigation for pilgrims without scanning QR codes.
IVR/voice assistant for non-smartphone users.
Integration with city’s waste & water IoT systems.

 Team
Kumari Shambhavi ( Lead & Presenter )
Sumit Kumar ( Developer )
Pritish Kumar ( Developer )
Arman Mishra ( Research & Insights lead)
