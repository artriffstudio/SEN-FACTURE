// ============================================================
// Invoice Types
// ============================================================

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  sortOrder: number;
}

export interface Invoice {
  id: string;
  companyId: string;
  clientId: string;
  client?: Client;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export interface InvoiceFormData {
  clientId: string;
  issueDate: string;
  dueDate: string;
  items: Omit<InvoiceItem, "id" | "sortOrder">[];
  notes?: string;
  status: InvoiceStatus;
}

// ============================================================
// Client Types
// ============================================================

export interface Client {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country: string;
  taxId?: string;
  notes?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
  invoiceCount?: number;
  totalRevenue?: number;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country: string;
  taxId?: string;
  notes?: string;
  logoUrl?: string;
}

// ============================================================
// Company Types
// ============================================================

export interface Company {
  id: string;
  userId: string;
  name: string;
  tradeName?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country: string;
  taxId?: string;
  currency: CurrencyCode;
  taxRate: number;
  logoUrl?: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyFormData {
  name: string;
  tradeName?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  country: string;
  taxId?: string;
  currency: CurrencyCode;
  taxRate: number;
  invoicePrefix: string;
  termsAndConditions?: string;
}

// ============================================================
// Currency Types
// ============================================================

export type CurrencyCode =
  | "XOF"
  | "XAF"
  | "NGN"
  | "KES"
  | "GHS"
  | "MAD"
  | "ZAR"
  | "USD"
  | "EUR";

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;
  decimals: number;
}

// ============================================================
// Dashboard Types
// ============================================================

export interface DashboardStats {
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  totalClients: number;
  invoiceCount: number;
  paidCount: number;
  overdueCount: number;
  draftCount: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  count: number;
}

// ============================================================
// Catalog / Prestation Types
// ============================================================

export interface CatalogItem {
  id: string;
  code: string;
  name: string;
  description: string;
  category: "Developpement" | "Cloud & Reseau" | "Conseil & Audit" | "Maintenance" | "Formation";
  unitPrice: number;
  unit: string;
  taxRate: number;
  active: boolean;
}
