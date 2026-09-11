import { useState, useEffect, useCallback } from 'react';
import type { ActiveTab, Mill, Operation, Transaction, DashboardStats } from './types';
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mill, setMill] = useState<Mill | null>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [preSelectedOperationId, setPreSelectedOperationId] = useState<string | null>(null);
  
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

  // Load all core data
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
      console.error('Error loading mill data:', err);
      addToast('error', 'ഡാറ്റ ലോഡ് ചെയ്യുന്നതിൽ തടസ്സം നേരിട്ടു.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle Quick Operation Click from Dashboard
  const handleSelectQuickOperation = (opId: string) => {
    setPreSelectedOperationId(opId);
    setActiveTab('new-entry');
  };

  // Handle Submitting New Transaction
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
      addToast('success', 'ഇടപാട് വിജയകരമായി രേഖപ്പെടുത്തി!');
      
      // Refresh state
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

  // Handle Editing Transaction
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

  // Handle Deleting Transaction with Confirmation
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

  // Handle Adding New Operation
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

  // Handle Updating Operation
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

  // Handle Updating Mill Name
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
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setPreSelectedOperationId(null);
          setActiveTab(tab);
        }}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenNewTransaction={() => {
          setPreSelectedOperationId(null);
          setActiveTab('new-entry');
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setPreSelectedOperationId(null);
            setActiveTab(tab);
          }}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={dashboardStats}
              operations={operations}
              loading={loading}
              onRefresh={loadInitialData}
              onSelectOperationForNewEntry={handleSelectQuickOperation}
              onGoToHistory={() => setActiveTab('history')}
              onGoToNewEntry={() => {
                setPreSelectedOperationId(null);
                setActiveTab('new-entry');
              }}
            />
          )}

          {activeTab === 'new-entry' && (
            <NewTransactionView
              operations={operations}
              preSelectedOperationId={preSelectedOperationId}
              onSubmitTransaction={handleCreateTransaction}
              onCancel={() => setActiveTab('dashboard')}
              onSuccessNavigate={() => setActiveTab('history')}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              transactions={transactions}
              operations={operations}
              onEditTransaction={handleEditTransaction}
              onGoToNewEntry={() => {
                setPreSelectedOperationId(null);
                setActiveTab('new-entry');
              }}
              onRequestConfirmDelete={(txId) => setDeleteTransactionId(txId)}
            />
          )}

          {activeTab === 'statement' && (
            <StatementView />
          )}

          {activeTab === 'operations' && (
            <OperationsView
              operations={operations}
              onAddOperation={handleAddOperation}
              onUpdateOperation={handleUpdateOperation}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              millName={mill?.name || ''}
              onUpdateMillName={handleUpdateMillName}
            />
          )}
        </main>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setPreSelectedOperationId(null);
          setActiveTab(tab);
        }}
        millName={mill?.name || ''}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setPreSelectedOperationId(null);
          setActiveTab(tab);
        }}
      />
    </div>
  );
}

export default App;
