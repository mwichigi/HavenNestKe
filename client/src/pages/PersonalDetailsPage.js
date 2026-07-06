import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function PersonalDetailsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name:'', email:'', phone:'', id_number:'', role:'', segment:'' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        email:     user.email     || '',
        phone:     user.phone     || '',
        id_number: user.id_number || '',
        role:      user.role      || '',
        segment:   user.segment   || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/users/me', {
        full_name: form.full_name,
        phone:     form.phone,
        segment:   form.segment,
      });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      // Save locally if backend not connected
      localStorage.setItem('nestkenya_profile', JSON.stringify(form));
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key:'full_name', label:'Full Name',      type:'text',  editable:true  },
    { key:'email',     label:'Email',          type:'email', editable:false },
    { key:'phone',     label:'Phone (M-Pesa)', type:'tel',   editable:true  },
    { key:'id_number', label:'ID Number',      type:'text',  editable:true  },
    { key:'role',      label:'Role',           type:'text',  editable:false },
  ];

  return (
    <Layout>
      <div className="max-w-xl mx-auto p-5">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
          <h1 className="text-xl font-bold text-gray-900 flex-1">Personal Details</h1>
          <button
            onClick={() => setEditing(!editing)}
            className="text-sm text-green-600 font-semibold hover:underline"
          >
            {editing ? 'Cancel' : '✏️ Edit'}
          </button>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
            ✅ Details saved successfully!
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          {fields.map((f, i) => (
            <div key={f.key} className={`px-5 py-4 ${i < fields.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                {f.label} {!f.editable && <span className="text-gray-300">(cannot be changed)</span>}
              </label>
              {editing && f.editable ? (
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full bg-gray-50 border border-green-300 rounded-xl px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                />
              ) : (
                <p className="text-sm text-gray-900 font-medium">
                  {form[f.key] || <span className="text-gray-400 italic">Not provided</span>}
                </p>
              )}
            </div>
          ))}

          <div className="px-5 py-4">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Segment</label>
            {editing ? (
              <select
                value={form.segment}
                onChange={e => setForm({ ...form, segment: e.target.value })}
                className="w-full bg-gray-50 border border-green-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500"
              >
                <option value="">Not set</option>
                <option value="student">Student / Young Professional</option>
                <option value="expat">Expat / Relocating Professional</option>
                <option value="newbuild">New Build Tenant</option>
                <option value="family">Family / General Tenant</option>
              </select>
            ) : (
              <p className="text-sm text-gray-900 font-medium capitalize">
                {form.segment || <span className="text-gray-400 italic">Not set</span>}
              </p>
            )}
          </div>
        </div>

        {editing && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl text-base transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        )}
      </div>
    </Layout>
  );
}
