import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const HISTORY = [
  { id:1, property:'Rongai Gardens Apts',  landlord:'Peter Kamau',   town:'Rongai',    start:'Jan 2026', end:'Present',  rent:18000, rating:5, review:'Great tenant, always pays on time.', status:'active' },
  { id:2, property:'Ruiru Budget Studio',  landlord:'Grace Muthoni', town:'Ruiru',     start:'Jun 2025', end:'Dec 2025', rent:8000,  rating:4, review:'Good tenant. Quiet and respectful.',  status:'ended'  },
  { id:3, property:'Juja Bedsitter',       landlord:'James Otieno',  town:'Juja',      start:'Jan 2025', end:'May 2025', rent:7500,  rating:5, review:'Excellent tenant. Highly recommended.', status:'ended' },
];

export default function RentalHistoryPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-5">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
          <h1 className="text-xl font-bold text-gray-900">Rental History</h1>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label:'Tenancies',    value:'3',   icon:'🏠' },
            { label:'Total Months', value:'18',  icon:'📅' },
            { label:'On-time Rate', value:'97%', icon:'✅' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-2xl p-4 text-white mb-5">
          <p className="text-xs text-green-200 uppercase tracking-wider mb-1">Your Rental Score</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">742</p>
              <p className="text-sm text-green-200 mt-0.5">Good — improving with every payment</p>
            </div>
            <div className="text-right text-xs text-green-200 space-y-1">
              <p>Payment history: +200</p>
              <p>Tenancy length: +150</p>
              <p>Landlord reviews: +192</p>
              <p>Disputes: 0</p>
            </div>
          </div>
        </div>

        <p className="font-semibold text-gray-900 mb-3">Past & Current Tenancies</p>
        <div className="flex flex-col gap-4">
          {HISTORY.map(h => (
            <div key={h.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{h.property}</p>
                    <p className="text-xs text-gray-500 mt-0.5">📍 {h.town} · {h.start} – {h.end}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${h.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {h.status === 'active' ? '🟢 Active' : '⚫ Ended'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400">Monthly Rent</p>
                    <p className="font-bold text-green-600">Ksh {h.rent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Landlord</p>
                    <p className="text-sm font-semibold text-gray-800">{h.landlord}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Rating</p>
                    <p className="text-sm">{'⭐'.repeat(h.rating)}</p>
                  </div>
                </div>
              </div>
              {h.review && (
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Landlord Review</p>
                  <p className="text-sm text-gray-600 italic">"{h.review}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
