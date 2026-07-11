// Hardcoded admin email — this account can never be deleted
const PROTECTED_ADMIN_EMAILS = ["ngangamj828@gmail.com", "jameskarira820@gmail.com"];

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const TABS = [
  { key: 'stats', label: 'Overview' },
  { key: 'users', label: 'Users' },
  { key: 'properties', label: 'Properties' },
  { key: 'payments', label: 'Payments' },
  { key: 'activity', label: 'Activity Logs' },
  { key: 'errors', label: 'Error Logs' },
];

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/home');
    }
  }, [user, navigate]);

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      try {
        if (tab === 'stats') {
          const res = await api.get('/admin/stats');
          setStats(res.data);
        } else if (tab === 'users') {
          const res = await api.get('/admin/users');
          setUsers(res.data.users);
        } else if (tab === 'properties') {
          const res = await api.get('/admin/properties');
          setProperties(res.data.properties);
        } else if (tab === 'payments') {
          const res = await api.get('/admin/payments');
          setPayments(res.data.payments);
        } else if (tab === 'activity') {
          const res = await api.get('/admin/logs/activity');
          setActivityLogs(res.data.logs);
        } else if (tab === 'errors') {
          const res = await api.get('/admin/logs/errors');
          setErrorLogs(res.data.logs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tab]);

  const deleteUser = async (id) => {
    const target = users.find(u => u.id === id);
    if (PROTECTED_ADMIN_EMAILS.includes(target?.email)) {
      alert('The admin account cannot be deleted. It is protected.');
      return;
    }
    try {
      await api.delete('/admin/users/' + id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert('Failed to delete user: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteProperty = async (id) => {
    if (!window.confirm('Delete this property permanently?')) return;
    await api.delete(`/admin/properties/${id}`);
    setProperties(properties.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col min-h-screen">
        <div className="px-6 py-6 border-b border-gray-800">
          <p className="font-serif text-xl font-bold text-green-400">HaveNestKe</p>
          <p className="text-gray-500 text-xs mt-1">Admin Control Panel</p>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-6 flex-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.key ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-800">
          <button onClick={() => navigate('/home')} className="w-full text-xs text-gray-500 hover:text-white text-left px-2 py-2">
            ← Back to site
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && tab === 'stats' && stats && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Site Overview</h1>
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Active Leases</p>
                <p className="text-3xl font-bold">{stats.activeLeases}</p>
              </div>
              <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-400">Ksh {Number(stats.totalRevenue).toLocaleString()}</p>
              </div>
              <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Open Maintenance</p>
                <p className="text-3xl font-bold text-amber-400">{stats.openMaintenance}</p>
              </div>
              <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total Users</p>
                <p className="text-3xl font-bold">{stats.usersByRole.reduce((sum, r) => sum + Number(r.count), 0)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <p className="font-semibold mb-3">Users by Role</p>
                {stats.usersByRole.map(r => (
                  <div key={r.role} className="flex justify-between text-sm py-1.5 border-b border-gray-800 last:border-0">
                    <span className="text-gray-400 capitalize">{r.role}</span>
                    <span className="font-semibold">{r.count}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                <p className="font-semibold mb-3">Properties by Status</p>
                {stats.propertiesByStatus.map(p => (
                  <div key={p.status} className="flex justify-between text-sm py-1.5 border-b border-gray-800 last:border-0">
                    <span className="text-gray-400 capitalize">{p.status}</span>
                    <span className="font-semibold">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && tab === 'users' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Users ({users.length})</h1>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Score</th>
                  <th className="pb-3 pr-4">Joined</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-gray-900 hover:bg-gray-900/50">
                    <td className="py-3 pr-4">{u.full_name}</td>
                    <td className="py-3 pr-4 text-gray-400">{u.email}</td>
                    <td className="py-3 pr-4 capitalize">{u.role}</td>
                    <td className="py-3 pr-4">{u.rental_score}</td>
                    <td className="py-3 pr-4 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      {PROTECTED_ADMIN_EMAILS.includes(u.email) ? (
                        <span className="text-gray-600 text-xs font-semibold">Protected</span>
                      ) : (
                        <button onClick={() => deleteUser(u.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === 'properties' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Properties ({properties.length})</h1>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="pb-3 pr-4">Title</th>
                  <th className="pb-3 pr-4">Owner</th>
                  <th className="pb-3 pr-4">Town</th>
                  <th className="pb-3 pr-4">Rent</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {properties.map(p => (
                  <tr key={p.id} className="border-b border-gray-900 hover:bg-gray-900/50">
                    <td className="py-3 pr-4">{p.title}</td>
                    <td className="py-3 pr-4 text-gray-400">{p.owner_name || '—'}</td>
                    <td className="py-3 pr-4">{p.town}</td>
                    <td className="py-3 pr-4">Ksh {Number(p.rent_amount).toLocaleString()}</td>
                    <td className="py-3 pr-4 capitalize">{p.status}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => deleteProperty(p.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === 'payments' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Payments ({payments.length})</h1>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="pb-3 pr-4">Tenant</th>
                  <th className="pb-3 pr-4">Property</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-gray-900 hover:bg-gray-900/50">
                    <td className="py-3 pr-4">{p.tenant_name}</td>
                    <td className="py-3 pr-4 text-gray-400">{p.property_title}</td>
                    <td className="py-3 pr-4">Ksh {Number(p.amount).toLocaleString()}</td>
                    <td className={`py-3 pr-4 capitalize ${p.status === 'paid' ? 'text-green-400' : 'text-amber-400'}`}>{p.status}</td>
                    <td className="py-3 pr-4 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === 'activity' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Activity Logs ({activityLogs.length})</h1>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Action</th>
                  <th className="pb-3 pr-4">Details</th>
                  <th className="pb-3 pr-4">IP</th>
                  <th className="pb-3 pr-4">When</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.map(l => (
                  <tr key={l.id} className="border-b border-gray-900 hover:bg-gray-900/50">
                    <td className="py-3 pr-4">{l.full_name || 'System'}</td>
                    <td className="py-3 pr-4 font-semibold text-green-400">{l.action}</td>
                    <td className="py-3 pr-4 text-gray-400">{l.details || '—'}</td>
                    <td className="py-3 pr-4 text-gray-500">{l.ip_address || '—'}</td>
                    <td className="py-3 pr-4 text-gray-500">{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === 'errors' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">Error Logs ({errorLogs.length})</h1>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="pb-3 pr-4">Method</th>
                  <th className="pb-3 pr-4">Path</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Message</th>
                  <th className="pb-3 pr-4">When</th>
                </tr>
              </thead>
              <tbody>
                {errorLogs.map(l => (
                  <tr key={l.id} className="border-b border-gray-900 hover:bg-gray-900/50">
                    <td className="py-3 pr-4">{l.method}</td>
                    <td className="py-3 pr-4 text-gray-400">{l.path}</td>
                    <td className="py-3 pr-4 text-red-400">{l.status_code}</td>
                    <td className="py-3 pr-4 text-gray-400">{l.message}</td>
                    <td className="py-3 pr-4 text-gray-500">{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
