import React from 'react';
import { Home, PlusCircle, Receipt, BarChart3 } from 'lucide-react';
import type { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'ഹോം', icon: Home },
    { id: 'new-entry' as ActiveTab, label: 'പുതിയ എൻട്രി', icon: PlusCircle, isPrimary: true },
    { id: 'history' as ActiveTab, label: 'ഇടപാടുകൾ', icon: Receipt },
    { id: 'statement' as ActiveTab, label: 'സ്റ്റേറ്റ്മെന്റ്', icon: BarChart3 },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 safe-area-pb shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center -mt-5 group focus:outline-none touch-action-manipulation"
              >
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
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-16 py-1 rounded-lg transition-colors touch-action-manipulation ${
                isActive ? 'text-amber-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : ''}`} />
              <span className={`text-[11px] mt-1 font-ml tracking-tight ${
                isActive ? 'font-bold text-amber-700' : 'font-medium'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
