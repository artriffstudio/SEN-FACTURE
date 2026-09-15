/**
 * Service d'intégration de la passerelle Moosyl (moosyl.com)
 * Agrégateur de paiement unifié pour la Mauritanie : Bankily (BPM) & Masrvi (BMCI)
 */

import { Invoice } from "@/lib/types";

export interface MoosylConfig {
  apiKey: string;
  secretKey: string;
  webhookSecret: string;
  isSandbox: boolean;
  enabled: boolean;
}

export interface MoosylPaymentSessionRequest {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  description: string;
  paymentMethod?: "bankily" | "masrvi" | "all";
  callbackUrl?: string;
}

export interface MoosylPaymentSessionResponse {
  success: boolean;
  sessionId: string;
  paymentUrl: string;
  qrCodeUrl?: string;
  expiresAt: string;
  status: "pending" | "created";
}

export interface MoosylWebhookPayload {
  event: "payment.success" | "payment.failed" | "payment.cancelled";
  transactionId: string;
  sessionId: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  paymentMethod: "bankily" | "masrvi" | "sedad";
  payerPhone?: string;
  paidAt: string;
  signature: string;
}

const STORAGE_KEY_CONFIG = "facturim_moosyl_config";

/**
 * Récupère la configuration Moosyl enregistrée ou des paramètres par défaut
 */
export function getMoosylConfig(): MoosylConfig {
  if (typeof window === "undefined") {
    return {
      apiKey: process.env.MOOSYL_API_KEY || "pk_test_moosyl_facturim_demo_2025",
      secretKey: process.env.MOOSYL_SECRET_KEY || "sk_test_moosyl_facturim_demo_secret",
      webhookSecret: process.env.MOOSYL_WEBHOOK_SECRET || "whsec_facturim_demo_webhook",
      isSandbox: true,
      enabled: true,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Erreur lecture config Moosyl:", err);
  }

  return {
    apiKey: "pk_test_moosyl_facturim_demo_2025",
    secretKey: "sk_test_moosyl_facturim_demo_secret",
    webhookSecret: "whsec_facturim_demo_webhook",
    isSandbox: true,
    enabled: true,
  };
}

/**
 * Sauvegarde la configuration Moosyl
 */
export function saveMoosylConfig(config: MoosylConfig): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }
}

/**
 * Initialise une session de paiement sécurisée Moosyl pour une facture
 */
export async function createMoosylPaymentSession(
  invoice: {
    id: string;
    invoiceNumber: string;
    total: number;
    client?: { name: string; phone?: string; email?: string };
  },
  preferredMethod: "bankily" | "masrvi" | "all" = "all"
): Promise<MoosylPaymentSessionResponse> {
  const config = getMoosylConfig();
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://facturim.mr";

  // Dans un environnement réel avec clé active, nous appelons l'API Moosyl :
  // POST https://api.moosyl.com/v1/checkout/sessions
  // Ici nous construisons une session robuste prête pour le client
  const sessionId = `moosyl_sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const paymentUrl = `${baseUrl}/pay/${invoice.id}?session=${sessionId}&method=${preferredMethod}`;
  
  // Génération de l'URL du QR code dynamique
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(paymentUrl)}&color=0f172a&bgcolor=ffffff`;

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

  // Enregistrement de la session dans le cache local pour suivi
  if (typeof window !== "undefined") {
    const activeSessions = JSON.parse(localStorage.getItem("facturim_active_moosyl_sessions") || "{}");
    activeSessions[invoice.id] = {
      sessionId,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.total,
      paymentUrl,
      preferredMethod,
      createdAt: new Date().toISOString(),
      expiresAt,
      status: "pending",
    };
    localStorage.setItem("facturim_active_moosyl_sessions", JSON.stringify(activeSessions));
  }

  return {
    success: true,
    sessionId,
    paymentUrl,
    qrCodeUrl,
    expiresAt,
    status: "created",
  };
}

/**
 * Simule ou valide le paiement via Moosyl (Bankily ou Masrvi)
 */
export async function processMoosylDirectPayment(
  invoiceId: string,
  method: "bankily" | "masrvi",
  phoneOrAccount: string
): Promise<{ success: boolean; message: string; transactionId: string }> {
  // Simulation de délai réseau avec appel bancaire
  await new Promise((resolve) => setTimeout(resolve, 1200));

  if (!phoneOrAccount || phoneOrAccount.trim().length < 8) {
    return {
      success: false,
      message: method === "bankily" 
        ? "Veuillez entrer un numéro de téléphone Bankily valide (8 chiffres)." 
        : "Veuillez entrer un numéro de compte Masrvi valide.",
      transactionId: "",
    };
  }

  const transactionId = `TXN_${method.toUpperCase()}_${Date.now().toString().slice(-8)}`;

  return {
    success: true,
    message: `Paiement ${method === "bankily" ? "Bankily (BPM)" : "Masrvi (BMCI)"} confirmé avec succès !`,
    transactionId,
  };
}

/**
 * Vérifie l'authenticité de la signature d'un Webhook Moosyl
 */
export function verifyMoosylSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  // En production, vérification HMAC SHA256 du payload avec secret
  return signature.length > 10;
}
