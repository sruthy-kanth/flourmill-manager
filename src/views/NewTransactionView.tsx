import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Phone, 
  FileText, 
  Check, 
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import type { Operation, TransactionFormData } from '../types';
import { getTodayDateString, formatCurrency, formatMalayalamDate } from '../utils/malayalam';
import confetti from 'canvas-confetti';

interface NewTransactionViewProps {
  operations: Operation[];
  preSelectedOperationId?: string | null;
  onSubmitTransaction: (data: {
    operation_id: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    transaction_date: string;
    phone?: string;
    notes?: string;
  }) => Promise<void>;
  onCancel: () => void;
  onSuccessNavigate: () => void;
}

export const NewTransactionView: React.FC<NewTransactionViewProps> = ({
  operations,
  preSelectedOperationId,
  onSubmitTransaction,
  onCancel,
  onSuccessNavigate,
}) => {
  const activeOperations = operations.filter(op => op.is_active);

  const [formData, setFormData] = useState<TransactionFormData>({
    operation_id: preSelectedOperationId || (activeOperations[0]?.id || ''),
    transaction_date: getTodayDateString(),
    quantity: '',
    unit_price: '',
    total_amount: '',
    phone: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [lastSavedSummary, setLastSavedSummary] = useState<{
    opName: string;
    qty: number;
    unit: string;
    total: number;
  } | null>(null);

  // When operation selection changes, load its default unit_price
  useEffect(() => {
    if (preSelectedOperationId) {
      const op = operations.find(o => o.id === preSelectedOperationId);
      if (op) {
        setFormData(prev => {
          const qty = typeof prev.quantity === 'number' ? prev.quantity : Number(prev.quantity) || 0;
          const price = op.price_per_unit;
          const total = qty > 0 ? Number((qty * price).toFixed(2)) : '';
          return {
            ...prev,
            operation_id: op.id,
            unit_price: price,
            total_amount: total,
          };
        });
      }
    } else if (activeOperations.length > 0 && !formData.operation_id) {
      const first = activeOperations[0];
      setFormData(prev => ({
        ...prev,
        operation_id: first.id,
        unit_price: first.price_per_unit,
      }));
    }
  }, [preSelectedOperationId, operations]);

  // Selected Operation Object
  const selectedOperation = operations.find(op => op.id === formData.operation_id);

  // Handle operation change
  const handleOperationSelect = (opId: string) => {
    const op = operations.find(o => o.id === opId);
    if (!op) return;

    const qty = typeof formData.quantity === 'number' ? formData.quantity : (Number(formData.quantity) || 0);
    const newPrice = op.price_per_unit;
    const newTotal = qty > 0 ? Number((qty * newPrice).toFixed(2)) : '';

    setFormData(prev => ({
      ...prev,
      operation_id: opId,
      unit_price: newPrice,
      total_amount: newTotal,
    }));
  };

  // Handle quantity change
  const handleQuantityChange = (val: string) => {
    const num = val === '' ? '' : Math.max(0, parseFloat(val));
    const price = typeof formData.unit_price === 'number' ? formData.unit_price : (Number(formData.unit_price) || 0);
    const total = (typeof num === 'number' && num > 0) ? Number((num * price).toFixed(2)) : '';

    setFormData(prev => ({
      ...prev,
      quantity: num,
      total_amount: total,
    }));
    setErrorMessage(null);
  };

  // Handle unit price change
  const handleUnitPriceChange = (val: string) => {
    const priceNum = val === '' ? '' : Math.max(0, parseFloat(val));
    const qty = typeof formData.quantity === 'number' ? formData.quantity : (Number(formData.quantity) || 0);
    const total = (typeof priceNum === 'number' && qty > 0) ? Number((qty * priceNum).toFixed(2)) : '';

    setFormData(prev => ({
      ...prev,
      unit_price: priceNum,
      total_amount: total,
    }));
  };

  // Quick quantity adder (+1, +2, +5, +10, +25)
  const addQuickQuantity = (increment: number) => {
    const current = typeof formData.quantity === 'number' ? formData.quantity : (Number(formData.quantity) || 0);
    const newQty = Number((current + increment).toFixed(2));
    const price = typeof formData.unit_price === 'number' ? formData.unit_price : (Number(formData.unit_price) || 0);
    const total = Number((newQty * price).toFixed(2));

    setFormData(prev => ({
      ...prev,
      quantity: newQty,
      total_amount: total,
    }));
    setErrorMessage(null);
  };

  const setExactQuantity = (exact: number) => {
    const price = typeof formData.unit_price === 'number' ? formData.unit_price : (Number(formData.unit_price) || 0);
    const total = Number((exact * price).toFixed(2));

    setFormData(prev => ({
      ...prev,
      quantity: exact,
      total_amount: total,
    }));
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validations
    if (!formData.operation_id) {
      setErrorMessage('ദയവായി ഒരു സേവനം തിരഞ്ഞെടുക്കുക.');
      return;
    }

    const qty = typeof formData.quantity === 'number' ? formData.quantity : parseFloat(String(formData.quantity));
    if (isNaN(qty) || qty <= 0) {
      setErrorMessage('അളവ് 0-ൽ കൂടുതൽ ആയിരിക്കണം.');
      return;
    }

    const price = typeof formData.unit_price === 'number' ? formData.unit_price : parseFloat(String(formData.unit_price));
    if (isNaN(price) || price < 0) {
      setErrorMessage('നിരക്ക് സാധുവായ ഒന്നായിരിക്കണം.');
      return;
    }

    if (!formData.transaction_date) {
      setErrorMessage('തീയതി ആവശ്യമാണ്.');
      return;
    }

    // Phone validation if entered
    if (formData.phone && formData.phone.trim().length > 0) {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10 && cleanPhone.length !== 10) {
        setErrorMessage('ഫോൺ നമ്പർ സാധുവായ 10 അക്ക നമ്പർ ആയിരിക്കണം.');
        return;
      }
    }

    const total = Number((qty * price).toFixed(2));

    try {
      setIsSubmitting(true);
      await onSubmitTransaction({
        operation_id: formData.operation_id,
        quantity: qty,
        unit_price: price,
        total_amount: total,
        transaction_date: formData.transaction_date,
        phone: formData.phone.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });

      // Confetti feedback
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {}

      setLastSavedSummary({
        opName: selectedOperation?.name_ml || 'സേവനം',
        qty,
        unit: selectedOperation?.unit || 'കിലോ',
        total,
      });
      setShowSuccessCard(true);

      // Reset form values for next entry
      setFormData(prev => ({
        operation_id: prev.operation_id, // keep current operation selected
        transaction_date: getTodayDateString(),
        quantity: '',
        unit_price: selectedOperation?.price_per_unit ?? prev.unit_price,
        total_amount: '',
        phone: '',
        notes: '',
      }));
    } catch (err: any) {
      setErrorMessage(err.message || 'ഇടപാട് സംരക്ഷിക്കുന്നതിൽ പിശക് സംഭവിച്ചു.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      operation_id: activeOperations[0]?.id || '',
      transaction_date: getTodayDateString(),
      quantity: '',
      unit_price: activeOperations[0]?.price_per_unit || '',
      total_amount: '',
      phone: '',
      notes: '',
    });
    setErrorMessage(null);
    setShowSuccessCard(false);
  };

  return (
    <div className="max-w-2xl mx-auto pb-16 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-ml">
              പുതിയ എൻട്രി
            </h2>
            <p className="text-xs text-slate-500 font-ml">
              ഉപഭോക്താവിന്റെ ഇടപാട് കുറഞ്ഞ നിമിഷങ്ങളിൽ രേഖപ്പെടുത്തുക
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-ml"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>മായ്ക്കുക</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {showSuccessCard && lastSavedSummary && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm animate-in fade-in zoom-in-95 font-ml">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-emerald-950">
                  ഇടപാട് വിജയകരമായി ചേർത്തു!
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  {lastSavedSummary.opName} — {lastSavedSummary.qty} {lastSavedSummary.unit} •{' '}
                  <strong className="font-numeric text-sm">{formatCurrency(lastSavedSummary.total)}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={onSuccessNavigate}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              പട്ടിക കാണുക
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 font-ml animate-in shake">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        
        {/* 1. സേവനം തിരഞ്ഞെടുക്കൽ (Quick Chips Selection) */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2 font-ml">
            സേവനം / പ്രവർത്തനം <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {activeOperations.map((op) => {
              const isSelected = formData.operation_id === op.id;
              return (
                <button
                  type="button"
                  key={op.id}
                  onClick={() => handleOperationSelect(op.id)}
                  className={`p-3 rounded-xl border text-left transition-all font-ml flex flex-col justify-between touch-action-manipulation ${
                    isSelected
                      ? 'bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/30 scale-[1.02]'
                      : 'bg-slate-50/70 border-slate-200 hover:border-amber-300 text-slate-800 hover:bg-amber-50/50'
                  }`}
                >
                  <span className={`font-bold text-sm leading-snug ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {op.name_ml}
                  </span>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className={isSelected ? 'text-amber-100 font-numeric' : 'text-slate-500 font-numeric'}>
                      {formatCurrency(op.price_per_unit)} / {op.unit}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. അളവും നിരക്കും (Quantity & Rate Inputs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Quantity */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-slate-800 font-ml">
                അളവ് ({selectedOperation?.unit || 'കിലോ'}) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-ml">കൃത്യമായ അളവ് നൽകുക</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="ഉദാ: 5"
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-full text-xl font-bold font-numeric px-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                required
                autoFocus
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 pointer-events-none font-ml">
                {selectedOperation?.unit || 'കിലോ'}
              </div>
            </div>

            {/* Quick Quantity Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {[1, 2, 5, 10, 20, 25].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setExactQuantity(val)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 transition-colors font-numeric"
                >
                  {val} {selectedOperation?.unit || 'കിലോ'}
                </button>
              ))}
              <button
                type="button"
                onClick={() => addQuickQuantity(1)}
                className="px-2 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors font-numeric"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => addQuickQuantity(5)}
                className="px-2 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors font-numeric"
              >
                +5
              </button>
            </div>
          </div>

          {/* Unit Price / നിരക്ക് */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-slate-800 font-ml">
                നിരക്ക് (1 {selectedOperation?.unit || 'കിലോ'}ന്)
              </label>
              <span className="text-[11px] text-amber-700 font-ml">മാറ്റങ്ങൾ വരുത്താം</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={formData.unit_price}
                onChange={(e) => handleUnitPriceChange(e.target.value)}
                className="w-full text-xl font-bold font-numeric pl-8 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-ml">
              സേവനത്തിന്റെ നിലവിലെ നിരക്ക് സ്വയമേവ വന്നിട്ടുണ്ട്.
            </p>
          </div>
        </div>

        {/* 3. തീയതി & ഫോൺ നമ്പർ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          {/* Transaction Date */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 font-ml">
              തീയതി <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-amber-500 text-sm font-semibold text-slate-800 font-numeric"
                required
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-ml">
              {formatMalayalamDate(formData.transaction_date)}
            </p>
          </div>

          {/* Customer Phone (Optional) */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 font-ml">
              ഫോൺ നമ്പർ <span className="text-slate-400 font-normal text-xs">(നിർബന്ധമില്ല)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                placeholder="ഉദാ: 9847012345"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-amber-500 text-sm font-numeric"
                maxLength={12}
              />
            </div>
          </div>
        </div>

        {/* 4. കുറിപ്പ് (Optional Notes) */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5 font-ml">
            കുറിപ്പ് / നിർദ്ദേശങ്ങൾ <span className="text-slate-400 font-normal text-xs">(നിർബന്ധമില്ല)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-slate-400">
              <FileText className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="ഉദാ: തരിയായി പൊടിക്കുക, ചാക്ക് നൽകിയിട്ടുണ്ട്"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-amber-500 text-sm font-ml"
            />
          </div>
        </div>

        {/* 5. ആകെ തുക & CALCULATOR DISPLAY (PRICE CALCULATION) */}
        <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-900 font-ml">
            <span className="flex items-center gap-1.5 font-bold">
              <Calculator className="w-4 h-4 text-amber-700" />
              തുക കണക്കുകൂട്ടൽ:
            </span>
            <span className="font-numeric">
              {formData.quantity || 0} {selectedOperation?.unit || 'കിലോ'} × {formatCurrency(Number(formData.unit_price) || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-base sm:text-lg font-black text-slate-900 font-ml">
              ആകെ തുക (Total Amount):
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-700 font-numeric tracking-tight">
              {formatCurrency(Number(formData.total_amount) || 0, true)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm font-ml transition-colors"
          >
            റദ്ദാക്കുക
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !formData.quantity || Number(formData.quantity) <= 0}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-extrabold text-base shadow-lg shadow-amber-600/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none font-ml touch-action-manipulation"
          >
            {isSubmitting ? (
              <span>സംരക്ഷിക്കുന്നു...</span>
            ) : (
              <>
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>ഇടപാട് സേവ് ചെയ്യുക (Save)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
