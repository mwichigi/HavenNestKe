import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

const LANGUAGES = [
  { code:'en', name:'English',   native:'English',   flag:'🇬🇧' },
  { code:'sw', name:'Kiswahili', native:'Kiswahili', flag:'🇰🇪' },
];

export default function LanguagePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(localStorage.getItem('nestkenya_lang') || 'en');
  const [saving, setSaving] = useState(false);

  const handleSelect = (code) => {
    if (code === selected) return;
    setSaving(true);
    localStorage.setItem('nestkenya_lang', code);
    window.__nestLang = code;
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto p-5">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-gray-600 text-xl">←</button>
          <h1 className="text-xl font-bold text-gray-900">
            {selected === 'sw' ? 'Chagua Lugha' : 'Choose Language'}
          </h1>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          {selected === 'sw'
            ? 'Chagua lugha utakayotumia katika programu nzima ya NestKenya.'
            : 'Select the language for the entire NestKenya app. The page will reload automatically.'}
        </p>

        {saving && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            {selected === 'sw' ? 'Inapakia upya...' : 'Applying language and reloading...'}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {LANGUAGES.map(lang => (
            <button key={lang.code} onClick={() => handleSelect(lang.code)}
              className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left w-full ${
                selected === lang.code
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-green-300 hover:bg-gray-50'
              }`}>
              <span className="text-4xl">{lang.flag}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-base">{lang.name}</p>
                <p className="text-sm text-gray-400 mt-0.5">{lang.native}</p>
              </div>
              {selected === lang.code
                ? <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">✓</div>
                : <div className="w-7 h-7 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
              }
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">More languages coming soon</p>
      </div>
    </Layout>
  );
}
