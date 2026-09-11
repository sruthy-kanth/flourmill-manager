import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, Receipt, BarChart3 } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', label: 'ഹോം', icon: Home, end: true },
    { to: '/new-entry', label: 'പുതിയ എൻട്രി', icon: PlusCircle, isPrimary: true },
    { to: '/history', label: 'ഇടപാടുകൾ', icon: Receipt },
    { to: '/statement', label: 'സ്റ്റേറ്റ്മെന്റ്', icon: BarChart3 },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 safe-area-pb shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className="flex flex-col items-center justify-center -mt-5 group focus:outline-none touch-action-manipulation"
              >
                {({ isActive }) => (
                  <>
                    <div className={`w-13 h-13 p-3 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                      isActive 
                        ? 'bg-amber-600 text-white ring-4 ring-amber-100 shadow-amber-600/40' 
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-amber-500/30'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-bold mt-1 font-ml ${
                      isActive ? 'text-amber-700' : 'text-slate-600'
                    }`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-16 py-1 rounded-lg transition-colors touch-action-manipulation ${
                  isActive ? 'text-amber-600' : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : ''}`} />
                  <span className={`text-[11px] mt-1 font-ml tracking-tight ${
                    isActive ? 'font-bold text-amber-700' : 'font-medium'
                  }`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
