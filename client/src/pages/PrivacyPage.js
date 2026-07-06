import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const Toggle = ({ value, onChange }) => (
  <button onClick={onChange} className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-green-500' : 'bg-gray-300'}`}>
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-7' : 'left-1'}`} />
  </button>
);

export default function PrivacyPage() {
  const navigate = useNavigate();
  const [twoFactor,   setTwoFactor]   = useState(false);
  const [showProfile, setShowProfile] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [showPwForm,  setShowPwForm]  = useState(false);
  const [passwords,   setPasswords]   = useState({ current:'', newPass:'', confirm:'' });
  const [flash,       setFlash]       = useState('');

  const save = (msg) => { setFlash(msg); setTimeout(() => setFlash(''), 2500); };

  const changePw = () => {
    if (!passwords.current)               { alert('Enter your current password.'); return; }
    if (passwords.newPass.length < 8)     { alert('New password must be at least 8 characters.'); return; }
    if (passwords.newPass !== passwords.confirm) { alert('Passwords do not match.'); return; }
    setPasswords({ current:'', newPass:'', confirm:'' });
    setShowPwForm(false);
    save('Password changed successfully!');
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto p-5">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
          <h1 className="text-xl font-bold text-gray-900">Privacy & Security</h1>
        </div>

        {flash && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">✅ {flash}</div>}

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Security</p>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
            <span className="text-xl">🔐</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Two-Factor Authentication</p>
              <p className="text-xs text-gray-400 mt-0.5">Secure your account with SMS verification</p>
            </div>
            <Toggle value={twoFactor} onChange={() => { setTwoFactor(!twoFactor); save(`Two-factor ${!twoFactor ? 'enabled' : 'disabled'}.`); }} />
          </div>

          <div className="px-5 py-4 border-b border-gray-100">
            <button onClick={() => setShowPwForm(!showPwForm)} className="w-full flex items-center gap-4 text-left">
              <span className="text-xl">🔑</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Change Password</p>
                <p className="text-xs text-gray-400 mt-0.5">Update your login password</p>
              </div>
              <span className="text-gray-400 text-sm">{showPwForm ? '▲' : '▼'}</span>
            </button>
            {showPwForm && (
              <div className="mt-4 flex flex-col gap-3">
                {[
                  { key:'current', label:'Current Password',  ph:'••••••••'         },
                  { key:'newPass', label:'New Password',      ph:'Min 8 characters' },
                  { key:'confirm', label:'Confirm Password',  ph:'Repeat new password' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">{f.label}</label>
                    <input type="password" placeholder={f.ph} value={passwords[f.key]}
                      onChange={e => setPasswords({ ...passwords, [f.key]: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400" />
                  </div>
                ))}
                <button onClick={changePw} className="w-full bg-green-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-green-600 transition-colors">
                  Update Password
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 px-5 py-4">
            <span className="text-xl">📱</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Active Sessions</p>
              <p className="text-xs text-gray-400 mt-0.5">This device · Chrome · Nairobi, Kenya</p>
            </div>
            <button onClick={() => save('All other sessions signed out.')} className="text-xs text-red-500 font-semibold hover:underline">Sign out others</button>
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Privacy</p>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
            <span className="text-xl">👁️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Public Profile</p>
              <p className="text-xs text-gray-400 mt-0.5">Landlords can see your rental score and history</p>
            </div>
            <Toggle value={showProfile} onChange={() => { setShowProfile(!showProfile); save('Profile visibility updated.'); }} />
          </div>
          <div className="flex items-center gap-4 px-5 py-4">
            <span className="text-xl">📊</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Anonymous Data Sharing</p>
              <p className="text-xs text-gray-400 mt-0.5">Help improve NestKenya with anonymous usage data</p>
            </div>
            <Toggle value={dataSharing} onChange={() => { setDataSharing(!dataSharing); save('Data sharing preference saved.'); }} />
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Danger Zone</p>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button onClick={() => { if(window.confirm('Download all your data?')) save('Data export started. Check your email shortly.'); }}
            className="w-full flex items-center gap-4 px-5 py-4 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors">
            <span className="text-xl">📥</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Download My Data</p>
              <p className="text-xs text-gray-400 mt-0.5">Get a copy of all your NestKenya data</p>
            </div>
            <span className="text-gray-300">›</span>
          </button>
          <button onClick={() => { if(window.confirm('Delete your account? This cannot be undone.')) alert('Deletion requested. Our team will contact you within 24 hours.'); }}
            className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-red-50 transition-colors">
            <span className="text-xl">🗑️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-600">Delete Account</p>
              <p className="text-xs text-gray-400 mt-0.5">Permanently delete your account and all data</p>
            </div>
            <span className="text-red-300">›</span>
          </button>
        </div>
      </div>
    </Layout>
  );
}
