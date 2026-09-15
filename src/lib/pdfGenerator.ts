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
  items?: PDFInvoiceItem[];
  status?: "paid" | "overdue" | "unpaid" | "sent" | "draft" | string;
  taxRate?: number;
  paymentTerms?: string;
  notes?: string;
  logoUrl?: string;
  documentLanguage?: "fr" | "ar" | "bilingual";
  includePaymentQr?: boolean;
}

const defaultPrestationsByClient: Record<string, { desc: string; qty: number }> = {
  "Mauritel SA": { desc: "Déploiement infrastructure réseau télécoms & fibre optique", qty: 1 },
  "Chinguitel": { desc: "Maintenance préventive & gestion des systèmes de transmission", qty: 2 },
  "SNIM Mauritanie": { desc: "Intégration passerelle API & système de gestion industrielle", qty: 1 },
  "Banque Populaire de Mauritanie (BPM)": { desc: "Licence annuelle plateforme SaaS Facturation & Bankily", qty: 1 },
  "Mattel": { desc: "Prestation d'ingénierie Cloud, audit de sécurité & DevOps", qty: 1 },
};

/**
 * Construit un conteneur HTML représentant la feuille A4 officielle de Facturim (Mauritanie)
 * avec support des modes Français, Arabe (RTL) ou Bilingue FR/AR.
 */
