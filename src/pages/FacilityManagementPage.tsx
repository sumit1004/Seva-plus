import React, { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, updateDoc, addDoc, deleteDoc, getFirestore, query } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import * as XLSX from 'xlsx';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

type Facility = {
  id: string;
  code: string;
  zoneId: string;
  lat: number;
  lng: number;
  status: string;
  lastUpdated: string;
  assignedTask?: string;
};

const statusColors: Record<string, string> = {
  clean: 'green',
  dirty: 'red',
  empty: 'blue',
  full: 'orange',
  working: 'green',
  faulty: 'red',
  clear: 'green',
  crowded: 'orange',
};

const typeStatusOptions: Record<string, string[]> = {
  Toilet: ['clean', 'dirty', 'empty', 'full'],
  Dustbin: ['empty', 'full'],
  'Water Supply': ['working', 'faulty'],
};

const defaultRegion = {
  center: [23.1824, 75.7764],
  bounds: [
    [23.1200, 75.7000],
    [23.2500, 75.8500],
  ],
  zoom: 13,
};

// PinMapModal component for picking lat/lng
const PinMapModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSelect: (lat: number, lng: number) => void;
  type: string;
}> = ({ open, onClose, onSelect, type }) => {
  const [selected, setSelected] = useState<[number, number] | null>(null);

  function MapClicker() {
    useMapEvents({
      click(e) {
        setSelected([e.latlng.lat, e.latlng.lng]);
      },
    });
    return selected ? (
      <Marker position={selected}>
        <Popup>
          Selected Location<br />
          <button
            className="bg-green-600 text-white px-2 py-1 rounded mt-2"
            onClick={() => {
              onSelect(selected[0], selected[1]);
              onClose();
            }}
          >
            Confirm
          </button>
        </Popup>
      </Marker>
    ) : null;
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-4 w-full max-w-xl relative">
        <button className="absolute top-2 right-2 text-xl" onClick={onClose}>&times;</button>
        <h3 className="text-lg font-bold mb-2">Select {type} Location</h3>
        <div className="h-96 w-full">
          <MapContainer
            center={defaultRegion.center}
            zoom={defaultRegion.zoom}
            style={{ height: '100%', width: '100%' }}
            maxBounds={defaultRegion.bounds}
            maxBoundsViscosity={1.0}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <MapClicker />
          </MapContainer>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Click on the map to select a location, then confirm.
        </div>
      </div>
    </div>
  );
};

