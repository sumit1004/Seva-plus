import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, where, limit, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Plus, Search, Filter, Edit, Trash2, Bell, User } from 'lucide-react';
import * as XLSX from 'xlsx';

interface StaffMember {
  id?: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  zone: string;
  status: 'active' | 'inactive' | 'on-leave';
  lastActive: string;
  joinDate: string;
  department?: string;
  imageUrl?: string;
  teams?: string[];
}

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newStaff, setNewStaff] = useState<Omit<StaffMember, 'id'>>({ 
    name: '',
    phone: '',
    email: '',
    role: 'Staff',
    zone: 'General',
    status: 'active',
    lastActive: new Date().toISOString(),
    joinDate: new Date().toISOString(),
    department: 'General',
    teams: []
  });

  const [editStaff, setEditStaff] = useState<StaffMember | null>(null);

  const [filters, setFilters] = useState({
    role: '',
    zone: 'all',
    status: 'all',
    department: 'all'
  });
  
  const itemsPerPage = 10;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      role: '',
      zone: 'all',
      status: 'all',
      department: 'all'
    });
  };


  // Toggle status filter
  const toggleStatusFilter = () => {
    setFilters(prev => {
      let newStatus = 'all';
      if (prev.status === 'all') newStatus = 'active';
      else if (prev.status === 'active') newStatus = 'inactive';
      
      return {
        ...prev,
        status: newStatus as 'all' | 'active' | 'inactive'
      };
    });
  };


  // Fetch staff data
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        console.log('Fetching staff data...');
        
        // First check if we can access the collection
        try {
          const testQuery = query(collection(db, 'staff'), limit(1));
          await getDocs(testQuery);
        } catch (permError) {
          console.error('Permission error:', permError);
          alert('Permission denied. Please check your Firestore security rules.');
          setStaff([]);
          return;
        }

        const staffRef = collection(db, 'staff');
        let q = query(staffRef);
        
        // Apply filters if any
        if (filters.role) {
          q = query(q, where('role', '==', filters.role));
        }
        if (filters.zone && filters.zone !== 'all') {
          q = query(q, where('zone', '==', filters.zone));
        }
        if (filters.status && filters.status !== 'all') {
          q = query(q, where('status', '==', filters.status));
        }
        if (filters.department && filters.department !== 'all') {
          q = query(q, where('department', '==', filters.department));
        }
        
        const querySnapshot = await getDocs(q);
        console.log(`Found ${querySnapshot.docs.length} staff members`);
        
        const staffData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unknown',
            phone: data.phone || data.mobile || '', // Handle both phone and mobile fields
            email: data.email || '',
            role: data.role || 'Staff',
            zone: data.zone || 'General',
            status: data.status || 'active',
            lastActive: data.lastActive || new Date().toISOString(),
            joinDate: data.joinDate || new Date().toISOString(),
            department: data.department || 'General',
            imageUrl: data.imageUrl
          } as StaffMember;
        });
        
        setStaff(staffData);
      } catch (error) {
        console.error('Error fetching staff:', error);
        alert(`Failed to fetch staff: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [filters.role, filters.zone, filters.status, filters.department]);

  // Add new staff member
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newStaff.name || !newStaff.email || !newStaff.phone || !newStaff.department) {
        alert('Please fill in all required fields');
        return;
      }

      const staffData = {
        ...newStaff,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Ensure all required fields have default values
        role: newStaff.role || 'Staff',
        zone: newStaff.zone || 'General',
        status: newStaff.status || 'active',
        lastActive: new Date().toISOString(),
        joinDate: new Date().toISOString()
      };

      await addDoc(collection(db, 'staff'), staffData);
      
      // Refresh staff list
      const querySnapshot = await getDocs(collection(db, 'staff'));
      const updatedStaff = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          role: data.role || 'Staff',
          zone: data.zone || 'General',
          status: data.status || 'active',
          lastActive: data.lastActive || new Date().toISOString(),
          joinDate: data.joinDate || new Date().toISOString(),
          department: data.department || 'General'
        } as StaffMember;
      });
      
      setStaff(updatedStaff);
      setShowAddModal(false);
      setNewStaff({ 
        name: '',
        phone: '',
        email: '',
        role: 'Staff',
        zone: 'General',
        status: 'active',
        lastActive: new Date().toISOString(),
        joinDate: new Date().toISOString(),
        department: 'General'
      });
      
    } catch (error) {
      console.error('Error adding staff:', error);
      alert(`Failed to add staff: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Edit staff member
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStaff?.id) return;
    try {
      const staffRef = doc(db, 'staff', editStaff.id);
      const { id, ...updateData } = editStaff;
      await updateDoc(staffRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
      // Refresh staff list
      const querySnapshot = await getDocs(collection(db, 'staff'));
      const updatedStaff = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          role: data.role || 'Staff',
          zone: data.zone || 'General',
          status: data.status || 'active',
          lastActive: data.lastActive || new Date().toISOString(),
          joinDate: data.joinDate || new Date().toISOString(),
          department: data.department || 'General'
        } as StaffMember;
      });
      setStaff(updatedStaff);
      setShowEditModal(false);
      setEditStaff(null);
    } catch (err) {
      alert('Failed to update staff: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Delete (Deactivate) handler
  const handleDeleteClick = async (member: StaffMember) => {
    if (!member.id) return;
    if (!window.confirm(`Are you sure you want to deactivate ${member.name}?`)) return;
    try {
      const staffRef = doc(db, 'staff', member.id);
      await updateDoc(staffRef, { status: 'inactive', updatedAt: serverTimestamp() });
      setStaff(prev =>
        prev.map(s => (s.id === member.id ? { ...s, status: 'inactive' } : s))
      );
    } catch (err) {
      alert('Failed to deactivate staff: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Send notification handler (simulate)
  const handleNotifyClick = (member: StaffMember) => {
    alert(`Notification sent to ${member.name} (${member.email || member.phone})`);
  };

  // Excel Import Handler
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' }); // defval ensures empty cells are not undefined

      // Normalize keys for each row to lower-case and trim spaces for robust mapping
      const normalizeRow = (row: any) => {
        const normalized: any = {};
        Object.keys(row).forEach(key => {
          normalized[key.trim().toLowerCase()] = row[key];
        });
        return normalized;
      };

      for (const rawRow of json) {
        const row = normalizeRow(rawRow);
        const staffData: Omit<StaffMember, 'id'> = {
          name: row.name || row['full name'] || row['staff name'] || '',
          phone: row.phone || row.mobile || row['mobile number'] || row['mobile no'] || row['contact'] || '',
          email: row.email || row['email address'] || '',
          role: row.role || 'Staff',
          zone: row.zone || 'General',
          status: (row.status as any) || 'active',
          lastActive: new Date().toISOString(),
          joinDate: new Date().toISOString(),
          department: row.department || 'General',
          imageUrl: row.imageurl || '',
          teams: row.teams
            ? typeof row.teams === 'string'
              ? row.teams.split(',').map((t: string) => t.trim())
              : row.teams
            : [],
        };
        // Only add if name, phone, and email are present
        if (staffData.name && staffData.phone && staffData.email) {
          await addDoc(collection(db, 'staff'), {
            ...staffData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      }
      // Refresh staff list
      const querySnapshot = await getDocs(collection(db, 'staff'));
      const updatedStaff = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          role: data.role || 'Staff',
          zone: data.zone || 'General',
          status: data.status || 'active',
          lastActive: data.lastActive || new Date().toISOString(),
          joinDate: data.joinDate || new Date().toISOString(),
          department: data.department || 'General'
        } as StaffMember;
      });
      setStaff(updatedStaff);
      alert('Staff imported successfully!');
    } catch (err) {
      alert('Failed to import staff: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Filter and search staff
  const filteredStaff = staff.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      member.name?.toLowerCase().includes(searchLower) ||
      member.email?.toLowerCase().includes(searchLower) ||
      member.phone?.includes(searchTerm);
      
    const matchesFilters = 
      (!filters.role || member.role === filters.role) &&
      (filters.zone === 'all' || member.zone === filters.zone) &&
      (filters.status === 'all' || member.status === filters.status) &&
      (filters.department === 'all' || member.department === filters.department);
      
    return matchesSearch && matchesFilters;
  });

  // Group staff by role and department
  const groupedStaff: { [role: string]: { [department: string]: StaffMember[] } } = {};
  filteredStaff.forEach(member => {
    const role = member.role || 'Staff';
    const dept = member.department || 'General';
    if (!groupedStaff[role]) groupedStaff[role] = {};
    if (!groupedStaff[role][dept]) groupedStaff[role][dept] = [];
    groupedStaff[role][dept].push(member);
  });

  // Pagination
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Staff
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            Import Excel
          </button>
          <input
            type="file"
            accept=".xlsx,.xls"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImportExcel}
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or mobile"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            
            <div className="relative">
              <select
                value={filters.zone}
                onChange={(e) => setFilters({...filters, zone: e.target.value})}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Zones</option>
                <option value="zone1">Zone 1</option>
                <option value="zone2">Zone 2</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <button
                className="text-indigo-600 hover:text-indigo-900"
                onClick={toggleStatusFilter}
              >
                <Filter className="h-5 w-5" />
                {filters.status === 'all' ? 'All Status' : filters.status}
              </button>
            </div>
            
            <div className="flex items-center">
              <select
                value={filters.department}
                onChange={(e) => setFilters({...filters, department: e.target.value})}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Departments</option>
                <option value="Operations">Operations</option>
                <option value="Logistics">Logistics</option>
                <option value="Support">Support</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <select
                value={filters.zone}
                onChange={(e) => setFilters({...filters, zone: e.target.value})}
                className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Zones</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
            
            <button
              className="p-2 text-gray-500 hover:text-gray-700"
              onClick={resetFilters}
            >
              <Filter className="h-5 w-5" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Render grouped tables */}
      {Object.keys(groupedStaff).length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">No staff members found</div>
      ) : (
        Object.entries(groupedStaff).map(([role, departments]) =>
          Object.entries(departments).map(([department, members]) => (
            <div key={`${role}-${department}`} className="mb-10">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {role.charAt(0).toUpperCase() + role.slice(1)} - {department}
              </h2>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mobile
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Zone
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Seen
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                            Loading...
                          </td>
                        </tr>
                      ) : members.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                            No staff members found
                          </td>
                        </tr>
                      ) : (
                        members.map((member) => (
                          <tr key={member.id} className={!member.active ? 'bg-gray-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <User className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                  <div className="text-sm text-gray-500">{member.role}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {member.phone}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {member.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                member.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : member.role === 'manager'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {member.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {member.department}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {member.zone}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {member.status === 'active' ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Active
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  Inactive
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(member.lastActive).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  className="text-indigo-600 hover:text-indigo-900"
                                  onClick={() => setEditStaff(member)}
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => handleDeleteClick(member)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                  className="text-blue-600 hover:text-blue-900"
                                  onClick={() => handleNotifyClick(member)}
                                >
                                  <Bell className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))
        )
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredStaff.length)}
                </span>{' '}
                of <span className="font-medium">{filteredStaff.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && editStaff && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setShowEditModal(false)}
              aria-hidden="true"
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <User className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Edit Staff Member
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleEditSave} className="space-y-5">
                        <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-6">
                          {/* Full Name */}
                          <div className="sm:col-span-6">
                            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                              Full Name
                            </label>
                            <input
                              type="text"
                              id="edit-name"
                              required
                              value={editStaff.name}
                              onChange={e => setEditStaff({ ...editStaff, name: e.target.value })}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border"
                            />
                          </div>
                          {/* Mobile */}
                          <div className="sm:col-span-6">
                            <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700">
                              Mobile Number
                            </label>
                            <input
                              type="tel"
                              id="edit-phone"
                              required
                              pattern="[0-9]{10}"
                              value={editStaff.phone}
                              onChange={e => setEditStaff({ ...editStaff, phone: e.target.value })}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border"
                            />
                          </div>
                          {/* Email */}
                          <div className="sm:col-span-6">
                            <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">
                              Email Address
                            </label>
                            <input
                              type="email"
                              id="edit-email"
                              value={editStaff.email}
                              onChange={e => setEditStaff({ ...editStaff, email: e.target.value })}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border"
                            />
                          </div>
                          {/* Department */}
                          <div className="sm:col-span-6">
                            <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700">
                              Department
                            </label>
                            <select
                              id="edit-department"
                              value={editStaff.department}
                              onChange={e => setEditStaff({ ...editStaff, department: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border"
                              required
                            >
                              <option value="">Select Department</option>
                              <option value="Operations">Operations</option>
                              <option value="Logistics">Logistics</option>
                              <option value="Support">Support</option>
                            </select>
                          </div>
                          {/* Role */}
                          <div className="sm:col-span-3">
                            <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700">
                              Role
                            </label>
                            <select
                              id="edit-role"
                              value={editStaff.role}
                              onChange={e => setEditStaff({ ...editStaff, role: e.target.value })}
                              className="mt-1 block w-full rounded-md border-gray-300 py-2.5 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border"
                              required
                            >
                              <option value="">Select a role</option>
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="staff">Staff</option>
                            </select>
                          </div>
                          {/* Zone */}
                          <div className="sm:col-span-3">
                            <label htmlFor="edit-zone" className="block text-sm font-medium text-gray-700">
                              Zone
                            </label>
                            <input
                              type="text"
                              id="edit-zone"
                              value={editStaff.zone}
                              onChange={e => setEditStaff({ ...editStaff, zone: e.target.value })}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border"
                            />
                          </div>
                        </div>
                        <div className="mt-6 flex items-center justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal - Enhanced */}
      {showAddModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setShowAddModal(false)}
              aria-hidden="true"
            ></div>

            {/* Modal panel */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <User className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Add New Staff Member
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleAddStaff} className="space-y-5">
                        <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-6">
                          {/* Full Name */}
                          <div className="sm:col-span-6">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id="name"
                                required
                                value={newStaff.name}
                                onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border"
                                placeholder="John Doe"
                              />
                            </div>
                          </div>

                          {/* Mobile */}
                          <div className="sm:col-span-6">
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                              Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              required
                              pattern="[0-9]{10}"
                              title="Please enter a valid 10-digit mobile number"
                              value={newStaff.phone}
                              onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border"
                              placeholder="9876543210"
                            />
                          </div>

                          {/* Email */}
                          <div className="sm:col-span-6">
                            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                              Department
                            </label>
                            <select
                              id="department"
                              value={newStaff.department}
                              onChange={(e) => setNewStaff({...newStaff, department: e.target.value})}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border"
                              required
                            >
                              <option value="">Select Department</option>
                              <option value="Operations">Operations</option>
                              <option value="Logistics">Logistics</option>
                              <option value="Support">Support</option>
                            </select>
                          </div>

                          {/* Email */}
                          <div className="sm:col-span-6">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email Address
                            </label>
                            <div className="mt-1">
                              <input
                                type="email"
                                id="email"
                                value={newStaff.email}
                                onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2.5 px-3 border"
                                placeholder="john@example.com"
                              />
                            </div>
                          </div>

                          {/* Role and Shift */}
                          <div className="sm:col-span-3">
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                              Role <span className="text-red-500">*</span>
                            </label>
                            <select
                              id="role"
                              required
                              value={newStaff.role}
                              onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                              className="mt-1 block w-full rounded-md border-gray-300 py-2.5 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border"
                            >
                              <option value="">Select a role</option>
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="staff">Staff</option>
                            </select>
                          </div>

                          <div className="sm:col-span-3">
                            <label htmlFor="shift" className="block text-sm font-medium text-gray-700">
                              Shift
                            </label>
                            <select
                              id="shift"
                              value={newStaff.shift}
                              onChange={(e) => setNewStaff({...newStaff, shift: e.target.value})}
                              className="mt-1 block w-full rounded-md border-gray-300 py-2.5 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border"
                            >
                              <option value="morning">Morning (9 AM - 5 PM)</option>
                              <option value="afternoon">Afternoon (2 PM - 10 PM)</option>
                              <option value="night">Night (10 PM - 6 AM)</option>
                            </select>
                          </div>
                        </div>

                        {/* Teams Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assign to Teams
                          </label>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {['Sanitation', 'Maintenance', 'Security', 'Housekeeping', 'Supervisor', 'Management'].map((team) => (
                              <div key={team} className="flex items-start">
                                <div className="flex items-center h-5">
                                  <input
                                    id={`team-${team.toLowerCase()}`}
                                    name="teams"
                                    type="checkbox"
                                    checked={newStaff.teams?.includes(team) || false}
                                    onChange={(e) => {
                                      const currentTeams = newStaff.teams || [];
                                      const updatedTeams = e.target.checked
                                        ? [...currentTeams, team]
                                        : currentTeams.filter(t => t !== team);
                                      setNewStaff({...newStaff, teams: updatedTeams});
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                </div>
                                <div className="ml-3 text-sm">
                                  <label htmlFor={`team-${team.toLowerCase()}`} className="font-medium text-gray-700">
                                    {team}
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowAddModal(false)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <Plus className="-ml-1 mr-2 h-4 w-4" />
                            Add Staff Member
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
