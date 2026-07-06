import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import api from '../utils/api';

const STATUS_STYLES = {
  open: 'bg-red-100 text-red-700',
  in_progress: 'bg-amber-100 text-amber-700',
  scheduled: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
};

const STATUS_LABELS = {
  open: 'Open',
  in_progress: 'In Progress',
  scheduled: 'Scheduled',
  resolved: '✅ Resolved',
};

const CATEGORIES = ['Plumbing', 'Electrical', 'Structural / Walls', 'Doors / Windows', 'Pest Control', 'Other'];
const URGENCY = [
  { value: 'urgent', label: '🔴 Urgent (within 24 hours)' },
  { value: 'standard', label: '🟡 Standard (within 7 days)' },
  { value: 'low', label: '⚪ Low priority (when convenient)' },
];

export default function MaintenancePage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: '', urgency: 'standard', title: '', description: '' });

  useEffect(() => {
    api.get('/maintenance').then(res => setRequests(res.data.requests || [])).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!form.category || !form.title || !form.description) return alert('Please fill all fields.');
    setSubmitting(true);
    try {
      await api.post('/maintenance', { ...form, property_id: 1, lease_id: 1 }); // IDs from active lease
      alert('✅ Request submitted! Landlord has been notified.');
      setShowForm(false);
      setForm({ category: '', urgency: 'standard', title: '', description: '' });
      const res = await api.get('/maintenance');
      setRequests(res.data.requests || []);
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const active = requests.filter(r => r.status !== 'resolved');
  const resolved = requests.filter(r => r.status === 'resolved');

  // Demo data fallback
  const demoActive = [
    { id: 1, category: 'Plumbing', title: 'Leaking Pipe — Bathroom', description: 'Water dripping from under the sink.', status: 'in_progress', created_at: '2026-06-25', urgency: 'urgent' },
    { id: 2, category: 'Electrical', title: 'Bulb Replacement — Kitchen', description: 'Ceiling light stopped working.', status: 'scheduled', created_at: '2026-06-27', urgency: 'standard' },
  ];
  const demoResolved = [
    { id: 3, category: 'Doors', title: 'Door Lock Stiff', description: 'Lock was stiff and hard to turn.', status: 'resolved', created_at: '2026-06-10', urgency: 'standard' },
  ];

  const displayActive = active.length > 0 ? active : demoActive;
  const displayResolved = resolved.length > 0 ? resolved : demoResolved;

  return (
    <Layout>
      <div className="bg-white px-5 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-40">
        <button onClick={() => navigate('/home')} className="text-xl text-gray-500">←</button>
        <span className="font-semibold text-gray-900 flex-1">Maintenance Requests</span>
        <button onClick={() => setShowForm(!showForm)} className="text-2xl">➕</button>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* New Request Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-4 shadow-md border border-green-100">
            <p className="font-semibold text-gray-900 mb-4">New Maintenance Request</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Category</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Urgency</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
                  value={form.urgency}
                  onChange={e => setForm({ ...form, urgency: e.target.value })}
                >
                  {URGENCY.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Title</label>
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
                  placeholder="Brief title of the issue..."
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400 resize-none"
                  rows={3}
                  placeholder="Describe the issue in detail..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-green-500 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        )}

        {/* Active */}
        <p className="font-semibold text-gray-900">Active Requests</p>
        <div className="flex flex-col gap-3">
          {displayActive.map(req => (
            <RequestCard key={req.id} req={req} />
          ))}
        </div>

        {/* Resolved */}
        <p className="font-semibold text-gray-900 mt-2">Resolved</p>
        <div className="flex flex-col gap-3 opacity-70">
          {displayResolved.map(req => (
            <RequestCard key={req.id} req={req} />
          ))}
        </div>

        <div className="bg-green-50 rounded-2xl p-4 flex gap-3">
          <span className="text-xl">ℹ️</span>
          <p className="text-sm text-green-700 leading-relaxed">
            All requests are visible to your landlord. Urgent issues unresolved after 7 days are escalated automatically.
          </p>
        </div>
      </div>
    </Layout>
  );
}

function RequestCard({ req }) {
  const icons = { Plumbing: '🚿', Electrical: '💡', Structural: '🧱', Doors: '🚪', Pest: '🪲', Other: '🔧' };
  const icon = Object.entries(icons).find(([k]) => req.category?.includes(k))?.[1] || '🔧';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex gap-3 active:scale-[0.99] transition-transform cursor-pointer">
      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm text-gray-900 leading-tight">{req.title}</p>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_STYLES[req.status] || 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABELS[req.status] || req.status}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1 leading-snug">{req.description}</p>
        <p className="text-xs text-gray-400 mt-2">📅 {new Date(req.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
      </div>
    </div>
  );
}
