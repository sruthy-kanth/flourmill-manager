export interface Mill {
  id: string;
  name: string;
  created_at: string;
}

export interface Operation {
  id: string;
  mill_id: string;
  name_ml: string;
  unit: string;
  price_per_unit: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  mill_id: string;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  mill_id: string;
  operation_id: string;
  customer_id?: string | null;
  transaction_date: string; // YYYY-MM-DD
  quantity: number;
  unit_price: number;
  total_amount: number;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  
  // Joined fields for display
  operation?: Operation;
  customer?: Customer;
}

export interface TransactionFormData {
  operation_id: string;
  transaction_date: string;
  quantity: number | '';
  unit_price: number | '';
  total_amount: number | '';
  phone: string;
  notes: string;
}

export interface DashboardStats {
  todayIncome: number;
  todayTransactionsCount: number;
  todayOperationsCount: number;
  recentTransactions: Transaction[];
}

export interface MonthlyStats {
  year: number;
  month: number; // 1-12
  totalIncome: number;
  totalTransactions: number;
  operationBreakdown: {
    operationId: string;
    operationName: string;
    unit: string;
    totalQuantity: number;
    totalRevenue: number;
    percentage: number;
  }[];
  dailyBreakdown: {
    date: string;
    formattedDate: string; // e.g. "01 സെപ്റ്റംബർ"
    totalAmount: number;
    transactionCount: number;
  }[];
}

export type ActiveTab = 'dashboard' | 'new-entry' | 'history' | 'statement' | 'operations' | 'settings';
