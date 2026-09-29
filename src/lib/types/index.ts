// ============================================================
// FACTURIM — Core TypeScript Type Definitions
// Conforme Réglementation Fiscale DGI & BCM Mauritanie
// ============================================================

// ============================================================
// 1. Roles & Permissions (RBAC)
// ============================================================
export type UserRole = "owner" | "admin" | "accountant" | "sales" | "viewer";

export interface TeamMember {
  id: string;
  companyId: string;
  userId?: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

// ============================================================
// 2. Invoice Types
// ============================================================
export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "partially_paid"
  | "overdue"
  | "cancelled";

export type TaxRateOption = 0 | 16 | 18;

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number; // 16%, 18%, 0%
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
  taxRate: number; // Taux par défaut ou consolidé (ex: 16% standard DGI)
  taxAmount: number;
  total: number;
  depositAmount?: number;
  depositPercentage?: number;
  paidAmount?: number;
  remainingAmount?: number;
  paymentTerms?: string; // "Paiement à réception", "5 jours", "10 jours", "15 jours", "30 jours", etc.
  notes?: string;
  verificationHash?: string;
  qrCodeUrl?: string;
  isCreditNote?: boolean; // Facture d'Avoir
  originalInvoiceNumber?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export interface InvoiceFormData {
  clientId: string;
  issueDate: string;
  dueDate: string;
  items: Omit<InvoiceItem, "id" | "sortOrder">[];
  taxRate?: number;
  depositAmount?: number;
  depositPercentage?: number;
  paidAmount?: number;
  paymentTerms?: string;
  notes?: string;
  status: InvoiceStatus;
}

// ============================================================
// 3. Client Types
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
  taxId?: string; // NIF Client (Optionnel)
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
  taxId?: string; // Optionnel
  notes?: string;
  logoUrl?: string;
}

// ============================================================
// 4. Company & Payment Settings
// ============================================================
export type PaymentMethodCode =
  | "BANKILY"
  | "MASRVI"
  | "SEDAD"
  | "CLICK"
  | "BIM_BANK"
  | "BANK_TRANSFER"
  | "CASH";

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
  taxId?: string; // NIF Entreprise (Optionnel pour TPE/Informel)
  rccm?: string;  // Registre de Commerce (Optionnel)
  currency: CurrencyCode;
  taxRate: number;
  logoUrl?: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  defaultPaymentTerms?: string; // Ex: "Paiement à réception"
  
  // Coordonnées bancaires & Mobile Banking Mauritanie
  bankRib?: string;         // RIB Bancaire (BPM, BMCI, BNM, BMI, BIM, Attijari)
  bankilyPhone?: string;    // BANKILY (BPM)
  masrviPhone?: string;     // MASRVI (BMCI)
  sedadPhone?: string;      // SEDAD (BMI)
  clickPhone?: string;      // CLICK (BNM)
  bimBankPhone?: string;    // BIM BANK Mobile (BIM)
  
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
  taxId?: string; // NIF Optionnel
  rccm?: string;
  currency: CurrencyCode;
  taxRate: number;
  invoicePrefix: string;
  defaultPaymentTerms?: string;
  bankRib?: string;
  bankilyPhone?: string;
  masrviPhone?: string;
  sedadPhone?: string;
  clickPhone?: string;
  bimBankPhone?: string;
  termsAndConditions?: string;
}

// ============================================================
// 5. Currency Types
// ============================================================
export type CurrencyCode =
  | "MRU"
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
// 6. Dashboard Types (Adaptés au rôle)
// ============================================================
export interface DashboardStats {
  totalRevenue: number;     // Masqué si rôle = 'sales'
  pendingAmount: number;    // Masqué si rôle = 'sales'
  overdueAmount: number;    // Masqué si rôle = 'sales'
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
// 7. Catalog / Prestation Types
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

// ============================================================
// 8. Audit Trail (Piste d'audit immuable)
// ============================================================
export interface AuditLogEntry {
  id: string;
  companyId: string;
  userId?: string;
  userName: string;
  action:
    | "invoice.created"
    | "invoice.validated"
    | "invoice.paid"
    | "invoice.cancelled"
    | "invoice.exported"
    | "client.created"
    | "settings.updated"
    | "auth.login"
    | "mfa.enabled";
  resourceType: "invoice" | "client" | "settings" | "auth";
  resourceId?: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

// ============================================================
// 9. Document Verification Certificate (/verify/[id])
// ============================================================
export interface VerificationCertificate {
  isValid: boolean;
  invoiceNumber: string;
  issuerName: string;
  issuerTaxId?: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  totalTTC: number;
  currency: string;
  status: InvoiceStatus;
  verificationHash: string;
  verifiedAt: string;
}
