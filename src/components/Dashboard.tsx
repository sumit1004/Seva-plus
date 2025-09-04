import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { BarChart2, Search, Users, AlertTriangle, Clock, Mail, Calendar, Filter } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  zone: string;
  status: 'active' | 'inactive' | 'on-leave';
  lastActive: string;
  joinDate: string;
  department?: string;
  imageUrl?: string;
}

interface Activity {
  id: string;
  title: string;
  description?: string;
  time: string;
  timestamp: any;
  status: 'completed' | 'in-progress' | 'pending';
  type: 'shift' | 'alert' | 'notification' | 'task';
  priority?: 'low' | 'medium' | 'high';
  assignedTo?: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  isPositive?: boolean;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, change, isPositive, className = '' }) => (
  <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-opacity-20">
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <span className={`ml-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    zone: 'all',
    status: 'all',
    dateRange: 'today',
    department: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchStaff = useCallback(async () => {
    try {
      setIsLoading(true);
      let staffQuery = query(collection(db, 'staff'));
      
      // Apply filters
      if (filters.zone !== 'all') {
        staffQuery = query(staffQuery, where('zone', '==', filters.zone));
      }
      if (filters.status !== 'all') {
        staffQuery = query(staffQuery, where('status', '==', filters.status));
      }
      if (filters.department !== 'all') {
        staffQuery = query(staffQuery, where('department', '==', filters.department));
      }
      
      const querySnapshot = await getDocs(staffQuery);
      const staffData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StaffMember[];
      setStaff(staffData);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchActivities = useCallback(async () => {
    try {
      // First check if we have permissions
      try {
        // Test query to check permissions
        await getDocs(collection(db, 'activities'));
      } catch (permError) {
        console.error('Permission error:', permError);
        setActivities([]);
        return;
      }

      let activitiesQuery = query(
        collection(db, 'activities'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      
      // Apply date range filter
      if (filters.dateRange === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        activitiesQuery = query(
          activitiesQuery,
          where('timestamp', '>=', today)
        );
      } else if (filters.dateRange === 'week') {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        activitiesQuery = query(
          activitiesQuery,
          where('timestamp', '>=', lastWeek)
        );
      }
      
      const querySnapshot = await getDocs(activitiesQuery);
      const activitiesData = querySnapshot.docs
        .map(doc => {
          try {
            const data = doc.data();
            if (!data) return null;
            
            // Ensure all required fields have default values
            return {
              id: doc.id,
              title: data.title || 'No Title',
              type: data.type || 'task',
              status: data.status || 'pending',
              timestamp: data.timestamp || new Date(),
              time: data.time || new Date().toLocaleTimeString(),
              ...data
            };
          } catch (e) {
            console.error('Error processing activity:', e);
            return null;
          }
        })
        .filter(Boolean) as Activity[];
      
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    }
  }, [filters.dateRange]);

  useEffect(() => {
    fetchStaff();
    fetchActivities();
  }, [fetchStaff, fetchActivities]);

  const filteredStaff = staff.filter(member => {
    const searchLower = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.phone?.includes(searchQuery) ||
      member.role?.toLowerCase().includes(searchLower)
    );
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      zone: 'all',
      status: 'all',
      dateRange: 'today',
      department: 'all'
    });
    setSearchQuery('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'shift':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'notification':
        return <Mail className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                {renderLoadingSkeleton()}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
              {renderLoadingSkeleton()}
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              {renderLoadingSkeleton()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search staff by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Filter className="h-4 w-4 mr-2 text-gray-500" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
              <select
                value={filters.zone}
                onChange={(e) => handleFilterChange('zone', e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Zones</option>
                <option value="Zone 1">Zone 1</option>
                <option value="Zone 2">Zone 2</option>
                <option value="Zone 3">Zone 3</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Staff"
          value={staff.length}
          icon={<Users className="w-6 h-6 text-indigo-600" />}
          change={`+${Math.floor(staff.length * 0.1)} from last month`}
          isPositive={true}
        />
        
        <StatsCard
          title="Active Staff"
          value={staff.filter(m => m.status === 'active').length}
          icon={<Users className="w-6 h-6 text-green-600" />}
          change={`${Math.round((staff.filter(m => m.status === 'active').length / Math.max(1, staff.length)) * 100)}% of total`}
          isPositive={true}
        />
        
        <StatsCard
          title="On Leave"
          value={staff.filter(m => m.status === 'on-leave').length}
          icon={<AlertTriangle className="w-6 h-6 text-yellow-600" />}
          change={`${Math.round((staff.filter(m => m.status === 'on-leave').length / Math.max(1, staff.length)) * 100)}% of staff`}
          isPositive={false}
        />
        
        <StatsCard
          title="Upcoming Shifts"
          value={activities.filter(a => a.type === 'shift' && a.status === 'pending').length}
          icon={<Calendar className="w-6 h-6 text-blue-600" />}
          change="Next 7 days"
          isPositive={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Staff Overview</h3>
              <div className="text-sm text-gray-500">
                Showing {Math.min(filteredStaff.length, 5)} of {staff.length} staff members
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        No staff members found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.slice(0, 5).map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-800 font-medium">
                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.role}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {member.zone}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(member.status || 'inactive')}`}>
                            {(member.status || 'inactive').charAt(0).toUpperCase() + (member.status || 'inactive').slice(1).replace('-', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
              <div className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer">
                View All
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {activities.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>No recent activities found</p>
                </div>
              ) : (
                (activities || []).filter(a => a && a.id).slice(0, 5).map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <div className="p-1.5 rounded-full bg-opacity-20 bg-gray-100">
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity?.title || 'Untitled Activity'}
                          </p>
                          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                            {activity?.time || ''}
                          </span>
                        </div>
                        {(activity?.description) ? (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {activity.description}
                          </p>
                        ) : null}
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            activity.priority === 'high' ? 'bg-red-100 text-red-800' :
                            activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {activity?.priority ? `${activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1)} Priority` : 'Normal Priority'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                            activity.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {activity?.status ? 
                              activity.status.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()) : 
                              'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
