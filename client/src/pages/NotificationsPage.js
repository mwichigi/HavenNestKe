import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const NOTIF_TYPES = [
  { key:'price_drops',    label:'Price Drops',         desc:'When saved properties reduce rent',        icon:'💰' },
  { key:'new_listings',   label:'New Listings',        desc:'New properties matching your preferences', icon:'🏠' },
  { key:'rent_reminders', label:'Rent Reminders',      desc:'3 days before rent is due',                icon:'📅' },
  { key:'maintenance',    label:'Maintenance Updates', desc:'When landlord responds to requests',       icon:'🔧' },
  { key:'messages',       label:'Messages',            desc:'New messages from landlords',              icon:'💬' },
  { key:'lease_updates',  label:'Lease Updates',       desc:'Signatures, renewals, changes',            icon:'📋' },
  { key:'offers',         label:'Special Offers',      desc:'Partner discounts on moving services',     icon:'🎁' },
];

const RECENT = [
  { id:1, icon:'💰', title:'Price Drop Alert',    body:'Rongai Gardens 1 Bed dropped by Ksh 2,000',              time:'2 hours ago',  read:false },
  { id:2, icon:'🔧', title:'Maintenance Update',  body:'Peter Kamau scheduled your pipe repair for Friday 4 Jul', time:'5 hours ago',  read:false },
  { id:3, icon:'🏠', title:'New Listing',         body:'New 2-bed in Syokimau matching your budget',             time:'Yesterday',    read:true  },
  { id:4, icon:'📅', title:'Rent Reminder',       body:'Your rent of Ksh 18,000 is due in 3 days',               time:'2 days ago',   read:true  },
  { id:5, icon:'💬', title:'New Message',         body:'Grace Muthoni: Viewing confirmed for 10am Saturday',      time:'3 days ago',   read:true  },
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(NOTIF_TYPES.reduce((a, n) => ({ ...a, [n.key]: true }), {}));
  const [notifications, setNotifications] = useState(RECENT);
  const [tab, setTab] = useState('inbox');
  const [saved, setSaved] = useState(false);

  const unread = notifications.filter(n => !n.read).length;
  const markRead = (id) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read:true } : n));
  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read:true })));
  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));
  const savePrefs = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-5">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
          <h1 className="text-xl font-bold text-gray-900 flex-1">Notifications</h1>
          {unread > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread} new</span>}
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
          {[{ key:'inbox', label:`Inbox${unread > 0 ? ` (${unread})` : ''}` }, { key:'settings', label:'Settings' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'inbox' && (
          <div>
            {unread > 0 && (
              <div className="flex justify-end mb-3">
                <button onClick={markAllRead} className="text-xs text-green-600 font-semibold hover:underline">Mark all as read</button>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {notifications.map(n => (
                <div key={n.id} onClick={() => markRead(n.id)}
                  className={`flex gap-3 p-4 rounded-2xl cursor-pointer transition-colors ${n.read ? 'bg-white' : 'bg-green-50 border border-green-100'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${n.read ? 'bg-gray-100' : 'bg-green-100'}`}>{n.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-semibold ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                      {!n.read && <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div>
            {saved && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">✅ Preferences saved!</div>}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
              {NOTIF_TYPES.map((n, i) => (
                <div key={n.key} className={`flex items-center gap-4 px-5 py-4 ${i < NOTIF_TYPES.length-1 ? 'border-b border-gray-100' : ''}`}>
                  <span className="text-xl w-7 text-center">{n.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{n.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
                  </div>
                  <button onClick={() => toggle(n.key)}
                    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${prefs[n.key] ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${prefs[n.key] ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={savePrefs} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-colors">
              💾 Save Preferences
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
