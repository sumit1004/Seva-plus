import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase'; // adjust path if needed

interface Message {
  id: string;
  name: string;
  number: string;
  message: string;
  sentAt: string;
}

function NotificationCenterPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [form, setForm] = useState({ name: '', number: '', message: '' });

  useEffect(() => {
    const dummyMessages: Message[] = [
      { id: 'n1', name: 'Aarav Sharma', number: '9876500001', message: 'Shift reminder: Morning shift starts at 9 AM', sentAt: new Date(Date.now() - 3600000).toLocaleString() },
      { id: 'n2', name: 'Priya Verma', number: '9876500002', message: 'Emergency: Water supply issue in Zone A', sentAt: new Date(Date.now() - 7200000).toLocaleString() },
      { id: 'n3', name: 'Rohit Mehta', number: '9876500003', message: 'Meeting reminder: Team briefing at 2 PM', sentAt: new Date(Date.now() - 10800000).toLocaleString() },
      { id: 'n4', name: 'Admin Team', number: '9876500004', message: 'System maintenance scheduled for tonight', sentAt: new Date(Date.now() - 14400000).toLocaleString() }
    ];

    const q = query(collection(db, 'notifications'), orderBy('sentAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            number: data.number,
            message: data.message,
            sentAt: data.sentAt?.toDate?.().toLocaleString?.() || '',
          };
        });
        setMessages(data.length ? data : dummyMessages);
      },
      () => {
        setMessages(dummyMessages);
      }
    );
    return unsub;
  }, []);

  const handleSend = async () => {
    if (!form.name || !form.number || !form.message) return;
    alert(`Notification will be sent to mobile number: ${form.number}`);
    await addDoc(collection(db, 'notifications'), {
      name: form.name,
      number: form.number,
      message: form.message,
      sentAt: serverTimestamp(),
    });
    setForm({ name: '', number: '', message: '' });
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Notification Center</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 500 }}>Name</label>
          <input
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ccc' }}
            placeholder="Enter name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 500 }}>Number</label>
          <input
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ccc' }}
            placeholder="Enter number"
            value={form.number}
            onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
          />
        </div>
        <div style={{ flex: 2 }}>
          <label style={{ fontWeight: 500 }}>Message</label>
          <textarea
            style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #ccc', minHeight: 38 }}
            placeholder="Type your message"
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          />
        </div>
        <button
          style={{
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 18px',
            fontWeight: 600,
            cursor: 'pointer',
            marginLeft: 8,
            height: 42,
          }}
          onClick={handleSend}
        >
          Send
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fafbfc', borderRadius: 8, overflow: 'hidden' }}>
        <thead>
          <tr style={{ background: '#f0f4f8' }}>
            <th style={{ padding: 10, borderBottom: '1px solid #e0e0e0' }}>Name</th>
            <th style={{ padding: 10, borderBottom: '1px solid #e0e0e0' }}>Number</th>
            <th style={{ padding: 10, borderBottom: '1px solid #e0e0e0' }}>Message</th>
            <th style={{ padding: 10, borderBottom: '1px solid #e0e0e0' }}>Sent At</th>
          </tr>
        </thead>
        <tbody>
          {messages.map(msg => (
            <tr key={msg.id}>
              <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{msg.name}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{msg.number}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{msg.message}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{msg.sentAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default NotificationCenterPage;
