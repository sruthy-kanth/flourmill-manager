import React from 'react';
import { Menu, Database, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import type { ActiveTab } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  millName: string;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMobileMenu: () => void;
  onOpenNewTransaction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  millName,
  setActiveTab,
  onOpenMobileMenu,
  onOpenNewTransaction,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Menu Button & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="മെനു തുറക്കുക"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div 
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center text-xl shadow-md shadow-amber-500/20">
                🌾
              </div>
              <div>
                <h1 className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight leading-tight">
                  {millName || 'മില്ല് മാനേജ്‌മെന്റ്'}
                </h1>
                <p className="text-xs text-amber-700 font-medium">ദൈനംദിന കണക്കുകൾ & സേവനങ്ങൾ</p>
              </div>
            </div>
          </div>

          {/* Right: Quick Action & Supabase Indicator */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Supabase Status Pill */}
            <button
              onClick={() => setActiveTab('settings')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                isSupabaseConfigured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
              title={isSupabaseConfigured ? 'Supabase കണക്റ്റഡ് ആണ്' : 'ലോക്കൽ സ്റ്റോറേജിൽ പ്രവർത്തിക്കുന്നു (Supabase സെറ്റ് ചെയ്യാം)'}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseConfigured ? 'Supabase Live' : 'ഓഫ്‌ലൈൻ / ലോക്കൽ'}</span>
              {isSupabaseConfigured ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-600" />
              )}
            </button>

            {/* Quick New Entry Button */}
            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-semibold text-sm rounded-xl shadow-sm shadow-amber-600/30 transition-all transform active:scale-95 touch-action-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>പുതിയ എൻട്രി</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
