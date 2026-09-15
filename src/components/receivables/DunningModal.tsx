"use client";

import { useState } from "react";
import {
  X,
  MessageCircle,
  AlertTriangle,
  FileText,
  Download,
  Send,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Percent,
} from "lucide-react";
import toast from "react-hot-toast";
import { Invoice } from "@/lib/types";
import { downloadAttachmentPDF } from "@/lib/pdfGenerator";

interface DunningModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  isAr?: boolean;
}

export default function DunningModal({
  isOpen,
  onClose,
  invoice,
  isAr = false,
}: DunningModalProps) {
  const [level, setLevel] = useState<1 | 2 | 3 | 4>(1);
  const [lang, setLang] = useState<"fr" | "ar">("fr");

  if (!isOpen || !invoice) return null;

  const penaltyRate = 1.5; // 1.5% par mois
  const penaltyAmount = Math.round(invoice.total * (penaltyRate / 100));
  const totalWithPenalties = invoice.total + penaltyAmount;

  const paymentLink = `https://facturim.mr/pay/${invoice.id}`;

  // Messages pré-rédigés pour les 4 niveaux
  const messages = {
    fr: {
      1: `Bonjour ${invoice.client?.name || "Cher Client"},\n\nNous vous rappelons gentiment que la facture *${invoice.invoiceNumber}* d'un montant de *${invoice.total.toLocaleString("fr-FR")} MRU* arrive à échéance le *${invoice.dueDate}*.\n\n💳 Vous pouvez régler directement en 1 clic via Bankily ou Masrvi : ${paymentLink}\n\nMerci de votre confiance,\nFacturim Mauritanie.`,
      2: `Bonjour ${invoice.client?.name || "Cher Client"},\n\nSauf erreur de notre part, la facture *${invoice.invoiceNumber}* de *${invoice.total.toLocaleString("fr-FR")} MRU* échue le *${invoice.dueDate}* demeure impayée à ce jour.\n\nMerci de procéder à sa régularisation dès que possible par Bankily/Masrvi : ${paymentLink}\n\nCordialement,\nService Comptabilité Facturim.`,
      3: `AVIS DE RETARD DE PAIEMENT\nClient : ${invoice.client?.name || "Client"}\nFacture : ${invoice.invoiceNumber}\n\nVotre facture présente un retard significatif. Conformément à nos conditions générales et à la législation mauritanienne, des pénalités de retard de ${penaltyRate}% (+${penaltyAmount.toLocaleString("fr-FR")} MRU) sont applicables, portant le solde à *${totalWithPenalties.toLocaleString("fr-FR")} MRU*.\n\nRèglement immédiat via Moosyl : ${paymentLink}\n\nComptabilité Facturim Mauritanie.`,
      4: `MISE EN DEMEURE AVANT PROCÉDURE DE RECOUVREMENT\nFacture : ${invoice.invoiceNumber}\nMontant exigible : ${totalWithPenalties.toLocaleString("fr-FR")} MRU\n\nNous vous mettons formellement en demeure de régler le montant impayé sous 48h ouvrées sous peine de transmission de votre dossier au service contentieux.\n\nLien de règlement d'urgence : ${paymentLink}`,
    },
    ar: {
      1: `السلام عليكم ${invoice.client?.name || "العميل الكريم"},\n\nنود تذكيركم بلطف بأن الفاتورة رقم *${invoice.invoiceNumber}* بمبلغ *${invoice.total.toLocaleString("fr-FR")} أوقية* يحل موعد استحقاقها في *${invoice.dueDate}*.\n\n💳 يمكنكم السداد المباشر بنقرة واحدة عبر بنكيلي أو مصرفي : ${paymentLink}\n\nمع الشكر لثقتكم,\nفكتوريم موريتانيا.`,
      2: `السلام عليكم ${invoice.client?.name || "العميل الكريم"},\n\nنلفت انتباهكم إلى أن الفاتورة رقم *${invoice.invoiceNumber}* بمبلغ *${invoice.total.toLocaleString("fr-FR")} أوقية* المستحقة في *${invoice.dueDate}* لم يتم تسويتها حتى الآن.\n\nيرجى تسوية المستحقات عبر بنكيلي أو مصرفي : ${paymentLink}\n\nمع التحية,\nقسم الحسابات - فكتوريم.`,
      3: `إشعار تأخير في السداد\nالعميل : ${invoice.client?.name || "العميل"}\nالفاتورة : ${invoice.invoiceNumber}\n\nنظراً لتجاوز موعد الاستحقاق، وطبقاً للشروط التجارية المعتمدة في موريتانيا، تم تطبيق غرامة تأخير بنسبة ${penaltyRate}% ليصل الإجمالي إلى *${totalWithPenalties.toLocaleString("fr-FR")} أوقية*.\n\nرابط السداد الفوري عبر موصل : ${paymentLink}`,
      4: `إنذار رسمي بالسداد قبل الإجراءات القانونية\nالفاتورة : ${invoice.invoiceNumber}\nالمبلغ المستحق : ${totalWithPenalties.toLocaleString("fr-FR")} أوقية\n\nنحيطكم علماً بضرورة تسوية المبلغ خلال 48 ساعة لتفادي تحويل الملف للقسم القانوني.\n\nرابط التسوية العاجلة : ${paymentLink}`,
    },
  };

  const currentMessage = messages[lang][level];

  const handleSendWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(currentMessage)}`;
    window.open(url, "_blank");
    toast.success("Relance WhatsApp envoyée avec succès !");
  };

  const handleDownloadNoticePDF = async () => {
    toast.loading("Génération du document officiel de relance...", { id: "notice-pdf" });
    const ok = await downloadAttachmentPDF(
      level === 4 ? "MISE EN DEMEURE OFFICIELLE DE PAIEMENT" : "LETTRE DE RELANCE DE FACTURE IMPAYÉE",
      level === 4 ? "CONTENTIEUX DGI" : "RELANCE COMMERCIALE",
      `Mise_en_demeure_${invoice.invoiceNumber}.pdf`,
      {
        partnerName: invoice.client?.name || "Client Entreprise",
        contractRef: invoice.invoiceNumber,
        date: new Date().toLocaleDateString("fr-FR"),
        amount: `${totalWithPenalties.toLocaleString("fr-FR")} MRU`,
        notes: `Conformément au Code de Commerce et à la réglementation fiscale en Mauritanie, le débiteur est sommé de régler sans délai les sommes dues sous peine de poursuites judiciaires. Modalités : Bankily / Masrvi / BPM.`,
      }
    );
    if (ok) {
      toast.success("Lettre officielle téléchargée en PDF certifié !", { id: "notice-pdf" });
    } else {
      toast.error("Erreur lors de la génération", { id: "notice-pdf" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-5 p-6 sm:p-8 text-slate-800">
        {/* En-tête de la Modale */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
              <MessageCircle size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Centre de Relance &amp; Recouvrement
              </h2>
              <p className="text-xs text-slate-500">
                Facture {invoice.invoiceNumber} • {invoice.client?.name} ({invoice.total.toLocaleString("fr-FR")} MRU)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sélection du Niveau de Relance (4 Étapes Progressives) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Niveau de sévérité de la relance
            </label>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setLang("fr")}
                className={`px-2 py-0.5 rounded ${lang === "fr" ? "bg-white text-sky-600 shadow-2xs" : "text-slate-500"}`}
              >
                Français
              </button>
              <button
                type="button"
                onClick={() => setLang("ar")}
                className={`px-2 py-0.5 rounded ${lang === "ar" ? "bg-white text-sky-600 shadow-2xs" : "text-slate-500"}`}
              >
                العربية
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setLevel(1)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                level === 1
                  ? "bg-sky-50 border-sky-400 ring-2 ring-sky-200 text-sky-900 font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="text-[10px] text-sky-600 font-extrabold uppercase">Niveau 1</span>
              <span className="text-xs mt-1 font-bold block">Rappel Courtois</span>
              <span className="text-[10px] text-slate-400">J-3 échéance</span>
            </button>

            <button
              type="button"
              onClick={() => setLevel(2)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                level === 2
                  ? "bg-amber-50 border-amber-400 ring-2 ring-amber-200 text-amber-900 font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="text-[10px] text-amber-600 font-extrabold uppercase">Niveau 2</span>
              <span className="text-xs mt-1 font-bold block">Relance Formelle</span>
              <span className="text-[10px] text-slate-400">J+7 retard</span>
            </button>

            <button
              type="button"
              onClick={() => setLevel(3)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                level === 3
                  ? "bg-orange-50 border-orange-400 ring-2 ring-orange-200 text-orange-900 font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="text-[10px] text-orange-600 font-extrabold uppercase">Niveau 3</span>
              <span className="text-xs mt-1 font-bold block">Pénalités (+1.5%)</span>
              <span className="text-[10px] text-slate-400">J+21 retard</span>
            </button>

            <button
              type="button"
              onClick={() => setLevel(4)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                level === 4
                  ? "bg-rose-50 border-rose-400 ring-2 ring-rose-200 text-rose-900 font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="text-[10px] text-rose-600 font-extrabold uppercase">Niveau 4</span>
              <span className="text-xs mt-1 font-bold block">Mise en Demeure</span>
              <span className="text-[10px] text-slate-400">J+45 contentieux</span>
            </button>
          </div>
        </div>

        {/* Aperçu du Message WhatsApp & Lien Moosyl */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Aperçu du message WhatsApp pré-formaté
          </label>
          <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner max-h-44 overflow-y-auto">
            {currentMessage}
          </div>
        </div>

        {/* Boutons d'Action */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle size={16} />
            <span>Envoyer la Relance WhatsApp + Lien Moosyl</span>
          </button>

          {level >= 3 && (
            <button
              type="button"
              onClick={handleDownloadNoticePDF}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={15} className="text-slate-600" />
              <span>Télécharger Mise en Demeure PDF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
