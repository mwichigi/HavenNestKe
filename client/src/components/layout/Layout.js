import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

const ADMIN_EMAIL = 'ngangamj828@gmail.com';

const navItems = [
  { path:'/home',        icon:'🏠', label:'Home'    },
  { path:'/map',         icon:'🗺️', label:'Map'     },
  { path:'/rent',        icon:'💳', label:'Rent'    },
  { path:'/maintenance', icon:'🔧', label:'Repairs' },
  { path:'/moving',      icon:'📦', label:'Moving'  },
  { path:'/profile',     icon:'👤', label:'Profile' },
];

const ALL_PROPERTIES = [
  { id:1,  title:'Rongai Gardens Apartments',        town:'Rongai',    estate:'Tumaini Estate',     type:'apartment', bedrooms:1, rent:18000 },
  { id:2,  title:'Rongai Gardens Block B — 2 Bed',   town:'Rongai',    estate:'Tumaini Estate',     type:'apartment', bedrooms:2, rent:24000 },
  { id:3,  title:'Rongai Executive Studio',          town:'Rongai',    estate:'Gataka',             type:'studio',    bedrooms:0, rent:12000 },
  { id:4,  title:'Kitengela Heights — 2 Bed',        town:'Kitengela', estate:'Milimani Estate',    type:'apartment', bedrooms:2, rent:25000 },
  { id:5,  title:'Kitengela Heights — 3 Bed',        town:'Kitengela', estate:'Milimani Estate',    type:'apartment', bedrooms:3, rent:38000 },
  { id:6,  title:'Thika Road Suites — Furnished',    town:'Ruiru',     estate:'Tatu City Area',     type:'apartment', bedrooms:2, rent:35000 },
  { id:7,  title:'Juja Green Apartments — Bedsitter',town:'Juja',      estate:'Juja Farm',          type:'apartment', bedrooms:0, rent:9500  },
  { id:8,  title:'Juja Green Apartments — 1 Bed',    town:'Juja',      estate:'Juja Farm',          type:'apartment', bedrooms:1, rent:14000 },
  { id:9,  title:'Syokimau Luxury Apartments',       town:'Syokimau',  estate:'Airport North Road', type:'apartment', bedrooms:2, rent:32000 },
  { id:10, title:'Ruiru Budget Bedsitter',           town:'Ruiru',     estate:'Ruiru Town',         type:'studio',    bedrooms:0, rent:8000  },
];

