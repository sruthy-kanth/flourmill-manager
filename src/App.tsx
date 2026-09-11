import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { Mill, Operation, Transaction, DashboardStats } from './types';
import { MillService } from './services/millService';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { MobileDrawer } from './components/MobileDrawer';
import { Toast, type ToastMessage } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';

// Views
import { DashboardView } from './views/DashboardView';
import { NewTransactionView } from './views/NewTransactionView';
import { HistoryView } from './views/HistoryView';
import { StatementView } from './views/StatementView';
import { OperationsView } from './views/OperationsView';
import { SettingsView } from './views/SettingsView';

export function App() {
  const [mill, setMill] = useState<Mill | null>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Confirm Delete Modal
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load all core data from DB
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [currentMill, currentOps, currentStats, currentTxs] = await Promise.all([
        MillService.getMill(),
        MillService.getOperations(true),
        MillService.getDashboardStats(),
        MillService.getTransactions(),
      ]);

      setMill(currentMill);
      setOperations(currentOps);
      setDashboardStats(currentStats);
      setTransactions(currentTxs);
    } catch (err: any) {
      console.error('Error loading mill data from database:', err);
      addToast('error', 'ഡാറ്റാബേസിൽ നിന്ന് ഡാറ്റ ലോഡ് ചെയ്യുന്നതിൽ തടസ്സം നേരിട്ടു.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle Submitting New Transaction to DB
  const handleCreateTransaction = async (data: {
    operation_id: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    transaction_date: string;
    phone?: string;
    notes?: string;
  }) => {
    try {
      await MillService.createTransaction(data);
      addToast('success', 'ഇടപാട് ഡാറ്റാബേസിൽ വിജയകരമായി രേഖപ്പെടുത്തി!');
      
      const [stats, txs] = await Promise.all([
        MillService.getDashboardStats(),
        MillService.getTransactions(),
      ]);
      setDashboardStats(stats);
      setTransactions(txs);
    } catch (err: any) {
      addToast('error', err.message || 'ഇടപാട് സംരക്ഷിക്കാൻ സാധിച്ചില്ല.');
      throw err;
    }
  };

  // Handle Editing Transaction in DB
  const handleEditTransaction = async (id: string, updates: {
    quantity: number;
    unit_price: number;
    transaction_date: string;
    notes?: string;
    phone?: string;
  }) => {
    try {
      await MillService.updateTransaction(id, updates);
      addToast('success', 'ഇടപാട് വിജയകരമായി തിരുത്തി!');
      
      const [stats, txs] = await Promise.all([
        MillService.getDashboardStats(),
        MillService.getTransactions(),
      ]);
      setDashboardStats(stats);
      setTransactions(txs);
    } catch (err: any) {
      addToast('error', err.message || 'തിരുത്തൽ സംരക്ഷിക്കാൻ സാധിച്ചില്ല.');
    }
  };

  // Handle Deleting Transaction from DB
  const handleConfirmDelete = async () => {
    if (!deleteTransactionId) return;

    try {
      await MillService.deleteTransaction(deleteTransactionId);
      addToast('info', 'ഇടപാട് ഇല്ലാതാക്കി.');
      setDeleteTransactionId(null);

      const [stats, txs] = await Promise.all([
        MillService.getDashboardStats(),
        MillService.getTransactions(),
      ]);
      setDashboardStats(stats);
      setTransactions(txs);
    } catch (err: any) {
      addToast('error', 'ഇല്ലാതാക്കാൻ സാധിച്ചില്ല.');
    }
  };

  // Handle Adding New Operation to DB
  const handleAddOperation = async (op: { name_ml: string; unit: string; price_per_unit: number }) => {
    try {
      await MillService.addOperation(op);
      addToast('success', 'പുതിയ സേവനം വിജയകരമായി ചേർത്തു!');
      const ops = await MillService.getOperations(true);
      setOperations(ops);
    } catch (err: any) {
      addToast('error', err.message || 'സേവനം ചേർക്കാൻ സാധിച്ചില്ല.');
    }
  };

  // Handle Updating Operation in DB
  const handleUpdateOperation = async (id: string, updates: Partial<Operation>) => {
    try {
      await MillService.updateOperation(id, updates);
      addToast('success', 'സേവന വിവരങ്ങൾ അപ്ഡേറ്റ് ചെയ്തു!');
      const ops = await MillService.getOperations(true);
      setOperations(ops);
    } catch (err: any) {
      addToast('error', err.message || 'അപ്ഡേറ്റ് പരാജയപ്പെട്ടു.');
    }
  };

  // Handle Updating Mill Name in DB
  const handleUpdateMillName = async (name: string) => {
    try {
      const updated = await MillService.updateMillName(name);
      setMill(updated);
      addToast('success', 'മില്ലിന്റെ പേര് മാറ്റി!');
    } catch (err: any) {
      addToast('error', 'പേര് മാറ്റാൻ സാധിച്ചില്ല.');
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        {/* Toast Notifications */}
        <Toast toasts={toasts} onDismiss={removeToast} />

        {/* Confirmation Modal for Delete */}
        <ConfirmModal
          isOpen={Boolean(deleteTransactionId)}
          title="ഇടപാട് ഇല്ലാതാക്കുക"
          message="ഈ ഇടപാട് ഇല്ലാതാക്കണോ?"
          confirmText="അതെ, ഇല്ലാതാക്കുക"
          cancelText="റദ്ദാക്കുക"
          isDestructive={true}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTransactionId(null)}
        />

        {/* Top Navbar */}
        <Navbar
          millName={mill?.name || 'ശ്രീ മില്ല്'}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Desktop Sidebar */}
          <Sidebar />

          {/* Dynamic Page Routed Views */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
            <Routes>
              {/* Home / Dashboard Route */}
              <Route
                path="/"
                element={
                  <DashboardView
                    stats={dashboardStats}
                    operations={operations}
                    loading={loading}
                    onRefresh={loadInitialData}
                  />
                }
              />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />

              {/* New Transaction Route */}
              <Route
                path="/new-entry"
                element={
                  <NewTransactionView
                    operations={operations}
                    onSubmitTransaction={handleCreateTransaction}
                  />
                }
              />

              {/* History / Transactions Route */}
              <Route
                path="/history"
                element={
                  <HistoryView
                    transactions={transactions}
                    operations={operations}
                    onEditTransaction={handleEditTransaction}
                    onRequestConfirmDelete={(txId) => setDeleteTransactionId(txId)}
                  />
                }
              />
              <Route path="/transactions" element={<Navigate to="/history" replace />} />

              {/* Monthly Statement Route */}
              <Route
                path="/statement"
                element={<StatementView />}
              />

              {/* Operations & Pricing Route */}
              <Route
                path="/operations"
                element={
                  <OperationsView
                    operations={operations}
                    onAddOperation={handleAddOperation}
                    onUpdateOperation={handleUpdateOperation}
                  />
                }
              />

              {/* Settings Route */}
              <Route
                path="/settings"
                element={
                  <SettingsView
                    millName={mill?.name || ''}
                    onUpdateMillName={handleUpdateMillName}
                  />
                }
              />

              {/* Fallback to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Mobile Drawer */}
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          millName={mill?.name || ''}
        />

        {/* Mobile Bottom Navigation Bar */}
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
