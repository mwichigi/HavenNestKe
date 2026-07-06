// ─── LoginPage.js ───────────────────────────────────────────────
import Layout from '../components/layout/Layout';
import api from '../utils/api';
import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col px-6 py-12 items-center">
      <div className="mb-8 w-full max-w-md">
        <h1 className="font-serif text-4xl font-bold text-white">Have<span className="text-green-400">NestKe</span></h1>
        <p className="text-gray-400 mt-2 text-sm">Welcome back — sign in to continue</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        {error && <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-xl">{error}</div>}
        <div>
          <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">Email</label>
          <input type="email" required className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div>
          <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">Password</label>
          <input type="password" required className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl mt-2 disabled:opacity-60 transition-colors">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="text-gray-400 text-sm text-center mt-6">Don't have an account? <Link to="/register" className="text-green-400 font-semibold">Register</Link></p>
    </div>
  );
}

// ─── RegisterPage.js ─────────────────────────────────────────────
export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'tenant', segment: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(form);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col px-6 py-12 items-center">
      <div className="mb-8 w-full max-w-md">
        <h1 className="font-serif text-4xl font-bold text-white">Have<span className="text-green-400">NestKe</span></h1>
        <p className="text-gray-400 mt-2 text-sm">Create your account to find your home</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        {error && <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-xl">{error}</div>}
        {[
          { key: 'full_name', label: 'Full Name', type: 'text', placeholder: 'James Kamau' },
          { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
          { key: 'phone', label: 'Phone (M-Pesa)', type: 'tel', placeholder: '0712345678' },
          { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">{f.label}</label>
            <input type={f.type} required className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} />
          </div>
        ))}
        <div>
          <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">I am a</label>
          <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord / Property Manager</option>
            <option value="developer">Property Developer</option>
            <option value="agency">Agency</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl mt-2 disabled:opacity-60 transition-colors">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p className="text-gray-400 text-sm text-center mt-6">Already have an account? <Link to="/login" className="text-green-400 font-semibold">Sign In</Link></p>
    </div>
  );
}

// ─── SplashPage.js ───────────────────────────────────────────────
export function SplashPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-6 text-center gap-6">
      <h1 className="font-serif text-6xl font-bold text-white leading-none">Have<span className="text-green-400">NestKe</span></h1>
      <p className="text-gray-400 text-base">Your complete home journey</p>
      <div className="w-64 h-48 bg-green-950 rounded-2xl flex items-center justify-center text-6xl mt-4">🗺️</div>
      <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
        <button onClick={() => navigate('/onboarding')} className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl text-base">Get Started</button>
        <button onClick={() => navigate('/login')} className="w-full border border-gray-700 text-gray-400 font-medium py-4 rounded-2xl text-base">I already have an account</button>
      </div>
    </div>
  );
}

