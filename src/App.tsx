import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { BarChart2, Users, Menu, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import StaffManagement from './pages/StaffManagement';
import TeamManagement from './pages/TeamManagement';
import ShiftManagementPage from './pages/ShiftManagementPage';
import FacilityManagementPage from './pages/FacilityManagementPage';
import TaskManagementPage from './pages/TaskManagementPage';
import IssueManagementPage from './pages/IssueManagementPage';
import NotificationCenterPage from './pages/NotificationCenterPage';
import AdsManagementPage from './pages/AdsManagementPage';
import { LandingPage } from './components/LandingPage';
import './App.css';
import { logout as firebaseLogout } from './firebase/auth';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await firebaseLogout();
    navigate('/landing');
  };
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-indigo-800 text-white transition-all duration-300 flex flex-col justify-between`}>
        <div>
          <div className="p-4 flex items-center justify-between">
            {isSidebarOpen && <h1 className="text-xl font-bold">Seva+ Admin</h1>}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-indigo-700"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-8">
          <Link
            to="/dashboard"
            className={`flex items-center p-4 ${isActive('/dashboard') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          >
            <BarChart2 className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Dashboard</span>}
          </Link>
          <Link
            to="/staff"
            className={`flex items-center p-4 ${isActive('/staff') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          >
            <Users className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Staff Management</span>}
          </Link>
          {/* Team Management Button */}
          <Link
            to="/team-management"
            className={`flex items-center p-4 ${isActive('/team-management') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          >
            <Users className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Team Management</span>}
          </Link>
          {/* Shift Management Button */}
          <Link
            to="/shift-management"
            className={`flex items-center p-4 ${isActive('/shift-management') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          >
            <Users className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Shift Management</span>}
          </Link>
          {/* Facility Management Button */}
          <Link
            to="/facility-management"
            className={`flex items-center p-4 ${isActive('/facility-management') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          >
            <Users className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Facility Management</span>}
          </Link>
          {/* Task Management Button */}
          <Link
            to="/task-management"
            className={`flex items-center p-4 ${isActive('/task-management') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
          >
            <Users className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Task Management</span>}
          </Link>
          {/* Admin Tools Section */}
          <div className="mt-8">
            <span className="px-4 py-2 text-xs font-semibold text-indigo-300 uppercase">Admin Tools</span>
            <Link
              to="/admin-tools/issues"
              className={`flex items-center p-4 ${isActive('/admin-tools/issues') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
            >
              <Users className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Issue Management</span>}
            </Link>
            <Link
              to="/admin-tools/notifications"
              className={`flex items-center p-4 ${isActive('/admin-tools/notifications') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
            >
              <Users className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Notification Center</span>}
            </Link>
            <Link
              to="/admin-tools/ads"
              className={`flex items-center p-4 ${isActive('/admin-tools/ads') ? 'bg-indigo-700' : 'hover:bg-indigo-700'}`}
            >
              <Users className="h-5 w-5" />
              {isSidebarOpen && <span className="ml-3">Ads Management</span>}
            </Link>
          </div>
          </nav>
        </div>
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-lg hover:bg-indigo-700"
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page Route */}
        <Route path="/landing" element={<LandingPage />} />
        
        {/* Admin Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/staff"
          element={
            <Layout>
              <StaffManagement />
            </Layout>
          }
        />
        <Route
          path="/team-management"
          element={
            <Layout>
              <TeamManagement />
            </Layout>
          }
        />
        <Route
          path="/shift-management"
          element={
            <Layout>
              <ShiftManagementPage />
            </Layout>
          }
        />
        <Route
          path="/facility-management"
          element={
            <Layout>
              <FacilityManagementPage />
            </Layout>
          }
        />
        <Route
          path="/task-management"
          element={
            <Layout>
              <TaskManagementPage />
            </Layout>
          }
        />
        {/* Admin Tools Routes */}
        <Route
          path="/admin-tools/issues"
          element={
            <Layout>
              <IssueManagementPage />
            </Layout>
          }
        />
        <Route
          path="/admin-tools/notifications"
          element={
            <Layout>
              <NotificationCenterPage />
            </Layout>
          }
        />
        <Route
          path="/admin-tools/ads"
          element={
            <Layout>
              <AdsManagementPage />
            </Layout>
          }
        />
        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </Router>
  );
}

export default App;