import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const mapPickerStyle = { width: '100%', height: '220px', borderRadius: '12px' };
const KENYA_CENTER = { lat: -1.2921, lng: 36.8219 };

function LocationPicker({ lat, lng, onPick }) {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: apiKey || '' });
  if (!apiKey) {
    return <p className="text-xs text-red-500">Map unavailable: missing Google Maps API key.</p>;
  }
  if (!isLoaded) {
    return <p className="text-xs text-gray-400">Loading map...</p>;
  }
  const position = (lat && lng) ? { lat: Number(lat), lng: Number(lng) } : KENYA_CENTER;
  return (
    <div>
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
        Pin Location on Map {lat && lng ? '✅' : '(tap map to set)'}
      </label>
      <GoogleMap
        mapContainerStyle={mapPickerStyle}
        center={position}
        zoom={lat && lng ? 15 : 6}
        onClick={(e) => onPick(e.latLng.lat(), e.latLng.lng())}
      >
        {lat && lng && <Marker position={position} />}
      </GoogleMap>
    </div>
  );
}

const TABS = ['Overview', 'Properties', 'Tenants', 'Viewings', 'Leases', 'Maintenance', 'Payments'];

export default function LandlordDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leasePrefill, setLeasePrefill] = useState(null);

  useEffect(() => {
    api.get('/landlord/dashboard')
      .then(res => setData(res.data))
      .catch(() => setData(DEMO_DATA))
      .finally(() => setLoading(false));
  }, []);

  const d = data || DEMO_DATA;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <div className="bg-gray-900 px-5 py-4 flex items-center justify-between">
        <div>
          <span className="font-serif text-2xl font-bold text-white">Have<span className="text-green-400">NestKe</span></span>
          <span className="ml-2 text-xs bg-green-800 text-green-300 px-2 py-0.5 rounded-full font-semibold">Landlord</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{user?.full_name || 'Peter Kamau'}</span>
          <button onClick={() => { logout(); navigate('/'); }} className="text-xs text-red-400 border border-red-800 px-3 py-1.5 rounded-full">Log out</button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 px-4 flex overflow-x-auto scrollbar-hide">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-shrink-0 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors ${tab === t ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-green-600">Loading dashboard...</div>
        ) : (
          <>
            {tab === 'Overview' && <Overview d={d} setTab={setTab} />}
            {tab === 'Properties' && <Properties properties={d.properties} navigate={navigate} />}
            {tab === 'Tenants' && <Tenants landlordId={user?.id} />}
            {tab === 'Viewings' && <ViewingsTab onCreateLease={(v) => { setLeasePrefill({ property_id: v.property_id, tenant_id: v.tenant_id }); setTab('Leases'); }} />}
            {tab === 'Leases' && <LeasesTab prefill={leasePrefill} onPrefillUsed={() => setLeasePrefill(null)} />}
            {tab === 'Maintenance' && <MaintenanceTab requests={d.maintenance} />}
            {tab === 'Payments' && <PaymentsTab arrears={d.arrears} />}
          </>
        )}
      </div>
    </div>
  );
}

