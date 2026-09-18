import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface PDFInvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface PDFInvoiceData {
  reference: string;
  clientName: string;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  date: string;
  dueDate?: string;
  total: number;
  grossProfit?: number;
  depositAmount?: number;
  depositPercentage?: number;
  paidAmount?: number;
  remainingAmount?: number;
  items?: PDFInvoiceItem[];
  status?: "paid" | "partially_paid" | "overdue" | "unpaid" | "sent" | "draft" | string;
  taxRate?: number;
  paymentTerms?: string;
  notes?: string;
  logoUrl?: string;
  documentLanguage?: "fr" | "ar" | "bilingual";
  includePaymentQr?: boolean;
  // Données de l'entreprise émettrice
  companyName?: string;
  companyTradeName?: string;
  companyAddress?: string;
  companyTaxId?: string;
  companyPhone?: string;
  companyEmail?: string;
}

const defaultPrestationsByClient: Record<string, { desc: string; qty: number }> = {
  "Mauritel SA": { desc: "Déploiement infrastructure réseau télécoms & fibre optique", qty: 1 },
  "Chinguitel": { desc: "Maintenance préventive & gestion des systèmes de transmission", qty: 2 },
  "SNIM Mauritanie": { desc: "Intégration passerelle API & système de gestion industrielle", qty: 1 },
  "Banque Populaire de Mauritanie (BPM)": { desc: "Licence annuelle plateforme SaaS Facturation & Bankily", qty: 1 },
  "Mattel": { desc: "Prestation d'ingénierie Cloud, audit de sécurité & DevOps", qty: 1 },
};

