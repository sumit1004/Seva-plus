import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Plus, Edit, Trash2, Users, Bell } from 'lucide-react';
import Select from 'react-select';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  zone: string;
  department?: string;
  shift?: string;
  email?: string;
  phone?: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  memberIds: string[];
  zoneIds: string[];
  defaultShift: string;
}

const shiftOptions = [
  { value: 'morning', label: 'Morning (9 AM - 5 PM)' },
  { value: 'afternoon', label: 'Afternoon (2 PM - 10 PM)' },
  { value: 'night', label: 'Night (10 PM - 6 AM)' },
];

const zoneOptions = [
  { value: 'North', label: 'North' },
  { value: 'South', label: 'South' },
  { value: 'East', label: 'East' },
  { value: 'West', label: 'West' },
];

const TeamManagement: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamForm, setTeamForm] = useState<any>({
    name: '',
    description: '',
    leaderId: '',
    memberIds: [],
    zoneIds: [],
    defaultShift: 'morning',
  });

  // Fetch staff and teams with realtime updates
  useEffect(() => {
    setLoading(true);
    const dummyStaff: StaffMember[] = [
      { id: 's1', name: 'Aarav Sharma', role: 'manager', zone: 'North', department: 'Operations', email: 'aarav@example.com', phone: '9876500001' },
      { id: 's2', name: 'Priya Verma', role: 'staff', zone: 'South', department: 'Support', email: 'priya@example.com', phone: '9876500002' },
      { id: 's3', name: 'Rohit Mehta', role: 'staff', zone: 'East', department: 'Logistics', email: 'rohit@example.com', phone: '9876500003' }
    ];
    const dummyTeams: Team[] = [
      { id: 't1', name: 'Sanitation Alpha', description: 'Morning sanitation crew', leaderId: 's1', memberIds: ['s2','s3'], zoneIds: ['North','East'], defaultShift: 'morning' },
      { id: 't2', name: 'Security Bravo', description: 'Evening security patrol', leaderId: 's1', memberIds: ['s3'], zoneIds: ['South'], defaultShift: 'night' }
    ];

    const unsubStaff = onSnapshot(
      collection(db, 'staff'),
      snap => {
        setStaff(
          snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StaffMember[]
        );
      },
      () => {
        setStaff(dummyStaff);
      }
    );

    const unsubTeams = onSnapshot(
      collection(db, 'teams'),
      snap => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Team[];
        setTeams(data.length ? data : dummyTeams);
        setLoading(false);
      },
      () => {
        setTeams(dummyTeams);
        setLoading(false);
      }
    );

    return () => {
      unsubStaff();
      unsubTeams();
    };
  }, []);

  // Create Team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name || !teamForm.leaderId) {
      alert('Name and Leader are required');
      return;
    }
    const docRef = await addDoc(collection(db, 'teams'), {
      ...teamForm,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setShowCreateModal(false);
    setTeamForm({
      name: '',
      description: '',
      leaderId: '',
      memberIds: [],
      zoneIds: [],
      defaultShift: 'morning',
    });
  };

  // Edit Team
  const handleEditTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    await updateDoc(doc(db, 'teams', selectedTeam.id), {
      ...teamForm,
      updatedAt: serverTimestamp(),
    });
    setShowEditModal(false);
    setSelectedTeam(null);
  };

  // Delete Team
  const handleDeleteTeam = async (team: Team) => {
    if (!window.confirm(`Delete team "${team.name}"?`)) return;
    await deleteDoc(doc(db, 'teams', team.id));
  };

  // Add/Remove Members
  const handleUpdateMembers = async (memberIds: string[]) => {
    if (!selectedTeam) return;
    // Update team
    await updateDoc(doc(db, 'teams', selectedTeam.id), {
      memberIds,
      updatedAt: serverTimestamp(),
    });
    // Update staff: add/remove teamId in staff's teams field (optional, for bidirectional sync)
    for (const staffMember of staff) {
      const staffDoc = doc(db, 'staff', staffMember.id);
      if (memberIds.includes(staffMember.id)) {
        await updateDoc(staffDoc, { teams: arrayUnion(selectedTeam.name) });
      } else {
        await updateDoc(staffDoc, { teams: arrayRemove(selectedTeam.name) });
      }
    }
    setShowMembersModal(false);
    setSelectedTeam(null);
  };

  // Notify Team
  const handleNotifyTeam = (team: Team) => {
    const leader = staff.find(s => s.id === team.leaderId);
    alert(
      `Notification sent to team "${team.name}"\nLeader: ${leader?.name}\nMembers: ${team.memberIds.length}`
    );
  };

  // Team Roster, Tasks, Performance (mocked for now)
  const renderTeamView = (team: Team) => {
    const leader = staff.find(s => s.id === team.leaderId);
    const members = staff.filter(s => team.memberIds.includes(s.id));
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Team Roster</h3>
        <ul className="mb-4">
          <li><b>Leader:</b> {leader?.name || 'N/A'}</li>
          {members.map(m => (
            <li key={m.id}>{m.name} ({m.role})</li>
          ))}
        </ul>
        <h3 className="text-lg font-semibold mb-2">Active Tasks</h3>
        <div className="mb-4 text-gray-500">No active tasks (demo)</div>
        <h3 className="text-lg font-semibold mb-2">Performance Stats</h3>
        <div className="text-gray-500">No stats available (demo)</div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Team Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </button>
      </div>
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leader</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Members Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Default Shift</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            ) : teams.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No teams found</td>
              </tr>
            ) : (
              teams.map(team => {
                const leader = staff.find(s => s.id === team.leaderId);
                return (
                  <tr key={team.id}>
                    <td className="px-6 py-4">{team.name}</td>
                    <td className="px-6 py-4">{leader?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{team.memberIds?.length || 0}</td>
                    <td className="px-6 py-4">{(team.zoneIds || []).join(', ')}</td>
                    <td className="px-6 py-4">{shiftOptions.find(opt => opt.value === team.defaultShift)?.label || team.defaultShift}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => {
                            setSelectedTeam(team);
                            setTeamForm({ ...team });
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteTeam(team)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => {
                            setSelectedTeam(team);
                            setShowMembersModal(true);
                          }}
                        >
                          <Users className="h-4 w-4" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900"
                          onClick={() => handleNotifyTeam(team)}
                        >
                          <Bell className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Team View Modal */}
      {selectedTeam && !showEditModal && !showMembersModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setSelectedTeam(null)}></div>
            <div className="bg-white rounded-lg shadow-xl p-6 z-10 max-w-lg w-full">
              <h2 className="text-xl font-bold mb-2">{selectedTeam.name}</h2>
              <div className="mb-2 text-gray-600">{selectedTeam.description}</div>
              {renderTeamView(selectedTeam)}
              <button
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={() => setSelectedTeam(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Team Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}></div>
            <div className="bg-white rounded-lg shadow-xl p-6 z-10 max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4">{showCreateModal ? 'Create Team' : 'Edit Team'}</h2>
              <form onSubmit={showCreateModal ? handleCreateTeam : handleEditTeam} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Team Name</label>
                  <input
                    type="text"
                    required
                    value={teamForm.name}
                    onChange={e => setTeamForm((f: any) => ({ ...f, name: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={teamForm.description}
                    onChange={e => setTeamForm((f: any) => ({ ...f, description: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Leader</label>
                  <select
                    required
                    value={teamForm.leaderId}
                    onChange={e => setTeamForm((f: any) => ({ ...f, leaderId: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Leader</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Zone(s)</label>
                  <Select
                    isMulti
                    options={zoneOptions}
                    value={zoneOptions.filter(opt => teamForm.zoneIds?.includes(opt.value))}
                    onChange={opts => setTeamForm((f: any) => ({ ...f, zoneIds: opts.map((o: any) => o.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Default Shift</label>
                  <select
                    value={teamForm.defaultShift}
                    onChange={e => setTeamForm((f: any) => ({ ...f, defaultShift: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {shiftOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    {showCreateModal ? 'Create' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add/Remove Members Modal */}
      {showMembersModal && selectedTeam && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowMembersModal(false)}></div>
            <div className="bg-white rounded-lg shadow-xl p-6 z-10 max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4">Manage Members for {selectedTeam.name}</h2>
              <Select
                isMulti
                options={staff.map(s => ({ value: s.id, label: `${s.name} (${s.role})` }))}
                value={staff.filter(s => selectedTeam.memberIds.includes(s.id)).map(s => ({ value: s.id, label: `${s.name} (${s.role})` }))}
                onChange={opts => handleUpdateMembers(opts.map((o: any) => o.value))}
              />
              <div className="flex justify-end mt-4">
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setShowMembersModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
