import React from 'react';
import { 
  TrendingUp, 
  Receipt, 
  Layers, 
  ArrowRight, 
  Clock, 
  Phone, 
  Sparkles, 
  RefreshCw,
  Plus
} from 'lucide-react';
import type { DashboardStats, Operation } from '../types';
import { formatCurrency, formatQuantity, formatShortMalayalamDate, formatPhoneNumber } from '../utils/malayalam';

interface DashboardViewProps {
  stats: DashboardStats | null;
  operations: Operation[];
  loading: boolean;
  onRefresh: () => void;
  onSelectOperationForNewEntry: (operationId: string) => void;
  onGoToHistory: () => void;
  onGoToNewEntry: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  operations,
  loading,
  onRefresh,
  onSelectOperationForNewEntry,
  onGoToHistory,
  onGoToNewEntry,
}) => {
  const activeOperations = operations.filter(op => op.is_active);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-ml">
            ഇന്നത്തെ കണക്കുകൾ
          </h2>
          <p className="text-sm text-slate-500 font-ml">
            മില്ലിലെ ഇന്നത്തെ വരുമാനവും ഇടപാടുകളും ഒറ്റനോട്ടത്തിൽ
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50 font-ml"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          <span>പുതുക്കുക</span>
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Most Important: ഇന്നത്തെ വരുമാനം */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 p-6 text-white shadow-xl shadow-amber-600/20 md:col-span-1">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-amber-100 font-ml">
              ഇന്നത്തെ വരുമാനം
            </span>
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-numeric">
              {formatCurrency(stats?.todayIncome ?? 0)}
            </div>
            <p className="mt-2 text-xs text-amber-100 font-ml">
              ഇന്ന് രേഖപ്പെടുത്തിയ ആകെ കളക്ഷൻ
            </p>
          </div>
        </div>

        {/* ഇന്നത്തെ ഇടപാടുകൾ */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600 font-ml">
              ഇന്നത്തെ ഇടപാടുകൾ
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 font-numeric">
              {stats?.todayTransactionsCount ?? 0}
            </div>
            <p className="mt-2 text-xs text-slate-500 font-ml">
              ഇന്ന് ചെയ്ത മൊത്തം എൻട്രികൾ
            </p>
          </div>
        </div>

        {/* ഇന്നത്തെ സേവനങ്ങളുടെ എണ്ണം */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600 font-ml">
              ഇന്നത്തെ സേവനങ്ങളുടെ എണ്ണം
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 font-numeric">
              {stats?.todayOperationsCount ?? 0}
            </div>
            <p className="mt-2 text-xs text-slate-500 font-ml">
              ഇന്ന് ഉപയോഗിച്ച വിവിധ പ്രവർത്തനങ്ങൾ
            </p>
          </div>
        </div>
      </div>

      {/* QUICK OPERATIONS SECTION (CORE WORKFLOW) */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-slate-900 font-ml">
              വേഗത്തിലുള്ള എൻട്രി (Quick Operations)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-ml hidden sm:inline">
            ഒരു ക്ലിക്കിൽ എൻട്രി തുടങ്ങാം
          </span>
        </div>

        {activeOperations.length === 0 ? (
          <div className="text-center py-6 text-slate-500 font-ml">
            സേവനങ്ങളൊന്നും സജീവമല്ല. ക്രമീകരണങ്ങളിൽ നിന്ന് ചേർക്കുക.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {activeOperations.map((op) => (
              <button
                key={op.id}
                onClick={() => onSelectOperationForNewEntry(op.id)}
                className="group relative flex flex-col justify-between p-4 rounded-xl bg-gradient-to-br from-amber-50/70 to-orange-50/30 border border-amber-200/80 hover:border-amber-400 hover:shadow-md hover:bg-amber-100/60 transition-all text-left active:scale-[0.98] touch-action-manipulation"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-base group-hover:text-amber-900 font-ml line-clamp-1">
                    {op.name_ml}
                  </h4>
                  <p className="text-xs text-slate-500 font-ml mt-1">
                    1 {op.unit}ന്
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-base font-black text-amber-700 font-numeric">
                    {formatCurrency(op.price_per_unit)}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-white text-amber-700 flex items-center justify-center text-xs shadow-xs group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-bold text-slate-900 font-ml">
              അവസാന ഇടപാടുകൾ
            </h3>
          </div>
          <button
            onClick={onGoToHistory}
            className="flex items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-800 font-ml"
          >
            <span>എല്ലാം കാണുക</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {(!stats?.recentTransactions || stats.recentTransactions.length === 0) ? (
          <div className="text-center py-10">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 font-medium text-sm font-ml">
              ഇടപാടുകളൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ല
            </p>
            <button
              onClick={onGoToNewEntry}
              className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 font-ml shadow-sm"
            >
              ആദ്യ ഇടപാട് രേഖപ്പെടുത്തുക
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 rounded-xl px-2 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm sm:text-base font-ml">
                      {tx.operation?.name_ml || 'മില്ല് സേവനം'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 font-medium font-ml">
                      {formatQuantity(tx.quantity, tx.operation?.unit || 'കിലോ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-ml">
                    <span>{formatShortMalayalamDate(tx.transaction_date)}</span>
                    {tx.customer?.phone && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{formatPhoneNumber(tx.customer.phone)}</span>
                      </span>
                    )}
                    {tx.notes && (
                      <span className="italic text-slate-400 truncate max-w-[150px]">
                        "{tx.notes}"
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-base sm:text-lg font-black text-slate-900 font-numeric">
                    {formatCurrency(tx.total_amount)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-numeric">
                    {formatCurrency(tx.unit_price)} / {tx.operation?.unit || 'കിലോ'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