export default function Layout({ children }) {
  const navigate     = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [photo, setPhoto]       = useState(localStorage.getItem('nestkenya_photo') || null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const searchRef = useRef();

  // Only show Admin Panel for the hardcoded admin email
  const isAdmin = user?.email === ADMIN_EMAIL || user?.role === 'admin';

  useEffect(() => {
    const handler = () => setPhoto(localStorage.getItem('nestkenya_photo'));
    window.addEventListener('nestkenya_photo_updated', handler);
    return () => window.removeEventListener('nestkenya_photo_updated', handler);
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setResults([]); setShowDrop(false); return; }
    const matched = ALL_PROPERTIES.filter(p =>
      p.title.toLowerCase().includes(q)  ||
      p.town.toLowerCase().includes(q)   ||
      p.estate.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)   ||
      String(p.rent).includes(q)
    ).slice(0, 6);
    setResults(matched);
    setShowDrop(true);
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (prop) => {
    setQuery(''); setShowDrop(false);
    navigate(`/property/${prop.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      setShowDrop(false);
      navigate(`/home?search=${encodeURIComponent(query.trim())}`);
    }
    if (e.key === 'Escape') { setShowDrop(false); setQuery(''); }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── SIDEBAR (desktop) ── */}
      <aside className="hidden md:flex flex-col w-56 lg:w-64 bg-gray-900 min-h-screen fixed left-0 top-0 z-50">
        <div className="px-6 py-6 border-b border-gray-800">
          <span className="font-serif text-2xl font-bold text-white cursor-pointer" onClick={() => navigate('/home')}>
            Have<span className="text-green-400">NestKe</span>
          </span>
          <p className="text-gray-500 text-xs mt-1">Your complete home journey</p>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-6 flex-1">
          {navItems.map(item => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left w-full ${
                  isActive ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}>
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-800">
          <div className="bg-green-900 rounded-xl p-3 text-center">
            <p className="text-green-300 text-xs font-semibold">HaveNestKe v1.0</p>
            <p className="text-gray-500 text-xs mt-0.5">Nairobi, Kenya 🇰🇪</p>
          </div>
        </div>
      </aside>
      {/* ── MOBILE TOP BAR ── */}
      <header className="md:hidden flex items-center justify-between bg-gray-900 px-4 py-3 sticky top-0 z-50">
        <button onClick={() => setMenuOpen(true)} className="text-white text-2xl leading-none p-1">☰</button>
        <span className="font-serif text-lg font-bold text-white cursor-pointer" onClick={() => navigate('/home')}>
          Have<span className="text-green-400">NestKe</span>
        </span>
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileSearchOpen(s => !s)} className="text-white text-lg">🔍</button>
          {isAdmin && (
            <button onClick={() => navigate('/admin')} className="text-white text-lg">🛡️</button>
          )}
          <button onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full overflow-hidden border-2 border-green-400 flex-shrink-0">
            {photo
              ? <img src={photo} alt="Profile" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
            }
          </button>
        </div>
      </header>

      {/* ── MOBILE SEARCH (expandable) ── */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-white px-4 py-3 border-b border-gray-200 sticky top-[52px] z-40">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Search area, estate, town, property..."
          />
          {showDrop && results.length > 0 && (
            <div className="mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {results.map(prop => (
                <button key={prop.id} onClick={() => { handleSelect(prop); setMobileSearchOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left border-b border-gray-50 last:border-0">
                  <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-base flex-shrink-0">🏢</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{prop.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">📍 {prop.town} · {prop.estate}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MOBILE DRAWER ── */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] flex">
          <div className="w-72 bg-gray-900 h-full flex flex-col">
            <div className="px-6 py-6 border-b border-gray-800 flex items-center justify-between">
              <span className="font-serif text-xl font-bold text-white">
                Have<span className="text-green-400">NestKe</span>
              </span>
              <button onClick={() => setMenuOpen(false)} className="text-gray-400 text-2xl leading-none">×</button>
            </div>
            <nav className="flex flex-col gap-1 px-3 py-6 flex-1 overflow-y-auto">
              {navItems.map(item => {
                const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                return (
                  <button key={item.path} onClick={() => { navigate(item.path); setMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left w-full ${
                      isActive ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}>
                    <span className="text-lg">{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
              {isAdmin && (
                <button onClick={() => { navigate('/admin'); setMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left w-full text-gray-400 hover:bg-gray-800 hover:text-white mt-2 border-t border-gray-800 pt-4">
                  <span className="text-lg">🛡️</span>
                  Admin Panel
                </button>
              )}
            </nav>
            <div className="px-4 py-4 border-t border-gray-800">
              <button onClick={() => { logout(); navigate('/'); }} className="w-full text-xs text-red-400 border border-red-800 px-3 py-2.5 rounded-full">
                Log out
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMenuOpen(false)}></div>
        </div>
      )}

      {/* ── MAIN ── */}
      <div className="flex flex-col flex-1 md:ml-56 lg:ml-64 min-h-screen">

        {/* Top bar */}
        <header className="hidden md:flex items-center justify-between bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-40">

          {/* Admin Panel button — ONLY for admin account */}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors flex-shrink-0 mr-4"
            >
              🛡️ Admin Panel
            </button>
          )}

          {/* Search */}
          <div ref={searchRef} className="relative flex items-center flex-1 max-w-lg">
            <span className="text-gray-400 text-lg absolute left-4 z-10">🔍</span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query && setShowDrop(true)}
              className="w-full bg-gray-100 rounded-full pl-11 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-green-400 transition-all"
              placeholder="Search area, estate, town, property..."
            />
            {showDrop && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {results.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-gray-400 text-center">
                    No properties found for "<strong>{query}</strong>"
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                      </p>
                    </div>
                    {results.map(prop => (
                      <button key={prop.id} onClick={() => handleSelect(prop)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left border-b border-gray-50 last:border-0">
                        <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center text-base flex-shrink-0">🏢</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{prop.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">📍 {prop.town} · {prop.estate}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-green-600">Ksh {prop.rent.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">{prop.bedrooms === 0 ? 'Bedsitter' : `${prop.bedrooms} Bed`}</p>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => { setShowDrop(false); navigate(`/home?search=${encodeURIComponent(query)}`); }}
                      className="w-full px-4 py-3 text-sm text-green-600 font-semibold hover:bg-green-50 transition-colors text-center">
                      See all results for "{query}" →
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4 ml-6">
            <button className="relative text-gray-500 hover:text-gray-800 transition-colors" onClick={() => navigate('/profile/notifications')}>
              <span className="text-xl">🔔</span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <button onClick={() => navigate('/rent')}
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
              💳 Pay Rent
            </button>
            <button onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-green-200 hover:border-green-500 transition-all flex-shrink-0">
              {photo
                ? <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
              }
            </button>
          </div>
        </header>

        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>

      {/* ── BOTTOM NAV (mobile) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex">
          {navItems.slice(0, 5).map(item => {
            const isActive = pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)}
                className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                <span className="text-xl">{item.icon}</span>
                <span className={`text-[10px] font-medium ${isActive ? 'text-green-600' : 'text-gray-400'}`}>{item.label}</span>
                {isActive && <div className="w-1 h-1 rounded-full bg-green-500 mt-0.5" />}
              </button>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