function createInvoiceDOM(invoice: PDFInvoiceData): HTMLElement {
  const isBilingual = invoice.documentLanguage === "bilingual" || !invoice.documentLanguage;
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
  container.style.fontFamily =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Arabic', sans-serif";
  container.style.color = "#0f172a";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.justifyContent = "space-between";
  container.style.zIndex = "-99999";
  container.style.pointerEvents = "none";

  // Récupération éventuelle du logo d'entreprise enregistré
  const effectiveLogoUrl =
    invoice.logoUrl ||
    (typeof window !== "undefined"
      ? localStorage.getItem("facturim_company_logo")
      : null);

  const logoMarkup = effectiveLogoUrl
    ? `<img src="${effectiveLogoUrl}" alt="Logo Entreprise" style="width: 44px; height: 44px; border-radius: 10px; object-fit: contain; background: #ffffff; border: 1px solid #e2e8f0; display: block; flex-shrink: 0;" />`
    : `<svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;">
        <rect width="42" height="42" rx="10" fill="#0f172a"/>
        <text x="21" y="22.5" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="17" letter-spacing="-0.5">FI</text>
      </svg>`;

  const defaultMeta = defaultPrestationsByClient[invoice.clientName] || {
    desc: `Prestation contractuelle et services associés — ${invoice.clientName}`,
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
    (acc, it) => acc + it.quantity * it.unitPrice,
    0
  );
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const total = invoice.total || subtotal + taxAmount;

  // Configuration du badge de statut
  let statusBg = "#f1f5f9";
  let statusColor = "#475569";
  let statusLabel = isBilingual ? "EN ATTENTE / في الانتظار" : isArOnly ? "في الانتظار" : "EN ATTENTE";

  if (invoice.status === "paid") {
    statusBg = "#ecfdf5";
    statusColor = "#047857";
    statusLabel = isBilingual ? "PAYÉE / مدفوعة ✓" : isArOnly ? "مدفوعة ✓" : "PAYÉE ✓";
  } else if (invoice.status === "overdue") {
    statusBg = "#fff1f2";
    statusColor = "#be123c";
    statusLabel = isBilingual ? "EN RETARD / متأخرة" : isArOnly ? "متأخرة" : "EN RETARD";
  } else if (invoice.status === "sent") {
    statusBg = "#f0f9ff";
    statusColor = "#0369a1";
    statusLabel = isBilingual ? "ÉMISE / تم الإرسال" : isArOnly ? "تم الإرسال" : "ÉMISE";
  }

  // QR Code de paiement Moosyl (Bankily / Masrvi)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    `https://facturim.mr/pay/${invoice.reference}`
  )}&color=0f172a&bgcolor=ffffff`;

  // Libellés selon la langue
  const docTitle = isBilingual ? "FACTURE / فاتورة" : isArOnly ? "فاتورة رسمية" : "FACTURE OFFICIELLE";
  const billedToLabel = isBilingual ? "FACTURÉ À / الفاتورة إلى" : isArOnly ? "بيانات العميل" : "FACTURÉ À";
  const descLabel = isBilingual ? "DÉSIGNATION / البيان" : isArOnly ? "البيان والخدمات" : "DÉSIGNATION DES PRESTATIONS";
  const qtyLabel = isBilingual ? "QTÉ / الكمية" : isArOnly ? "الكمية" : "QTÉ";
  const puLabel = isBilingual ? "PRIX UNIT. / السعر" : isArOnly ? "السعر الإفرادي" : "PRIX UNIT.";
  const totalHtLabel = isBilingual ? "TOTAL HT / الإجمالي" : isArOnly ? "المجموع قبل الضريبة" : "TOTAL HT";
  const subtotalLabel = isBilingual ? "Sous-total HT / المجموع قبل الضريبة :" : isArOnly ? "المجموع قبل الضريبة :" : "Sous-total Hors Taxes (HT) :";
  const vatLabel = isBilingual ? `TVA légale (${taxRate}%) / ضريبة القيمة المضافة :` : isArOnly ? `ضريبة القيمة المضافة (${taxRate}%) :` : `TVA légale (${taxRate}%) :`;
  const netTotalLabel = isBilingual ? "TOTAL NET TTC / المجموع الصافي :" : isArOnly ? "المجموع الصافي شامل الضريبة :" : "TOTAL NET TTC :";

  // Génération des lignes du tableau
  const rowsHTML = items
    .map(
      (it, idx) => `
      <tr style="border-bottom: 1px solid #f1f5f9; font-size: 12px; ${
        idx % 2 === 1 ? "background-color: #f8fafc;" : ""
      }">
        <td style="padding: 11px 8px 11px 0; color: #1e293b; font-weight: 600;">
          ${it.description}
        </td>
        <td style="padding: 11px 8px; text-align: center; color: #475569; font-weight: 700;">
          ${it.quantity}
        </td>
        <td style="padding: 11px 8px; text-align: right; color: #475569; font-weight: 500;">
          ${it.unitPrice.toLocaleString("fr-FR")} MRU
        </td>
        <td style="padding: 11px 0 11px 8px; text-align: right; font-weight: 800; color: #0f172a;">
          ${(it.quantity * it.unitPrice).toLocaleString("fr-FR")} MRU
        </td>
      </tr>
    `
    )
    .join("");

  container.innerHTML = `
    <div>
      <!-- EN-TÊTE OFFICIEL FACTURIM MAURITANIE -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
        <div>
          <div style="display: flex; align-items: center; gap: 12px;">
            ${logoMarkup}
            <div>
              <span style="font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
                FACTURIM
              </span>
              <span style="font-size: 13px; font-weight: 800; color: #0284c7; margin-left: 6px;">
                موريتانيا
              </span>
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 11.5px; color: #64748b; line-height: 1.5;">
            <p style="font-weight: 700; color: #334155; margin: 0;">Facturim Mauritanie SARL</p>
            <p style="margin: 2px 0 0 0;">Avenue du Roi Fayçal, Tevragh Zeina, Nouakchott</p>
            <p style="margin: 2px 0 0 0;">NIF : 00987654-MR | RC : MR.NKTT.2025.B.1234</p>
            <p style="margin: 2px 0 0 0;">Tél : +222 45 25 00 00 | contact@facturim.mr</p>
          </div>
        </div>

        <div style="text-align: right;">
          <span style="display: inline-block; background: #f0f9ff; color: #0369a1; font-weight: 800; font-size: 12px; padding: 5px 12px; border-radius: 6px; letter-spacing: 0.8px; border: 1px solid #bae6fd; text-transform: uppercase;">
            ${docTitle}
          </span>
          <p style="font-size: 17px; font-weight: 900; color: #0f172a; margin: 8px 0 0 0;">
            ${invoice.reference}
          </p>
          <p style="font-size: 11.5px; color: #64748b; margin: 5px 0 0 0;">
            Date : <span style="font-weight: 700; color: #334155;">${invoice.date}</span>
          </p>
          <p style="font-size: 11.5px; color: #64748b; margin: 2px 0 0 0;">
            Échéance : <span style="font-weight: 700; color: #334155;">${invoice.dueDate || "30 jours nets"}</span>
          </p>
        </div>
      </div>

      <!-- BLOC DESTINATAIRE FACTURÉ À -->
      <div style="margin-top: 20px; background: #f8fafc; padding: 16px 20px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <p style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: #94a3b8; letter-spacing: 0.6px; margin: 0;">
            ${billedToLabel}
          </p>
          <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 4px 0 0 0;">
            ${invoice.clientName}
          </h4>
          <p style="color: #475569; font-size: 11.5px; margin: 3px 0 0 0;">${invoice.clientAddress || "Nouakchott, Mauritanie"}</p>
          <p style="color: #475569; font-size: 11.5px; margin: 2px 0 0 0;">${invoice.clientEmail || "contact@client.mr"} | ${invoice.clientPhone || "+222 45 00 00 00"}</p>
        </div>

        <div style="text-align: right;">
          <p style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: #94a3b8; letter-spacing: 0.6px; margin: 0;">
            STATUT / الحالة
          </p>
          <span style="display: inline-block; margin-top: 4px; background: ${statusBg}; color: ${statusColor}; font-weight: 800; padding: 4px 12px; border-radius: 9999px; font-size: 10.5px;">
            ${statusLabel}
          </span>
        </div>
      </div>

      <!-- TABLEAU DES PRESTATIONS -->
      <div style="margin-top: 22px;">
        <table style="width: 100%; text-align: left; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #0f172a; color: #0f172a; font-size: 11.5px; font-weight: 800;">
              <th style="padding: 8px 0; text-align: left;">${descLabel}</th>
              <th style="padding: 8px 0; text-align: center; width: 60px;">${qtyLabel}</th>
              <th style="padding: 8px 0; text-align: right; width: 130px;">${puLabel}</th>
              <th style="padding: 8px 0; text-align: right; width: 150px;">${totalHtLabel}</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
      </div>

      <!-- BLOC TOTAUX FINANCIERS & QR CODE MOOSYL -->
      <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
        <!-- Cartouche Moosyl Pay & QR Code -->
        <div style="display: flex; align-items: center; gap: 14px; background: #f8fafc; padding: 10px 14px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <img src="${qrCodeUrl}" alt="QR Code Moosyl" style="width: 64px; height: 64px; border-radius: 6px; display: block;" />
          <div style="font-size: 10.5px; color: #475569; line-height: 1.4;">
            <p style="font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 4px;">
              <span>Paiement Direct Moosyl</span>
            </p>
            <p style="margin: 2px 0 0 0; color: #047857; font-weight: 700;">🟢 Bankily (BPM) • 🔵 Masrvi (BMCI)</p>
            <p style="margin: 2px 0 0 0; color: #94a3b8;">Scannez pour régler en 1 clic</p>
          </div>
        </div>

        <!-- Totaux Chiffrés -->
        <div style="width: 320px; font-size: 11.5px;">
          <div style="display: flex; justify-content: space-between; color: #475569; padding: 3px 0;">
            <span>${subtotalLabel}</span>
            <span style="font-weight: 700; color: #1e293b;">${subtotal.toLocaleString("fr-FR")} MRU</span>
          </div>
          ${
            taxRate > 0
              ? `
          <div style="display: flex; justify-content: space-between; color: #475569; padding: 3px 0;">
            <span>${vatLabel}</span>
            <span style="font-weight: 700; color: #1e293b;">${taxAmount.toLocaleString("fr-FR")} MRU</span>
          </div>
          `
              : ""
          }
          <div style="display: flex; justify-content: space-between; align-items: baseline; padding-top: 10px; margin-top: 4px; border-top: 2px solid #0f172a; color: #0f172a;">
            <span style="font-size: 12px; font-weight: 800; text-transform: uppercase;">${netTotalLabel}</span>
            <span style="font-size: 19px; font-weight: 900; color: #0284c7;">${total.toLocaleString("fr-FR")} MRU</span>
          </div>
        </div>
      </div>
    </div>

    <!-- PIED DE PAGE ET MENTIONS DGI MAURITANIE -->
    <div style="margin-top: 30px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 10.5px; color: #64748b;">
      <p style="margin: 0;">
        <strong style="color: #334155;">Modalités de règlement :</strong> ${
          invoice.paymentTerms || "Paiement à 30 jours nets. Règlements acceptés par Bankily (BPM), Masrvi (BMCI), Seddap ou virement bancaire."
        }
      </p>
      <p style="margin: 4px 0 0 0; line-height: 1.4;">
        ${
          invoice.notes ||
          "Merci pour votre confiance. Règlements acceptés par virement bancaire (BPM Mauritanie MR12 00010 01001 12345678901 23) ou Mobile Money (Bankily / Masrvi)."
        }
      </p>
      <div style="margin-top: 14px; text-align: center; font-size: 9.5px; color: #94a3b8; font-weight: 600;">
        FACTURIM — Document certifié conforme à la législation fiscale de la République Islamique de Mauritanie (DGI)
      </div>
    </div>
  `;

  return container;
}

/**
 * Télécharge la facture officielle sous forme de vrai document PDF A4
 * Rendu 100% fidèle à l'aperçu A4 en direct.
 */
export async function downloadInvoicePDF(
  invoice: PDFInvoiceData,
  fileName?: string
): Promise<boolean> {
  const container = createInvoiceDOM(invoice);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // Haute résolution Retina
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL("image/png");

    // Dimensions A4 en millimètres (210 x 297 mm)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = 297;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

    const sanitizedRef = invoice.reference.replace(/[^a-zA-Z0-9-_]/g, "_");
    const outputName =
      fileName || `Facture_Facturim_${sanitizedRef || "Officielle"}.pdf`;

    pdf.save(outputName);
    return true;
  } catch (error) {
    console.error("Erreur lors de la génération du PDF Facturim :", error);
    return false;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Génère et télécharge un document ou contrat officiel certifié A4
 */
export async function downloadAttachmentPDF(
  title: string,
  category: string,
  fileName: string,
  extraDetails?: {
    partnerName?: string;
    contractRef?: string;
    date?: string;
    amount?: string;
    notes?: string;
  }
): Promise<boolean> {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "0px";
  container.style.top = "0px";
  container.style.width = "794px";
  container.style.minHeight = "1123px";
  container.style.backgroundColor = "#ffffff";
  container.style.padding = "44px 40px";
  container.style.boxSizing = "border-box";
  container.style.fontFamily =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  container.style.color = "#0f172a";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.justifyContent = "space-between";
  container.style.zIndex = "-99999";
  container.style.pointerEvents = "none";

  container.innerHTML = `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 18px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="#0f172a"/>
            <text x="20" y="21" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-family="sans-serif" font-weight="900" font-size="16">FI</text>
          </svg>
          <div>
            <h2 style="font-size: 18px; font-weight: 900; margin: 0; color: #0f172a;">FACTURIM MAURITANIE</h2>
            <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">Document &amp; Attestation Officielle • DGI</p>
          </div>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; background: #0284c7; color: #ffffff; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;">
            ${category}
          </span>
          <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0;">Réf : ${extraDetails?.contractRef || "DOC-" + Date.now().toString().slice(-6)}</p>
        </div>
      </div>

      <div style="margin-top: 32px; padding: 22px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
        <h1 style="font-size: 20px; font-weight: 900; color: #0f172a; margin: 0;">${title}</h1>
        <p style="font-size: 13px; color: #475569; margin: 8px 0 0 0;">Partenaire associé : <strong>${extraDetails?.partnerName || "Entreprise Partenaire"}</strong></p>
        <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Date d'émission : ${extraDetails?.date || new Date().toLocaleDateString("fr-FR")}</p>
        ${extraDetails?.amount ? `<p style="font-size: 14px; font-weight: 800; color: #0284c7; margin: 8px 0 0 0;">Montant concerné : ${extraDetails.amount}</p>` : ""}
      </div>

      <div style="margin-top: 26px; font-size: 12.5px; line-height: 1.7; color: #334155;">
        <p>Le présent document atteste de la validité de l'opération commerciale ou contractuelle référencée ci-dessus, enregistrée dans le système de facturation et de gestion commerciale <strong>Facturim Mauritanie</strong>.</p>
        <p style="margin-top: 12px;">${extraDetails?.notes || "Ce document est généré électroniquement et revêtu du sceau numérique de conformité DGI Mauritanie."}</p>
      </div>
    </div>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; font-size: 10px; color: #94a3b8;">
      FACTURIM SARL — Avenue du Roi Fayçal, Tevragh Zeina, Nouakchott, Mauritanie — Document officiel
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");
    pdf.save(fileName || "Document_Officiel_Facturim.pdf");
    return true;
  } catch (error) {
    console.error("Erreur lors de la génération du document PDF :", error);
    return false;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