const FacilityManagementPage: React.FC = () => {
  const [toilets, setToilets] = useState<Facility[]>([]);
  const [dustbins, setDustbins] = useState<Facility[]>([]);
  const [watersupply, setWatersupply] = useState<Facility[]>([]);
  const [view, setView] = useState<'table' | 'map'>('table');
  const [addForm, setAddForm] = useState({ code: '', type: 'Toilet', zoneId: '', lat: '', lng: '', status: '' });
  const [importing, setImporting] = useState(false);
  const [pinModal, setPinModal] = useState<{ open: boolean; type: string }>({ open: false, type: '' });
  const db = getFirestore(getApp());

  // --- Fetch data from separate collections ---
  useEffect(() => {
    const dummyToilets: Facility[] = [
      { id: 'T-A12', code: 'A12', zoneId: 'North', lat: 23.185, lng: 75.782, status: 'clean', lastUpdated: new Date().toISOString() },
      { id: 'T-B04', code: 'B04', zoneId: 'South', lat: 23.172, lng: 75.796, status: 'dirty', lastUpdated: new Date().toISOString() },
      { id: 'T-C08', code: 'C08', zoneId: 'East', lat: 23.191, lng: 75.774, status: 'clean', lastUpdated: new Date().toISOString() },
      { id: 'T-D15', code: 'D15', zoneId: 'West', lat: 23.177, lng: 75.788, status: 'empty', lastUpdated: new Date().toISOString() },
      { id: 'T-E22', code: 'E22', zoneId: 'North', lat: 23.188, lng: 75.786, status: 'full', lastUpdated: new Date().toISOString() },
      { id: 'T-F33', code: 'F33', zoneId: 'South', lat: 23.169, lng: 75.799, status: 'clean', lastUpdated: new Date().toISOString() },
      { id: 'T-G44', code: 'G44', zoneId: 'East', lat: 23.183, lng: 75.781, status: 'dirty', lastUpdated: new Date().toISOString() },
      { id: 'T-H55', code: 'H55', zoneId: 'West', lat: 23.175, lng: 75.790, status: 'clean', lastUpdated: new Date().toISOString() },
      { id: 'T-I66', code: 'I66', zoneId: 'North', lat: 23.186, lng: 75.784, status: 'empty', lastUpdated: new Date().toISOString() },
      { id: 'T-J77', code: 'J77', zoneId: 'South', lat: 23.170, lng: 75.797, status: 'full', lastUpdated: new Date().toISOString() }
    ];
    const dummyDustbins: Facility[] = [
      { id: 'D-D07', code: 'D07', zoneId: 'East', lat: 23.191, lng: 75.774, status: 'full', lastUpdated: new Date().toISOString() },
      { id: 'D-D11', code: 'D11', zoneId: 'West', lat: 23.177, lng: 75.788, status: 'empty', lastUpdated: new Date().toISOString() },
      { id: 'D-D18', code: 'D18', zoneId: 'North', lat: 23.187, lng: 75.785, status: 'full', lastUpdated: new Date().toISOString() },
      { id: 'D-D25', code: 'D25', zoneId: 'South', lat: 23.171, lng: 75.798, status: 'empty', lastUpdated: new Date().toISOString() },
      { id: 'D-D32', code: 'D32', zoneId: 'East', lat: 23.192, lng: 75.773, status: 'full', lastUpdated: new Date().toISOString() },
      { id: 'D-D39', code: 'D39', zoneId: 'West', lat: 23.176, lng: 75.789, status: 'empty', lastUpdated: new Date().toISOString() },
      { id: 'D-D46', code: 'D46', zoneId: 'North', lat: 23.184, lng: 75.783, status: 'full', lastUpdated: new Date().toISOString() },
      { id: 'D-D53', code: 'D53', zoneId: 'South', lat: 23.168, lng: 75.800, status: 'empty', lastUpdated: new Date().toISOString() },
      { id: 'D-D60', code: 'D60', zoneId: 'East', lat: 23.193, lng: 75.772, status: 'full', lastUpdated: new Date().toISOString() },
      { id: 'D-D67', code: 'D67', zoneId: 'West', lat: 23.174, lng: 75.791, status: 'empty', lastUpdated: new Date().toISOString() }
    ];
    const dummyWater: Facility[] = [
      { id: 'W-W03', code: 'W03', zoneId: 'North', lat: 23.188, lng: 75.786, status: 'working', lastUpdated: new Date().toISOString() },
      { id: 'W-W08', code: 'W08', zoneId: 'South', lat: 23.169, lng: 75.799, status: 'faulty', lastUpdated: new Date().toISOString() },
      { id: 'W-W14', code: 'W14', zoneId: 'East', lat: 23.190, lng: 75.775, status: 'working', lastUpdated: new Date().toISOString() },
      { id: 'W-W21', code: 'W21', zoneId: 'West', lat: 23.178, lng: 75.787, status: 'working', lastUpdated: new Date().toISOString() },
      { id: 'W-W28', code: 'W28', zoneId: 'North', lat: 23.185, lng: 75.782, status: 'faulty', lastUpdated: new Date().toISOString() },
      { id: 'W-W35', code: 'W35', zoneId: 'South', lat: 23.172, lng: 75.796, status: 'working', lastUpdated: new Date().toISOString() },
      { id: 'W-W42', code: 'W42', zoneId: 'East', lat: 23.189, lng: 75.776, status: 'working', lastUpdated: new Date().toISOString() },
      { id: 'W-W49', code: 'W49', zoneId: 'West', lat: 23.179, lng: 75.786, status: 'faulty', lastUpdated: new Date().toISOString() },
      { id: 'W-W56', code: 'W56', zoneId: 'North', lat: 23.186, lng: 75.781, status: 'working', lastUpdated: new Date().toISOString() },
      { id: 'W-W63', code: 'W63', zoneId: 'South', lat: 23.173, lng: 75.795, status: 'working', lastUpdated: new Date().toISOString() }
    ];

    const unsubToilets = onSnapshot(
      query(collection(db, 'toilets')),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Facility[];
        setToilets(data.length ? data : dummyToilets);
      },
      () => {
        setToilets(dummyToilets);
      }
    );
    const unsubDustbins = onSnapshot(
      query(collection(db, 'dustbins')),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Facility[];
        setDustbins(data.length ? data : dummyDustbins);
      },
      () => {
        setDustbins(dummyDustbins);
      }
    );
    const unsubWatersupply = onSnapshot(
      query(collection(db, 'watersupply')),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Facility[];
        setWatersupply(data.length ? data : dummyWater);
      },
      () => {
        setWatersupply(dummyWater);
      }
    );
    return () => {
      unsubToilets();
      unsubDustbins();
      unsubWatersupply();
    };
  }, [db]);

  // --- Facility Actions ---
  const updateStatus = async (facility: Facility, newStatus: string, type: string) => {
    const col = type === 'Toilet' ? 'toilets' : type === 'Dustbin' ? 'dustbins' : 'watersupply';
    await updateDoc(doc(db, col, facility.id), {
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    });
  };

  const assignTask = async (facility: Facility, type: string) => {
    const col = type === 'Toilet' ? 'toilets' : type === 'Dustbin' ? 'dustbins' : 'watersupply';
    const task = prompt('Enter task to assign:');
    if (task) {
      await updateDoc(doc(db, col, facility.id), {
        assignedTask: task,
        lastUpdated: new Date().toISOString(),
      });
    }
  };

  const deleteFacility = async (facilityId: string, type: string) => {
    if (window.confirm('Delete this facility?')) {
      const col = type === 'Toilet' ? 'toilets' : type === 'Dustbin' ? 'dustbins' : 'watersupply';
      await deleteDoc(doc(db, col, facilityId));
    }
  };

  // --- Manual Add ---
  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.code || !addForm.type || !addForm.zoneId || !addForm.lat || !addForm.lng || !addForm.status) return;
    const col = addForm.type === 'Toilet' ? 'toilets' : addForm.type === 'Dustbin' ? 'dustbins' : 'watersupply';
    try {
      await addDoc(collection(db, col), {
        code: addForm.code,
        zoneId: addForm.zoneId,
        lat: parseFloat(addForm.lat),
        lng: parseFloat(addForm.lng),
        status: addForm.status,
        lastUpdated: new Date().toISOString(),
        assignedTask: '',
      });
      setAddForm({ code: '', type: 'Toilet', zoneId: '', lat: '', lng: '', status: '' });
    } catch (error: any) {
      alert('Permission denied or insufficient permissions to add facility.\n\n' + error.message);
    }
  };

  // --- Excel Import ---
  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    // Expected columns: code, type, zoneId, lat, lng, status
    for (const row of rows) {
      const type = row.type;
      const col = type === 'Toilet' ? 'toilets' : type === 'Dustbin' ? 'dustbins' : 'watersupply';
      const lat = parseFloat(row.lat);
      const lng = parseFloat(row.lng);
      if (isNaN(lat) || isNaN(lng)) continue;
      try {
        await addDoc(collection(db, col), {
          code: row.code || '',
          zoneId: row.zoneId || '',
          lat,
          lng,
          status: row.status || '',
          lastUpdated: new Date().toISOString(),
          assignedTask: '',
        });
      } catch (error: any) {
        alert('Permission denied or insufficient permissions to import facility.\n\n' + error.message);
        break;
      }
    }
    setImporting(false);
    e.target.value = '';
  };

  // --- Pin on Map ---
  const openPinModal = (type: string) => setPinModal({ open: true, type });
  const closePinModal = () => setPinModal({ open: false, type: '' });
  const handlePinSelect = (lat: number, lng: number) => {
    setAddForm(f => ({ ...f, lat: lat.toString(), lng: lng.toString() }));
  };

  // --- Stats ---
  const stats = {
    toilets: toilets.length,
    toilets_clean: toilets.filter(f => f.status === 'clean').length,
    toilets_dirty: toilets.filter(f => f.status === 'dirty').length,
    toilets_empty: toilets.filter(f => f.status === 'empty').length,
    toilets_full: toilets.filter(f => f.status === 'full').length,
    dustbins: dustbins.length,
    dustbins_empty: dustbins.filter(f => f.status === 'empty').length,
    dustbins_full: dustbins.filter(f => f.status === 'full').length,
    water: watersupply.length,
    water_working: watersupply.filter(f => f.status === 'working').length,
    water_faulty: watersupply.filter(f => f.status === 'faulty').length,
    byZone: Object.fromEntries(
      Array.from(new Set([...toilets, ...dustbins, ...watersupply].map(f => f.zoneId))).map(zone => [
        zone,
        [...toilets, ...dustbins, ...watersupply].filter(f => f.zoneId === zone).length,
      ])
    ),
  };

  // Add custom pin icons for each facility type
  const toiletIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png', // Toilet pin icon
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
  const dustbinIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/679/679922.png', // Dustbin pin icon
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
  const waterIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2917/2917995.png', // Water supply pin icon
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Facility Management</h2>
        <div>
          <button
            className={`px-4 py-2 rounded-l ${view === 'table' ? 'bg-indigo-700 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('table')}
          >
            Table View
          </button>
          <button
            className={`px-4 py-2 rounded-r ${view === 'map' ? 'bg-indigo-700 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('map')}
          >
            Map View
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded shadow p-4">
          <div className="font-bold">Toilets</div>
          <div>Total: {stats.toilets}</div>
          <div>Clean: {stats.toilets_clean}</div>
          <div>Dirty: {stats.toilets_dirty}</div>
          <div>Empty: {stats.toilets_empty}</div>
          <div>Full: {stats.toilets_full}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="font-bold">Dustbins</div>
          <div>Total: {stats.dustbins}</div>
          <div>Empty: {stats.dustbins_empty}</div>
          <div>Full: {stats.dustbins_full}</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="font-bold">Water Supply</div>
          <div>Total: {stats.water}</div>
          <div>Working: {stats.water_working}</div>
          <div>Faulty: {stats.water_faulty}</div>
        </div>
      </div>
      <div className="mb-4 bg-white rounded shadow p-4">
        <div className="font-bold mb-2">Facilities by Zone</div>
        <div className="flex flex-wrap gap-4">
          {Object.entries(stats.byZone).map(([zone, count]) => (
            <div key={zone}>
              <span className="font-semibold">{zone}:</span> {count}
            </div>
          ))}
        </div>
      </div>

      {/* Import & Add */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <form onSubmit={handleAddFacility} className="flex flex-wrap gap-2 items-end bg-white p-4 rounded shadow">
          <div>
            <label className="block text-xs">Code</label>
            <input className="border px-2 py-1 rounded" value={addForm.code} onChange={e => setAddForm(f => ({ ...f, code: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs">Type</label>
            <select className="border px-2 py-1 rounded" value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value, status: '' }))}>
              <option>Toilet</option>
              <option>Dustbin</option>
              <option>Water Supply</option>
            </select>
          </div>
          <div>
            <label className="block text-xs">Zone</label>
            <input className="border px-2 py-1 rounded" value={addForm.zoneId} onChange={e => setAddForm(f => ({ ...f, zoneId: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs">Latitude</label>
            <input className="border px-2 py-1 rounded" value={addForm.lat} onChange={e => setAddForm(f => ({ ...f, lat: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs">Longitude</label>
            <input className="border px-2 py-1 rounded" value={addForm.lng} onChange={e => setAddForm(f => ({ ...f, lng: e.target.value }))} required />
          </div>
          <div>
            <button
              type="button"
              className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
              onClick={() => openPinModal(addForm.type)}
            >
              Pin {addForm.type} on Map
            </button>
          </div>
          <div>
            <label className="block text-xs">Status</label>
            <select
              className="border px-2 py-1 rounded"
              value={addForm.status}
              onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))}
              required
            >
              <option value="">Select</option>
              {(typeStatusOptions[addForm.type] || []).map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">Add Facility</button>
        </form>
        <div className="flex flex-col gap-2 bg-white p-4 rounded shadow">
          <label className="block text-xs font-bold">Import from Excel</label>
          <input type="file" accept=".xlsx,.xls" onChange={handleImportExcel} disabled={importing} />
          {importing && <span className="text-xs text-gray-500">Importing...</span>}
          <span className="text-xs text-gray-500">Columns: code, type, zoneId, lat, lng, status</span>
        </div>
      </div>

      {/* Pin Map Modal */}
      <PinMapModal
        open={pinModal.open}
        onClose={closePinModal}
        onSelect={handlePinSelect}
        type={pinModal.type}
      />

      {/* Table or Map */}
      {view === 'table' ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Zone</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Last Updated</th>
                <th className="px-4 py-2">Assigned Task</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...toilets.map(f => ({ ...f, type: 'Toilet' })), 
                ...dustbins.map(f => ({ ...f, type: 'Dustbin' })), 
                ...watersupply.map(f => ({ ...f, type: 'Water Supply' }))
              ].map((f) => (
                <tr key={f.id}>
                  <td className="border px-4 py-2">{f.code}</td>
                  <td className="border px-4 py-2">{f.type}</td>
                  <td className="border px-4 py-2">{f.zoneId}</td>
                  <td className="border px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-white`}
                      style={{ background: statusColors[f.status] || 'gray' }}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="border px-4 py-2">{new Date(f.lastUpdated).toLocaleString()}</td>
                  <td className="border px-4 py-2">{f.assignedTask || '-'}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <select
                      value={f.status}
                      onChange={(e) => updateStatus(f, e.target.value, f.type)}
                      className="border rounded px-2 py-1"
                    >
                      {(typeStatusOptions[f.type] || []).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                      onClick={() => assignTask(f, f.type)}
                    >
                      Assign Task
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => deleteFacility(f.id, f.type)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Toilets Map */}
          <div className="h-[400px] rounded shadow overflow-hidden bg-white">
            <div className="font-bold text-center py-2">Toilets</div>
            <MapContainer
              center={defaultRegion.center}
              zoom={defaultRegion.zoom}
              style={{ height: '90%', width: '100%' }}
              maxBounds={defaultRegion.bounds}
              maxBoundsViscosity={1.0}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {toilets.map((f) => (
                <Marker
                  key={f.id}
                  position={[f.lat, f.lng]}
                  icon={toiletIcon}
                >
                  <Popup>
                    <div>
                      <strong>{f.code}</strong> (Toilet)<br />
                      Status: <span style={{ color: statusColors[f.status] }}>{f.status}</span>
                      <br />
                      Zone: {f.zoneId}
                      <br />
                      Last Updated: {new Date(f.lastUpdated).toLocaleString()}
                      <br />
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
                        onClick={() => assignTask(f, 'Toilet')}
                      >
                        Assign Task
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded mt-2 ml-2"
                        onClick={() => deleteFacility(f.id, 'Toilet')}
                      >
                        Delete
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          {/* Dustbins Map */}
          <div className="h-[400px] rounded shadow overflow-hidden bg-white">
            <div className="font-bold text-center py-2">Dustbins</div>
            <MapContainer
              center={defaultRegion.center}
              zoom={defaultRegion.zoom}
              style={{ height: '90%', width: '100%' }}
              maxBounds={defaultRegion.bounds}
              maxBoundsViscosity={1.0}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {dustbins.map((f) => (
                <Marker
                  key={f.id}
                  position={[f.lat, f.lng]}
                  icon={dustbinIcon}
                >
                  <Popup>
                    <div>
                      <strong>{f.code}</strong> (Dustbin)<br />
                      Status: <span style={{ color: statusColors[f.status] }}>{f.status}</span>
                      <br />
                      Zone: {f.zoneId}
                      <br />
                      Last Updated: {new Date(f.lastUpdated).toLocaleString()}
                      <br />
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
                        onClick={() => assignTask(f, 'Dustbin')}
                      >
                        Assign Task
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded mt-2 ml-2"
                        onClick={() => deleteFacility(f.id, 'Dustbin')}
                      >
                        Delete
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          {/* Water Supply Map */}
          <div className="h-[400px] rounded shadow overflow-hidden bg-white">
            <div className="font-bold text-center py-2">Water Supply</div>
            <MapContainer
              center={defaultRegion.center}
              zoom={defaultRegion.zoom}
              style={{ height: '90%', width: '100%' }}
              maxBounds={defaultRegion.bounds}
              maxBoundsViscosity={1.0}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {watersupply.map((f) => (
                <Marker
                  key={f.id}
                  position={[f.lat, f.lng]}
                  icon={waterIcon}
                >
                  <Popup>
                    <div>
                      <strong>{f.code}</strong> (Water Supply)<br />
                      Status: <span style={{ color: statusColors[f.status] }}>{f.status}</span>
                      <br />
                      Zone: {f.zoneId}
                      <br />
                      Last Updated: {new Date(f.lastUpdated).toLocaleString()}
                      <br />
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
                        onClick={() => assignTask(f, 'Water Supply')}
                      >
                        Assign Task
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded mt-2 ml-2"
                        onClick={() => deleteFacility(f.id, 'Water Supply')}
                      >
                        Delete
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityManagementPage;

