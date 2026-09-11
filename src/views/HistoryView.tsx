import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Phone, 
  Edit3, 
  Trash2, 
  Receipt, 
  RotateCcw, 
  X, 
  Plus 
} from 'lucide-react';
import type { Transaction, Operation } from '../types';
import { 
  formatCurrency, 
  formatQuantity, 
  formatMalayalamDate, 
  formatPhoneNumber 
} from '../utils/malayalam';

interface HistoryViewProps {
  transactions: Transaction[];
  operations: Operation[];
  onEditTransaction: (id: string, updates: {
    quantity: number;
    unit_price: number;
    transaction_date: string;
    notes?: string;
    phone?: string;
  }) => Promise<void>;
  onRequestConfirmDelete: (txId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  transactions,
  operations,
  onEditTransaction,
  onRequestConfirmDelete,
}) => {
  const navigate = useNavigate();

  // Filter States
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedOperationId, setSelectedOperationId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  // Edit Modal State
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editQuantity, setEditQuantity] = useState<number | ''>('');
  const [editUnitPrice, setEditUnitPrice] = useState<number | ''>('');
  const [editDate, setEditDate] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Filtered List
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Filter by Phone
      if (searchPhone.trim()) {
        const phone = (t.customer?.phone || '').toLowerCase();
        if (!phone.includes(searchPhone.trim().toLowerCase())) return false;
      }

      // Filter by Operation
      if (selectedOperationId && t.operation_id !== selectedOperationId) {
        return false;
      }

      // Filter by Date
      if (filterDate && t.transaction_date !== filterDate) {
        return false;
      }

      return true;
    });
  }, [transactions, searchPhone, selectedOperationId, filterDate]);

  // Aggregate stats for current filter
  const totalFilteredAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
  }, [filteredTransactions]);

  const handleStartEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setEditQuantity(tx.quantity);
    setEditUnitPrice(tx.unit_price);
    setEditDate(tx.transaction_date);
    setEditPhone(tx.customer?.phone || '');
    setEditNotes(tx.notes || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    const qty = typeof editQuantity === 'number' ? editQuantity : parseFloat(String(editQuantity));
    const price = typeof editUnitPrice === 'number' ? editUnitPrice : parseFloat(String(editUnitPrice));

    if (isNaN(qty) || qty <= 0 || isNaN(price) || price < 0 || !editDate) {
      alert('ദയവായി സാധുവായ വിവരങ്ങൾ നൽകുക.');
      return;
    }

    try {
      setIsUpdating(true);
      await onEditTransaction(editingTransaction.id, {
        quantity: qty,
        unit_price: price,
        transaction_date: editDate,
        phone: editPhone.trim() || undefined,
        notes: editNotes.trim() || undefined,
      });
      setEditingTransaction(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const resetFilters = () => {
    setSearchPhone('');
    setSelectedOperationId('');
    setFilterDate('');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Quick Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-ml">
            ഇടപാടുകളുടെ വിവരങ്ങൾ (History)
          </h2>
          <p className="text-sm text-slate-500 font-ml">
            എല്ലാ ഇടപാടുകളും പരിശോധിക്കാനും തിരുത്താനും ഇല്ലാതാക്കാനും ഇവിടെ സാധിക്കും
          </p>
        </div>

        <button
          onClick={() => navigate('/new-entry')}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-sm font-ml"
        >
          <Plus className="w-4 h-4" />
          <span>പുതിയ ഇടപാട്</span>
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 font-ml">
            <Filter className="w-4 h-4 text-amber-600" />
            <span>ഫിൽട്ടറുകൾ</span>
          </div>
          {(searchPhone || selectedOperationId || filterDate) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-semibold font-ml"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>റീസെറ്റ് ചെയ്യുക</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Phone Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ഫോൺ നമ്പർ തിരയുക..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-ml focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Operation Filter */}
          <div>
            <select
              value={selectedOperationId}
              onChange={(e) => setSelectedOperationId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-ml focus:bg-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="">എല്ലാ സേവനങ്ങളും</option>
              {operations.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name_ml}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-numeric focus:bg-white focus:ring-2 focus:ring-amber-500"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                title="തീയതി ഒഴിവാക്കുക"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary Badge */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-ml">
          <span>കണ്ടെത്തിയ ഇടപാടുകൾ: <strong>{filteredTransactions.length}</strong></span>
          <span>ആകെ തുക: <strong className="text-amber-700 text-sm font-numeric">{formatCurrency(totalFilteredAmount)}</strong></span>
        </div>
      </div>

      {/* TRANSACTION LIST */}
      {filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800 font-ml">
            ഇടപാടുകളൊന്നും കണ്ടെത്തിയില്ല
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-ml">
            തിരഞ്ഞെടുത്ത ഫിൽട്ടറുകളിൽ വിവരങ്ങളില്ല. ഫിൽട്ടറുകൾ മാറ്റി നോക്കുക.
          </p>
        </div>
      ) : (
        <>
          {/* MOBILE VIEW: Cards */}
          <div className="grid grid-cols-1 gap-3 lg:hidden">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-base text-slate-900 font-ml">
                      {tx.operation?.name_ml || 'സേവനം'}
                    </h4>
                    <span className="text-xs text-slate-500 font-ml">
                      {formatMalayalamDate(tx.transaction_date)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-amber-700 font-numeric">
                      {formatCurrency(tx.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 py-2 px-3 rounded-xl bg-slate-50 text-xs font-ml border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">അളവ്:</span>
                    <span className="font-bold text-slate-800 font-numeric">
                      {formatQuantity(tx.quantity, tx.operation?.unit || 'യൂണിറ്റ്')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">നിരക്ക്:</span>
                    <span className="font-bold text-slate-800 font-numeric">
                      {formatCurrency(tx.unit_price)} / {tx.operation?.unit || 'യൂണിറ്റ്'}
                    </span>
                  </div>
                </div>

                {/* Details & Actions Footer */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 font-ml">
                    {tx.customer?.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-numeric">{formatPhoneNumber(tx.customer.phone)}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">ഫോൺ ഇല്ല</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(tx)}
                      className="p-2 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                      title="തിരുത്തുക"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRequestConfirmDelete(tx.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="ഇല്ലാതാക്കുക"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {tx.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-amber-50/40 p-2 rounded-lg font-ml">
                    "{tx.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW: High Precision Table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 font-ml">
                  <th className="py-3.5 px-4">തീയതി</th>
                  <th className="py-3.5 px-4">സേവനം</th>
                  <th className="py-3.5 px-4 text-right">അളവ്</th>
                  <th className="py-3.5 px-4 text-right">നിരക്ക്</th>
                  <th className="py-3.5 px-4 text-right">ആകെ തുക</th>
                  <th className="py-3.5 px-4">ഫോൺ നമ്പർ</th>
                  <th className="py-3.5 px-4">കുറിപ്പ്</th>
                  <th className="py-3.5 px-4 text-center">നടപടികൾ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-800 font-ml">
                      {formatMalayalamDate(tx.transaction_date)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-ml">
                      {tx.operation?.name_ml || 'സേവനം'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-800 font-numeric">
                      {formatQuantity(tx.quantity, tx.operation?.unit || 'യൂണിറ്റ്')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-600 font-numeric">
                      {formatCurrency(tx.unit_price)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-amber-700 font-numeric text-base">
                      {formatCurrency(tx.total_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-numeric text-xs">
                      {formatPhoneNumber(tx.customer?.phone)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic text-xs font-ml max-w-xs truncate">
                      {tx.notes || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleStartEdit(tx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                          title="തിരുത്തുക"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRequestConfirmDelete(tx.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="ഇല്ലാതാക്കുക"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* EDIT TRANSACTION MODAL */}
      {editingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setEditingTransaction(null)}
          />

          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 animate-in zoom-in-95 font-ml">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                ഇടപാട് തിരുത്തുക ({editingTransaction.operation?.name_ml})
              </h3>
              <button
                onClick={() => setEditingTransaction(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    അളവ് ({editingTransaction.operation?.unit || 'യൂണിറ്റ്'})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-numeric font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    നിരക്ക് (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={editUnitPrice}
                    onChange={(e) => setEditUnitPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-numeric font-bold"
                    required
                  />
                </div>
              </div>

              {/* Live calculated total */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">ആകെ തുക:</span>
                <span className="text-xl font-black text-amber-700 font-numeric">
                  {formatCurrency((Number(editQuantity) || 0) * (Number(editUnitPrice) || 0))}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  തീയതി
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-numeric"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ഫോൺ നമ്പർ
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-numeric"
                  placeholder="നമ്പർ നൽകാം"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  കുറിപ്പ്
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm"
                  placeholder="കുറിപ്പ്"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                >
                  റദ്ദാക്കുക
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
                >
                  {isUpdating ? 'സംരക്ഷിക്കുന്നു...' : 'അപ്ഡേറ്റ് ചെയ്യുക'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