// ── OVERVIEW TAB ──
function Overview({ d, setTab }) {
  const stats = [
    { icon: '🏠', label: 'Total Properties', value: d.stats.total_properties, color: 'bg-green-50 text-green-700' },
    { icon: '💰', label: 'Collected This Month', value: `Ksh ${Number(d.stats.total_collected_this_month).toLocaleString()}`, color: 'bg-blue-50 text-blue-700' },
    { icon: '🔧', label: 'Open Maintenance', value: d.stats.open_maintenance, color: 'bg-amber-50 text-amber-700' },
    { icon: '⚠️', label: 'Tenants in Arrears', value: d.stats.tenants_in_arrears, color: 'bg-red-50 text-red-700' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs font-medium mt-0.5 opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Urgent maintenance */}
      {d.maintenance.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-900">🔧 Urgent Maintenance</p>
            <button onClick={() => setTab('Maintenance')} className="text-xs text-green-600 font-semibold">View all →</button>
          </div>
          {d.maintenance.slice(0, 3).map(r => (
            <MaintenanceRow key={r.id} r={r} />
          ))}
        </div>
      )}

      {/* Arrears alert */}
      {d.arrears.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <p className="font-semibold text-red-700 mb-3">⚠️ Rent Arrears</p>
          {d.arrears.map((a, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-red-100 last:border-0">
              <div>
                <p className="text-sm font-semibold text-gray-900">{a.full_name}</p>
                <p className="text-xs text-gray-500">{a.property_title}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-red-600">Ksh {Number(a.monthly_rent).toLocaleString()}</p>
                <p className="text-xs text-gray-400">overdue</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Property summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-gray-900">🏠 Your Properties</p>
          <button onClick={() => setTab('Properties')} className="text-xs text-green-600 font-semibold">View all →</button>
        </div>
        {d.properties.slice(0, 3).map(p => (
          <div key={p.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl flex-shrink-0">🏢</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{p.title}</p>
              <p className="text-xs text-gray-400">{p.town} · {p.active_tenants} tenant(s)</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-green-600">Ksh {Number(p.rent_amount).toLocaleString()}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${p.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PROPERTIES TAB ──
function Properties({ properties, navigate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ title: '', town: '', type: 'apartment', bedrooms: 1, bathrooms: 1, rent_amount: '', is_furnished: false, is_new_build: false });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    try {
      await api.post('/properties', form);
      alert('✅ Property listed successfully!');
      setShowAddForm(false);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => setShowAddForm(!showAddForm)}
        className="w-full bg-green-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2">
        ➕ {showAddForm ? 'Cancel' : 'Add New Property'}
      </button>

      {showAddForm && (
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <p className="font-semibold text-gray-900">New Property Listing</p>
          {[
            { key: 'title', label: 'Property Name', placeholder: 'Rongai Gardens Block C' },
            { key: 'town', label: 'Town / Area', placeholder: 'Rongai' },
            { key: 'estate', label: 'Estate', placeholder: 'Tumaini Estate' },
            { key: 'full_address', label: 'Full Address', placeholder: 'Plot 42, Off Magadi Rd' },
            { key: 'rent_amount', label: 'Monthly Rent (Ksh)', placeholder: '18000', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">{f.label}</label>
              <input type={f.type || 'text'} placeholder={f.placeholder}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
                value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
            </div>
          ))}
          <LocationPicker
            lat={form.latitude}
            lng={form.longitude}
            onPick={(lat, lng) => setForm({ ...form, latitude: lat, longitude: lng })}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Bedrooms</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: e.target.value })}>
                {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n === 0 ? 'Bedsitter' : `${n} Bed`}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Type</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {['apartment', 'house', 'studio', 'townhouse', 'villa'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            {[{ key: 'is_furnished', label: '🛋️ Furnished' }, { key: 'is_new_build', label: '🏗️ New Build' }].map(cb => (
              <label key={cb.key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form[cb.key]} onChange={e => setForm({ ...form, [cb.key]: e.target.checked })}
                  className="w-4 h-4 accent-green-500" />
                {cb.label}
              </label>
            ))}
          </div>
          <button onClick={handleAdd} disabled={saving}
            className="w-full bg-green-500 text-white font-bold py-3 rounded-xl disabled:opacity-60">
            {saving ? 'Saving...' : '✅ List Property'}
          </button>
        </div>
      )}

      {properties.map(p => (
        <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{p.title}</p>
              <p className="text-sm text-gray-400 mt-0.5">📍 {p.town} · {p.bedrooms} bed · {p.type}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${p.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {p.status}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-lg font-bold text-green-600">Ksh {Number(p.rent_amount).toLocaleString()}<span className="text-xs font-normal text-gray-400">/mo</span></p>
            <div className="flex gap-2 text-xs">
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full">👥 {p.active_tenants} tenant(s)</span>
              {p.open_requests > 0 && <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full">🔧 {p.open_requests} request(s)</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── TENANTS TAB ──
function Tenants() {
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    api.get('/landlord/tenants')
      .then(res => setTenants(res.data.tenants || []))
      .catch(() => setTenants(DEMO_DATA.tenants));
  }, []);

  const displayTenants = tenants.length > 0 ? tenants : DEMO_DATA.tenants;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-500">{displayTenants.length} tenant(s) across all properties</p>
      {displayTenants.map((t, i) => (
        <div key={t.id || i} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center text-xl flex-shrink-0">👤</div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{t.full_name}</p>
              <p className="text-xs text-gray-400">{t.phone} · {t.email}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-green-600">{t.rental_score}</div>
              <div className="text-[10px] text-gray-400">score</div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-xs">
            <div className="flex justify-between mb-1.5">
              <span className="text-gray-500">Property</span>
              <span className="font-semibold text-gray-800">{t.property_title}</span>
            </div>
            <div className="flex justify-between mb-1.5">
              <span className="text-gray-500">Rent</span>
              <span className="font-semibold text-gray-800">Ksh {Number(t.monthly_rent).toLocaleString()}/mo</span>
            </div>
            <div className="flex justify-between mb-1.5">
              <span className="text-gray-500">Lease</span>
              <span className="font-semibold text-gray-800">{t.start_date?.slice(0,10)} → {t.end_date?.slice(0,10)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payments</span>
              <span className="font-semibold text-green-600">✅ {t.payments_made} paid · ⏳ {t.payments_pending} pending</span>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => alert(`Calling ${t.full_name}...`)}
              className="flex-1 text-xs bg-gray-100 text-gray-700 font-semibold py-2 rounded-xl">📞 Call</button>
            <button onClick={() => alert(`Opening WhatsApp for ${t.full_name}...`)}
              className="flex-1 text-xs bg-green-50 text-green-700 font-semibold py-2 rounded-xl">💬 WhatsApp</button>
            <button onClick={() => alert(`Sending rent reminder to ${t.full_name}...`)}
              className="flex-1 text-xs bg-amber-50 text-amber-700 font-semibold py-2 rounded-xl">⚠️ Remind</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAINTENANCE TAB ──
function MaintenanceTab({ requests }) {
  const display = requests.length > 0 ? requests : DEMO_DATA.maintenance;

  const handleRespond = async (id) => {
    const response = prompt('Your response to the tenant:');
    if (!response) return;
    try {
      await api.patch(`/landlord/maintenance/${id}`, { status: 'in_progress', landlord_response: response });
      alert('✅ Response sent to tenant!');
    } catch {
      alert('Response sent! (demo mode)');
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {display.map((r, i) => <MaintenanceRow key={r.id || i} r={r} onRespond={handleRespond} showActions />)}
      {display.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">✅</div>
          <p className="font-semibold">No open maintenance requests</p>
        </div>
      )}
    </div>
  );
}

// ── PAYMENTS TAB ──
function PaymentsTab({ arrears }) {
  const DEMO_HISTORY = [
    { month: 'July 2026', tenant: 'James Kamau', property: 'Rongai Gardens', amount: 18000, method: 'M-Pesa', receipt: 'QHF7829KA', status: 'paid' },
    { month: 'July 2026', tenant: 'Sarah Wanjiku', property: 'Kitengela Heights', amount: 25000, method: 'M-Pesa', receipt: 'QHF8830KB', status: 'paid' },
    { month: 'July 2026', tenant: 'David Ochieng', property: 'Rongai Gardens', amount: 18000, method: 'Bank', receipt: 'N/A', status: 'pending' },
    { month: 'June 2026', tenant: 'James Kamau', property: 'Rongai Gardens', amount: 18000, method: 'M-Pesa', receipt: 'QHF6610QA', status: 'paid' },
  ];

  const totalPaid = DEMO_HISTORY.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-2xl p-4">
          <p className="text-xs text-green-600 font-semibold uppercase tracking-wider">Collected July</p>
          <p className="text-2xl font-bold text-green-700 mt-1">Ksh {totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4">
          <p className="text-xs text-red-600 font-semibold uppercase tracking-wider">Outstanding</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{(arrears.length || 1)} tenant(s)</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="font-semibold text-gray-900 mb-3">Payment Records</p>
        {DEMO_HISTORY.map((p, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${p.status === 'paid' ? 'bg-green-100' : 'bg-amber-100'}`}>
              {p.status === 'paid' ? '✅' : '⏳'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{p.tenant}</p>
              <p className="text-xs text-gray-400 truncate">{p.month} · {p.property} · {p.method}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-sm font-bold ${p.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                Ksh {p.amount.toLocaleString()}
              </p>
              {p.receipt !== 'N/A' && <p className="text-[10px] text-gray-400">{p.receipt}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SHARED: Maintenance Row ──
function MaintenanceRow({ r, onRespond, showActions }) {
  const urgencyColors = { urgent: 'bg-red-100 text-red-700', standard: 'bg-amber-100 text-amber-700', low: 'bg-gray-100 text-gray-600' };
  const icons = { Plumbing: '🚿', Electrical: '💡', Structural: '🧱', Doors: '🚪', Pest: '🪲', Other: '🔧' };
  const icon = Object.entries(icons).find(([k]) => r.category?.includes(k))?.[1] || '🔧';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm text-gray-900">{r.title}</p>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${urgencyColors[r.urgency] || urgencyColors.standard}`}>
              {r.urgency}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{r.description}</p>
          <p className="text-xs text-gray-400 mt-1">
            👤 {r.tenant_name || 'Tenant'} · 🏠 {r.property_title || 'Property'} · 📅 {r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Today'}
          </p>
        </div>
      </div>
      {showActions && (
        <div className="flex gap-2 mt-3">
          <button onClick={() => onRespond?.(r.id)} className="flex-1 text-xs bg-green-50 text-green-700 font-semibold py-2 rounded-xl">💬 Respond</button>
          <button onClick={() => alert('Scheduled ✅')} className="flex-1 text-xs bg-blue-50 text-blue-700 font-semibold py-2 rounded-xl">📅 Schedule Fix</button>
          <button onClick={() => alert('Marked as resolved ✅')} className="flex-1 text-xs bg-gray-100 text-gray-600 font-semibold py-2 rounded-xl">✅ Resolve</button>
        </div>
      )}
    </div>
  );
}

// ── DEMO DATA (shown when DB is empty) ──
function ViewingsTab({ onCreateLease }) {
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => {
    api.get('/landlord/viewings')
      .then(res => setViewings(res.data.viewings || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  const respond = async (id, status) => {
    try {
      await api.patch('/landlord/viewings/' + id, { status });
      load();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
  };
  if (loading) return <p className="text-sm text-gray-500">Loading viewing requests...</p>;
  if (viewings.length === 0) return <p className="text-sm text-gray-500">No viewing requests yet.</p>;
  const statusStyle = {
    requested: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-600',
  };
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-gray-500">{viewings.length} viewing request(s)</p>
      {viewings.map(v => (
        <div key={v.id} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900">{v.tenant_name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{v.tenant_phone} - score {v.rental_score}</p>
            </div>
            <span className={'text-xs px-2 py-1 rounded-full font-semibold ' + (statusStyle[v.status] || 'bg-gray-100 text-gray-600')}>
              {v.status}
            </span>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 mt-3 text-xs">
            <div className="flex justify-between mb-1.5">
              <span className="text-gray-500">Property</span>
              <span className="font-semibold text-gray-800">{v.property_title} - {v.town}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Requested Date</span>
              <span className="font-semibold text-gray-800">{v.scheduled_at ? new Date(v.scheduled_at).toLocaleString() : 'Not set'}</span>
            </div>
          </div>
          {v.status === 'requested' && (
            <div className="flex gap-2 mt-3">
              <button onClick={() => respond(v.id, 'confirmed')} className="flex-1 bg-green-500 text-white text-xs font-bold py-2 rounded-xl">Confirm</button>
              <button onClick={() => respond(v.id, 'rejected')} className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-2 rounded-xl">Reject</button>
            </div>
          )}
          {v.status === 'confirmed' && (
            <div className="flex gap-2 mt-3">
              <button onClick={() => onCreateLease(v)} className="flex-1 bg-green-500 text-white text-xs font-bold py-2 rounded-xl">Create Lease</button>
              <button onClick={() => respond(v.id, 'completed')} className="flex-1 bg-gray-100 text-gray-700 text-xs font-bold py-2 rounded-xl">Mark as Completed</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
function LeasesTab({ prefill, onPrefillUsed }) {
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ property_id: '', tenant_id: '', start_date: '', end_date: '', monthly_rent: '', deposit_amount: '' });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (prefill) {
      setForm(f => ({ ...f, property_id: prefill.property_id, tenant_id: prefill.tenant_id }));
      setShowForm(true);
      if (onPrefillUsed) onPrefillUsed();
    }
  }, [prefill]);
  const load = () => {
    api.get('/landlord/leases')
      .then(res => setLeases(res.data.leases || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.post('/landlord/leases', form);
      setShowForm(false);
      setForm({ property_id: '', tenant_id: '', start_date: '', end_date: '', monthly_rent: '', deposit_amount: '' });
      load();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };
  const signAsLandlord = async (id) => {
    try {
      await api.patch('/landlord/leases/' + id + '/sign');
      load();
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
  };
  const statusStyle = {
    active: 'bg-green-100 text-green-700',
    pending_signature: 'bg-amber-100 text-amber-700',
    pending_landlord: 'bg-amber-100 text-amber-700',
    pending_tenant: 'bg-amber-100 text-amber-700',
  };
  return (
    <div className="flex flex-col gap-4">
      <button onClick={() => setShowForm(!showForm)} className="w-full bg-green-500 text-white font-bold py-3.5 rounded-2xl">
        {showForm ? 'Cancel' : '+ Create New Lease'}
      </button>
      {showForm && (
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <p className="font-semibold text-gray-900">New Lease</p>
          {[
            { key: 'property_id', label: 'Property ID', placeholder: 'e.g. 1' },
            { key: 'tenant_id', label: 'Tenant User ID', placeholder: 'e.g. 5' },
            { key: 'start_date', label: 'Start Date', type: 'date' },
            { key: 'end_date', label: 'End Date', type: 'date' },
            { key: 'monthly_rent', label: 'Monthly Rent (Ksh)', type: 'number', placeholder: '18000' },
            { key: 'deposit_amount', label: 'Deposit Amount (Ksh)', type: 'number', placeholder: '36000' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">{f.label}</label>
              <input
                type={f.type || 'text'}
                placeholder={f.placeholder}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <button onClick={handleCreate} disabled={saving} className="w-full bg-green-500 text-white font-bold py-3 rounded-xl disabled:opacity-60">
            {saving ? 'Creating...' : 'Create Lease'}
          </button>
        </div>
      )}
      {loading ? (
        <p className="text-sm text-gray-500">Loading leases...</p>
      ) : leases.length === 0 ? (
        <p className="text-sm text-gray-500">No leases yet.</p>
      ) : (
        leases.map(l => (
          <div key={l.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900">{l.tenant_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{l.property_title} - {l.town}</p>
              </div>
              <span className={'text-xs px-2 py-1 rounded-full font-semibold ' + (statusStyle[l.status] || 'bg-gray-100 text-gray-600')}>
                {l.status}
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 mt-3 text-xs">
              <div className="flex justify-between mb-1.5">
                <span className="text-gray-500">Rent</span>
                <span className="font-semibold text-gray-800">Ksh {Number(l.monthly_rent).toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between mb-1.5">
                <span className="text-gray-500">Tenant Signed</span>
                <span className="font-semibold text-gray-800">{l.tenant_signed_at ? new Date(l.tenant_signed_at).toLocaleDateString() : 'Not yet'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Landlord Signed</span>
                <span className="font-semibold text-gray-800">{l.landlord_signed_at ? new Date(l.landlord_signed_at).toLocaleDateString() : 'Not yet'}</span>
              </div>
            </div>
            {!l.landlord_signed_at && (
              <button onClick={() => signAsLandlord(l.id)} className="w-full mt-3 bg-green-500 text-white text-xs font-bold py-2.5 rounded-xl">
                Sign Lease
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
const DEMO_DATA = {
  stats: { total_properties: 4, total_collected_this_month: 79000, open_maintenance: 2, tenants_in_arrears: 1 },
  properties: [
    { id: 1, title: 'Rongai Gardens Apts', town: 'Rongai', type: 'apartment', bedrooms: 1, rent_amount: 18000, status: 'available', active_tenants: 2, open_requests: 1 },
    { id: 2, title: 'Kitengela Heights', town: 'Kitengela', type: 'apartment', bedrooms: 2, rent_amount: 25000, status: 'occupied', active_tenants: 1, open_requests: 0 },
    { id: 3, title: 'Ruiru Studios', town: 'Ruiru', type: 'studio', bedrooms: 0, rent_amount: 12000, status: 'available', active_tenants: 1, open_requests: 1 },
    { id: 4, title: 'Juja Green Phase 2', town: 'Juja', type: 'apartment', bedrooms: 1, rent_amount: 15000, status: 'available', active_tenants: 0, open_requests: 0 },
  ],
  tenants: [
    { id: 1, full_name: 'James Kamau', email: 'james@email.com', phone: '0712345678', rental_score: 742, property_title: 'Rongai Gardens Apts', monthly_rent: 18000, start_date: '2026-01-01', end_date: '2027-01-01', payments_made: 7, payments_pending: 0 },
    { id: 2, full_name: 'Sarah Wanjiku', email: 'sarah@email.com', phone: '0723456789', rental_score: 810, property_title: 'Kitengela Heights', monthly_rent: 25000, start_date: '2026-02-01', end_date: '2027-02-01', payments_made: 5, payments_pending: 0 },
    { id: 3, full_name: 'David Ochieng', email: 'david@email.com', phone: '0734567890', rental_score: 620, property_title: 'Ruiru Studios', monthly_rent: 12000, start_date: '2026-03-01', end_date: '2027-03-01', payments_made: 3, payments_pending: 1 },
  ],
  maintenance: [
    { id: 1, category: 'Plumbing', title: 'Leaking Pipe — Bathroom', description: 'Water dripping under the sink.', status: 'open', urgency: 'urgent', tenant_name: 'James Kamau', property_title: 'Rongai Gardens', created_at: new Date().toISOString() },
    { id: 2, category: 'Electrical', title: 'Bulb Replacement — Kitchen', description: 'Ceiling light stopped working.', status: 'open', urgency: 'standard', tenant_name: 'David Ochieng', property_title: 'Ruiru Studios', created_at: new Date().toISOString() },
  ],
  arrears: [
    { full_name: 'David Ochieng', property_title: 'Ruiru Studios', monthly_rent: 12000 },
  ],
};
