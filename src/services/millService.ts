import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Mill, Operation, Customer, Transaction, DashboardStats, MonthlyStats } from '../types';
import { getTodayDateString, MALAYALAM_MONTHS } from '../utils/malayalam';

// Pre-seeded Initial Operations required by the user
export const INITIAL_OPERATIONS_SEED = [
  { name_ml: 'അരി പൊടിക്കാൻ', unit: 'കിലോ', price_per_unit: 12.00, is_active: true },
  { name_ml: 'ഗോതമ്പ് പൊടിക്കാൻ', unit: 'കിലോ', price_per_unit: 14.00, is_active: true },
  { name_ml: 'മുളക് പൊടിക്കാൻ', unit: 'കിലോ', price_per_unit: 35.00, is_active: true },
  { name_ml: 'മഞ്ഞൾ പൊടിക്കാൻ', unit: 'കിലോ', price_per_unit: 40.00, is_active: true },
  { name_ml: 'തേങ്ങ ആട്ടിക്കാൻ', unit: 'കിലോ', price_per_unit: 25.00, is_active: true },
  { name_ml: 'അരി വറുക്കാൻ', unit: 'കിലോ', price_per_unit: 15.00, is_active: true },
  { name_ml: 'അവലോസ് വറുക്കാൻ', unit: 'കിലോ', price_per_unit: 20.00, is_active: true },
];

const LOCAL_STORAGE_KEYS = {
  MILL: 'MILL_STORE_MILL',
  OPERATIONS: 'MILL_STORE_OPERATIONS',
  CUSTOMERS: 'MILL_STORE_CUSTOMERS',
  TRANSACTIONS: 'MILL_STORE_TRANSACTIONS',
};

// Helper for generating UUIDs in local mock mode
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Ensure Local Storage initial state
function initLocalStore() {
  if (typeof window === 'undefined') return;

  // Initialize Mill
  let millStr = localStorage.getItem(LOCAL_STORAGE_KEYS.MILL);
  let mill: Mill;
  if (!millStr) {
    mill = {
      id: 'default-mill-001',
      name: 'ശ്രീ മില്ല് (Flour Mill)',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.MILL, JSON.stringify(mill));
  } else {
    mill = JSON.parse(millStr);
  }

  // Initialize Operations
  let opsStr = localStorage.getItem(LOCAL_STORAGE_KEYS.OPERATIONS);
  if (!opsStr) {
    const defaultOps: Operation[] = INITIAL_OPERATIONS_SEED.map((op, idx) => ({
      id: `op-seed-${idx + 1}`,
      mill_id: mill.id,
      name_ml: op.name_ml,
      unit: op.unit,
      price_per_unit: op.price_per_unit,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    localStorage.setItem(LOCAL_STORAGE_KEYS.OPERATIONS, JSON.stringify(defaultOps));
  }

  // Initialize Customers & Transactions if not present
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS)) {
    // Seed a couple sample transactions for today to show rich immediate experience
    const ops: Operation[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.OPERATIONS) || '[]');
    const today = getTodayDateString();
    
    if (ops.length >= 3) {
      const sampleTransactions: Transaction[] = [
        {
          id: generateUUID(),
          mill_id: mill.id,
          operation_id: ops[0].id,
          transaction_date: today,
          quantity: 10,
          unit_price: ops[0].price_per_unit,
          total_amount: 10 * ops[0].price_per_unit,
          notes: 'നല്ല പോലെ പൊടിക്കുക',
          created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
        },
        {
          id: generateUUID(),
          mill_id: mill.id,
          operation_id: ops[2].id,
          transaction_date: today,
          quantity: 2,
          unit_price: ops[2].price_per_unit,
          total_amount: 2 * ops[2].price_per_unit,
          notes: null,
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        }
      ];
      localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(sampleTransactions));
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    }
  }
}

// Call initLocalStore once
initLocalStore();

