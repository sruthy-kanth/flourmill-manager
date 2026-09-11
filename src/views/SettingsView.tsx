import React, { useState } from 'react';
import { 
  Database, 
  ShieldCheck, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  Building2,
  Terminal
} from 'lucide-react';
import { isSupabaseConfigured, supabaseUrl, supabaseAnonKey, saveSupabaseConfig } from '../lib/supabase';

interface SettingsViewProps {
  millName: string;
  onUpdateMillName: (name: string) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  millName,
  onUpdateMillName,
}) => {
  const [nameInput, setNameInput] = useState(millName);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);

  // Supabase Configuration State
  const [urlInput, setUrlInput] = useState(supabaseUrl || '');
  const [keyInput, setKeyInput] = useState(supabaseAnonKey || '');
  const [supabaseMessage, setSupabaseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // SQL Schema Modal / Viewer
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSaveMillName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    try {
      setIsSavingName(true);
      await onUpdateMillName(nameInput.trim());
      setNameSavedSuccess(true);
      setTimeout(() => setNameSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSaveSupabase = () => {
    setSupabaseMessage(null);
    if (!urlInput.trim() || !keyInput.trim()) {
      saveSupabaseConfig('', '');
      setSupabaseMessage({
        type: 'success',
        text: 'ഡാറ്റാബേസ് കോൺഫിഗറേഷൻ നീക്കം ചെയ്തു. ഇപ്പോൾ ലോക്കൽ സ്റ്റോറേജിൽ പ്രവർത്തിക്കുന്നു.'
      });
      setTimeout(() => window.location.reload(), 1200);
      return;
    }

    if (!urlInput.startsWith('https://')) {
      setSupabaseMessage({
        type: 'error',
        text: 'സാധുവായ Supabase URL നൽകുക (ഉദാ: https://xyz.supabase.co)'
      });
      return;
    }

    saveSupabaseConfig(urlInput.trim(), keyInput.trim());
    setSupabaseMessage({
      type: 'success',
      text: 'Supabase ക്രെഡൻഷ്യലുകൾ സേവ് ചെയ്തു! പേജ് പുതുക്കുന്നു...'
    });
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleCopySql = () => {
    const sqlContent = `-- ==========================================================
-- MALAYALAM FLOUR MILL MANAGEMENT SYSTEM (മില്ല് മാനേജ്‌മെന്റ്)
-- Database Schema for Supabase Postgres
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS mills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'ഞങ്ങളുടെ മില്ല്',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mill_id UUID NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
    name_ml TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'കിലോ',
    price_per_unit NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mill_id UUID NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_mill_customer_phone UNIQUE (mill_id, phone)
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mill_id UUID NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
    operation_id UUID NOT NULL REFERENCES operations(id) ON DELETE RESTRICT,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_mill_date ON transactions(mill_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_operation ON transactions(operation_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);

ALTER TABLE mills ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public anon access on mills" ON mills FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access on operations" ON operations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access on customers" ON customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon access on transactions" ON transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
`;

    navigator.clipboard.writeText(sqlContent);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 font-ml">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          ക്രമീകരണങ്ങൾ (Settings)
        </h2>
        <p className="text-sm text-slate-500">
          മില്ലിന്റെ പേരും ഡാറ്റാബേസ് കണക്ഷനുകളും കോൺഫിഗർ ചെയ്യുക
        </p>
      </div>

      {/* 1. MILL DETAILS */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
          <Building2 className="w-5 h-5 text-amber-600" />
          <span>മില്ലിന്റെ പേര് (Mill Name)</span>
        </div>

        <form onSubmit={handleSaveMillName} className="space-y-3">
          <div>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="ഉദാ: ശ്രീ മില്ല് (Flour Mill)"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-sm focus:bg-white focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            {nameSavedSuccess ? (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                പേര് വിജയകരമായി മാറ്റി!
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={isSavingName || !nameInput.trim()}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
            >
              {isSavingName ? 'സംരക്ഷിക്കുന്നു...' : 'സേവ് ചെയ്യുക'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. SUPABASE POSTGRES CONFIGURATION */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
            <Database className="w-5 h-5 text-amber-600" />
            <span>Supabase ഡാറ്റാബേസ് കണക്ഷൻ</span>
          </div>

          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
            isSupabaseConfigured 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-amber-100 text-amber-800'
          }`}>
            {isSupabaseConfigured ? 'സജീവം (Connected)' : 'ഓഫ്‌ലൈൻ / ലോക്കൽ മോഡ്'}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          നിങ്ങളുടെ Supabase പ്രോജക്റ്റിലെ <strong>Project Settings &gt; API</strong> യിൽ നിന്നുള്ള വിവരങ്ങൾ നൽകുക.
          ഇത് നൽകാത്ത പക്ഷം ആപ്പ് തത്സമയം ബ്രൗസറിലെ ലോക്കൽ സ്റ്റോറേജിൽ പ്രവർത്തിക്കും.
        </p>

        {supabaseMessage && (
          <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            supabaseMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}>
            {supabaseMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{supabaseMessage.text}</span>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Project URL
            </label>
            <input
              type="text"
              placeholder="https://your-project.supabase.co"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Anon / Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              ⚠️ ഒരിക്കലും service-role key ഇവിടെ നൽകരുത്. Anon public key മാത്രം ഉപയോഗിക്കുക.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowSqlSchema(!showSqlSchema)}
            className="flex items-center gap-1.5 text-xs text-amber-700 font-bold hover:underline"
          >
            <Terminal className="w-4 h-4" />
            <span>{showSqlSchema ? 'SQL മറയ്ക്കുക' : 'Supabase SQL Schema കാണുക'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveSupabase}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              സേവ് ചെയ്ത് കണക്റ്റ് ചെയ്യുക
            </button>
          </div>
        </div>

        {/* SQL SCHEMA CODE BOX */}
        {showSqlSchema && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono space-y-3">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold">Supabase SQL Editor-ൽ പേസ്റ്റ് ചെയ്യേണ്ട കോഡ്:</span>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] font-sans font-bold"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'കോപ്പി ചെയ്തു!' : 'കോപ്പി ചെയ്യുക'}</span>
              </button>
            </div>
            <pre className="overflow-x-auto max-h-48 text-[11px] text-slate-300 scrollbar-thin">
{`-- Enable UUID & create tables
CREATE TABLE IF NOT EXISTS mills (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS operations (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), mill_id UUID REFERENCES mills(id), name_ml TEXT, unit TEXT, price_per_unit NUMERIC, is_active BOOLEAN);
CREATE TABLE IF NOT EXISTS transactions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), mill_id UUID REFERENCES mills(id), operation_id UUID REFERENCES operations(id), customer_id UUID, transaction_date DATE, quantity NUMERIC, unit_price NUMERIC, total_amount NUMERIC, notes TEXT);`}
            </pre>
          </div>
        )}
      </div>

      {/* 3. SECURITY & NO-AUTH MVP NOTICE */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>സുരക്ഷാ അറിയിപ്പ് (Security & Privacy)</span>
        </div>
        <p className="leading-relaxed text-[11px] text-slate-500">
          ഈ ആപ്പ് സിംഗിൾ ഓണർക്ക് ലളിതമായി ഉപയോഗിക്കാനായി ലോഗിൻ ആവശ്യമില്ലാത്ത രീതിയിലാണ് രൂപകൽപ്പന ചെയ്തിട്ടുള്ളത്.
          ഭാവിയിൽ കൂടുതൽ ജീവനക്കാരെയോ ശാഖകളെയോ ചേർക്കാൻ തക്കവിധം സുരക്ഷിതമായ ഡാറ്റാബേസ് ഘടനയാണ് ഉപയോഗിച്ചിട്ടുള്ളത്.
        </p>
      </div>
    </div>
  );
};
