import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Layers, Settings, Database, ShieldCheck, Home, PlusCircle, Receipt, BarChart3 } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  millName: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  millName,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const navItems = [
    { to: '/', label: 'ഹോം (Dashboard)', icon: Home },
    { to: '/new-entry', label: 'പുതിയ എൻട്രി', icon: PlusCircle },
    { to: '/history', label: 'ഇടപാടുകൾ (History)', icon: Receipt },
    { to: '/statement', label: 'സ്റ്റേറ്റ്മെന്റ് (Monthly)', icon: BarChart3 },
    { to: '/operations', label: 'സേവനങ്ങൾ & നിരക്കുകൾ', icon: Layers },
    { to: '/settings', label: 'ക്രമീകരണങ്ങൾ (Settings)', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Menu */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center text-lg shadow-sm">
                🌾
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-tight font-ml">
                  {millName || 'മില്ല് മാനേജ്‌മെന്റ്'}
                </h3>
                <p className="text-[11px] text-amber-700 font-ml">മെനു & നാവിഗേഷൻ</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="അടയ്ക്കുക"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav List */}
          <div className="p-4 space-y-1.5 font-ml">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
              പേജുകൾ
            </p>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.to === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(item.to);

              return (
                <button
                  key={item.to}
                  onClick={() => handleNavigate(item.to)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                    isActive
                      ? 'bg-amber-500 text-white font-semibold shadow-sm shadow-amber-500/30'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Database className="w-4 h-4 text-amber-600" />
            <span>ഡാറ്റാബേസ്: <strong>{isSupabaseConfigured ? 'Supabase Postgres' : 'ലോക്കൽ സ്റ്റോറേജ്'}</strong></span>
          </div>

          <div className="text-[11px] text-slate-400 font-ml flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>സിംഗിൾ ഓണർ - വേഗതയേറിയ പ്രവർത്തനം</span>
          </div>
        </div>
      </div>
    </div>
  );
};
