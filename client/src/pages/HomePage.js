import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const FILTER_TYPES = ['All','Bedsitter','1 Bed','2 Beds','3+ Beds','Furnished','New Build'];

const DEMO = [
  { id:1,  title:'Rongai Gardens Apartments',        town:'Rongai',    estate:'Tumaini Estate',     rent_amount:18000, bedrooms:1, status:'available', is_verified:true,  is_new_build:false, is_furnished:false },
  { id:2,  title:'Rongai Gardens Block B — 2 Bed',   town:'Rongai',    estate:'Tumaini Estate',     rent_amount:24000, bedrooms:2, status:'available', is_verified:true,  is_new_build:false, is_furnished:false },
  { id:3,  title:'Rongai Executive Studio',          town:'Rongai',    estate:'Gataka',             rent_amount:12000, bedrooms:0, status:'available', is_verified:true,  is_new_build:false, is_furnished:false },
  { id:4,  title:'Kitengela Heights — 2 Bed',        town:'Kitengela', estate:'Milimani Estate',    rent_amount:25000, bedrooms:2, status:'available', is_verified:true,  is_new_build:true,  is_furnished:false },
  { id:5,  title:'Kitengela Heights — 3 Bed',        town:'Kitengela', estate:'Milimani Estate',    rent_amount:38000, bedrooms:3, status:'available', is_verified:true,  is_new_build:true,  is_furnished:false },
  { id:6,  title:'Thika Road Suites — Furnished',    town:'Ruiru',     estate:'Tatu City Area',     rent_amount:35000, bedrooms:2, status:'available', is_verified:true,  is_new_build:false, is_furnished:true  },
  { id:7,  title:'Juja Green Apartments — Bedsitter',town:'Juja',      estate:'Juja Farm',          rent_amount:9500,  bedrooms:0, status:'available', is_verified:true,  is_new_build:false, is_furnished:false },
  { id:8,  title:'Juja Green Apartments — 1 Bed',    town:'Juja',      estate:'Juja Farm',          rent_amount:14000, bedrooms:1, status:'available', is_verified:true,  is_new_build:false, is_furnished:false },
  { id:9,  title:'Syokimau Luxury Apartments',       town:'Syokimau',  estate:'Airport North Road', rent_amount:32000, bedrooms:2, status:'available', is_verified:true,  is_new_build:false, is_furnished:false },
  { id:10, title:'Ruiru Budget Bedsitter',           town:'Ruiru',     estate:'Ruiru Town',         rent_amount:8000,  bedrooms:0, status:'available', is_verified:false, is_new_build:false, is_furnished:false },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [properties, setProperties]     = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading]           = useState(true);
  const [searchQuery, setSearchQuery]   = useState('');

  // Read search query from URL (?search=rongai)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search') || '';
    setSearchQuery(q);
  }, [location.search]);

  useEffect(() => {
    api.get('/properties')
      .then(res => setProperties(res.data.properties || []))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const base = properties.length > 0 ? properties : DEMO;

  // Apply search filter
  const afterSearch = searchQuery
    ? base.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())   ||
        p.town.toLowerCase().includes(searchQuery.toLowerCase())    ||
        (p.estate || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : base;

  // Apply chip filter
  const display = afterSearch.filter(p => {
    if (activeFilter === 'All')       return true;
    if (activeFilter === 'Bedsitter') return p.bedrooms === 0;
    if (activeFilter === '1 Bed')     return p.bedrooms === 1;
    if (activeFilter === '2 Beds')    return p.bedrooms === 2;
    if (activeFilter === '3+ Beds')   return p.bedrooms >= 3;
    if (activeFilter === 'Furnished') return p.is_furnished;
    if (activeFilter === 'New Build') return p.is_new_build;
    return true;
  });

  return (
    <Layout>
      {/* HERO */}
      <div className="bg-gradient-to-br from-gray-900 to-green-900 px-5 md:px-10 pt-8 pb-10 text-white">
        <p className="text-sm text-gray-400 mb-1">{greeting()}, {user?.full_name?.split(' ')[0] || 'there'} 👋</p>
        <h1 className="font-serif text-2xl md:text-4xl font-bold leading-tight mb-6">
          Find your <span className="text-green-400">perfect</span> home in Kenya
        </h1>

        {/* Mobile search bar */}
        <MobileSearch navigate={navigate} />

        {/* Desktop stats */}
        <div className="hidden md:grid grid-cols-4 gap-4 mt-6">
          {[
            { label:'Properties Listed',  value:'10+', icon:'🏠' },
            { label:'Verified Landlords', value:'8',   icon:'✅' },
            { label:'Towns Covered',      value:'5',   icon:'📍' },
            { label:'Your Rental Score',  value: user?.rental_score || 600, icon:'⭐' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 md:px-10 py-6">

        {/* Score + Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-2xl p-4 text-white flex items-center gap-4 cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="w-16 h-16 rounded-full bg-white/20 border-4 border-white/40 flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold leading-none">{user?.rental_score || 600}</span>
              <span className="text-[9px] opacity-80">SCORE</span>
            </div>
            <div>
              <h4 className="font-semibold text-base">Your Rental Score: Good</h4>
              <p className="text-sm opacity-85 mt-0.5 leading-snug">Pay rent on time to reach Excellent. Landlords trust scores above 800.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon:'💳', label:'Pay Rent',  path:'/rent'        },
                { icon:'🔧', label:'Repairs',   path:'/maintenance' },
                { icon:'📦', label:'Moving',    path:'/moving'      },
                { icon:'🗺️', label:'Map',       path:'/map'         },
              ].map(a => (
                <button key={a.path} onClick={() => navigate(a.path)}
                  className="bg-gray-50 hover:bg-green-50 rounded-xl p-3 flex flex-col items-center gap-1.5 transition-all border border-gray-100 hover:border-green-200">
                  <span className="text-2xl">{a.icon}</span>
                  <span className="text-[11px] font-medium text-gray-600">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search result banner */}
        {searchQuery && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
            <p className="text-sm text-green-700">
              🔍 Showing <strong>{display.length}</strong> result{display.length !== 1 ? 's' : ''} for "<strong>{searchQuery}</strong>"
            </p>
            <button
              onClick={() => { setSearchQuery(''); navigate('/home'); }}
              className="text-xs text-green-600 font-semibold hover:underline"
            >
              Clear ✕
            </button>
          </div>
        )}

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5">
          {FILTER_TYPES.map(f => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                activeFilter === f ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-500 hover:border-green-300'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* Properties grid */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-gray-900 text-lg">
            🏠 {searchQuery ? `Results for "${searchQuery}"` : 'Properties Near You'}
          </span>
          <button onClick={() => navigate('/map')} className="text-sm text-green-600 font-medium hover:underline">
            View on map →
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_,i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : display.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <p className="font-semibold text-gray-900 text-lg">No properties found</p>
            <p className="text-gray-400 text-sm mt-1">Try searching for Rongai, Kitengela, Juja, Ruiru or Syokimau</p>
            <button onClick={() => { setSearchQuery(''); setActiveFilter('All'); navigate('/home'); }}
              className="mt-4 bg-green-500 text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-green-600 transition-colors">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {display.map(p => (
              <PropertyCard key={p.id} property={p} onClick={() => navigate(`/property/${p.id}`)} />
            ))}
          </div>
        )}

        {/* New Builds */}
        {!searchQuery && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-gray-900 text-lg">🏗️ Pre-register: New Builds</span>
              <span className="text-sm text-green-600 font-medium cursor-pointer hover:underline">See all</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id:11, title:'Juja Green Phase 2',  town:'Juja',      rent_amount:15000, opens:'Oct 2026', registered:23 },
                { id:12, title:'Rongai Executive',    town:'Rongai',    rent_amount:30000, opens:'Jan 2027', registered:11 },
                { id:13, title:'Kitengela Park View', town:'Kitengela', rent_amount:22000, opens:'Mar 2027', registered:7  },
              ].map(p => (
                <div key={p.id}
                  onClick={() => alert('Pre-registration saved! You will be first notified.')}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-gray-100 hover:border-green-200">
                  <div className="h-36 bg-gradient-to-br from-amber-800 to-amber-600 flex items-center justify-center relative">
                    <span className="text-5xl">🏗️</span>
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">Opening {p.opens}</span>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-gray-900">{p.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">📍 {p.town}</p>
                    <p className="text-green-600 font-bold mt-2">From Ksh {p.rent_amount.toLocaleString()}<span className="text-xs text-gray-400 font-normal"> /mo</span></p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-400">👥 {p.registered} pre-registered</span>
                      <button className="text-xs bg-green-50 text-green-700 font-semibold px-3 py-1.5 rounded-full hover:bg-green-100 transition-colors">Pre-register →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Mobile search bar component
function MobileSearch({ navigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);

  const PROPS = [
    { id:1, title:'Rongai Gardens Apartments',        town:'Rongai',    rent_amount:18000, bedrooms:1 },
    { id:4, title:'Kitengela Heights — 2 Bed',        town:'Kitengela', rent_amount:25000, bedrooms:2 },
    { id:7, title:'Juja Green Apartments — Bedsitter',town:'Juja',      rent_amount:9500,  bedrooms:0 },
    { id:9, title:'Syokimau Luxury Apartments',       town:'Syokimau',  rent_amount:32000, bedrooms:2 },
    { id:6, title:'Thika Road Suites — Furnished',    town:'Ruiru',     rent_amount:35000, bedrooms:2 },
  ];

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setResults([]); setShow(false); return; }
    const matched = PROPS.filter(p =>
      p.title.toLowerCase().includes(q) || p.town.toLowerCase().includes(q)
    );
    setResults(matched);
    setShow(true);
  }, [query]);

  return (
    <div className="md:hidden relative">
      <div className="w-full bg-white rounded-full px-4 py-3 flex items-center gap-3">
        <span className="text-green-500 text-lg">🔍</span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && query) {
              setShow(false);
              navigate(`/home?search=${encodeURIComponent(query)}`);
            }
          }}
          className="flex-1 outline-none text-gray-700 text-sm bg-transparent"
          placeholder="Search area, estate, town..."
        />
        {query && <button onClick={() => { setQuery(''); setShow(false); }} className="text-gray-400 text-sm">✕</button>}
      </div>
      {show && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl overflow-hidden z-50">
          {results.map(p => (
            <button key={p.id} onClick={() => { setQuery(''); setShow(false); navigate(`/property/${p.id}`); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 text-left border-b border-gray-50 last:border-0">
              <span className="text-lg">🏢</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                <p className="text-xs text-gray-400">📍 {p.town}</p>
              </div>
              <p className="text-sm font-bold text-green-600">Ksh {p.rent_amount.toLocaleString()}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyCard({ property, onClick }) {
  return (
    <div onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100">
      <div className="h-40 bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center relative">
        <span className="text-5xl">🏢</span>
        <span className="absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
          {property.is_new_build ? '🆕 New Build' : '✅ Available'}
        </span>
      </div>
      <div className="p-4">
        <p className="font-semibold text-gray-900 truncate">{property.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">📍 {property.town}</p>
        <p className="text-green-600 font-bold text-lg mt-2">
          Ksh {Number(property.rent_amount).toLocaleString()}
          <span className="text-xs text-gray-400 font-normal"> /mo</span>
        </p>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {property.bedrooms === 0 ? 'Bedsitter' : `${property.bedrooms} Bed`}
          </span>
          {property.is_verified && <span className="text-[11px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full">✅ Verified</span>}
          {property.is_furnished && <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">🛋️ Furnished</span>}
        </div>
      </div>
    </div>
  );
}
