import React, { useEffect, useState } from 'react';

const SEVERITY_EMERGENCY = 'emergency';
const SLA_HOURS = 24;

function getSlaCountdown(reportedAt: any) {
  if (!reportedAt) return '';
  const reported = reportedAt.seconds ? new Date(reportedAt.seconds * 1000) : new Date(reportedAt);
  const deadline = new Date(reported.getTime() + SLA_HOURS * 60 * 60 * 1000);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  return `${hours}h ${mins}m ${secs}s`;
}

import './IssueManagementPage.css';

function IssueManagementPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [emergencyReports, setEmergencyReports] = useState<any[]>([]);
  const [assigning, setAssigning] = useState<{[id: string]: string}>({});
  const [timer, setTimer] = useState(0);

  // SLA timer update every second
  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Dummy data for issues
  useEffect(() => {
    const dummyIssues = [
      {
        id: '1',
        facilityId: 'Building A',
        zoneId: 'Zone 1',
        category: 'Dustbins',
        severity: 'medium',
        description: 'Leaking pipe in restroom',
        reportedBy: 'pritishofficial042gmail.com',
        status: 'open',
        assignedTo: '',
        reportedAt: { seconds: Math.floor(Date.now() / 1000) - 3600 } // 1 hour ago
      },
      {
        id: '2',
        facilityId: 'Building B',
        zoneId: 'Zone 2',
        category: 'Water supply',
        severity: 'emergency',
        description: 'Power outage',
        reportedBy: 'kumarsumit04@gmail.com',
        status: 'open',
        assignedTo: '',
        reportedAt: { seconds: Math.floor(Date.now() / 1000) - 7200 } // 2 hours ago
      },
      {
        id: '3',
        facilityId: 'Building C',
        zoneId: 'Zone 3',
        category: 'Cleaning',
        severity: 'low',
        description: 'Trash overflow',
        reportedBy: 'sumitkumar042006@gmail.com',
        status: 'assigned',
        assignedTo: 'staff1',
        reportedAt: { seconds: Math.floor(Date.now() / 1000) - 18000 } // 5 hours ago
      },
      {
        id: '4',
        facilityId: 'Main Gate',
        zoneId: 'Zone 1',
        category: 'Security',
        severity: 'high',
        description: 'Unauthorized access attempt',
        reportedBy: 'security@facility.com',
        status: 'open',
        assignedTo: '',
        reportedAt: { seconds: Math.floor(Date.now() / 1000) - 1800 } // 30 mins ago
      },
      {
        id: '5',
        facilityId: 'Parking Area',
        zoneId: 'Zone 2',
        category: 'Maintenance',
        severity: 'medium',
        description: 'Broken parking barrier',
        reportedBy: 'sumitkumar042006@gmail.com',
        status: 'assigned',
        assignedTo: 'staff2',
        reportedAt: { seconds: Math.floor(Date.now() / 1000) - 9000 } // 2.5 hours ago
      }
    ];
    setIssues(dummyIssues);
  }, []);

  // Dummy data for emergency reports (4 entries: 2 for testing, 2 realistic)
  useEffect(() => {
    const dummyEmergencyReports = [
      {
        id: 'ER-201',
        contact: 'sumitkumar042006@gmail.com',
        desc: 'Test emergency report for system check.',
        location: 'Test Location 1',
        lat: 21.250048,
        lng: 81.6316416,
        source: 'seva-plus-web',
        timestamp: { seconds: Math.floor(Date.now() / 1000) - 300 },
        type: 'test'
      },
      {
        id: 'ER-202',
        contact: 'sumitkumar042006@gmail.com',
        desc: 'Another test report for QA.',
        location: 'Test Location 2',
        lat: 28.6139,
        lng:  77.2090,
        source: 'web-form',
        timestamp: { seconds: Math.floor(Date.now() / 1000) - 600 },
        type: 'test'
      },
      {
        id: 'ER-301',
        contact: ' sumitkumar042006@gmail.com',
        desc: 'Unauthorized person spotted near main gate.',
        location: { address: 'Main Gate, Building F', lat: 28.6139, lng: 77.2090 },
        lat: 28.6139,
        lng: 77.2090,
        source: 'seva-plus-web',
        timestamp: { seconds: Math.floor(Date.now() / 1000) - 1200 },
        type: 'security'
      },
      {
        id: 'ER-302',
        contact: 'sumitkumar042006@gmail.com',
        desc: 'Water leakage detected in basement parking.',
        location: { address: 'Basement Parking, Building G', lat: 28.7041, lng: 77.1025 },
        lat: 28.7041,
        lng: 77.1025,
        source: 'web-form',
        timestamp: { seconds: Math.floor(Date.now() / 1000) - 1800 },
        type: 'maintenance'
      },
      {
        id: 'ER-303',
        contact: 'sumitkumar042006@gmail.com',
        desc: 'Medical emergency in cafeteria area.',
        location: { address: 'Cafeteria, Building H', lat: 28.7041, lng: 77.1025 },
        lat: 28.7041,
        lng: 77.1025,
        source: 'mobile-app',
        timestamp: { seconds: Math.floor(Date.now() / 1000) - 900 },
        type: 'medical'
      },
      {
        id: 'ER-304',
        contact: 'sumitkumar042006@gmail.com',
        desc: 'Fire alarm triggered in office building.',
        location: { address: 'Office Building, Zone 3', lat: 28.6139, lng: 77.2090 },
        lat: 28.6139,
        lng: 77.2090,
        source: 'seva-plus-web',
        timestamp: { seconds: Math.floor(Date.now() / 1000) - 1500 },
        type: 'fire'
      }
    ];
    setEmergencyReports(dummyEmergencyReports);
  }, []);

  const emergencies = issues.filter(i => i.severity === SEVERITY_EMERGENCY && i.status !== 'closed');

  const handleAction = async (id: string, action: string) => {
    // Dummy handler for demo
    if (action === 'close') {
      setIssues(prev =>
        prev.map(issue => issue.id === id ? { ...issue, status: 'closed' } : issue)
      );
    } else if (action === 'assign') {
      const assignedTo = assigning[id];
      if (assignedTo) {
        setIssues(prev =>
          prev.map(issue => issue.id === id ? { ...issue, assignedTo, status: 'assigned' } : issue)
        );
        setAssigning(a => ({ ...a, [id]: '' }));
      }
    } else if (action === 'merge') {
      setIssues(prev =>
        prev.map(issue => issue.id === id ? { ...issue, status: 'merged' } : issue)
      );
    }
  };

  return (
    <div className="issue-mgmt-container">
      <h2 className="issue-mgmt-title">Issue & Emergency Management</h2>
      {emergencies.length > 0 && (
        <div className="emergency-banner">
          <span>🚨 Emergency Issues: {emergencies.length}</span>
        </div>
      )}
      <div className="table-section">
        <h3 className="section-title">All Issues</h3>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Facility</th>
              <th>Zone</th>
              <th>Category</th>
              <th>Severity</th>
              <th>Reported By</th>
              <th>Status</th>
              <th>SLA Timer</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.map(issue => (
              <tr
                key={issue.id}
                className={
                  issue.severity === SEVERITY_EMERGENCY
                    ? 'emergency-row'
                    : ''
                }
              >
                <td>{issue.facilityId}</td>
                <td>{issue.zoneId}</td>
                <td>{issue.category}</td>
                <td>
                  <span className={`severity-badge severity-${issue.severity}`}>
                    {issue.severity}
                  </span>
                </td>
                <td>{issue.reportedBy}</td>
                <td>
                  <span className={`status-badge status-${issue.status}`}>
                    {issue.status}
                  </span>
                </td>
                <td>
                  <span className={getSlaCountdown(issue.reportedAt) === 'Expired' ? 'sla-expired' : ''}>
                    {getSlaCountdown(issue.reportedAt)}
                  </span>
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Assign to"
                    value={assigning[issue.id] || ''}
                    onChange={e => setAssigning(a => ({ ...a, [issue.id]: e.target.value }))}
                    className="assign-input"
                  />
                </td>
                <td>
                  <button className="action-btn assign" onClick={() => handleAction(issue.id, 'assign')}>Assign</button>
                  <button className="action-btn merge" onClick={() => handleAction(issue.id, 'merge')}>Merge</button>
                  <button className="action-btn close" onClick={() => handleAction(issue.id, 'close')}>Close</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-section">
        <h3 className="section-title">Emergency Reports (User Submitted)</h3>
        <table className="styled-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Contact</th>
              <th>Description</th>
              <th>Location</th>
              <th>Lat</th>
              <th>Lng</th>
              <th>Source</th>
              <th>Timestamp</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {emergencyReports.map(report => (
              <tr key={report.id} className="emergency-row">
                <td>{report.id}</td>
                <td>{report.contact || '-'}</td>
                <td>{report.desc || report.description || '-'}</td>
                <td>
                  {typeof report.location === 'string'
                    ? report.location
                    : (report.location?.address || '-')}
                </td>
                <td>
                  {report.lat ||
                    (typeof report.location === 'object' && report.location?.lat) ||
                    '-'}
                </td>
                <td>
                  {report.lng ||
                    (typeof report.location === 'object' && report.location?.lng) ||
                    '-'}
                </td>
                <td>{report.source || '-'}</td>
                <td>
                  {report.timestamp?.seconds
                    ? new Date(report.timestamp.seconds * 1000).toLocaleString()
                    : (report.reportedAt?.seconds
                        ? new Date(report.reportedAt.seconds * 1000).toLocaleString()
                        : '-')}
                </td>
                <td>{report.type || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IssueManagementPage;
              