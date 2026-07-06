import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(localStorage.getItem('nestkenya_photo') || null);
  const fileRef = useRef();

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target.result;
      setPhoto(data);
      localStorage.setItem('nestkenya_photo', data);
      // Force topbar to re-read from localStorage
      window.dispatchEvent(new Event('nestkenya_photo_updated'));
    };
    reader.readAsDataURL(file);
  };

  const rows = [
    { icon:'👤', title:'Personal Details',   desc:'Name, ID, phone, email',          path:'/profile/personal-details' },
    { icon:'📋', title:'Rental History',     desc:'Previous landlord reviews',        path:'/profile/rental-history'   },
    { icon:'💳', title:'Payment Methods',    desc:'M-Pesa · •••• 5623',              path:'/profile/payment-methods'  },
    { icon:'📦', title:'Moving Services',    desc:'Book movers, cleaners, utilities', path:'/moving'                   },
    { icon:'🔔', title:'Notifications',      desc:'Price drops, new listings',        path:'/profile/notifications'    },
    { icon:'🗣️', title:'Language',           desc:'English · Kiswahili',              path:'/profile/language'         },
    { icon:'🔒', title:'Privacy & Security', desc:'Two-factor, data settings',        path:'/profile/privacy'          },
  ];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 to-green-900 px-5 pt-10 pb-8 flex flex-col items-center gap-3 text-white">
          {/* Photo upload */}
          <div className="relative">
            <div
              onClick={() => fileRef.current.click()}
              className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 cursor-pointer hover:border-green-400 transition-all group"
            >
              {photo
                ? <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-green-600 flex items-center justify-center text-4xl font-bold">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
              }
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <span className="text-2xl">📷</span>
              </div>
            </div>
            <button
              onClick={() => fileRef.current.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-xs hover:bg-green-400 transition-colors"
            >✏️</button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </div>

          <p className="font-serif text-2xl font-bold">{user?.full_name || 'Peter Kamau'}</p>
          <p className="text-sm text-gray-400 capitalize">{user?.role || 'tenant'} · Rongai, Nairobi</p>

          <div className="w-24 h-24 rounded-full border-4 border-green-400 bg-white/10 flex flex-col items-center justify-center mt-2">
            <span className="text-3xl font-bold">{user?.rental_score || 742}</span>
            <span className="text-[10px] opacity-70 uppercase tracking-wider">Rental Score</span>
            <span className="text-xs text-green-300 font-semibold">GOOD</span>
          </div>

          <p className="text-xs text-gray-500 mt-1">Tap photo to change</p>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-3">
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-green-700 mb-1">Current Tenancy</p>
            <p className="font-semibold text-gray-900">Searching for a home</p>
            <p className="text-sm text-gray-500 mt-0.5">3 saved properties · 1 viewing booked</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {rows.map((r, i) => (
              <button key={i} onClick={() => navigate(r.path)}
                className="w-full flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 last:border-0 text-left hover:bg-gray-50 transition-colors">
                <span className="text-xl w-7 text-center">{r.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">{r.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                </div>
                <span className="text-gray-300 text-lg">›</span>
              </button>
            ))}
          </div>

          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full bg-red-50 text-red-600 font-semibold py-3.5 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors mt-2">
            🚪 Log Out
          </button>
        </div>
      </div>
    </Layout>
  );
}
