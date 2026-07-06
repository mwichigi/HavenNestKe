import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function RentPaymentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('mpesa');
  const [paying, setPaying] = useState(false);
  const [payments, setPayments] = useState([]);
  const [lease, setLease] = useState(null);

  useEffect(() => {
    api.get('/leases/my').then(res => setLease(res.data)).catch(() => {});
    api.get('/payments/history').then(res => setPayments(res.data.payments || [])).catch(() => {});
  }, []);

  const handlePay = async () => {
    if (!lease) return alert('No active lease found.');
    setPaying(true);
    try {
      await api.post('/payments/mpesa/pay', {
        lease_id: lease.id,
        phone: user.phone,
        amount: lease.monthly_rent,
      });
      alert('✅ M-Pesa prompt sent! Enter your PIN on your phone to complete payment.');
    } catch (err) {
      alert('Payment failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setPaying(false);
    }
  };

  const rentAmount = lease?.monthly_rent || 18000;

  return (
    <Layout>
      <div className="bg-white px-5 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-40">
        <button onClick={() => navigate('/home')} className="text-xl text-gray-500">←</button>
        <span className="font-semibold text-gray-900 flex-1">Rent Payment</span>
        <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">Due in 3 days</span>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Rent Hero */}
        <div className="bg-gradient-to-br from-gray-900 to-green-900 rounded-2xl p-5 text-white">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">August 2026 Rent</p>
          <p className="font-serif text-4xl font-bold">
            Ksh {Number(rentAmount).toLocaleString()}
            <span className="text-base font-normal text-gray-400"> /month</span>
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Due: <span className="text-amber-400 font-semibold">1st August 2026</span>
            {lease && ` · ${lease.title}`}
          </p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: 'On-time', value: '11 ✅', color: 'text-green-300' },
              { label: 'Late', value: '0', color: 'text-amber-300' },
              { label: 'Score', value: user?.rental_score || 600, color: 'text-green-400' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-gray-400">{s.label}</p>
                <p className={`text-lg font-bold mt-0.5 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Breakdown</p>
          {[
            { label: 'Base Rent', value: `Ksh ${Number(rentAmount).toLocaleString()}` },
            { label: 'Service Charge', value: 'Included' },
            { label: 'Arrears', value: 'None ✅', green: true },
          ].map(r => (
            <div key={r.label} className="flex justify-between py-2.5 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-500">{r.label}</span>
              <span className={`text-sm font-semibold ${r.green ? 'text-green-600' : 'text-gray-900'}`}>{r.value}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 border-t-2 border-gray-200 mt-1">
            <span className="font-bold text-gray-900">Total Due</span>
            <span className="text-lg font-bold text-green-600">Ksh {Number(rentAmount).toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <p className="font-semibold text-gray-900">Choose Payment Method</p>
        <div className="flex flex-col gap-2.5">
          {[
            { id: 'mpesa', icon: '📱', name: 'M-Pesa', detail: `Paybill: 522533 · Account: NK-${lease?.id || '3847'}` },
            { id: 'bank', icon: '🏦', name: 'Bank Transfer', detail: 'Equity Bank · Account •••• 7821' },
            { id: 'card', icon: '💳', name: 'Card Payment', detail: 'Visa/Mastercard · 2.5% fee' },
          ].map(m => (
            <div
              key={m.id}
              onClick={() => setSelectedMethod(m.id)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedMethod === m.id ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">{m.icon}</div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">{m.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{m.detail}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${selectedMethod === m.id ? 'border-green-500 bg-green-500' : 'border-gray-300'}`} />
            </div>
          ))}
        </div>

        {/* M-Pesa Steps */}
        {selectedMethod === 'mpesa' && (
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-sm font-semibold text-green-700 mb-3">📱 M-Pesa Steps</p>
            {[
              'Go to M-Pesa → Lipa na M-Pesa → Pay Bill',
              `Business No: 522533`,
              `Account No: NK-${lease?.id || '3847'}`,
              `Amount: Ksh ${Number(rentAmount).toLocaleString()}`,
            ].map((step, i) => (
              <div key={i} className="flex gap-3 items-start mb-2 last:mb-0">
                <div className="w-5 h-5 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: step.replace(/(\d+)/g, '<strong>$1</strong>') }} />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl text-base transition-colors disabled:opacity-60"
        >
          {paying ? 'Processing...' : `💳 Pay Ksh ${Number(rentAmount).toLocaleString()} Now`}
        </button>

        {/* History */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Payment History</p>
          {payments.length === 0 ? (
            [
              { month: 'July 2026', date: '1 Jul 2026', amount: rentAmount },
              { month: 'June 2026', date: '1 Jun 2026', amount: rentAmount },
              { month: 'May 2026', date: '30 Apr 2026', amount: rentAmount },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-base">✅</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{p.month} Rent</p>
                  <p className="text-xs text-gray-400 mt-0.5">Paid {p.date} · M-Pesa</p>
                </div>
                <span className="text-sm font-bold text-green-600">Ksh {Number(p.amount).toLocaleString()}</span>
              </div>
            ))
          ) : payments.map(p => (
            <div key={p.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center text-base">✅</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{p.property_title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(p.created_at).toLocaleDateString()} · {p.payment_method}</p>
              </div>
              <span className="text-sm font-bold text-green-600">Ksh {Number(p.amount).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
