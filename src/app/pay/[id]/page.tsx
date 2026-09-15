"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  Smartphone,
  ShieldCheck,
  Building2,
  Calendar,
  Lock,
  ArrowRight,
  QrCode,
  CreditCard,
  ChevronRight,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";
import { getInvoiceById, updateInvoiceStatus } from "@/lib/services/invoiceService";
import { downloadInvoicePDF } from "@/lib/pdfGenerator";
import { processMoosylDirectPayment } from "@/lib/services/moosylService";
import { Invoice } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InvoicePaymentPage({ params }: PageProps) {
  const { id } = use(params);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState<"fr" | "ar">("fr");
  const [selectedMethod, setSelectedMethod] = useState<"bankily" | "masrvi">("bankily");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const isAr = lang === "ar";

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const inv = await getInvoiceById(id);
        if (inv) {
          setInvoice(inv);
          if (inv.status === "paid") {
            setPaymentSuccess(true);
          }
        }
      } catch (err) {
        console.error("Erreur chargement facture :", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    setIsProcessing(true);
    try {
      const res = await processMoosylDirectPayment(invoice.id, selectedMethod, phoneNumber);
      if (res.success) {
        setTransactionId(res.transactionId);
        setPaymentSuccess(true);
        // Mise à jour de la facture en base
        await updateInvoiceStatus(invoice.id, "paid");
        toast.success(
          isAr
            ? `تم تأكيد الدفع بنجاح عبر ${selectedMethod === "bankily" ? "بنكيلي" : "مصرفي"}!`
            : `Paiement ${selectedMethod === "bankily" ? "Bankily" : "Masrvi"} validé avec succès !`
        );
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(isAr ? "حدث خطأ أثناء معالجة الدفع." : "Erreur lors du traitement du paiement.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    toast.loading(isAr ? "جاري تحميل الفاتورة..." : "Téléchargement de la facture...", { id: "pdf-pay" });
    const ok = await downloadInvoicePDF({
      reference: invoice.invoiceNumber,
      clientName: invoice.client?.name || "Client",
      clientAddress: invoice.client?.address,
      clientEmail: invoice.client?.email,
      clientPhone: invoice.client?.phone,
      date: invoice.issueDate || new Date().toISOString().split("T")[0],
      dueDate: invoice.dueDate,
      total: invoice.total,
      taxRate: invoice.taxRate || 16,
      status: paymentSuccess ? "paid" : invoice.status,
    });
    if (ok) {
      toast.success(isAr ? "تم تحميل الفاتورة بنجاح !" : "Facture téléchargée en PDF !", { id: "pdf-pay" });
    } else {
      toast.error(isAr ? "فشل التحميل" : "Erreur de téléchargement", { id: "pdf-pay" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Chargement de la session de paiement sécurisée...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center max-w-md w-full">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Facture Introuvable</h2>
          <p className="text-sm text-slate-600 mb-6">Le lien de paiement est expiré ou le numéro de facture n&apos;existe pas.</p>
          <Link
            href="/"
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors inline-block"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white ${
        isAr ? "font-sans text-right" : "font-sans text-left"
      }`}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* En-tête de la page de paiement sécurisée */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-md shrink-0">
              <span className="font-extrabold text-sm text-white tracking-tighter">FI</span>
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              FACTU<span className="text-sky-400">RIM</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Badge Sécurisé */}
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <ShieldCheck size={14} />
              <span>Moosyl Pay 256-bit SSL</span>
            </span>

            {/* Commutateur de langue FR / AR */}
            <button
              onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              <Globe size={13} className="text-sky-400" />
              <span>{lang === "fr" ? "العربية 🇲🇷" : "Français 🇫🇷"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Colonne Gauche : Détails & Récapitulatif Facture */}
          <div className="lg:col-span-5 bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400 block mb-1">
                  {isAr ? "فاتورة إلكترونية" : "Facture Commerciale"}
                </span>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{invoice.invoiceNumber}</h1>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide ${
                  paymentSuccess
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                {paymentSuccess ? (isAr ? "مدفوعة ✓" : "PAYÉE ✓") : (isAr ? "في الانتظار" : "EN ATTENTE")}
              </span>
            </div>

            {/* Émetteur & Destinataire */}
            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <Building2 size={14} />
                </div>
                <div>
                  <span className="text-slate-400 block">{isAr ? "المرسل" : "Émetteur"}</span>
                  <p className="font-bold text-slate-200 text-sm">Facturim Mauritanie SARL</p>
                  <p className="text-slate-400 text-[11px]">NIF : 00987654-MR • Nouakchott</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <Smartphone size={14} />
                </div>
                <div>
                  <span className="text-slate-400 block">{isAr ? "العميل" : "Client"}</span>
                  <p className="font-bold text-slate-200 text-sm">{invoice.client?.name || "Client Entreprise"}</p>
                  <p className="text-slate-400 text-[11px]">{invoice.client?.address || "Nouakchott, Mauritanie"}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <Calendar size={14} />
                </div>
                <div>
                  <span className="text-slate-400 block">{isAr ? "تاريخ الإصدار والاستحقاق" : "Date & Échéance"}</span>
                  <p className="font-semibold text-slate-300">
                    {invoice.issueDate || "Aujourd'hui"} ➔ {invoice.dueDate || "30 jours nets"}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Financier MRU */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{isAr ? "المبلغ غير شامل الضريبة" : "Sous-total HT"}</span>
                <span className="font-bold text-slate-200">{invoice.subtotal.toLocaleString("fr-FR")} MRU</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{isAr ? "ضريبة القيمة المضافة (16%)" : "TVA Légale (16%)"}</span>
                <span className="font-bold text-slate-200">{invoice.taxAmount.toLocaleString("fr-FR")} MRU</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline">
                <span className="font-bold text-white text-sm uppercase">{isAr ? "المجموع الصافي" : "Total Net TTC"}</span>
                <span className="font-black text-2xl text-sky-400 tabular-nums">
                  {invoice.total.toLocaleString("fr-FR")} {isAr ? "أوقية" : "MRU"}
                </span>
              </div>
            </div>

            {/* Bouton Téléchargement Facture PDF */}
            <button
              onClick={handleDownloadPDF}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer border border-slate-700"
            >
              <Download size={14} className="text-sky-400" />
              <span>{isAr ? "تحميل الفاتورة الرسمية PDF" : "Télécharger la facture PDF"}</span>
            </button>
          </div>

          {/* Colonne Droite : Formulaire de Règlement Moosyl (Bankily / Masrvi) */}
          <div className="lg:col-span-7">
            {paymentSuccess ? (
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-8 sm:p-10 border border-emerald-500/30 text-center space-y-6 shadow-2xl animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg ring-8 ring-emerald-500/10">
                  <CheckCircle2 size={36} className="stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white mb-2">
                    {isAr ? "تم تسوية الفاتورة بنجاح !" : "Paiement Validé avec Succès !"}
                  </h2>
                  <p className="text-slate-300 text-sm max-w-md mx-auto">
                    {isAr
                      ? `شكراً لكم. تم قيد المبلغ البالغ ${invoice.total.toLocaleString("fr-FR")} أوقية في حساب التاجر.`
                      : `Votre règlement de ${invoice.total.toLocaleString("fr-FR")} MRU a été reçu et validé via Moosyl.`}
                  </p>
                </div>

                {transactionId && (
                  <div className="bg-slate-800/80 px-4 py-3 rounded-2xl inline-block border border-slate-700 text-xs font-mono text-slate-300">
                    <span className="text-slate-400">{isAr ? "رقم المعاملة : " : "Réf Transaction : "}</span>
                    <strong className="text-emerald-400">{transactionId}</strong>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleDownloadPDF}
                    className="px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-2"
                  >
                    <Download size={15} />
                    <span>{isAr ? "تحميل إشعار السداد PDF" : "Télécharger le reçu certifié"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                    {isAr ? "بوابة الدفع الإلكتروني المباشر" : "Passerelle de Paiement Direct"}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    {isAr ? "اختر وسيلة الدفع عبر Moosyl" : "Régler en direct via Moosyl"}
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    {isAr
                      ? "الدفع فوري ومؤمن مباشرة من تطبيق بنكيلي أو مصرفي على هاتفك."
                      : "Paiement instantané et sécurisé débité depuis votre application mobile."}
                  </p>
                </div>

                {/* Commutateur de Mode de Paiement (Bankily vs Masrvi) */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod("bankily")}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedMethod === "bankily"
                        ? "bg-emerald-950/40 border-emerald-500/80 ring-2 ring-emerald-500/30 text-white"
                        : "bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        B
                      </div>
                      {selectedMethod === "bankily" && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-extrabold block text-white">Bankily (BPM)</span>
                      <span className="text-[11px] text-slate-400">{isAr ? "محفظة بنكيلي" : "Mobile Banking BPM"}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod("masrvi")}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedMethod === "masrvi"
                        ? "bg-sky-950/40 border-sky-500/80 ring-2 ring-sky-500/30 text-white"
                        : "bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                        M
                      </div>
                      {selectedMethod === "masrvi" && (
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-extrabold block text-white">Masrvi (BMCI)</span>
                      <span className="text-[11px] text-slate-400">{isAr ? "محفظة مصرفي" : "Digital Banking BMCI"}</span>
                    </div>
                  </button>
                </div>

                {/* Formulaire de saisie du compte / téléphone */}
                <form onSubmit={handlePayment} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      {selectedMethod === "bankily"
                        ? (isAr ? "رقم هاتف بنكيلي (Bankily) *" : "Numéro de téléphone Bankily (8 chiffres) *")
                        : (isAr ? "رقم حساب أو هاتف مصرفي (Masrvi) *" : "Numéro de compte ou téléphone Masrvi *")}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                        +222
                      </div>
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder={selectedMethod === "bankily" ? "45 12 34 56" : "36 00 00 00"}
                        className="w-full pl-16 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm font-semibold tracking-wider"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {isAr
                        ? "ستصلك رسالة تأكيد فورية على هاتفك للموافقة على الخصم."
                        : "Une notification push ou OTP sera envoyée sur votre téléphone pour valider l'opération."}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing || !phoneNumber}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                      selectedMethod === "bankily"
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/20 active:scale-98"
                        : "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-sky-500/20 active:scale-98"
                    } ${isProcessing ? "opacity-75 cursor-wait" : ""}`}
                  >
                    <Lock size={15} />
                    <span>
                      {isProcessing
                        ? (isAr ? "جاري الاتصال بالبنك..." : "Traitement Moosyl en cours...")
                        : `${isAr ? "سداد" : "Payer"} ${invoice.total.toLocaleString("fr-FR")} MRU ${isAr ? "الآن" : "via Moosyl"}`}
                    </span>
                  </button>
                </form>

                {/* Section QR Code de scan direct Moosyl */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <QrCode size={16} className="text-sky-400" />
                    <span>{isAr ? "دفع سريع عبر مسح الكود" : "Scanner pour régler depuis l'application"}</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded-md text-slate-300 font-mono">
                    Moosyl Gateway
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Pied de page sécurisé */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 bg-slate-950">
        <p>
          © 2026 Facturim Mauritanie • Passerelle de paiement certifiée Moosyl PayFac (Bankily &amp; Masrvi).
        </p>
      </footer>
    </div>
  );
}
