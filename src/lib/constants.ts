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
  partially_paid: {
    label: "Acompte versé",
    color: "text-amber-800",
    bgColor: "bg-amber-100/80 border border-amber-300/60",
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
  MRU: {
    code: "MRU",
    name: "Ouguiya mauritanienne",
    symbol: "MRU",
    locale: "fr-MR",
    decimals: 0,
  },
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
// Countries (Mauritanie en tête & pays partenaires)
// ============================================================

export const COUNTRIES = [
  { code: "MR", name: "Mauritanie", currency: "MRU" as CurrencyCode, taxRate: 16 },
  { code: "SN", name: "Sénégal", currency: "XOF" as CurrencyCode, taxRate: 18 },
  { code: "CI", name: "Côte d'Ivoire", currency: "XOF" as CurrencyCode, taxRate: 18 },
  { code: "ML", name: "Mali", currency: "XOF" as CurrencyCode, taxRate: 18 },
  { code: "MA", name: "Maroc", currency: "MAD" as CurrencyCode, taxRate: 20 },
  { code: "GN", name: "Guinée", currency: "XOF" as CurrencyCode, taxRate: 18 },
  { code: "BF", name: "Burkina Faso", currency: "XOF" as CurrencyCode, taxRate: 18 },
  { code: "NE", name: "Niger", currency: "XOF" as CurrencyCode, taxRate: 19 },
  { code: "TG", name: "Togo", currency: "XOF" as CurrencyCode, taxRate: 18 },
  { code: "BJ", name: "Bénin", currency: "XOF" as CurrencyCode, taxRate: 18 },
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
// Default Company Settings (Mauritanie / Facturim)
// ============================================================

export const DEFAULT_COMPANY = {
  name: "Teranga Tech Mauritanie SARL",
  tradeName: "Facturim Entreprise",
  email: "contact@facturim.net",
  phone: "+222 45 25 00 00",
  address: "Avenue du Roi Fayçal, Tevragh Zeina",
  city: "Nouakchott",
  country: "Mauritanie",
  currency: "MRU" as CurrencyCode,
  taxRate: 16, // TVA Mauritanie 16%
  taxId: "00987654-MR", // NIF
  rcNumber: "MR.NKTT.2025.B.1234",
  invoicePrefix: "FAC-2025-",
  bankRib: "MR12 00010 01001 12345678901 23 (BPM Mauritanie)",
  bankilyPhone: "+222 45 12 34 56",
  seddapPhone: "+222 36 78 90 12",
  termsAndConditions:
    "Paiement à réception par virement bancaire BPM ou Mobile Money (Bankily / Seddap). Conformément aux règles fiscales de la Direction Générale des Impôts de Mauritanie.",
};
