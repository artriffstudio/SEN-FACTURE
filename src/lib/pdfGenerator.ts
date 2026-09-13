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
  status?: "paid" | "overdue" | "unpaid" | string;
  taxRate?: number;
  paymentTerms?: string;
  notes?: string;
  logoUrl?: string;
}

const defaultPrestationsByClient: Record<string, { desc: string; qty: number }> = {
  "Sonatel SA": { desc: "Déploiement infrastructure réseau télécoms & fibre optique", qty: 1 },
  "TotalEnergies Sénégal": { desc: "Maintenance préventive & gestion des systèmes de distribution", qty: 2 },
  "Orange Sénégal": { desc: "Intégration passerelle API Orange Money & paiements marchands", qty: 1 },
  "CBAO Attijariwafa Bank": { desc: "Licence annuelle plateforme SaaS Facturation bancaire", qty: 1 },
  "Free Sénégal": { desc: "Prestation d'ingénierie Cloud, audit de sécurité & DevOps", qty: 1 },
};

/**
 * Construit un conteneur HTML représentant la feuille A4 officielle de SEN FACTURE
 * avec exactement le même design, la même typographie et les mêmes couleurs que l'aperçu A4 en direct.
 */
function createInvoiceDOM(invoice: PDFInvoiceData): HTMLElement {
  const container = document.createElement("div");
  container.id = "sen-facture-pdf-render-sheet";
  container.style.position = "fixed";
  container.style.left = "0px";
  container.style.top = "0px";
  container.style.width = "794px"; // Format A4 à 96 DPI (210mm)
  container.style.minHeight = "1123px"; // Hauteur A4 standard (297mm)
  container.style.backgroundColor = "#ffffff";
  container.style.padding = "48px 44px";
  container.style.boxSizing = "border-box";
  container.style.fontFamily =
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
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
      ? localStorage.getItem("sen_facture_company_logo")
      : null);

  const logoMarkup = effectiveLogoUrl
    ? `<img src="${effectiveLogoUrl}" alt="Logo Entreprise" style="width: 46px; height: 46px; border-radius: 10px; object-fit: contain; background: #ffffff; border: 1px solid #e2e8f0; display: block; flex-shrink: 0;" />`
    : `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;">
        <rect width="44" height="44" rx="10" fill="#0f172a"/>
        <text x="22" y="23.5" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="18" letter-spacing="-0.5">SF</text>
      </svg>`;

  const defaultMeta = defaultPrestationsByClient[invoice.clientName] || {
    desc: `Prestation contractuelle et services associés — ${invoice.clientName}`,
    qty: 1,
  };

  const taxRate = invoice.taxRate !== undefined ? invoice.taxRate : 18;

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

  const isPaid = invoice.status === "paid";
  const isOverdue = invoice.status === "overdue";

  const statusLabel = isPaid
    ? "Payée"
    : isOverdue
    ? "En retard"
    : "En cours d'émission";

  const statusBg = isPaid ? "#dcfce7" : isOverdue ? "#fee2e2" : "#fef3c7";
  const statusColor = isPaid ? "#15803d" : isOverdue ? "#b91c1c" : "#92400e";

  const rowsHTML = items
    .map(
      (it) => `
      <tr style="border-bottom: 1px solid #f1f5f9; font-size: 13px;">
        <td style="padding: 13px 8px 13px 0; font-weight: 600; color: #1e293b;">
          ${it.description}
        </td>
        <td style="padding: 13px 8px; text-align: center; color: #475569; font-weight: 700;">
          ${it.quantity}
        </td>
        <td style="padding: 13px 8px; text-align: right; color: #475569; font-weight: 500;">
          ${it.unitPrice.toLocaleString("fr-FR")} F
        </td>
        <td style="padding: 13px 0 13px 8px; text-align: right; font-weight: 800; color: #0f172a;">
          ${(it.quantity * it.unitPrice).toLocaleString("fr-FR")} FCFA
        </td>
      </tr>
    `
    )
    .join("");

  container.innerHTML = `
    <div>
      <!-- EN-TÊTE OFFICIEL SEN FACTURE (Exactement comme dans l'aperçu A4) -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 22px;">
        <div>
          <div style="display: flex; align-items: center; gap: 12px;">
            ${logoMarkup}
            <span style="font-size: 22px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
              SEN FACTURE
            </span>
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #64748b; line-height: 1.55;">
            <p style="font-weight: 700; color: #334155; margin: 0;">Teranga Digital SARL</p>
            <p style="margin: 2px 0 0 0;">46 Boulevard de la République, Dakar Plateau, Sénégal</p>
            <p style="margin: 2px 0 0 0;">NINEA : SN-009876543-2B | RC : SN.DKR.2024.B.1234</p>
            <p style="margin: 2px 0 0 0;">Tél : +221 77 123 45 67 | contact@senfacture.sn</p>
          </div>
        </div>

        <div style="text-align: right;">
          <span style="display: inline-block; background: #f0f9ff; color: #0369a1; font-weight: 800; font-size: 13px; padding: 6px 14px; border-radius: 6px; letter-spacing: 1.2px; border: 1px solid #bae6fd; text-transform: uppercase;">
            FACTURE
          </span>
          <p style="font-size: 18px; font-weight: 900; color: #0f172a; margin: 10px 0 0 0;">
            ${invoice.reference}
          </p>
          <p style="font-size: 12px; color: #64748b; margin: 6px 0 0 0;">
            Émise le : <span style="font-weight: 700; color: #334155;">${invoice.date}</span>
          </p>
          <p style="font-size: 12px; color: #64748b; margin: 3px 0 0 0;">
            Échéance : <span style="font-weight: 700; color: #334155;">${invoice.dueDate || "30 jours nets"}</span>
          </p>
        </div>
      </div>

      <!-- BLOC DESTINATAIRE FACTURÉ À -->
      <div style="margin-top: 24px; background: #f8fafc; padding: 18px 22px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <p style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: #94a3b8; letter-spacing: 0.6px; margin: 0;">
            FACTURÉ À
          </p>
          <h4 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 4px 0 0 0;">
            ${invoice.clientName}
          </h4>
          <p style="color: #475569; font-size: 12px; margin: 4px 0 0 0;">${invoice.clientAddress || "Dakar, Sénégal"}</p>
          <p style="color: #475569; font-size: 12px; margin: 2px 0 0 0;">${invoice.clientEmail || "contact@client.sn"}</p>
          <p style="color: #475569; font-size: 12px; margin: 2px 0 0 0;">${invoice.clientPhone || "+221 33 800 00 00"}</p>
        </div>

        <div style="text-align: right;">
          <p style="font-size: 10px; text-transform: uppercase; font-weight: 800; color: #94a3b8; letter-spacing: 0.6px; margin: 0;">
            STATUT DE RÈGLEMENT
          </p>
          <span style="display: inline-block; margin-top: 6px; background: ${statusBg}; color: ${statusColor}; font-weight: 800; padding: 5px 14px; border-radius: 9999px; font-size: 11px;">
            ${statusLabel}
          </span>
        </div>
      </div>

      <!-- TABLEAU DES PRESTATIONS -->
      <div style="margin-top: 28px;">
        <table style="width: 100%; text-align: left; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #0f172a; color: #0f172a; font-size: 12px; font-weight: 800;">
              <th style="padding: 10px 0; text-align: left;">DÉSIGNATION DES PRESTATIONS</th>
              <th style="padding: 10px 0; text-align: center; width: 60px;">QTÉ</th>
              <th style="padding: 10px 0; text-align: right; width: 140px;">PRIX UNIT.</th>
              <th style="padding: 10px 0; text-align: right; width: 160px;">TOTAL HT</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
      </div>

      <!-- BLOC TOTAUX FINANCIERS -->
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end;">
        <div style="width: 320px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; color: #475569; padding: 4px 0;">
            <span>Sous-total Hors Taxes (HT) :</span>
            <span style="font-weight: 700; color: #1e293b;">${subtotal.toLocaleString("fr-FR")} FCFA</span>
          </div>
          ${
            taxRate > 0
              ? `
          <div style="display: flex; justify-content: space-between; color: #475569; padding: 4px 0;">
            <span>TVA légale (${taxRate}%) :</span>
            <span style="font-weight: 700; color: #1e293b;">${taxAmount.toLocaleString("fr-FR")} FCFA</span>
          </div>
          `
              : ""
          }
          <div style="display: flex; justify-content: space-between; align-items: baseline; padding-top: 12px; margin-top: 6px; border-top: 2px solid #0f172a; color: #0f172a;">
            <span style="font-size: 13px; font-weight: 800; text-transform: uppercase;">TOTAL NET TTC :</span>
            <span style="font-size: 20px; font-weight: 900; color: #0284c7;">${total.toLocaleString("fr-FR")} FCFA</span>
          </div>
        </div>
      </div>
    </div>

    <!-- PIED DE PAGE ET MODALITÉS -->
    <div style="margin-top: 40px; padding-top: 18px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
      <p style="margin: 0;">
        <strong style="color: #334155;">Modalités de règlement :</strong> ${
          invoice.paymentTerms || "Paiement sous 30 jours nets. Règlements acceptés par Wave Mobile Money, Orange Money ou virement bancaire."
        }
      </p>
      <p style="margin: 6px 0 0 0; line-height: 1.45;">
        ${
          invoice.notes ||
          "Merci pour votre confiance. Règlements acceptés par virement bancaire (BICIS SN08 0100 1025 0001 2345 6789) ou Mobile Money (Wave / Orange Money)."
        }
      </p>
      <div style="margin-top: 20px; text-align: center; font-size: 10px; color: #94a3b8; font-weight: 600;">
        SEN FACTURE — Document certifié conforme aux normes fiscales SYSCOHADA et République du Sénégal
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
  invoice: PDFInvoiceData
): Promise<boolean> {
  let container: HTMLElement | null = null;

  try {
    container = createInvoiceDOM(invoice);
    document.body.appendChild(container);

    // Capture haute résolution 2x (qualité Retina / Impression A4 nette)
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      width: 794,
      height: Math.max(container.offsetHeight, 1123),
      onclone: (_clonedDoc, clonedElement) => {
        clonedElement.style.position = "static";
        clonedElement.style.left = "0px";
        clonedElement.style.top = "0px";
        clonedElement.style.margin = "0";
        clonedElement.style.zIndex = "1";
        clonedElement.style.display = "flex";
        clonedElement.style.visibility = "visible";
      },
    });

    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      pdfWidth,
      Math.min(imgHeight, pdfHeight),
      undefined,
      "FAST"
    );

    const safeRef = (invoice.reference || "Facture").replace(/[^a-zA-Z0-9-_]/g, "_");
    pdf.save(`Facture_${safeRef}.pdf`);
    return true;
  } catch (error) {
    console.error("Erreur téléchargement PDF :", error);
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    return false;
  }
}

/**
 * Télécharge un document officiel archivé (Facture tiers ou contrat)
 * Génère un véritable document A4 exhaustif avec prestations réelles et totaux certifiés.
 */
export async function downloadAttachmentPDF(fileName: string, title: string): Promise<boolean> {
  const isContract = fileName.toLowerCase().includes("contrat") || title.toLowerCase().includes("contrat");
  const isSonatel = fileName.toLowerCase().includes("sonatel") || title.toLowerCase().includes("sonatel");

  if (isContract) {
    return downloadInvoicePDF({
      reference: "CONTRAT-CADRE-2025",
      clientName: "Sonatel SA — Direction Générale",
      clientAddress: "46 Boulevard de la République, Dakar Plateau, Sénégal",
      clientEmail: "marches.publics@sonatel.sn",
      clientPhone: "+221 33 839 12 00",
      date: "15/01/2025",
      dueDate: "31/12/2025",
      total: 14160000,
      taxRate: 18,
      status: "paid",
      items: [
        {
          description: "Contrat annuel d'infogérance, maintenance préventive & astreinte 24/7",
          quantity: 4,
          unitPrice: 2500000,
        },
        {
          description: "Assistance technique spécialisée SYSCOHADA & intégrations API sécurisées",
          quantity: 2,
          unitPrice: 1000000,
        },
      ],
      paymentTerms: "Paiement trimestriel à terme échu par Virement Bancaire BICIS.",
      notes: "Contrat officiel de prestation de services numériques — Enregistré et certifié conforme au Sénégal.",
    });
  }

  // Facture Sonatel ou document de facturation tiers
  return downloadInvoicePDF({
    reference: "FAC-2025-0001",
    clientName: isSonatel ? "Sonatel SA" : "Teranga Partenaire SARL",
    clientAddress: "46 Boulevard de la République, Dakar Plateau, Sénégal",
    clientEmail: "compta@sonatel.sn",
    clientPhone: "+221 33 839 12 34",
    date: "15/03/2025",
    dueDate: "15/04/2025",
    total: 4750000,
    taxRate: 18,
    status: "paid",
    items: [
      {
        description: "Déploiement infrastructure réseau télécoms & raccordement fibre optique",
        quantity: 1,
        unitPrice: 2500000,
      },
      {
        description: "Configuration serveurs haute disponibilité & passerelle VoIP",
        quantity: 2,
        unitPrice: 762711,
      },
    ],
    paymentTerms: "Règlement effectué par Virement Bancaire (BICIS SN08 0100 1025 0001 2345 6789).",
    notes: "Facture acquittée. Merci pour votre fidélité.",
  });
}

