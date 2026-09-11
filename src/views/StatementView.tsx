import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Receipt, 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  Printer
} from 'lucide-react';
import type { MonthlyStats } from '../types';
import { MillService } from '../services/millService';
import { 
  formatCurrency, 
  formatQuantity, 
  MALAYALAM_MONTHS 
} from '../utils/malayalam';

export const StatementView: React.FC = () => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [stats, setStats] = useState<MonthlyStats | null>(null);

  const loadStatement = async () => {
    try {
      const data = await MillService.getMonthlyStats(selectedYear, selectedMonth);
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadStatement();
  }, [selectedYear, selectedMonth]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const yearOptions = [
    selectedYear - 2,
    selectedYear - 1,
    selectedYear,
    selectedYear + 1,
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-ml">
            പ്രതിമാസ സ്റ്റേറ്റ്മെന്റ് (Monthly Statement)
          </h2>
          <p className="text-sm text-slate-500 font-ml">
            ഓരോ മാസത്തെയും ആകെ വരുമാനവും സേവനങ്ങളുടെ കണക്കുകളും
          </p>
        </div>

        {/* Print / Export Action */}
        <button
          onClick={handlePrint}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors font-ml"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>പ്രിന്റ് / സേവ് ചെയ്യുക</span>
        </button>
      </div>

      {/* MONTH & YEAR PICKER */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="മുൻപത്തെ മാസം"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            {/* Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 font-ml focus:bg-white focus:ring-2 focus:ring-amber-500"
            >
              {MALAYALAM_MONTHS.map((monthName, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {monthName}
                </option>
              ))}
            </select>

            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 font-numeric focus:bg-white focus:ring-2 focus:ring-amber-500"
            >
              {yearOptions.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="അടുത്ത മാസം"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-500 font-ml text-center sm:text-right">
          തിരഞ്ഞെടുത്ത കാലയളവ്: <strong>{MALAYALAM_MONTHS[selectedMonth - 1]} {selectedYear}</strong>
        </div>
      </div>

      {/* MONTHLY SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ആ മാസത്തെ ആകെ വരുമാനം */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 p-6 text-white shadow-xl shadow-amber-600/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-amber-100 font-ml">
              ആ മാസത്തെ ആകെ വരുമാനം
            </span>
            <div className="p-2 rounded-xl bg-white/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-numeric">
              {formatCurrency(stats?.totalIncome ?? 0)}
            </div>
            <p className="mt-2 text-xs text-amber-100 font-ml">
              {MALAYALAM_MONTHS[selectedMonth - 1]} മാസത്തെ ആകെ ഗ്രോസ് വരുമാനം
            </p>
          </div>
        </div>

        {/* ആകെ ഇടപാടുകൾ */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600 font-ml">
              ആകെ ഇടപാടുകൾ (Transactions)
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900 font-numeric">
              {stats?.totalTransactions ?? 0}
            </div>
            <p className="mt-2 text-xs text-slate-500 font-ml">
              ഈ മാസത്തിൽ രേഖപ്പെടുത്തിയ ആകെ പ്രവർത്തനങ്ങൾ
            </p>
          </div>
        </div>
      </div>

      {/* OPERATION-WISE BREAKDOWN */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-slate-900 font-ml">
              സേവന തിരിച്ചുള്ള കണക്കുകൾ (Operation-wise Breakdown)
            </h3>
          </div>
        </div>

        {(!stats?.operationBreakdown || stats.operationBreakdown.length === 0) ? (
          <p className="text-center py-6 text-xs text-slate-400 font-ml">
            ഈ മാസത്തിൽ ഇടപാടുകളൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ല.
          </p>
        ) : (
          <div className="space-y-4">
            {stats.operationBreakdown.map((item) => (
              <div key={item.operationId} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-sm font-ml">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{item.operationName}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold font-numeric">
                      {formatQuantity(item.totalQuantity, item.unit)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 font-numeric text-base">
                      {formatCurrency(item.totalRevenue)}
                    </span>
                    <span className="text-xs text-slate-400 font-numeric ml-1.5">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DAILY BREAKDOWN LIST */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-bold text-slate-900 font-ml">
              ദിവസേനയുള്ള കണക്ക് (Daily Breakdown)
            </h3>
          </div>
        </div>

        {(!stats?.dailyBreakdown || stats.dailyBreakdown.length === 0) ? (
          <p className="text-center py-6 text-xs text-slate-400 font-ml">
            ദിവസേനയുള്ള കണക്കുകളൊന്നും ലഭ്യമല്ല.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.dailyBreakdown.map((day) => (
              <div
                key={day.date}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm font-ml">
                    {day.formattedDate}
                  </div>
                  <div className="text-xs text-slate-500 font-ml">
                    {day.transactionCount} ഇടപാടുകൾ
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-base font-extrabold text-amber-700 font-numeric">
                    {formatCurrency(day.totalAmount)}
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
