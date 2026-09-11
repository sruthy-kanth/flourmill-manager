import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  PlusCircle, 
  Receipt, 
  BarChart3, 
  Layers, 
  Settings, 
  ShieldAlert
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const Sidebar: React.FC = () => {
  const primaryNavItems = [
    { to: '/', label: 'ഹോം (Dashboard)', icon: Home, end: true },
    { to: '/new-entry', label: 'പുതിയ എൻട്രി', icon: PlusCircle },
    { to: '/history', label: 'ഇടപാടുകൾ (History)', icon: Receipt },
    { to: '/statement', label: 'സ്റ്റേറ്റ്മെന്റ് (Monthly)', icon: BarChart3 },
  ];

  const secondaryNavItems = [
    { to: '/operations', label: 'സേവനങ്ങൾ & നിരക്കുകൾ', icon: Layers },
    { to: '/settings', label: 'ക്രമീകരണങ്ങൾ (Settings)', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 justify-between">
      <div className="space-y-6">
        {/* Primary Navigation */}
        <div>
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-ml">
            പ്രധാന മെനു
          </p>
          <nav className="space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-amber-500 text-white font-semibold shadow-sm shadow-amber-500/30'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="font-ml">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Secondary Navigation */}
        <div>
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-ml">
            മാനേജ്‌മെന്റ്
          </p>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-amber-500 text-white font-semibold shadow-sm shadow-amber-500/30'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="font-ml">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Database Security / Info Banner */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>സിംഗിൾ ഓണർ മോഡ്</span>
        </div>
        <p className="leading-relaxed text-[11px] text-slate-500">
          ലോഗിൻ ഇല്ലാതെ ഉടമയ്ക്ക് നേരിട്ട് വേഗത്തിൽ എൻട്രി ചെയ്യാം. {isSupabaseConfigured ? 'Supabase സുരക്ഷിതമാണ്.' : 'ലോക്കൽ ഡാറ്റാബേസ് സുരക്ഷിതമായി നിലനിൽക്കുന്നു.'}
        </p>
      </div>
    </aside>
  );
};