export const MillService = {
  /**
   * Get or initialize the primary mill
   */
  async getMill(): Promise<Mill> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('mills').select('*').limit(1).single();
        if (data && !error) return data as Mill;
        
        // If table is empty, insert default mill
        const { data: newMill, error: insertError } = await supabase
          .from('mills')
          .insert([{ name: 'ശ്രീ മില്ല് (Flour Mill)' }])
          .select()
          .single();
        
        if (newMill && !insertError) {
          // Also seed initial operations in Supabase
          const opsWithMill = INITIAL_OPERATIONS_SEED.map(op => ({
            ...op,
            mill_id: newMill.id
          }));
          await supabase.from('operations').insert(opsWithMill);
          return newMill as Mill;
        }
      } catch (e) {
        console.warn('Supabase getMill failed, falling back to local store:', e);
      }
    }

    // Local Fallback
    const millStr = localStorage.getItem(LOCAL_STORAGE_KEYS.MILL);
    return millStr ? JSON.parse(millStr) : {
      id: 'default-mill-001',
      name: 'ശ്രീ മില്ല് (Flour Mill)',
      created_at: new Date().toISOString()
    };
  },

  /**
   * Update mill name
   */
  async updateMillName(name: string): Promise<Mill> {
    const mill = await this.getMill();
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('mills')
          .update({ name })
          .eq('id', mill.id)
          .select()
          .single();
        if (data && !error) return data as Mill;
      } catch (e) {
        console.warn('Supabase updateMillName error:', e);
      }
    }

    // Local
    const updated = { ...mill, name };
    localStorage.setItem(LOCAL_STORAGE_KEYS.MILL, JSON.stringify(updated));
    return updated;
  },

  /**
   * Get all operations
   */
  async getOperations(includeInactive: boolean = false): Promise<Operation[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const mill = await this.getMill();
        let query = supabase
          .from('operations')
          .select('*')
          .eq('mill_id', mill.id)
          .order('created_at', { ascending: true });
        
        if (!includeInactive) {
          query = query.eq('is_active', true);
        }

        const { data, error } = await query;
        if (data && !error) return data as Operation[];
      } catch (e) {
        console.warn('Supabase getOperations error, using local:', e);
      }
    }

    // Local
    const opsStr = localStorage.getItem(LOCAL_STORAGE_KEYS.OPERATIONS);
    const ops: Operation[] = opsStr ? JSON.parse(opsStr) : [];
    if (includeInactive) return ops;
    return ops.filter(op => op.is_active);
  },

  /**
   * Add a new operation
   */
  async addOperation(opData: { name_ml: string; unit: string; price_per_unit: number }): Promise<Operation> {
    const mill = await this.getMill();
    
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('operations')
          .insert([{
            mill_id: mill.id,
            name_ml: opData.name_ml.trim(),
            unit: opData.unit.trim() || 'കിലോ',
            price_per_unit: Number(opData.price_per_unit),
            is_active: true,
          }])
          .select()
          .single();
        
        if (data && !error) return data as Operation;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase addOperation error, falling to local:', e);
      }
    }

    // Local
    const opsStr = localStorage.getItem(LOCAL_STORAGE_KEYS.OPERATIONS);
    const ops: Operation[] = opsStr ? JSON.parse(opsStr) : [];
    const newOp: Operation = {
      id: generateUUID(),
      mill_id: mill.id,
      name_ml: opData.name_ml.trim(),
      unit: opData.unit.trim() || 'കിലോ',
      price_per_unit: Number(opData.price_per_unit),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    ops.push(newOp);
    localStorage.setItem(LOCAL_STORAGE_KEYS.OPERATIONS, JSON.stringify(ops));
    return newOp;
  },

  /**
   * Update operation (price, unit, name, or active status)
   */
  async updateOperation(id: string, updates: Partial<Operation>): Promise<Operation> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('operations')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();
        if (data && !error) return data as Operation;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase updateOperation error:', e);
      }
    }

    // Local
    const opsStr = localStorage.getItem(LOCAL_STORAGE_KEYS.OPERATIONS);
    const ops: Operation[] = opsStr ? JSON.parse(opsStr) : [];
    const index = ops.findIndex(o => o.id === id);
    if (index === -1) throw new Error('സേവനം കണ്ടെത്താനായില്ല');
    
    ops[index] = {
      ...ops[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.OPERATIONS, JSON.stringify(ops));
    return ops[index];
  },

  /**
   * Helper: Get or Create Customer by Phone
   */
  async getOrCreateCustomer(millId: string, phone?: string | null): Promise<Customer | null> {
    const cleanPhone = phone ? phone.trim() : null;
    if (!cleanPhone) return null;

    if (isSupabaseConfigured && supabase) {
      try {
        // Check if customer exists
        const { data: existing } = await supabase
          .from('customers')
          .select('*')
          .eq('mill_id', millId)
          .eq('phone', cleanPhone)
          .maybeSingle();
        
        if (existing) return existing as Customer;

        // Create new customer
        const { data: newCust, error } = await supabase
          .from('customers')
          .insert([{ mill_id: millId, phone: cleanPhone }])
          .select()
          .single();
        
        if (newCust && !error) return newCust as Customer;
      } catch (e) {
        console.warn('Supabase customer lookup error:', e);
      }
    }

    // Local
    const custStr = localStorage.getItem(LOCAL_STORAGE_KEYS.CUSTOMERS);
    const customers: Customer[] = custStr ? JSON.parse(custStr) : [];
    const existing = customers.find(c => c.mill_id === millId && c.phone === cleanPhone);
    if (existing) return existing;

    const newCust: Customer = {
      id: generateUUID(),
      mill_id: millId,
      phone: cleanPhone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    customers.push(newCust);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    return newCust;
  },

  /**
   * Create a new transaction with locked unit_price & total_amount
   */
  async createTransaction(payload: {
    operation_id: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    transaction_date: string;
    phone?: string;
    notes?: string;
  }): Promise<Transaction> {
    const mill = await this.getMill();

    if (payload.quantity <= 0) {
      throw new Error('അളവ് 0-ൽ കൂടുതൽ ആയിരിക്കണം');
    }
    if (payload.unit_price < 0) {
      throw new Error('നിരക്ക് സാധുവായ ഒന്നായിരിക്കണം');
    }

    // Calculated total
    const totalAmount = Number((payload.quantity * payload.unit_price).toFixed(2));

    let customer: Customer | null = null;
    if (payload.phone && payload.phone.trim()) {
      customer = await this.getOrCreateCustomer(mill.id, payload.phone.trim());
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .insert([{
            mill_id: mill.id,
            operation_id: payload.operation_id,
            customer_id: customer?.id || null,
            transaction_date: payload.transaction_date || getTodayDateString(),
            quantity: Number(payload.quantity),
            unit_price: Number(payload.unit_price),
            total_amount: totalAmount,
            notes: payload.notes?.trim() || null,
          }])
          .select('*, operation:operations(*), customer:customers(*)')
          .single();
        
        if (data && !error) return data as Transaction;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase createTransaction failed, fallback to local:', e);
      }
    }

    // Local Store
    const transStr = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
    const transactions: Transaction[] = transStr ? JSON.parse(transStr) : [];
    const ops = await this.getOperations(true);
    const op = ops.find(o => o.id === payload.operation_id);

    const newTx: Transaction = {
      id: generateUUID(),
      mill_id: mill.id,
      operation_id: payload.operation_id,
      customer_id: customer?.id || null,
      transaction_date: payload.transaction_date || getTodayDateString(),
      quantity: Number(payload.quantity),
      unit_price: Number(payload.unit_price),
      total_amount: totalAmount,
      notes: payload.notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      operation: op,
      customer: customer || undefined,
    };

    transactions.unshift(newTx);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return newTx;
  },

  /**
   * Get Transactions with filters
   */
  async getTransactions(filters?: {
    date?: string;
    operationId?: string;
    phone?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const mill = await this.getMill();
        let query = supabase
          .from('transactions')
          .select('*, operation:operations(*), customer:customers(*)')
          .eq('mill_id', mill.id)
          .order('transaction_date', { ascending: false })
          .order('created_at', { ascending: false });

        if (filters?.date) {
          query = query.eq('transaction_date', filters.date);
        }
        if (filters?.startDate) {
          query = query.gte('transaction_date', filters.startDate);
        }
        if (filters?.endDate) {
          query = query.lte('transaction_date', filters.endDate);
        }
        if (filters?.operationId) {
          query = query.eq('operation_id', filters.operationId);
        }

        const { data, error } = await query;
        if (data && !error) {
          let results = data as Transaction[];
          if (filters?.phone && filters.phone.trim()) {
            const queryPhone = filters.phone.trim().toLowerCase();
            results = results.filter(t => t.customer?.phone?.toLowerCase().includes(queryPhone));
          }
          return results;
        }
      } catch (e) {
        console.warn('Supabase getTransactions error, fallback to local:', e);
      }
    }

    // Local
    const transStr = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
    let list: Transaction[] = transStr ? JSON.parse(transStr) : [];
    const ops = await this.getOperations(true);
    const custStr = localStorage.getItem(LOCAL_STORAGE_KEYS.CUSTOMERS);
    const customers: Customer[] = custStr ? JSON.parse(custStr) : [];

    // Populate joined relations
    list = list.map(t => ({
      ...t,
      operation: ops.find(o => o.id === t.operation_id),
      customer: customers.find(c => c.id === t.customer_id)
    }));

    if (filters?.date) {
      list = list.filter(t => t.transaction_date === filters.date);
    }
    if (filters?.startDate) {
      list = list.filter(t => t.transaction_date >= filters.startDate!);
    }
    if (filters?.endDate) {
      list = list.filter(t => t.transaction_date <= filters.endDate!);
    }
    if (filters?.operationId) {
      list = list.filter(t => t.operation_id === filters.operationId);
    }
    if (filters?.phone && filters.phone.trim()) {
      const p = filters.phone.trim().toLowerCase();
      list = list.filter(t => t.customer?.phone?.toLowerCase().includes(p));
    }

    return list.sort((a, b) => {
      const dateCmp = b.transaction_date.localeCompare(a.transaction_date);
      if (dateCmp !== 0) return dateCmp;
      return (b.created_at || '').localeCompare(a.created_at || '');
    });
  },

  /**
   * Update Transaction
   */
  async updateTransaction(id: string, updates: {
    quantity: number;
    unit_price: number;
    transaction_date: string;
    notes?: string;
    phone?: string;
  }): Promise<Transaction> {
    const totalAmount = Number((updates.quantity * updates.unit_price).toFixed(2));
    const mill = await this.getMill();

    let customer: Customer | null = null;
    if (updates.phone !== undefined) {
      customer = await this.getOrCreateCustomer(mill.id, updates.phone);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const updatePayload: any = {
          quantity: updates.quantity,
          unit_price: updates.unit_price,
          total_amount: totalAmount,
          transaction_date: updates.transaction_date,
          notes: updates.notes || null,
          updated_at: new Date().toISOString(),
        };
        if (updates.phone !== undefined) {
          updatePayload.customer_id = customer?.id || null;
        }

        const { data, error } = await supabase
          .from('transactions')
          .update(updatePayload)
          .eq('id', id)
          .select('*, operation:operations(*), customer:customers(*)')
          .single();

        if (data && !error) return data as Transaction;
        if (error) throw error;
      } catch (e) {
        console.warn('Supabase updateTransaction failed:', e);
      }
    }

    // Local
    const transStr = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
    const transactions: Transaction[] = transStr ? JSON.parse(transStr) : [];
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) throw new Error('ഇടപാട് കണ്ടെത്താനായില്ല');

    transactions[index] = {
      ...transactions[index],
      quantity: updates.quantity,
      unit_price: updates.unit_price,
      total_amount: totalAmount,
      transaction_date: updates.transaction_date,
      notes: updates.notes || null,
      customer_id: updates.phone !== undefined ? (customer?.id || null) : transactions[index].customer_id,
      updated_at: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    
    // Return with relations
    const ops = await this.getOperations(true);
    const op = ops.find(o => o.id === transactions[index].operation_id);
    return {
      ...transactions[index],
      operation: op,
      customer: customer || undefined
    };
  },

  /**
   * Delete Transaction
   */
  async deleteTransaction(id: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (e) {
        console.warn('Supabase deleteTransaction failed:', e);
      }
    }

    // Local
    const transStr = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTIONS);
    let transactions: Transaction[] = transStr ? JSON.parse(transStr) : [];
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return true;
  },

  /**
   * Dashboard Statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const today = getTodayDateString();
    const todayTransactions = await this.getTransactions({ date: today });
    
    const todayIncome = todayTransactions.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);
    const uniqueOps = new Set(todayTransactions.map(t => t.operation_id));

    // Also get the 5 most recent transactions overall
    const allRecent = await this.getTransactions();
    const recentTransactions = allRecent.slice(0, 5);

    return {
      todayIncome,
      todayTransactionsCount: todayTransactions.length,
      todayOperationsCount: uniqueOps.size,
      recentTransactions,
    };
  },

  /**
   * Monthly Statement Statistics
   */
  async getMonthlyStats(year: number, month: number): Promise<MonthlyStats> {
    const startStr = `${year}-${month.toString().padStart(2, '0')}-01`;
    // Last day of month
    const lastDay = new Date(year, month, 0).getDate();
    const endStr = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

    const monthTransactions = await this.getTransactions({
      startDate: startStr,
      endDate: endStr,
    });

    const totalIncome = monthTransactions.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
    const totalTransactions = monthTransactions.length;

    // Operation-wise breakdown
    const ops = await this.getOperations(true);
    const opMap = new Map<string, {
      operationId: string;
      operationName: string;
      unit: string;
      totalQuantity: number;
      totalRevenue: number;
    }>();

    // Initialize map with known operations
    ops.forEach(op => {
      opMap.set(op.id, {
        operationId: op.id,
        operationName: op.name_ml,
        unit: op.unit,
        totalQuantity: 0,
        totalRevenue: 0,
      });
    });

    monthTransactions.forEach(t => {
      const entry = opMap.get(t.operation_id);
      if (entry) {
        entry.totalQuantity += Number(t.quantity || 0);
        entry.totalRevenue += Number(t.total_amount || 0);
      } else {
        opMap.set(t.operation_id, {
          operationId: t.operation_id,
          operationName: t.operation?.name_ml || 'മറ്റുള്ളവ',
          unit: t.operation?.unit || 'കിലോ',
          totalQuantity: Number(t.quantity || 0),
          totalRevenue: Number(t.total_amount || 0),
        });
      }
    });

    const operationBreakdown = Array.from(opMap.values())
      .filter(item => item.totalQuantity > 0 || item.totalRevenue > 0)
      .map(item => ({
        ...item,
        percentage: totalIncome > 0 ? Number(((item.totalRevenue / totalIncome) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Daily breakdown for the month
    const dailyMap = new Map<string, { totalAmount: number; count: number }>();
    
    // Seed days in descending or chronological order
    monthTransactions.forEach(t => {
      const curr = dailyMap.get(t.transaction_date) || { totalAmount: 0, count: 0 };
      curr.totalAmount += Number(t.total_amount || 0);
      curr.count += 1;
      dailyMap.set(t.transaction_date, curr);
    });

    const dailyBreakdown = Array.from(dailyMap.entries())
      .map(([dateStr, data]) => {
        const d = new Date(dateStr + 'T00:00:00');
        const dayFormatted = `${d.getDate().toString().padStart(2, '0')} ${MALAYALAM_MONTHS[month - 1]}`;
        return {
          date: dateStr,
          formattedDate: dayFormatted,
          totalAmount: data.totalAmount,
          transactionCount: data.count,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date)); // Latest date first

    return {
      year,
      month,
      totalIncome,
      totalTransactions,
      operationBreakdown,
      dailyBreakdown,
    };
  }
};
