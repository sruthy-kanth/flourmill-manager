import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

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

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 font-ml">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          ക്രമീകരണങ്ങൾ (Settings)
        </h2>
        <p className="text-sm text-slate-500">
          മില്ലിന്റെ പേരും വിവരങ്ങളും ഇവിടെ ക്രമീകരിക്കാം
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

      {/* 2. SECURITY & INFO */}
      <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>സുരക്ഷാ വിവരങ്ങൾ (Security & Privacy)</span>
        </div>
        <p className="leading-relaxed text-[11px] text-slate-500">
          ഈ ആപ്പ് സിംഗിൾ ഓണർക്ക് ലളിതമായി ഉപയോഗിക്കാനായി ലോഗിൻ ആവശ്യമില്ലാത്ത രീതിയിലാണ് രൂപകൽപ്പന ചെയ്തിട്ടുള്ളത്.
          എല്ലാ ഇടപാടുകളും ക്രമീകരണങ്ങളും നിങ്ങളുടെ Supabase ക്ലൗഡ് ഡാറ്റാബേസിൽ സുരക്ഷിതമായി സൂക്ഷിക്കപ്പെടുന്നു.
        </p>
      </div>
    </div>
  );
};