// ─── OnboardingPage.js ───────────────────────────────────────────
export function OnboardingPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('');
  const segments = [
    { id: 'student', icon: '🎓', title: 'Student / Young Professional', desc: 'Budget-friendly, satellite towns, roommate matching' },
    { id: 'expat', icon: '✈️', title: 'Expat / Relocating Professional', desc: 'Furnished options, concierge support, safety scores' },
    { id: 'newbuild', icon: '🏗️', title: 'Moving into a New Building', desc: 'Pre-register for new developments, first access' },
    { id: 'family', icon: '👨‍👩‍👧', title: 'Family / General Tenant', desc: 'Full search, all budgets, all areas' },
  ];
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center px-6 py-12 gap-6">
      <div className="w-full max-w-md flex flex-col gap-6 flex-1">
      <button onClick={() => navigate('/')} className="text-gray-400 text-xl self-start">←</button>
      <h2 className="font-serif text-3xl font-bold text-white leading-tight">Who are you <span className="text-green-400">looking for</span> a home?</h2>
      <p className="text-gray-400 text-sm">We'll tailor your experience to find the right home faster.</p>
      <div className="flex flex-col gap-3">
        {segments.map(s => (
          <div key={s.id} onClick={() => setSelected(s.id)} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selected === s.id ? 'border-green-500 bg-green-950' : 'border-gray-700 bg-gray-800'}`}>
            <span className="text-2xl">{s.icon}</span>
            <div className="flex-1"><p className="font-semibold text-white text-sm">{s.title}</p><p className="text-xs text-gray-400 mt-0.5">{s.desc}</p></div>
            {selected === s.id && <span className="text-green-400 text-lg">✅</span>}
          </div>
        ))}
      </div>
      <button onClick={() => navigate('/register')} className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl mt-auto">Continue →</button>
      </div>
    </div>
  );
}

// ─── ProfilePage.js ──────────────────────────────────────────────
export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const rows = [
    { icon: '👤', title: 'Personal Details', desc: 'Name, ID, phone, email', action: () => navigate('/profile/personal-details') },
    { icon: '📋', title: 'Rental History', desc: 'Previous landlord reviews' },
    { icon: '💳', title: 'Payment Methods', desc: 'M-Pesa · •••• 5623' },
    { icon: '📦', title: 'Moving Services', desc: 'Book movers, cleaners, utilities', action: () => navigate('/moving') },
    { icon: '🔔', title: 'Notifications', desc: 'Price drops, new listings' },
    { icon: '🗣️', title: 'Language', desc: 'English · Kiswahili', action: () => navigate('/profile/language') },
    { icon: '🔒', title: 'Privacy & Security', desc: 'Two-factor, data settings' },
  ];
  return (
    <Layout>
      <div className="bg-gradient-to-br from-gray-900 to-green-900 px-5 pt-10 pb-8 flex flex-col items-center gap-3 text-white">
        <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-3xl border-4 border-white/20">👤</div>
        <p className="font-serif text-2xl font-bold">{user?.full_name || 'James Kamau'}</p>
        <p className="text-sm text-gray-400">{user?.role || 'Tenant'} · {user?.segment || 'Rongai, Nairobi'}</p>
        <div className="w-24 h-24 rounded-full border-4 border-green-400 bg-white/10 flex flex-col items-center justify-center mt-2">
          <span className="text-3xl font-bold">{user?.rental_score || 742}</span>
          <span className="text-[10px] opacity-70">RENTAL SCORE</span>
          <span className="text-xs text-green-300 font-semibold">GOOD</span>
        </div>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div className="bg-green-50 rounded-2xl p-4">
          <p className="text-xs font-semibold text-green-700 mb-1">Current Tenancy</p>
          <p className="font-semibold text-gray-900">Searching for a home</p>
          <p className="text-sm text-gray-500 mt-0.5">3 saved properties · 1 viewing booked</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {rows.map((r, i) => (
            <button key={i} onClick={r.action} className="w-full flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 last:border-0 text-left hover:bg-gray-50 transition-colors">
              <span className="text-xl w-7 text-center">{r.icon}</span>
              <div className="flex-1"><p className="font-semibold text-sm text-gray-900">{r.title}</p><p className="text-xs text-gray-400 mt-0.5">{r.desc}</p></div>
              <span className="text-gray-300 text-lg">›</span>
            </button>
          ))}
        </div>
        <button onClick={() => { logout(); navigate('/'); }} className="w-full bg-red-50 text-red-600 font-semibold py-3.5 rounded-2xl border border-red-100 mt-2">
          🚪 Log Out
        </button>
      </div>
    </Layout>
  );
}

// ─── MovingServicesPage.js ───────────────────────────────────────
export function MovingServicesPage() {
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Sign lease agreement', done: true },
    { id: 2, text: 'Pay security deposit', done: true },
    { id: 3, text: 'Book moving company', done: false },
    { id: 4, text: 'Connect electricity (KPLC)', done: false },
    { id: 5, text: 'Set up water meter', done: false },
    { id: 6, text: 'Book internet installation', done: false },
    { id: 7, text: 'Book move-in cleaning', done: false },
    { id: 8, text: 'Complete move-in condition report', done: false },
    { id: 9, text: 'Collect keys from landlord', done: false },
  ]);

  const toggle = (id) => setChecklist(c => c.map(item => item.id === id ? { ...item, done: !item.done } : item));
  const done = checklist.filter(c => c.done).length;

  const services = [
    { cat: '🚚 Moving Companies', items: [{ name: 'SafeMove Kenya', price: 'From Ksh 3,500', rating: '⭐ 4.9 · 312 moves', icon: '🚛' }, { name: 'QuickShift', price: 'From Ksh 2,800', rating: '⭐ 4.7 · 187 moves', icon: '📦' }, { name: 'HamaHama', price: 'From Ksh 4,200', rating: '⭐ 4.8 · 94 moves', icon: '🏗️' }] },
    { cat: '⚡ Utility Setup', items: [{ name: 'KPLC Electricity', price: 'New connection', rating: '🏛️ Official', icon: '💡' }, { name: 'Nairobi Water', price: 'Meter registration', rating: '🏛️ Official', icon: '💧' }] },
    { cat: '📶 Internet', items: [{ name: 'Safaricom Fibre', price: 'From Ksh 2,999/mo', rating: '⭐ 4.5 · 100Mbps', icon: '📡' }, { name: 'Zuku Fibre', price: 'From Ksh 2,499/mo', rating: '⭐ 4.2 · 40Mbps', icon: '🌐' }] },
    { cat: '🧹 Cleaning', items: [{ name: 'CleanNest', price: 'From Ksh 1,800', rating: '⭐ 4.9 · Move-in special', icon: '🧽' }, { name: 'SparklePro', price: 'From Ksh 1,500', rating: '⭐ 4.7 · Same day', icon: '✨' }] },
  ];

  return (
    <Layout>
      <div className="bg-white px-5 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-40">
        <button onClick={() => navigate('/home')} className="text-xl text-gray-500">←</button>
        <span className="font-semibold text-gray-900 flex-1">Moving & Setup Services</span>
      </div>
      <div className="p-5 flex flex-col gap-5">
        <div className="bg-gradient-to-br from-purple-900 to-purple-700 rounded-2xl p-5 text-white">
          <h2 className="font-serif text-2xl font-bold">🚚 Your Move-In Hub</h2>
          <p className="text-sm text-purple-200 mt-2 leading-relaxed">Everything to settle into your new home — movers, utilities, internet, and cleaning. All verified partners.</p>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Move-In Checklist</p>
            <span className="text-xs font-semibold text-green-600">{done}/{checklist.length} done</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
            <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${(done / checklist.length) * 100}%` }} />
          </div>
          {checklist.map(item => (
            <button key={item.id} onClick={() => toggle(item.id)} className="w-full flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 text-left">
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${item.done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                {item.done && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <span className={`text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-900'}`}>{item.text}</span>
            </button>
          ))}
        </div>

        {/* Service categories */}
        {services.map(cat => (
          <div key={cat.cat}>
            <p className="font-semibold text-gray-900 mb-3">{cat.cat}</p>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {cat.items.map(item => (
                <div key={item.name} onClick={() => alert(`Booking ${item.name}...`)} className="flex-shrink-0 w-40 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-green-300 transition-all active:scale-95">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">{item.price}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.rating}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Expat Concierge */}
        <div className="bg-gradient-to-br from-purple-900 to-purple-700 rounded-2xl p-5 text-white">
          <p className="text-xs text-purple-300 uppercase tracking-wider mb-1">Expat & Relocation</p>
          <h3 className="font-serif text-xl font-bold mb-2">✈️ Concierge Setup</h3>
          <p className="text-sm text-purple-200 leading-relaxed mb-4">New to Nairobi? Let our local advisor handle everything — utilities, orientation, neighbourhood tour and more.</p>
          <button onClick={() => alert('Concierge request sent! An advisor will call you within 2 hours.')} className="w-full bg-white text-purple-800 font-bold py-3 rounded-xl text-sm">Book a Relocation Advisor →</button>
        </div>
      </div>
    </Layout>
  );
}

// ─── PropertyDetailPage.js stub ──────────────────────────────────
export function PropertyDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [myLease, setMyLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [showScheduler, setShowScheduler] = useState(false);
  const [banner, setBanner] = useState(null);
  useEffect(() => {
    Promise.all([
      api.get('/properties/' + id),
      api.get('/leases/my').catch(() => ({ data: null })),
    ]).then(([propRes, leaseRes]) => {
      setProperty(propRes.data);
      if (leaseRes.data && String(leaseRes.data.property_id) === String(id)) {
        setMyLease(leaseRes.data);
      }
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);
  const handleBookViewing = async () => {
    if (!scheduledDate) {
      setBanner({ type: 'error', text: 'Please choose a date and time first.' });
      return;
    }
    setBooking(true);
    try {
      await api.post('/properties/' + id + '/view', { scheduled_at: scheduledDate });
      setBanner({ type: 'success', text: 'Viewing request sent! The landlord will confirm shortly.' });
      setShowScheduler(false);
    } catch (err) {
      setBanner({ type: 'error', text: err.response?.data?.error || 'Failed to book viewing.' });
    } finally {
      setBooking(false);
    }
  };
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }
  if (!property) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
          <p className="text-5xl mb-4">Not Found</p>
          <p className="font-semibold text-gray-900">Property not found</p>
          <button onClick={() => navigate('/home')} className="mt-4 text-green-600 font-semibold text-sm">Back to Home</button>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <div className="bg-white px-5 py-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-xl text-gray-500">Back</button>
        <span className="font-semibold text-gray-900 flex-1">Property Detail</span>
      </div>
      {banner && (
        <div className={"mx-5 mt-4 px-4 py-3 rounded-xl text-sm font-medium " + (banner.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200')}>
          {banner.text}
        </div>
      )}
      <div className="p-5">
        <div className="h-48 bg-gradient-to-br from-green-800 to-green-600 rounded-2xl flex items-center justify-center text-5xl mb-5">Property</div>
        <h2 className="font-serif text-2xl font-bold text-gray-900">{property.title}</h2>
        <p className="text-gray-500 text-sm mt-1">{property.estate ? (property.estate + ', ') : ''}{property.town}</p>
        <p className="text-green-600 text-3xl font-bold mt-3">Ksh {Number(property.rent_amount).toLocaleString()}<span className="text-base font-normal text-gray-400"> /month</span></p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{property.bedrooms === 0 ? 'Bedsitter' : (property.bedrooms + ' Bed')}</span>
          {property.is_furnished && <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">Furnished</span>}
          {property.is_new_build && <span className="text-xs bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">New Build</span>}
          <span className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-full">{property.status}</span>
        </div>
        {property.description && (
          <p className="text-sm text-gray-600 mt-4 leading-relaxed">{property.description}</p>
        )}
        <div className="bg-gray-50 rounded-2xl p-4 mt-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Listed by</p>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 text-sm">{property.owner_name}</p>
            {property.owner_verified && <span className="text-green-500 text-xs">Verified</span>}
          </div>
        </div>
        {showScheduler && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mt-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">Choose a viewing date and time</p>
            <input
              type="datetime-local"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500"
              value={scheduledDate}
              onChange={e => setScheduledDate(e.target.value)}
            />
            <button
              onClick={handleBookViewing}
              disabled={booking}
              className="w-full bg-green-500 text-white font-bold py-3 rounded-xl mt-3 disabled:opacity-60"
            >
              {booking ? 'Sending request...' : 'Confirm Viewing Request'}
            </button>
          </div>
        )}
        <div className="flex gap-3 mt-5">
          <button onClick={() => setShowScheduler(!showScheduler)} className="flex-1 bg-green-500 text-white font-bold py-3.5 rounded-2xl">Book Viewing</button>
          {myLease ? (
            <button onClick={() => navigate('/lease/' + myLease.id)} className="flex-1 bg-gray-100 text-gray-900 font-bold py-3.5 rounded-2xl">View Lease</button>
          ) : (
            <button disabled className="flex-1 bg-gray-100 text-gray-400 font-bold py-3.5 rounded-2xl cursor-not-allowed">No Lease Yet</button>
          )}
        </div>
      </div>
    </Layout>
  );
}

export function LeasePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [banner, setBanner] = useState(null);
  useEffect(() => {
    api.get('/leases/' + id)
      .then(res => setLease(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);
  const handleSign = async () => {
    setSigning(true);
    try {
      await api.patch('/leases/' + id + '/sign');
      const res = await api.get('/leases/' + id);
      setLease(res.data);
      setBanner({ type: 'success', text: 'Lease signed! Next step: pay your deposit via M-Pesa.' });
    } catch (err) {
      setBanner({ type: 'error', text: err.response?.data?.error || 'Failed to sign lease.' });
    } finally {
      setSigning(false);
    }
  };
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }
  if (!lease) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
          <p className="font-semibold text-gray-900">Lease not found</p>
          <button onClick={() => navigate('/home')} className="mt-4 text-green-600 font-semibold text-sm">Back to Home</button>
        </div>
      </Layout>
    );
  }
  const isSigned = !!lease.tenant_signed_at;
  const statusLabel = lease.status === 'active' ? { text: 'Active', color: 'bg-green-100 text-green-700' }
    : lease.status === 'pending_landlord' ? { text: 'Awaiting Landlord', color: 'bg-amber-100 text-amber-700' }
    : { text: 'Pending Signature', color: 'bg-amber-100 text-amber-700' };
  return (
    <Layout>
      <div className="bg-white px-5 py-4 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-xl text-gray-500">Back</button>
        <span className="font-semibold text-gray-900 flex-1">Lease Agreement</span>
        <span className={"text-xs font-semibold px-3 py-1 rounded-full " + statusLabel.color}>{statusLabel.text}</span>
      </div>
      {banner && (
        <div className={"mx-5 mt-4 px-4 py-3 rounded-xl text-sm font-medium " + (banner.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200')}>
          {banner.text}
        </div>
      )}
      <div className="p-5 flex flex-col gap-4">
        <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-2xl p-5 text-white">
          <p className="text-xs text-green-300 uppercase tracking-wider mb-1">Lease For</p>
          <h2 className="font-serif text-2xl font-bold">{lease.title}</h2>
          <p className="text-green-200 text-sm mt-1">{lease.estate ? (lease.estate + ', ') : ''}{lease.town}</p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              ['Start', new Date(lease.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })],
              ['End', new Date(lease.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })],
              ['Rent', 'Ksh ' + Number(lease.monthly_rent).toLocaleString()],
            ].map(([l, v]) => (
              <div key={l} className="bg-white/10 rounded-xl p-2 text-center"><p className="text-[10px] text-green-300">{l}</p><p className="font-semibold text-xs mt-0.5">{v}</p></div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          {[
            ['Monthly Rent', 'Ksh ' + Number(lease.monthly_rent).toLocaleString()],
            ['Security Deposit', 'Ksh ' + Number(lease.deposit_amount).toLocaleString()],
            ['Agreement No.', lease.agreement_number],
            ['Status', statusLabel.text],
            ['Landlord', lease.landlord_name + (lease.landlord_verified ? ' (Verified)' : '')],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-500">{l}</span>
              <span className="text-sm font-semibold text-gray-900">{v}</span>
            </div>
          ))}
        </div>
        {isSigned ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-green-700 font-semibold text-sm">You signed this lease on {new Date(lease.tenant_signed_at).toLocaleDateString()}</p>
            <button onClick={() => navigate('/rent')} className="mt-3 w-full bg-green-500 text-white font-bold py-3 rounded-xl">Proceed to Pay Rent</button>
          </div>
        ) : (
          <button onClick={handleSign} disabled={signing} className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl disabled:opacity-60">
            {signing ? 'Signing...' : 'Sign & Submit Lease'}
          </button>
        )}
      </div>
    </Layout>
  );
}

// ─── PersonalDetailsPage.js ─────────────────────────────────────
export function PersonalDetailsPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: user?.full_name || '', phone: user?.phone || '', segment: user?.segment || '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setSaved(false);
    try {
      const res = await api.patch('/users/me', form);
      if (setUser) setUser(res.data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally { setSaving(false); }
  };
  return (
    <Layout>
      <div className="p-5 flex flex-col gap-5 max-w-md">
        <button onClick={() => navigate('/profile')} className="text-gray-400 text-xl self-start">←</button>
        <h1 className="font-serif text-2xl font-bold text-gray-900">Personal Details</h1>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">Full Name</label>
            <input type="text" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">Email</label>
            <input type="email" disabled className="w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-xl px-4 py-3 text-sm outline-none cursor-not-allowed" value={user?.email || ''} />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">Phone (M-Pesa)</label>
            <input type="tel" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">ID Number</label>
            <input type="text" disabled className="w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-xl px-4 py-3 text-sm outline-none cursor-not-allowed" value={user?.id_number || 'Not provided'} />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">Role</label>
            <input type="text" disabled className="w-full bg-gray-100 border border-gray-200 text-gray-500 rounded-xl px-4 py-3 text-sm outline-none cursor-not-allowed capitalize" value={user?.role || ''} />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1.5">Segment</label>
            <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500" value={form.segment} onChange={e => setForm({...form, segment: e.target.value})}>
              <option value="">Not set</option>
              <option value="student">Student / Young Professional</option>
              <option value="expat">Expat / Relocating Professional</option>
              <option value="newbuild">Moving into a New Building</option>
              <option value="family">Family / General Tenant</option>
            </select>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl mt-2 disabled:opacity-60 transition-colors">
            {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>
    </Layout>
  );
}

// ─── LanguagePage.js ────────────────────────────────────────────
export function LanguagePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(user?.language || 'en');
  const [saving, setSaving] = useState(false);
  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'sw', label: 'Kiswahili', native: 'Kiswahili' },
  ];
  const handleSelect = async (code) => {
    setSelected(code);
    setSaving(true);
    try {
      const res = await api.patch('/users/me', { language: code });
      if (setUser) setUser(res.data.user);
    } catch (err) {
      console.error(err);
    } finally { setSaving(false); }
  };
  return (
    <Layout>
      <div className="p-5 flex flex-col gap-5 max-w-md">
        <button onClick={() => navigate('/profile')} className="text-gray-400 text-xl self-start">←</button>
        <h1 className="font-serif text-2xl font-bold text-gray-900">Language</h1>
        <p className="text-sm text-gray-500 -mt-3">Choose the language you'd like to use across HaveNestKe.</p>
        <div className="flex flex-col gap-3">
          {languages.map(l => (
            <button key={l.code} onClick={() => handleSelect(l.code)} disabled={saving} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${selected === l.code ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{l.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{l.native}</p>
              </div>
              {selected === l.code && <span className="text-green-500 text-lg">✅</span>}
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
