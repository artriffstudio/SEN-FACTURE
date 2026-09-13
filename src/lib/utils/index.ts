import { format, formatDistanceToNow, parseISO, isAfter, isBefore } from "date-fns";
import { fr } from "date-fns/locale";
import { CURRENCIES } from "@/lib/constants";
import { CurrencyCode } from "@/lib/types";

// ============================================================
// Currency Formatting
// ============================================================

export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode = "XOF"
): string {
  const config = CURRENCIES[currencyCode];
  if (!config) return `${amount}`;

  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
    useGrouping: true,
  }).format(amount);

  // For CFA, put symbol after the number
  if (currencyCode === "XOF" || currencyCode === "XAF") {
    return `${formatted} ${config.symbol}`;
  }

  return `${config.symbol}${formatted}`;
}

// ============================================================
// Date Formatting
// ============================================================

export function formatDate(dateString: string): string {
  return format(parseISO(dateString), "dd MMM yyyy", { locale: fr });
}

export function formatDateLong(dateString: string): string {
  return format(parseISO(dateString), "dd MMMM yyyy", { locale: fr });
}

export function formatDateShort(dateString: string): string {
  return format(parseISO(dateString), "dd/MM/yyyy", { locale: fr });
}

export function formatRelativeDate(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), {
    addSuffix: true,
    locale: fr,
  });
}

export function isOverdue(dueDateString: string): boolean {
  return isBefore(parseISO(dueDateString), new Date());
}

export function isDueSoon(dueDateString: string, daysThreshold: number = 3): boolean {
  const dueDate = parseISO(dueDateString);
  const now = new Date();
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + daysThreshold);
  return isAfter(dueDate, now) && isBefore(dueDate, threshold);
}

// ============================================================
// Number Formatting
// ============================================================

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ============================================================
// Invoice Number Generation
// ============================================================

export function generateInvoiceNumber(
  prefix: string,
  nextNumber: number
): string {
  const year = new Date().getFullYear();
  const paddedNumber = String(nextNumber).padStart(4, "0");
  return `${prefix}-${year}-${paddedNumber}`;
}

// ============================================================
// Tax Calculations
// ============================================================

export function calculateSubtotal(
  items: { quantity: number; unitPrice: number }[]
): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function calculateTaxAmount(subtotal: number, taxRate: number): number {
  return Math.round(subtotal * (taxRate / 100));
}

export function calculateTotal(subtotal: number, taxAmount: number): number {
  return subtotal + taxAmount;
}

// ============================================================
// Misc Utilities
// ============================================================

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
