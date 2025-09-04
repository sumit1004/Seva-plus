import React, { useEffect, useState, useRef } from 'react';
import { collection, doc, onSnapshot, updateDoc, getDocs, setDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
// Map imports
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SHIFTS = [
  { id: 'red', name: 'Red', color: 'red' },
  { id: 'orange', name: 'Orange', color: 'orange' },
  { id: 'green', name: 'Green', color: 'green' },
];

const UJJAIN_BOUNDS = [
  [23.070, 75.690], // Southwest corner (approx)
  [23.230, 75.900], // Northeast corner (approx)
];
const UJJAIN_CENTER = [23.1793, 75.7849]; // Ujjain Mahakumbh center

function ZoneMap({ zones, onSelectLatLng }: { zones: any[], onSelectLatLng?: (lat: number, lng: number) => void }) {
  // Fix marker icon for leaflet
  useEffect(() => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);
  function PinSelector() {
    useMapEvents({
      click(e) {
        if (onSelectLatLng) {
          onSelectLatLng(e.latlng.lat, e.latlng.lng);
        }
      },
    });
    return null;
  }
  return (
    <MapContainer
      center={UJJAIN_CENTER}
      zoom={13}
      style={{ height: 350, width: '100%', marginBottom: 16 }}
      maxBounds={UJJAIN_BOUNDS}
      maxBoundsViscosity={1.0}
      scrollWheelZoom={true}
      minZoom={12}
      maxZoom={17}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onSelectLatLng && <PinSelector />}
      {zones.map(zone =>
        zone.lat && zone.lng ? (
          <Marker key={zone.id} position={[zone.lat, zone.lng]}>
            <Popup>
              <b>{zone.name}</b>
              <br />
              {zone.description || ''}
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  );
}

export default function ShiftManagementPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [headcounts, setHeadcounts] = useState<{ [zoneId: string]: number }>({});
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [zoneDesc, setZoneDesc] = useState('');
  const [zoneLat, setZoneLat] = useState('');
  const [zoneLng, setZoneLng] = useState('');
  const [importing, setImporting] = useState(false);
  const [pinMode, setPinMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch zones, staff, and listen to shifts/headcounts
  useEffect(() => {
    let unsubShifts: any;
    setLoading(true);
    const dummyZones = [
      { id: 'North', name: 'North', description: 'Main ghats area', lat: 23.1901, lng: 75.7802 },
      { id: 'South', name: 'South', description: 'Parking and entry', lat: 23.1705, lng: 75.7921 }
    ];
    const dummyStaff = [
      { id: 's1', name: 'Aarav Sharma' },
      { id: 's2', name: 'Priya Verma' },
      { id: 's3', name: 'Rohit Mehta' }
    ];
    const dummyShifts = [
      { id: 'sh1', zoneId: 'North', name: 'red', startTime: '09:00', endTime: '17:00', assignedStaffIds: ['s2'] },
      { id: 'sh2', zoneId: 'South', name: 'green', startTime: '14:00', endTime: '22:00', assignedStaffIds: ['s1','s3'] }
    ];

    const unsubZones = onSnapshot(
      collection(db, 'zones'),
      snapshot => {
        const z = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setZones(z.length ? z : dummyZones);
      },
      () => setZones(dummyZones)
    );

    const unsubStaff = onSnapshot(
      collection(db, 'staff'),
      snapshot => {
        const s = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStaff(s.length ? s : dummyStaff);
      },
      () => setStaff(dummyStaff)
    );

    unsubShifts = onSnapshot(
      collection(db, 'shifts'),
      snapshot => {
        const sh = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setShifts(sh.length ? sh : dummyShifts);
        setLoading(false);
      },
      () => {
        setShifts(dummyShifts);
        setLoading(false);
      }
    );
    return () => {
      unsubZones();
      unsubStaff();
      if (unsubShifts) unsubShifts();
    };
  }, []);

  // Listen to headcounts
  useEffect(() => {
    const unsubscribes: any[] = [];
    if (!zones.length) return;
    zones.forEach(zone => {
      const unsub = onSnapshot(
        doc(db, `headcounts/${zone.id}`),
        docSnap => {
          setHeadcounts(prev => ({
            ...prev,
            [zone.id]: docSnap.exists() ? docSnap.data().count : Math.floor(Math.random() * 40) + 10
          }));
        },
        () => {
          setHeadcounts(prev => ({ ...prev, [zone.id]: Math.floor(Math.random() * 40) + 10 }));
        }
      );
      unsubscribes.push(unsub);
    });
    return () => unsubscribes.forEach(unsub => unsub());
  }, [zones]);

  // Update shift time
  const handleTimeChange = async (shiftId: string, field: 'startTime' | 'endTime', value: string) => {
    if (!shiftId) return;
    await updateDoc(doc(db, 'shifts', shiftId), { [field]: value });
  };

  // Assign staff to shift
  const handleAssignStaff = async (shiftId: string, staffId: string) => {
    if (!shiftId || !staffId) return;
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;
    const assigned = shift.assignedStaffIds || [];
    if (!assigned.includes(staffId)) {
      await updateDoc(doc(db, 'shifts', shiftId), { assignedStaffIds: [...assigned, staffId] });
    }
  };

  // Remove staff from shift
  const handleRemoveStaff = async (shiftId: string, staffId: string) => {
    if (!shiftId || !staffId) return;
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;
    const assigned = (shift.assignedStaffIds || []).filter((id: string) => id !== staffId);
    await updateDoc(doc(db, 'shifts', shiftId), { assignedStaffIds: assigned });
  };

  // Helper: get shift for zone+shiftId
  const getZoneShift = (zoneId: string, shiftTypeId: string) =>
    shifts.find(s => s.zoneId === zoneId && s.name === shiftTypeId);

  // Create default shifts for all zones if missing
  const handleCreateDefaultShifts = async () => {
    setCreating(true);
    for (const zone of zones) {
      for (const shiftType of SHIFTS) {
        const exists = shifts.find(s => s.zoneId === zone.id && s.name === shiftType.id);
        if (!exists) {
          await setDoc(doc(collection(db, 'shifts')), {
            zoneId: zone.id,
            name: shiftType.id,
            startTime: '09:00',
            endTime: '17:00',
            assignedStaffIds: [],
          });
        }
      }
    }
    setCreating(false);
  };

  // Add zone manually
  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName || !zoneLat || !zoneLng) return;
    await addDoc(collection(db, 'zones'), {
      name: zoneName,
      description: zoneDesc,
      lat: parseFloat(zoneLat),
      lng: parseFloat(zoneLng),
    });
    setZoneName('');
    setZoneDesc('');
    setZoneLat('');
    setZoneLng('');
  };

  // Import zones from file (CSV or JSON)
  const handleImportZones = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const text = await file.text();
    let data: any[] = [];
    try {
      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parser: name,description,lat,lng
        data = text
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean)
          .map(line => {
            const [name, description, lat, lng] = line.split(',');
            return { name, description, lat: parseFloat(lat), lng: parseFloat(lng) };
          });
      }
      for (const zone of data) {
        if (zone.name && zone.lat && zone.lng) {
          await addDoc(collection(db, 'zones'), {
            name: zone.name,
            description: zone.description || '',
            lat: zone.lat,
            lng: zone.lng,
          });
        }
      }
    } catch (err) {
      alert('Invalid file format');
    }
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // UI rendering
  return (
    <div>
      <h2>Shift Management (Workforce Allocation)</h2>

      {/* --- Zone Management Section --- */}
      <div style={{ margin: '24px 0', padding: 16, border: '1px solid #e5e7eb', borderRadius: 8, background: '#f9fafb' }}>
        <h3>Add Zone Manually</h3>
        <form onSubmit={handleAddZone} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Zone Name"
            value={zoneName}
            onChange={e => setZoneName(e.target.value)}
            required
            style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="Description"
            value={zoneDesc}
            onChange={e => setZoneDesc(e.target.value)}
            style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <input
            type="number"
            placeholder="Latitude"
            value={zoneLat}
            onChange={e => setZoneLat(e.target.value)}
            step="any"
            min={UJJAIN_BOUNDS[0][0]}
            max={UJJAIN_BOUNDS[1][0]}
            required
            style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', width: 120 }}
          />
          <input
            type="number"
            placeholder="Longitude"
            value={zoneLng}
            onChange={e => setZoneLng(e.target.value)}
            step="any"
            min={UJJAIN_BOUNDS[0][1]}
            max={UJJAIN_BOUNDS[1][1]}
            required
            style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', width: 120 }}
          />
          <button
            type="button"
            onClick={() => setPinMode(m => !m)}
            style={{
              padding: '6px 12px',
              background: pinMode ? '#f59e42' : '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
            title="Select Lat/Lng on Map"
          >
            {pinMode ? 'Click on Map...' : 'Pin on Map'}
          </button>
          <button
            type="submit"
            style={{
              padding: '6px 16px',
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Add Zone
          </button>
        </form>
        <div style={{ marginTop: 12 }}>
          <b>Import Zones:</b>
          <input
            type="file"
            accept=".json,.csv"
            ref={fileInputRef}
            onChange={handleImportZones}
            disabled={importing}
            style={{ marginLeft: 8 }}
          />
          <span style={{ marginLeft: 8, color: '#888' }}>
            (Upload .json or .csv with columns: name,description,lat,lng)
          </span>
        </div>
      </div>

      {/* --- Map Section --- */}
      <div style={{ marginBottom: 24 }}>
        <h3>Zone Map (Ujjain Mahakumbh Region)</h3>
        <ZoneMap
          zones={zones}
          onSelectLatLng={
            pinMode
              ? (lat, lng) => {
                  setZoneLat(lat.toString());
                  setZoneLng(lng.toString());
                  setPinMode(false);
                }
              : undefined
          }
        />
      </div>

      {/* --- Existing Shift Management UI --- */}
      {loading ? (
        <div style={{ margin: 32 }}>Loading...</div>
      ) : zones.length === 0 ? (
        <div style={{ margin: 32, color: 'red' }}>
          No zones found. Please add zones in Firestore.<br />
        </div>
      ) : (
        <>
          {shifts.length === 0 && (
            <div style={{ margin: 24, color: 'orange' }}>
              No shifts found for zones.<br />
              <button
                onClick={handleCreateDefaultShifts}
                disabled={creating}
                style={{
                  marginTop: 8,
                  padding: '6px 16px',
                  background: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  opacity: creating ? 0.6 : 1,
                }}
              >
                {creating ? 'Creating...' : 'Create Default Shifts'}
              </button>
            </div>
          )}
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {zones.map(zone => (
              <div key={zone.id} style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8, minWidth: 320 }}>
                <h3>{zone.name}</h3>
                <div>Headcount: {headcounts[zone.id] || 0}</div>
                <div>Required Staff: {Math.ceil((headcounts[zone.id] || 0) / 8)}</div>
                <div>
                  {SHIFTS.map(shiftType => {
                    const shift = getZoneShift(zone.id, shiftType.id);
                    if (!shift) {
                      return (
                        <div key={shiftType.id} style={{ margin: '12px 0', padding: 8, border: `2px dashed #ccc`, borderRadius: 6, color: '#aaa' }}>
                          {shiftType.name} Shift: Not created yet
                        </div>
                      );
                    }
                    const assigned = shift.assignedStaffIds || [];
                    const required = Math.ceil((headcounts[zone.id] || 0) / 8);
                    let coverage = 'green';
                    if (assigned.length < required) coverage = assigned.length < required / 2 ? 'red' : 'orange';
                    return (
                      <div key={shiftType.id} style={{ margin: '12px 0', padding: 8, border: `2px solid ${shiftType.color}`, borderRadius: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <b style={{ color: shiftType.color }}>{shiftType.name} Shift</b>
                          <span>
                            <input
                              type="time"
                              value={shift?.startTime || ''}
                              onChange={e => handleTimeChange(shift.id, 'startTime', e.target.value)}
                            /> - 
                            <input
                              type="time"
                              value={shift?.endTime || ''}
                              onChange={e => handleTimeChange(shift.id, 'endTime', e.target.value)}
                            />
                          </span>
                          <span style={{
                            background: coverage,
                            color: '#fff',
                            borderRadius: 4,
                            padding: '2px 8px',
                            fontWeight: 'bold'
                          }}>
                            {assigned.length}/{required}
                          </span>
                        </div>
                        <div>
                          <b>Assigned Staff:</b>
                          <ul>
                            {assigned.map((staffId: string) => {
                              const s = staff.find(st => st.id === staffId);
                              return (
                                <li key={staffId}>
                                  {s?.name || staffId}
                                  <button onClick={() => handleRemoveStaff(shift.id, staffId)} style={{ marginLeft: 8 }}>Remove</button>
                                </li>
                              );
                            })}
                          </ul>
                          <select onChange={e => handleAssignStaff(shift.id, e.target.value)} value="">
                            <option value="">Assign staff...</option>
                            {staff.filter(st => !assigned.includes(st.id)).map(st => (
                              <option key={st.id} value={st.id}>{st.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