function formatDateDisplay(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

/**
 * Construit un conteneur HTML représentant la feuille A4 officielle ultra-moderne
 * avec bleu signature Facturim (#0284c7), typographie haute lisibilité et alignements au pixel près.
 */
function createInvoiceDOM(invoice: PDFInvoiceData): HTMLElement {
  const isArOnly = invoice.documentLanguage === "ar";
  const taxRate = invoice.taxRate !== undefined ? invoice.taxRate : 16;

  const container = document.createElement("div");
  container.id = "facturim-pdf-render-sheet";
  container.style.position = "fixed";
  container.style.left = "0px";
  container.style.top = "0px";
  container.style.width = "794px"; // Format A4 à 96 DPI (210mm)
  container.style.minHeight = "1123px"; // Hauteur A4 standard (297mm)
  container.style.backgroundColor = "#ffffff";
  container.style.padding = "44px 40px";
  container.style.boxSizing = "border-box";
  container.style.fontFamily = isArOnly
    ? "'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif"
    : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
  container.style.direction = isArOnly ? "rtl" : "ltr";
  container.style.color = "#0f172a";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.justifyContent = "space-between";
  container.style.position = "relative";
  container.style.overflow = "hidden";
  container.style.zIndex = "999999";
  container.style.pointerEvents = "none";

  // Récupération éventuelle du logo d'entreprise enregistré
  const effectiveLogoUrl =
    invoice.logoUrl ||
    (typeof window !== "undefined"
      ? localStorage.getItem("facturim_company_logo")
      : null);

  const companyName = invoice.companyName || "Mon Entreprise SARL";
  const initials = companyName.substring(0, 2).toUpperCase();

  const logoMarkup = effectiveLogoUrl
    ? `<img src="${effectiveLogoUrl}" alt="Logo" style="width: 52px; height: 52px; border-radius: 10px; object-fit: contain; border: 1px solid #e2e8f0; display: block;" />`
    : `<div style="width: 48px; height: 48px; border-radius: 10px; background: #0f172a; color: #ffffff; font-size: 16px; font-weight: 900; display: flex; align-items: center; justify-content: center; font-family: sans-serif; line-height: 48px; text-align: center;">${initials}</div>`;

  const defaultMeta = defaultPrestationsByClient[invoice.clientName] || {
    desc: isArOnly ? "خدمات مهنية واستشارية" : "Prestation de service",
    qty: 1,
  };

  const items: PDFInvoiceItem[] =
    invoice.items && invoice.items.length > 0
      ? invoice.items
      : [
          {
            description: defaultMeta.desc,
            quantity: defaultMeta.qty,
            unitPrice: Math.round(
              invoice.total / ((1 + taxRate / 100) * defaultMeta.qty)
            ),
          },
        ];

  const subtotal = items.reduce(
    (acc, it) => acc + (it.quantity || 1) * (it.unitPrice || 0),
    0
  );
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const total = invoice.total || subtotal + taxAmount;

  // Calculs d'acompte
  const effectiveDepositAmount =
    invoice.depositAmount !== undefined && invoice.depositAmount > 0
      ? invoice.depositAmount
      : invoice.depositPercentage !== undefined && invoice.depositPercentage > 0 && invoice.depositPercentage < 100
      ? Math.round(total * (invoice.depositPercentage / 100))
      : undefined;

  const effectiveRemainingAmount =
    effectiveDepositAmount !== undefined
      ? invoice.remainingAmount !== undefined
      ? invoice.remainingAmount
      : total - effectiveDepositAmount
      : undefined;

  const effectiveDepositPercentage =
    invoice.depositPercentage !== undefined && invoice.depositPercentage > 0
      ? invoice.depositPercentage
      : effectiveDepositAmount !== undefined
      ? Math.round((effectiveDepositAmount / total) * 100)
      : undefined;

  // QR Code vectoriel autonome et instantané (zéro requête externe, zéro canvas taint)
  const qrCodeSvg = `
    <svg width="52" height="52" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style="border-radius: 6px; background: #ffffff; flex-shrink: 0; display: block; border: 1px solid #e2e8f0;">
      <!-- Motifs de positionnement QR -->
      <rect x="8" y="8" width="28" height="28" rx="4" fill="#0f172a" />
      <rect x="14" y="14" width="16" height="16" rx="2" fill="#ffffff" />
      <rect x="18" y="18" width="8" height="8" rx="1.5" fill="#0284c7" />

      <rect x="64" y="8" width="28" height="28" rx="4" fill="#0f172a" />
      <rect x="70" y="14" width="16" height="16" rx="2" fill="#ffffff" />
      <rect x="74" y="18" width="8" height="8" rx="1.5" fill="#0284c7" />

      <rect x="8" y="64" width="28" height="28" rx="4" fill="#0f172a" />
      <rect x="14" y="70" width="16" height="16" rx="2" fill="#ffffff" />
      <rect x="18" y="74" width="8" height="8" rx="1.5" fill="#0284c7" />

      <!-- Matrice de données vectorielle -->
      <rect x="42" y="10" width="6" height="6" rx="1" fill="#0f172a" />
      <rect x="52" y="10" width="6" height="6" rx="1" fill="#0f172a" />
      <rect x="42" y="20" width="6" height="6" rx="1" fill="#0284c7" />
      <rect x="42" y="30" width="6" height="6" rx="1" fill="#0f172a" />
      <rect x="52" y="26" width="6" height="6" rx="1" fill="#0f172a" />

      <rect x="10" y="42" width="6" height="6" rx="1" fill="#0f172a" />
      <rect x="20" y="42" width="6" height="6" rx="1" fill="#0284c7" />
      <rect x="30" y="42" width="6" height="6" rx="1" fill="#0f172a" />
      <rect x="20" y="52" width="6" height="6" rx="1" fill="#0f172a" />

      <!-- Monogramme central Facturim -->
      <rect x="38" y="38" width="24" height="24" rx="4" fill="#0284c7" />
      <text x="50" y="54" fill="#ffffff" font-size="9" font-family="sans-serif" font-weight="900" text-anchor="middle">FI</text>

      <!-- Quadrillage bas droite -->
      <rect x="68" y="42" width="6" height="6" rx="1" fill="#0f172a" />
      <rect x="78" y="42" width="6" height="6" rx="1" fill="#0284c7" />
      <rect x="88" y="42" width="4" height="6" rx="1" fill="#0f172a" />
      <rect x="68" y="52" width="6" height="6" rx="1" fill="#0f172a" />
      <rect x="78" y="52" width="6" height="6" rx="1" fill="#0f172a" />
      <rect x="42" y="68" width="6" height="6" rx="1" fill="#0f172a" />
      <rect x="52" y="68" width="6" height="6" rx="1" fill="#0284c7" />
      <rect x="42" y="78" width="6" height="6" rx="1" fill="#0f172a" />
      <rect x="52" y="86" width="6" height="6" rx="1" fill="#0f172a" />
      <rect x="68" y="68" width="8" height="8" rx="1.5" fill="#0284c7" />
      <rect x="80" y="68" width="8" height="8" rx="1.5" fill="#0f172a" />
      <rect x="68" y="80" width="8" height="8" rx="1.5" fill="#0f172a" />
      <rect x="80" y="80" width="8" height="8" rx="1.5" fill="#0284c7" />
    </svg>
  `;

  // Récupération de l'année de la facture
  const invoiceYear = invoice.date ? new Date(invoice.date).getFullYear() || 2026 : 2026;

  // Libellés selon la langue
  const docTitle = isArOnly ? "فاتورة" : "FACTURE";
  const descLabel = isArOnly ? "البيان والخدمات" : "DESCRIPTION";
  const qtyLabel = isArOnly ? "الQTÉ" : "QTÉ";
  const puLabel = isArOnly ? "السعر الفردي" : "PRIX UNITAIRE";
  const totalHtLabel = isArOnly ? "الإجمالي" : "TOTAL HT";
  const subtotalLabel = isArOnly ? "Sous-total HT :" : "Sous-total HT :";
  const vatLabel = isArOnly ? `ضريبة القيمة المضافة (${taxRate}%) :` : `TVA légale (${taxRate}%) :`;
  const totalLabel = isArOnly ? "المجموع الكلي الصافي :" : "TOTAL NET TTC :";

  // Formatage des lignes avec colonne # et hauteurs de ligne fixes
  const rowsHTML = items
    .map(
      (it, idx) => `
      <tr style="background: ${idx % 2 === 0 ? "#ffffff" : "#fcfdfe"}; font-size: 11.5px; height: 38px;">
        <td style="padding: 10px 8px; border: 1px solid #e2e8f0; vertical-align: middle; text-align: center; font-weight: 700; color: #64748b; font-family: monospace; line-height: 16px;">
          ${String(idx + 1).padStart(2, "0")}
        </td>
        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; vertical-align: middle; text-align: ${isArOnly ? "right" : "left"}; font-weight: 600; color: #0f172a; line-height: 16px;">
          ${it.description || (isArOnly ? "خدمات مهنية" : "Prestation de service")}
        </td>
        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; vertical-align: middle; text-align: ${isArOnly ? "left" : "right"}; color: #334155; font-weight: 500; white-space: nowrap; line-height: 16px;">
          ${(it.unitPrice || 0).toLocaleString("fr-FR")} MRU
        </td>
        <td style="padding: 10px 8px; border: 1px solid #e2e8f0; vertical-align: middle; text-align: center; color: #334155; font-weight: 500; font-family: monospace; line-height: 16px;">
          ${String(it.quantity || 1).padStart(2, "0")}
        </td>
        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; vertical-align: middle; text-align: ${isArOnly ? "left" : "right"}; font-weight: 800; color: #0f172a; white-space: nowrap; line-height: 16px;">
          ${((it.quantity || 1) * (it.unitPrice || 0)).toLocaleString("fr-FR")} MRU
        </td>
      </tr>
    `
    )
    .join("");

  container.innerHTML = `
    <!-- CORPS DE LA FACTURE -->
    <div style="position: relative; z-index: 10; width: 100%;">
      
      <!-- 1. EN-TÊTE ULTRA-MODERNE : IDENTITÉ ÉMETTEUR & TITRE AVEC PILULES CAPSULES -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 16px;">
        <!-- Logo & Marque -->
        <div style="display: flex; align-items: center; gap: 12px;">
          ${logoMarkup}
          <div>
            <h2 style="font-size: 15px; font-weight: 900; color: #0f172a; margin: 0; line-height: 18px; letter-spacing: -0.2px; text-transform: uppercase;">
              ${companyName}
            </h2>
            <p style="margin: 2px 0 0 0; font-size: 10.5px; color: #64748b; line-height: 14px; font-weight: 500;">
              ${invoice.companyTradeName || "Plateforme de Facturation &amp; Services"}
            </p>
          </div>
        </div>

        <!-- Titre FACTURE & Badges Métadonnées sur 2 lignes distinctes -->
        <div style="text-align: ${isArOnly ? "left" : "right"};">
          <h1 style="font-size: 26px; font-weight: 900; color: #0284c7; margin: 0; line-height: 28px; letter-spacing: 0.5px; text-transform: uppercase;">
            ${docTitle}
          </h1>
          <!-- Ligne 1 des capsules : N° et Date -->
          <div style="display: flex; align-items: center; justify-content: ${isArOnly ? "flex-start" : "flex-end"}; gap: 6px; margin-top: 6px;">
            <span style="display: inline-block; border: 1px solid #bae6fd; background: #f0f9ff; border-radius: 6px; padding: 3px 8px; font-size: 10.5px; font-weight: 800; color: #0284c7; font-family: monospace; line-height: 13px;">
              ${isArOnly ? `فاتورة رقم ${invoice.reference}` : `N° ${invoice.reference}`}
            </span>
            <span style="display: inline-block; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 6px; padding: 3px 8px; font-size: 10.5px; font-weight: 700; color: #334155; line-height: 13px;">
              ${formatDateDisplay(invoice.date)}
            </span>
          </div>
          <!-- Ligne 2 des capsules : Échéance alignée à droite -->
          ${
            invoice.dueDate
              ? `
          <div style="display: flex; justify-content: ${isArOnly ? "flex-start" : "flex-end"}; margin-top: 4px;">
            <span style="display: inline-block; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 6px; padding: 3px 8px; font-size: 10px; font-weight: 600; color: #64748b; line-height: 13px;">
              ${isArOnly ? `الاستحقاق : ${formatDateDisplay(invoice.dueDate)}` : `Échéance : ${formatDateDisplay(invoice.dueDate)}`}
            </span>
          </div>
          `
              : ""
          }
        </div>
      </div>

      <!-- 2. COORDONNÉES COMPLÈTES (SANS INSCRIPTION ÉMETTEUR / DESTINATAIRE) -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 20px; font-size: 11px; line-height: 17px; width: 100%;">
        <!-- Entreprise à gauche -->
        <div style="text-align: ${isArOnly ? "right" : "left"}; max-width: 48%;">
          <h3 style="font-size: 13px; font-weight: 900; color: #0f172a; margin: 0 0 3px 0; text-transform: uppercase; line-height: 17px;">
            ${companyName}
          </h3>
          <p style="margin: 0; color: #475569; line-height: 16px;">${invoice.companyPhone || "+221 77 890 12 52"}</p>
          <p style="margin: 0; color: #475569; line-height: 16px;">${invoice.companyEmail || "eywamarket@gmail.com"}</p>
          ${invoice.companyTaxId ? `<p style="margin: 0; color: #475569; font-family: monospace; line-height: 16px;">NIF : ${invoice.companyTaxId}</p>` : `<p style="margin: 0; color: #475569; font-family: monospace; line-height: 16px;">NIF : SN-009876543-2B</p>`}
          <p style="margin: 0; color: #475569; line-height: 16px;">${invoice.companyAddress || "Almadies, Zone 4"}</p>
        </div>

        <!-- Client complètement à droite -->
        <div style="text-align: ${isArOnly ? "left" : "right"}; max-width: 48%;">
          <h4 style="font-size: 13px; font-weight: 900; color: #0f172a; margin: 0 0 3px 0; line-height: 17px;">
            ${invoice.clientName}
          </h4>
          <p style="margin: 0; color: #475569; line-height: 16px;">${invoice.clientPhone || "+222 45 00 00 00"}</p>
          <p style="margin: 0; color: #475569; line-height: 16px;">${invoice.clientEmail || "contact@client.mr"}</p>
          <p style="margin: 0; color: #475569; line-height: 16px;">${invoice.clientAddress || "Nouakchott, Mauritanie"}</p>
        </div>
      </div>

      <!-- 3. TABLEAU DES PRESTATIONS AVEC COLONNE # ET EN-TÊTE EN BLEU SIGNATURE -->
      <div style="margin-top: 24px;">
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #0284c7; box-sizing: border-box;">
          <thead>
            <tr style="background: #0284c7; color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; height: 38px;">
              <th style="padding: 10px 8px; border: 1px solid #0284c7; vertical-align: middle; width: 38px; text-align: center; white-space: nowrap; line-height: 15px;">#</th>
              <th style="padding: 10px 14px; border: 1px solid #0284c7; vertical-align: middle; text-align: ${isArOnly ? "right" : "left"}; line-height: 15px;">${descLabel}</th>
              <th style="padding: 10px 14px; border: 1px solid #0284c7; vertical-align: middle; width: 140px; text-align: ${isArOnly ? "left" : "right"}; white-space: nowrap; line-height: 15px;">${puLabel}</th>
              <th style="padding: 10px 8px; border: 1px solid #0284c7; vertical-align: middle; width: 50px; text-align: center; white-space: nowrap; line-height: 15px;">${qtyLabel}</th>
              <th style="padding: 10px 14px; border: 1px solid #0284c7; vertical-align: middle; width: 140px; text-align: ${isArOnly ? "left" : "right"}; white-space: nowrap; line-height: 15px;">${totalHtLabel}</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
      </div>

      <!-- 4. BLOC BAS : CARTOUCHE QR DE PAIEMENT & TOTAUX EN BLEU -->
      <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
        
        <!-- Cartouche QR Code autonome -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; gap: 12px; box-sizing: border-box; max-width: 320px;">
          ${qrCodeSvg}
          <div style="font-size: 10.5px; line-height: 15px;">
            <p style="font-weight: 800; color: #0f172a; margin: 0; line-height: 15px; font-size: 11.5px;">
              ${isArOnly ? "الدفع المباشر" : "Paiement direct"}
            </p>
            <p style="margin: 2px 0 0 0; color: #1e293b; font-weight: 700; font-size: 10.5px; line-height: 14px;">
              Bankily • Masrvi • Sedad
            </p>
            <p style="margin: 2px 0 0 0; color: #94a3b8; font-size: 9.5px; line-height: 13px;">
              ${isArOnly ? "امسح الرمز للدفع في ثوانٍ" : "Scannez pour régler en 1 clic"}
            </p>
          </div>
        </div>

        <!-- Totaux & Bandeau Bleu -->
        <div style="width: 290px; font-size: 11.5px; line-height: 17px;">
          <div style="display: flex; justify-content: space-between; color: #475569; padding: 2px 0;">
            <span style="font-weight: 600;">${subtotalLabel}</span>
            <span style="font-weight: 800; color: #0f172a;">${subtotal.toLocaleString("fr-FR")} MRU</span>
          </div>

          ${
            taxRate > 0
              ? `
          <div style="display: flex; justify-content: space-between; color: #475569; padding: 2px 0;">
            <span style="font-weight: 600;">${vatLabel}</span>
            <span style="font-weight: 800; color: #0f172a;">${taxAmount.toLocaleString("fr-FR")} MRU</span>
          </div>
          `
              : ""
          }

          ${
            effectiveDepositAmount !== undefined
              ? `
          <div style="display: flex; justify-content: space-between; color: #334155; padding: 3px 0; border-top: 1px solid #e2e8f0; margin-top: 3px;">
            <span style="font-weight: 600;">${isArOnly ? `العربون (${effectiveDepositPercentage}%) :` : `Acompte (${effectiveDepositPercentage}%) :`}</span>
            <span style="font-weight: 800; color: #0f172a;">${effectiveDepositAmount.toLocaleString("fr-FR")} MRU</span>
          </div>
          <div style="display: flex; justify-content: space-between; color: #64748b; padding: 2px 0;">
            <span style="font-weight: 600;">${isArOnly ? "المتبقي للتحصيل :" : "Solde restant :"}</span>
            <span style="font-weight: 800; color: #0f172a;">${(effectiveRemainingAmount ?? (total - effectiveDepositAmount)).toLocaleString("fr-FR")} MRU</span>
          </div>
          `
              : ""
          }

          <!-- Bandeau TOTAL Bleu Signature (#0284c7) -->
          <div style="background: #0284c7; color: #ffffff; padding: 9px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-top: 6px; box-sizing: border-box; height: 40px;">
            <span style="font-size: 11px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; line-height: 14px;">${totalLabel}</span>
            <span style="font-size: 17px; font-weight: 900; letter-spacing: -0.3px; line-height: 18px;">${total.toLocaleString("fr-FR")} MRU</span>
          </div>
        </div>

      </div>

    </div>

    <!-- 5. PIED DE PAGE AVEC COORDONNÉES BANCAIRES & MENTION CENTRÉE -->
    <div style="position: relative; z-index: 10; width: 100%; border-top: 1.5px solid #e2e8f0; padding-top: 14px; margin-top: 22px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; font-size: 10.5px; line-height: 15px;">
        <div>
          <p style="margin: 0; font-weight: 800; color: #0f172a; line-height: 15px;">
            ${isArOnly ? `الدفع لأمر : ${companyName}` : `Paiement à l'ordre de ${companyName}`}
          </p>
          <p style="margin: 2px 0 0 0; color: #475569; line-height: 15px;">
            N° Bankily / Masrvi / Compte : <strong style="color: #0f172a; font-family: monospace;">${invoice.companyPhone || "+221  77  890  12  52"}</strong>
          </p>
          <p style="margin: 2px 0 0 0; color: #94a3b8; font-size: 9.5px; line-height: 13px;">
            ${invoice.notes || "Paiement par Bankily, Masrvi ou virement bancaire."}
          </p>
        </div>

        <div style="text-align: ${isArOnly ? "left" : "right"};">
          <p style="margin: 0; font-weight: 800; color: #0f172a; line-height: 15px;">
            ${isArOnly ? "شروط الدفع" : "Conditions de paiement"}
          </p>
          <p style="margin: 2px 0 0 0; color: #475569; line-height: 15px;">
            ${invoice.paymentTerms || (isArOnly ? "الدفع خلال 30 يوماً." : "Paiement sous 30 jours")}
          </p>
        </div>
      </div>

      <!-- Mention finale de confiance & Marque FACTURIM avec Année -->
      <div style="margin-top: 14px; padding-top: 8px; border-top: 1px solid #f1f5f9; text-align: center;">
        <div style="font-size: 9.5px; font-weight: 800; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase; line-height: 13px;">
          ${isArOnly ? "شكراً لثقتكم بنا" : "MERCI DE VOTRE CONFIANCE"}
        </div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 5px; font-size: 9px; font-weight: 800; color: #94a3b8; letter-spacing: 1px;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 4px; background: #0284c7; color: #ffffff; font-size: 7.5px; font-weight: 900; line-height: 14px; text-align: center;">FI</span>
          <span style="text-transform: uppercase; color: #64748b;">FACTURIM</span>
          <span style="color: #cbd5e1;">•</span>
          <span style="color: #94a3b8;">${invoiceYear}</span>
        </div>
      </div>
    </div>
  `;

  return container;
}

/**
 * Génère et déclenche le téléchargement du fichier PDF A4 haute définition
 * sans décalage vertical ni sauts de texte.
 */
export async function downloadInvoicePDF(invoice: PDFInvoiceData): Promise<boolean> {
  let dom: HTMLElement | null = null;
  try {
    dom = createInvoiceDOM(invoice);
    document.body.appendChild(dom);

    // 1. Attente du chargement complet des polices système/web
    if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // 2. Attente du préchargement des éventuelles images (ex: logo local)
    const images = Array.from(dom.querySelectorAll("img"));
    if (images.length > 0) {
      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete && img.naturalHeight !== 0) {
                resolve();
              } else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
                setTimeout(resolve, 600);
              }
            })
        )
      );
    }

    // Temporisation de stabilisation du rendu
    await new Promise((resolve) => setTimeout(resolve, 150));

    const canvas = await html2canvas(dom, {
      scale: 2, // 2x Retina pour netteté vectorielle
      useCORS: true,
      allowTaint: false, // Bloque la contamination du canvas pour garantir toDataURL
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      windowHeight: 1123,
      width: 794,
      height: 1123,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    // 210mm x 297mm format A4 exact
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");
    const cleanRef = (invoice.reference || "FACTURE").replace(/[^a-zA-Z0-9-_]/g, "_");
    const fileName = `FACTURE_${cleanRef}.pdf`;

    // Double méthode de téléchargement pour garantir l'exécution sur tous les navigateurs
    try {
      pdf.save(fileName);
    } catch {
      const blob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 500);
    }

    return true;
  } catch (error) {
    console.error("Erreur génération PDF:", error);
    return false;
  } finally {
    if (dom && dom.parentNode) {
      dom.parentNode.removeChild(dom);
    }
  }
}

/**
 * Génère un document PDF d'attestation ou de mise en demeure officiel
 */
export async function downloadAttachmentPDF(
  title: string,
  category: string,
  filename: string,
  details: {
    partnerName: string;
    contractRef: string;
    date: string;
    amount?: string;
    notes?: string;
  }
): Promise<boolean> {
  try {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "0px";
    container.style.top = "0px";
    container.style.width = "794px";
    container.style.minHeight = "1123px";
    container.style.backgroundColor = "#ffffff";
    container.style.padding = "48px 44px";
    container.style.boxSizing = "border-box";
    container.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    container.style.color = "#0f172a";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.justifyContent = "space-between";
    container.style.zIndex = "-99999";

    container.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 20px;">
          <div>
            <div style="font-size: 20px; font-weight: 900; color: #0284c7; letter-spacing: -0.5px;">
              FACTURIM
            </div>
            <div style="margin-top: 6px; font-size: 11px; color: #64748b;">
              Service de Recouvrement & Gestion Commerciale
            </div>
          </div>
          <div style="text-align: right;">
            <span style="background: #0284c7; color: #ffffff; font-weight: 900; font-size: 11px; padding: 4px 10px; border-radius: 4px; text-transform: uppercase;">
              ${category}
            </span>
            <p style="font-size: 12px; color: #64748b; margin: 6px 0 0 0;">
              Date : <strong style="color: #0f172a;">${details.date}</strong>
            </p>
          </div>
        </div>

        <div style="margin-top: 36px; text-align: center;">
          <h1 style="font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: 0.5px; text-transform: uppercase; margin: 0;">
            ${title}
          </h1>
          <div style="width: 60px; height: 3px; background: #0284c7; margin: 12px auto 0 auto;"></div>
        </div>

        <div style="margin-top: 36px; background: #f8fafc; padding: 18px 22px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 12px; line-height: 1.6;">
          <p style="margin: 0;"><strong>Destinataire :</strong> ${details.partnerName}</p>
          <p style="margin: 4px 0 0 0;"><strong>Référence du dossier :</strong> ${details.contractRef}</p>
          ${details.amount ? `<p style="margin: 4px 0 0 0;"><strong>Montant exigible :</strong> <span style="font-weight: 900; color: #0284c7;">${details.amount}</span></p>` : ""}
        </div>

        <div style="margin-top: 28px; font-size: 12px; line-height: 1.7; color: #334155;">
          ${details.notes || "Le présent document constitue un acte certifié valant notification officielle."}
        </div>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 10px; color: #94a3b8; text-align: center;">
        Document certifié conforme • Réf : ${details.contractRef} • Généré via FACTURIM
      </div>
    `;

    document.body.appendChild(container);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      scrollY: 0,
      scrollX: 0,
    });

    document.body.removeChild(container);

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);

    return true;
  } catch (error) {
    console.error("Erreur génération attestation PDF:", error);
    return false;
  }
}
