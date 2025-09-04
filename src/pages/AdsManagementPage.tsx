import React, { useEffect, useState } from 'react';
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface Ad {
  id: string;
  title: string;
  description: string;
  type: string;
  validFrom: any;
  validTo: any;
  contact: string;
  status: string;
  createdAt?: any;
}

const initialForm = { title: '', description: '', type: 'ad', validFrom: '', validTo: '', contact: '' };

function AdsManagementPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dummyAds: Ad[] = [
      {
        id: 'ad1',
        title: 'Mahakumbh 2025 - Volunteer Registration',
        description: 'Join us as a volunteer for the upcoming Mahakumbh 2025. Help make this historic event a success!',
        type: 'announcement',
        validFrom: '2025-01-15',
        validTo: '2025-02-15',
        contact: 'volunteer@mahakumbh2025.com',
        status: 'published'
      },
      {
        id: 'ad2',
        title: 'Emergency Contact Numbers',
        description: 'Important emergency contact numbers for all zones. Keep these handy during the event.',
        type: 'announcement',
        validFrom: '2025-01-10',
        validTo: '2025-03-10',
        contact: 'emergency@facility.com',
        status: 'published'
      },
      {
        id: 'ad3',
        title: 'Food Vendor Registration',
        description: 'Applications open for food vendors. Limited slots available. Apply now!',
        type: 'ad',
        validFrom: '2025-01-20',
        validTo: '2025-01-30',
        contact: 'vendor@mahakumbh2025.com',
        status: 'unpublished'
      },
      {
        id: 'ad4',
        title: 'Transportation Schedule',
        description: 'Updated transportation schedule for all zones. Check your route before traveling.',
        type: 'announcement',
        validFrom: '2025-01-12',
        validTo: '2025-02-20',
        contact: 'transport@facility.com',
        status: 'published'
      },
      {
        id: 'ad5',
        title: 'Security Guidelines',
        description: 'Important security guidelines for all visitors and staff. Please read carefully.',
        type: 'announcement',
        validFrom: '2025-01-08',
        validTo: '2025-03-15',
        contact: 'security@facility.com',
        status: 'published'
      }
    ];

    const unsub = onSnapshot(
      collection(db, 'ads'),
      (snap) => {
        const data = snap.docs.map(doc => {
          const data = doc.data();
          // Convert Firestore Timestamp to JS Date string for display
          const validFrom =
            data.validFrom && typeof data.validFrom.toDate === 'function'
              ? data.validFrom.toDate().toLocaleDateString()
              : (typeof data.validFrom === 'string' ? data.validFrom : '');
          const validTo =
            data.validTo && typeof data.validTo.toDate === 'function'
              ? data.validTo.toDate().toLocaleDateString()
              : (typeof data.validTo === 'string' ? data.validTo : '');
          return {
            id: doc.id,
            ...data,
            validFrom,
            validTo,
          } as Ad;
        });
        setAds(data.length ? data : dummyAds);
      },
      () => {
        setAds(dummyAds);
      }
    );
    return unsub;
  }, []);

  const handleCreate = async () => {
    setError('');
    if (!form.title || !form.description || !form.validFrom || !form.validTo) {
      setError('Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'ads'), {
        ...form,
        status: 'unpublished',
        validFrom: new Date(form.validFrom),
        validTo: new Date(form.validTo),
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setForm(initialForm);
    } catch (e) {
      setError('Failed to create ad.');
    }
    setLoading(false);
  };

  const handleAction = async (id: string, action: string) => {
    if (action === 'publish') {
      await updateDoc(doc(db, 'ads', id), { status: 'published' });
    } else if (action === 'unpublish') {
      await updateDoc(doc(db, 'ads', id), { status: 'unpublished' });
    } else if (action === 'delete') {
      await deleteDoc(doc(db, 'ads', id));
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Advertisements & Announcements</h2>
      <div style={{ textAlign: 'right', marginBottom: 16 }}>
        <button
          style={{
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 18px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onClick={() => setShowModal(true)}
        >
          + Create New
        </button>
      </div>
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: '#0006', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 10, minWidth: 350, maxWidth: 400, boxShadow: '0 2px 12px #0002' }}>
            <h3 style={{ marginBottom: 16 }}>Create Ad/Announcement</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                placeholder="Title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minHeight: 60 }}
              />
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
              >
                <option value="ad">Ad</option>
                <option value="announcement">Announcement</option>
              </select>
              <input
                type="date"
                value={form.validFrom}
                onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
              />
              <input
                type="date"
                value={form.validTo}
                onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
              />
              <input
                placeholder="Contact Info"
                value={form.contact}
                onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
              />
              {error && <div style={{ color: 'red', fontSize: 13 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button
                  onClick={handleCreate}
                  style={{
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 16px',
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                  }}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => { setShowModal(false); setError(''); setForm(initialForm); }}
                  style={{
                    background: '#eee',
                    color: '#333',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{ overflowX: 'auto', marginTop: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', borderRadius: 8, overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#f0f4f8' }}>
              <th style={{ padding: 10, borderBottom: '1px solid #e0e0e0' }}>Title</th>
              <th style={{ padding: 10, borderBottom: '1px solid #e0e0e0' }}>Type</th>
              <th style={{ padding: 10, borderBottom: '1px solid #e0e0e0' }}>Valid From</th>
              <th style={{ padding: 10, borderBottom: '1px solid #e0e0e0' }}>Valid To</th>
              <th style={{ padding: 10, borderBottom: '1px solid #e0e0e0' }}>Contact</th>
              <th style={{ padding: 10, borderBottom: '1px solid #e0e0e0' }}>Status</th>
              <th style={{ padding: 10, borderBottom: '1px solid #e0e0e0' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ads.map(ad => (
              <tr key={ad.id}>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{ad.title}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{ad.type}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{ad.validFrom}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{ad.validTo}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{ad.contact}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{
                    padding: '2px 10px',
                    borderRadius: 12,
                    background: ad.status === 'published' ? '#c8e6c9' : '#ffe0b2',
                    color: ad.status === 'published' ? '#256029' : '#a67c00',
                    fontWeight: 600,
                  }}>
                    {ad.status}
                  </span>
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <button
                    style={{
                      background: '#43a047',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 10px',
                      marginRight: 4,
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                    onClick={() => handleAction(ad.id, 'publish')}
                  >
                    Publish
                  </button>
                  <button
                    style={{
                      background: '#ffa726',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 10px',
                      marginRight: 4,
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                    onClick={() => handleAction(ad.id, 'unpublish')}
                  >
                    Unpublish
                  </button>
                  <button
                    style={{
                      background: '#e53935',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 10px',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                    onClick={() => handleAction(ad.id, 'delete')}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {ads.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 20, color: '#888' }}>
                  No ads or announcements found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdsManagementPage;
