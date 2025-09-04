import React, { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, updateDoc, addDoc, getFirestore, serverTimestamp, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';
import { Tabs, Tab, Card, CardContent, Typography, Button, Box, Paper, TextField } from '@mui/material';

const db = getFirestore(app);
const storage = getStorage(app);

const STATUS = ['Pending', 'In Progress', 'Done', 'Verified'];

function TaskManagementPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [uploading, setUploading] = useState(false);

  // For create task form
  const [showCreate, setShowCreate] = useState(false);
  const [newTask, setNewTask] = useState<any>({
    title: '',
    description: '',
    facilityId: '',
    zoneId: '',
    assignedTo: '',
    priority: 'Medium',
    slaMinutes: 60,
  });

  // Add state for zones, facilities, staff
  const [zones, setZones] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    const dummyTasks = [
      { id: 'd1', title: 'Clean Toilet A-12', description: 'Deep clean required', facilityId: 'Toilet-A12', zoneId: 'North', assignedTo: { type: 'staff', id: 's2' }, priority: 'High', status: 'Pending', slaMinutes: 45, photosBefore: [], photosAfter: [] },
      { id: 'd2', title: 'Empty Dustbin D-07', description: 'Overflowing near gate', facilityId: 'Dustbin-D07', zoneId: 'East', assignedTo: { type: 'staff', id: 's3' }, priority: 'Medium', status: 'In Progress', slaMinutes: 30, photosBefore: [], photosAfter: [] },
      { id: 'd3', title: 'Fix Water Tap W-03', description: 'Low pressure reported', facilityId: 'Water-W03', zoneId: 'South', assignedTo: { type: 'staff', id: 's1' }, priority: 'Low', status: 'Done', slaMinutes: 120, photosBefore: [], photosAfter: [] }
    ];
    const unsub = onSnapshot(
      collection(db, 'tasks'),
      (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTasks(data.length ? data : dummyTasks);
      },
      () => {
        setTasks(dummyTasks);
      }
    );
    return unsub;
  }, []);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [zoneSnap, facilitySnap, staffSnap] = await Promise.all([
          getDocs(collection(db, 'zones')),
          getDocs(collection(db, 'facilities')),
          getDocs(collection(db, 'staff')),
        ]);
        const z = zoneSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const f = facilitySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const s = staffSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setZones(z.length ? z : [{ id: 'North', name: 'North' }, { id: 'South', name: 'South' }]);
        setFacilities(f.length ? f : [{ id: 'Toilet-A12', code: 'A12', type: 'Toilet' }, { id: 'Dustbin-D07', code: 'D07', type: 'Dustbin' }]);
        setStaff(s.length ? s : [{ id: 's1', name: 'Aarav Sharma' }, { id: 's2', name: 'Priya Verma' }, { id: 's3', name: 'Rohit Mehta' }]);
      } catch {
        setZones([{ id: 'North', name: 'North' }, { id: 'South', name: 'South' }]);
        setFacilities([{ id: 'Toilet-A12', code: 'A12', type: 'Toilet' }, { id: 'Dustbin-D07', code: 'D07', type: 'Dustbin' }]);
        setStaff([{ id: 's1', name: 'Aarav Sharma' }, { id: 's2', name: 'Priya Verma' }, { id: 's3', name: 'Rohit Mehta' }]);
      }
    };
    fetchMeta();
  }, []);

  // Analytics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Verified').length;
  const slaCompliant = tasks.filter(t => t.status === 'Verified' && t.completedAt && t.slaMinutes && ((t.completedAt?.seconds - t.createdAt?.seconds) / 60 <= t.slaMinutes)).length;
  const completionPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const slaPercent = completedTasks ? Math.round((slaCompliant / completedTasks) * 100) : 0;

  // Task actions
  const startTask = async (taskId: string) => {
    await updateDoc(doc(db, 'tasks', taskId), { status: 'In Progress', startedAt: serverTimestamp() });
  };

  // Upload multiple files and return array of URLs
  const uploadFiles = async (files: FileList, path: string) => {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const storageRef = ref(storage, `${path}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    return urls;
  };

  // Create Task (no photosBefore)
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    await addDoc(collection(db, 'tasks'), {
      title: newTask.title,
      description: newTask.description,
      facilityId: newTask.facilityId,
      zoneId: newTask.zoneId,
      assignedTo: { type: 'staff', id: newTask.assignedTo },
      priority: newTask.priority,
      status: 'Pending',
      slaMinutes: Number(newTask.slaMinutes),
      photosBefore: [],
      photosAfter: [],
      createdAt: serverTimestamp(),
    });
    setUploading(false);
    setShowCreate(false);
    setNewTask({
      title: '',
      description: '',
      facilityId: '',
      zoneId: '',
      assignedTo: '',
      priority: 'Medium',
      slaMinutes: 60,
    });
  };

  const markDone = async (taskId: string, files: FileList) => {
    setUploading(true);
    const urls = await uploadFiles(files, `tasks/${taskId}/after`);
    await updateDoc(doc(db, 'tasks', taskId), {
      status: 'Done',
      photosAfter: urls,
      completedAt: serverTimestamp()
    });
    setUploading(false);
  };

  const verifyTask = async (taskId: string) => {
    await updateDoc(doc(db, 'tasks', taskId), { status: 'Verified' });
  };

  const rejectTask = async (taskId: string) => {
    await updateDoc(doc(db, 'tasks', taskId), { status: 'In Progress' });
  };

  // Kanban view
  const renderKanban = () => (
    <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', py: 2 }}>
      {STATUS.map(status => (
        <Paper key={status} elevation={3} sx={{ minWidth: 340, p: 2, bgcolor: '#f9f9fb' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>{status}</Typography>
          {tasks.filter(t => t.status === status).map(task => (
            <Card key={task.id} sx={{ mb: 2, borderLeft: '4px solid #1976d2' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">{task.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{task.description}</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
                  <div><b>Zone:</b> {task.zoneId}</div>
                  <div><b>Facility:</b> {task.facilityId}</div>
                  <div><b>Assigned:</b> {task.assignedTo?.id}</div>
                  <div><b>Priority:</b> {task.priority}</div>
                  <div><b>SLA:</b> {task.slaMinutes} min</div>
                </Box>
                {task.photosAfter?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption">After:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      {task.photosAfter.map((url: string, i: number) => (
                        <img key={i} src={url} alt="after" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                      ))}
                    </Box>
                  </Box>
                )}
                <Box sx={{ mt: 2 }}>
                  {status === 'Pending' && (
                    <Button variant="contained" size="small" onClick={() => startTask(task.id)}>Start Task</Button>
                  )}
                  {status === 'In Progress' && (
                    <form
                      style={{ display: 'inline' }}
                      onSubmit={e => {
                        e.preventDefault();
                        const files = (e.target as any).elements.photo.files;
                        if (files && files.length > 0) markDone(task.id, files);
                      }}>
                      <input type="file" name="photo" accept="image/*" multiple required style={{ marginRight: 8 }} />
                      <Button variant="contained" size="small" type="submit" disabled={uploading}>Mark Done</Button>
                    </form>
                  )}
                  {status === 'Done' && (
                    <>
                      <Button variant="contained" size="small" color="success" sx={{ mr: 1 }} onClick={() => verifyTask(task.id)}>Verify</Button>
                      <Button variant="outlined" size="small" color="error" onClick={() => rejectTask(task.id)}>Reject</Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Paper>
      ))}
    </Box>
  );

  // Table view
  const renderTable = () => (
    <Paper sx={{ overflowX: 'auto', p: 2 }}>
      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Zone</th>
            <th>Facility</th>
            <th>AssignedTo</th>
            <th>Priority</th>
            <th>Status</th>
            <th>SLA</th>
            <th>After</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td className="max-w-[150px] truncate">{task.description}</td>
              <td>{task.zoneId}</td>
              <td>{task.facilityId}</td>
              <td>{task.assignedTo?.id}</td>
              <td>{task.priority}</td>
              <td>{task.status}</td>
              <td>{task.slaMinutes} min</td>
              <td>
                {task.photosAfter?.length > 0 && task.photosAfter.map((url: string, i: number) => (
                  <img key={i} src={url} alt="after" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, marginRight: 2 }} />
                ))}
              </td>
              <td>
                {task.status === 'Pending' && (
                  <Button variant="contained" size="small" onClick={() => startTask(task.id)}>Start</Button>
                )}
                {task.status === 'In Progress' && (
                  <form style={{ display: 'inline' }} onSubmit={e => {
                    e.preventDefault();
                    const files = (e.target as any).elements.photo.files;
                    if (files && files.length > 0) markDone(task.id, files);
                  }}>
                    <input type="file" name="photo" accept="image/*" multiple required style={{ marginRight: 4 }} />
                    <Button variant="contained" size="small" type="submit" disabled={uploading}>Done</Button>
                  </form>
                )}
                {task.status === 'Done' && (
                  <>
                    <Button variant="contained" size="small" color="success" sx={{ mr: 1 }} onClick={() => verifyTask(task.id)}>Verify</Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => rejectTask(task.id)}>Reject</Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Paper>
  );

  // Create Task Form (input boxes for zone, facility, staff)
  const renderCreateTaskForm = () => (
    <Card sx={{ maxWidth: 500, mx: 'auto', mb: 4, mt: 2, border: '1px solid #e0e0e0' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>Create Task</Typography>
        <Box component="form" onSubmit={handleCreateTask} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Title"
            required
            value={newTask.title}
            onChange={e => setNewTask((t: any) => ({ ...t, title: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Description"
            required
            value={newTask.description}
            onChange={e => setNewTask((t: any) => ({ ...t, description: e.target.value }))}
            multiline
            rows={2}
            fullWidth
          />
          <TextField
            label="Zone"
            required
            value={newTask.zoneId}
            onChange={e => setNewTask((t: any) => ({ ...t, zoneId: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Facility"
            required
            value={newTask.facilityId}
            onChange={e => setNewTask((t: any) => ({ ...t, facilityId: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Assign Staff (ID)"
            required
            value={newTask.assignedTo}
            onChange={e => setNewTask((t: any) => ({ ...t, assignedTo: e.target.value }))}
            fullWidth
          />
          <TextField
            select
            label="Priority"
            value={newTask.priority}
            onChange={e => setNewTask((t: any) => ({ ...t, priority: e.target.value }))}
            SelectProps={{ native: true }}
            fullWidth
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </TextField>
          <TextField
            label="SLA Minutes"
            type="number"
            required
            value={newTask.slaMinutes}
            onChange={e => setNewTask((t: any) => ({ ...t, slaMinutes: e.target.value }))}
            fullWidth
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="contained" type="submit" disabled={uploading}>Create</Button>
            <Button variant="outlined" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 1, md: 4 }, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, color: '#1976d2' }}>
        Task Management
      </Typography>
      <Box sx={{ mb: 3, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 2, minWidth: 180, bgcolor: '#e3f2fd' }}>
          <Typography variant="subtitle2" color="text.secondary">Completion</Typography>
          <Typography variant="h6" color="primary">{completionPercent}%</Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 180, bgcolor: '#e8f5e9' }}>
          <Typography variant="subtitle2" color="text.secondary">SLA Compliance</Typography>
          <Typography variant="h6" color="success.main">{slaPercent}%</Typography>
        </Paper>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={() => setShowCreate(v => !v)}>
          {showCreate ? 'Hide Create Task' : 'Create Task'}
        </Button>
      </Box>
      {showCreate && renderCreateTaskForm()}
      <Tabs value={view} onChange={(_, v) => setView(v)} sx={{ mb: 2 }}>
        <Tab label="Kanban" value="kanban" />
        <Tab label="Table" value="table" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {view === 'kanban' ? renderKanban() : renderTable()}
      </Box>
    </Box>
  );
}

export default TaskManagementPage;


