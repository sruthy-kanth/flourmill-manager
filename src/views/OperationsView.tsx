import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  X, 
  Power, 
  Info
} from 'lucide-react';
import type { Operation } from '../types';
import { formatCurrency, COMMON_UNITS } from '../utils/malayalam';

interface OperationsViewProps {
  operations: Operation[];
  onAddOperation: (op: { name_ml: string; unit: string; price_per_unit: number }) => Promise<void>;
  onUpdateOperation: (id: string, updates: Partial<Operation>) => Promise<void>;
}

export const OperationsView: React.FC<OperationsViewProps> = ({
  operations,
  onAddOperation,
  onUpdateOperation,
}) => {
  // Modal / Form state for new operation
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('കിലോ');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editUnit, setEditUnit] = useState('കിലോ');
  const [editPrice, setEditPrice] = useState<number | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStartEdit = (op: Operation) => {
    setEditingId(op.id);
    setEditName(op.name_ml);
    setEditUnit(op.unit);
    setEditPrice(op.price_per_unit);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim() || editPrice === '' || Number(editPrice) < 0) {
      alert('ദയവായി സാധുവായ പേരും നിരക്കും നൽകുക.');
      return;
    }

    try {
      setIsUpdating(true);
      await onUpdateOperation(id, {
        name_ml: editName.trim(),
        unit: editUnit,
        price_per_unit: Number(editPrice),
      });
      setEditingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleActive = async (op: Operation) => {
    try {
      await onUpdateOperation(op.id, {
        is_active: !op.is_active,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newPrice === '' || Number(newPrice) < 0) {
      alert('ദയവായി സാധുവായ പേരും നിരക്കും നൽകുക.');
      return;
    }

    try {
      setIsAdding(true);
      await onAddOperation({
        name_ml: newName.trim(),
        unit: newUnit,
        price_per_unit: Number(newPrice),
      });
      setShowAddModal(false);
      setNewName('');
      setNewPrice('');
      setNewUnit('കിലോ');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-ml">
            സേവനങ്ങളും നിരക്കുകളും (Operations)
          </h2>
          <p className="text-sm text-slate-500 font-ml">
            മില്ലിലെ പ്രവർത്തനങ്ങളുടെ പേരുകളും യൂണിറ്റും നിരക്കുകളും ഇവിടെ ക്രമീകരിക്കാം
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-sm font-ml"
        >
          <Plus className="w-4 h-4" />
          <span>പുതിയ സേവനം ചേർക്കുക</span>
        </button>
      </div>

      {/* Info notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 font-ml flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            നിരക്കുകൾ മാറ്റിയാലും പഴയ ഇടപാടുകളിലെ തുക മാറില്ല.
          </p>
          <p className="text-amber-800 text-[11px]">
            പഴയ ഇടപാടുകളുടെ സുരക്ഷിതത്വത്തിനായി സേവനങ്ങൾ ഡിലീറ്റ് ചെയ്യുന്നതിന് പകരം താൽക്കാലികമായി നിർത്തലാക്കുക (Disable) ചെയ്യാം.
          </p>
        </div>
      </div>

      {/* Operations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {operations.map((op) => {
          const isEditing = editingId === op.id;

          if (isEditing) {
            return (
              <div 
                key={op.id}
                className="bg-white rounded-2xl p-5 border-2 border-amber-400 shadow-md space-y-4 font-ml animate-in fade-in"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 text-sm">സേവനം തിരുത്തുക</span>
                  <button onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">പേര്</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold"
                      placeholder="ഉദാ: അരി പൊടിക്കാൻ"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">യൂണിറ്റ്</label>
                      <select
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        {COMMON_UNITS.map(u => (
                          <option key={u.id} value={u.id}>{u.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">നിരക്ക് (₹)</label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold font-numeric"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                  >
                    റദ്ദാക്കുക
                  </button>
                  <button
                    onClick={() => handleSaveEdit(op.id)}
                    disabled={isUpdating}
                    className="px-4 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold shadow-xs hover:bg-amber-700"
                  >
                    {isUpdating ? 'സംരക്ഷിക്കുന്നു...' : 'സേവ് ചെയ്യുക'}
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={op.id}
              className={`rounded-2xl p-5 border transition-all ${
                op.is_active
                  ? 'bg-white border-slate-200 shadow-xs hover:border-amber-300'
                  : 'bg-slate-100/70 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base font-ml">
                      {op.name_ml}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-ml ${
                      op.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {op.is_active ? 'സജീവം (Active)' : 'നിഷ്ക്രിയം'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-ml mt-1">
                    യൂണിറ്റ്: <strong>{op.unit}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xl font-extrabold text-amber-700 font-numeric">
                    {formatCurrency(op.price_per_unit)}
                  </div>
                  <span className="text-[11px] text-slate-400 font-ml">
                    1 {op.unit}ന്
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleActive(op)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors font-ml ${
                    op.is_active
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{op.is_active ? 'നിഷ്ക്രിയമാക്കുക' : 'സജീവമാക്കുക'}</span>
                </button>

                <button
                  onClick={() => handleStartEdit(op)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-amber-700 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors font-ml"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>തിരുത്തുക</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD NEW OPERATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowAddModal(false)}
          />

          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 animate-in zoom-in-95 font-ml">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                പുതിയ സേവനം ചേർക്കുക
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  സേവനത്തിന്റെ പേര് (മലയാളത്തിൽ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ഉദാ: മല്ലി പൊടിക്കാൻ"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-amber-500"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    യൂണിറ്റ് <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold"
                  >
                    {COMMON_UNITS.map(u => (
                      <option key={u.id} value={u.id}>{u.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    നിരക്ക് (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="0.00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold font-numeric text-sm"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
                >
                  റദ്ദാക്കുക
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
                >
                  {isAdding ? 'ചേർക്കുന്നു...' : 'ചേർക്കുക (Add)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
