import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const INITIAL = [
  { id:1, type:'mpesa', name:'M-Pesa',      detail:'0712 000 001',     icon:'📱', color:'bg-green-50', border:'border-green-200', default:true  },
  { id:2, type:'bank',  name:'Equity Bank', detail:'Account •••• 7821',icon:'🏦', color:'bg-blue-50',  border:'border-blue-200',  default:false },
];

export default function PaymentMethodsPage() {
  const navigate = useNavigate();
  const [methods, setMethods] = useState(INITIAL);
  const [showAdd, setShowAdd] = useState(false);
  const [newM, setNewM] = useState({ type:'mpesa', name:'', detail:'' });
  const [saved, setSaved] = useState('');

  const flash = (msg) => { setSaved(msg); setTimeout(() => setSaved(''), 2500); };

  const setDefault = (id) => {
    setMethods(methods.map(m => ({ ...m, default: m.id === id })));
    flash('Default payment method updated!');
  };

  const remove = (id) => {
    if (methods.find(m => m.id === id)?.default) {
      alert('Set another method as default before removing this one.');
      return;
    }
    setMethods(methods.filter(m => m.id !== id));
    flash('Payment method removed.');
  };

  const add = () => {
    if (!newM.name || !newM.detail) { alert('Please fill in all fields.'); return; }
    const meta = {
      mpesa: { icon:'📱', color:'bg-green-50', border:'border-green-200' },
      bank:  { icon:'🏦', color:'bg-blue-50',  border:'border-blue-200'  },
      card:  { icon:'💳', color:'bg-purple-50',border:'border-purple-200'},
    };
    setMethods([...methods, { id:Date.now(), ...newM, ...meta[newM.type], default:false }]);
    setShowAdd(false);
    setNewM({ type:'mpesa', name:'', detail:'' });
    flash('Payment method added!');
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto p-5">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
          <h1 className="text-xl font-bold text-gray-900">Payment Methods</h1>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
            ✅ {saved}
          </div>
        )}

        <div className="flex flex-col gap-3 mb-5">
          {methods.map(m => (
            <div key={m.id} className={`${m.color} border-2 ${m.default ? 'border-green-400' : m.border} rounded-2xl p-4`}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm flex-shrink-0">{m.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{m.name}</p>
                    {m.default && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{m.detail}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-white/70">
                {!m.default && (
                  <button onClick={() => setDefault(m.id)} className="flex-1 text-xs bg-white text-green-700 font-semibold py-2 rounded-xl border border-green-200 hover:bg-green-50 transition-colors">
                    ✅ Set Default
                  </button>
                )}
                <button onClick={() => remove(m.id)} className="flex-1 text-xs bg-white text-red-500 font-semibold py-2 rounded-xl border border-red-100 hover:bg-red-50 transition-colors">
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {showAdd ? (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <p className="font-semibold text-gray-900 mb-3">Add Payment Method</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Type</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
                  value={newM.type} onChange={e => setNewM({ ...newM, type: e.target.value })}>
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Account</option>
                  <option value="card">Debit / Credit Card</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Name</label>
                <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
                  placeholder="e.g. My Safaricom Line" value={newM.name} onChange={e => setNewM({ ...newM, name: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Number / Account</label>
                <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
                  placeholder="e.g. 0712 345 678" value={newM.detail} onChange={e => setNewM({ ...newM, detail: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <button onClick={add} className="flex-1 bg-green-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-green-600 transition-colors">Add Method</button>
                <button onClick={() => setShowAdd(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl text-sm">Cancel</button>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAdd(true)} className="w-full border-2 border-dashed border-gray-300 text-gray-500 font-semibold py-4 rounded-2xl hover:border-green-400 hover:text-green-600 transition-colors">
            ➕ Add Payment Method
          </button>
        )}
      </div>
    </Layout>
  );
}
