import { CurrencyCode, CurrencyConfig, InvoiceStatus } from "@/lib/types";

// ============================================================
// Invoice Statuses
// ============================================================

export const INVOICE_STATUSES: Record<
  InvoiceStatus,
  { label: string; color: string; bgColor: string }
> = {
  draft: {
    label: "Brouillon",
    color: "text-slate-700",
    bgColor: "bg-slate-100",
  },
  sent: {
    label: "Envoyée",
    color: "text-sky-700",
    bgColor: "bg-sky-100/70 border border-sky-200/50",
  },
  paid: {
    label: "Payée",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100/70 border border-emerald-200/50",
  },
  overdue: {
    label: "En retard",
    color: "text-rose-700",
    bgColor: "bg-rose-100/70 border border-rose-200/50",
  },
  cancelled: {
    label: "Annulée",
    color: "text-slate-500",
    bgColor: "bg-slate-100",
  },
};

// ============================================================
// Currencies
// ============================================================

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  XOF: {
    code: "XOF",
    name: "Franc CFA (BCEAO)",
    symbol: "FCFA",
    locale: "fr-SN",
    decimals: 0,
  },
  XAF: {
    code: "XAF",
    name: "Franc CFA (BEAC)",
    symbol: "FCFA",
    locale: "fr-CM",
    decimals: 0,
  },
  NGN: {
    code: "NGN",
    name: "Naira nigérian",
    symbol: "₦",
    locale: "en-NG",
    decimals: 2,
  },
  KES: {
    code: "KES",
    name: "Shilling kenyan",
    symbol: "KSh",
    locale: "en-KE",
    decimals: 2,
  },
  GHS: {
    code: "GHS",
    name: "Cedi ghanéen",
    symbol: "GH₵",
    locale: "en-GH",
    decimals: 2,
  },
  MAD: {
    code: "MAD",
    name: "Dirham marocain",
    symbol: "MAD",
    locale: "fr-MA",
    decimals: 2,
  },
  ZAR: {
    code: "ZAR",
    name: "Rand sud-africain",
    symbol: "R",
    locale: "en-ZA",
    decimals: 2,
  },
  USD: {
    code: "USD",
    name: "Dollar américain",
    symbol: "$",
    locale: "en-US",
    decimals: 2,
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    locale: "fr-FR",
    decimals: 2,
  },
};

// ============================================================
// African Countries
// ============================================================

export const COUNTRIES = [
  { code: "SN", name: "Sénégal", currency: "XOF" as CurrencyCode, taxRate: 18 },
  { code: "CI", name: "Côte d'Ivoire", currency: "XOF" as CurrencyCode, taxRate: 18 },
  { code: "ML", name: "Mali", currency: "XOF" as CurrencyCode, taxRate: 18 },
  { code: "BF", name: "Burkina Faso", currency: "XOF" as CurrencyCode, taxRate: 18 },
  { code: "NE", name: "Niger", currency: "XOF" as CurrencyCode, taxRate: 19 },
  { code: "TG", name: "Togo", currency: "XOF" as CurrencyCode, taxRate: 18 },
  { code: "BJ", name: "Bénin", currency: "XOF" as CurrencyCode, taxRate: 18 },
  { code: "GW", name: "Guinée-Bissau", currency: "XOF" as CurrencyCode, taxRate: 15 },
  { code: "CM", name: "Cameroun", currency: "XAF" as CurrencyCode, taxRate: 19.25 },
  { code: "GA", name: "Gabon", currency: "XAF" as CurrencyCode, taxRate: 18 },
  { code: "CG", name: "Congo", currency: "XAF" as CurrencyCode, taxRate: 18.9 },
  { code: "TD", name: "Tchad", currency: "XAF" as CurrencyCode, taxRate: 18 },
  { code: "CF", name: "Centrafrique", currency: "XAF" as CurrencyCode, taxRate: 19 },
  { code: "GQ", name: "Guinée équatoriale", currency: "XAF" as CurrencyCode, taxRate: 15 },
  { code: "NG", name: "Nigeria", currency: "NGN" as CurrencyCode, taxRate: 7.5 },
  { code: "KE", name: "Kenya", currency: "KES" as CurrencyCode, taxRate: 16 },
  { code: "GH", name: "Ghana", currency: "GHS" as CurrencyCode, taxRate: 15 },
  { code: "MA", name: "Maroc", currency: "MAD" as CurrencyCode, taxRate: 20 },
  { code: "ZA", name: "Afrique du Sud", currency: "ZAR" as CurrencyCode, taxRate: 15 },
  { code: "GN", name: "Guinée", currency: "XOF" as CurrencyCode, taxRate: 18 },
] as const;

// ============================================================
// Navigation
// ============================================================

export const NAV_ITEMS = [
  { label: "Tableau de bord", href: "/", icon: "LayoutDashboard" },
  { label: "Factures", href: "/invoices", icon: "FileText" },
  { label: "Clients", href: "/clients", icon: "Users" },
  { label: "Paramètres", href: "/settings", icon: "Settings" },
] as const;

// ============================================================
// Default Company Settings
// ============================================================

export const DEFAULT_COMPANY = {
  currency: "XOF" as CurrencyCode,
  taxRate: 18,
  invoicePrefix: "FAC",
  country: "SN",
};
