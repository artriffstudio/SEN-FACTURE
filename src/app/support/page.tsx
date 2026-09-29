"use client";

import { useState } from "react";
import Link from "next/link";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import {
  Headphones,
  MessageCircle,
  Phone,
  Mail,
  Send,
  HelpCircle,
  ChevronDown,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import Tooltip from "@/components/ui/Tooltip";
import { createSupportTicket } from "@/lib/services/supportService";
import { useTranslation, useLanguage } from "@/contexts/LanguageContext";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function PublicSupportPage() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("billing");
  const [ticketPriority, setTicketPriority] = useState("normal");
  const [ticketMessage, setTicketMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqData: FAQItem[] = [
    {
      category: `${t.vatRateLabel} & DGI`,
      question: "Comment fonctionne la TVA à 16% selon le code général des impôts mauritanien ?",
      answer:
        "Facturim calcule automatiquement la TVA standard de 16% en vigueur en République Islamique de Mauritanie (DGI). Vous pouvez également émettre des factures exonérées à 0% pour les exportations ou régimes dérogatoires (Article 15 CGI) ou à 18% pour les télécommunications.",
    },
    {
      category: "Mobile Money (Bankily, Masrvi, SEDAD, Click, BIM Bank)",
      question: "Comment mes clients peuvent-ils régler leurs factures par Mobile Money ?",
      answer:
        "Chaque facture générée intègre automatiquement vos coordonnées BANKILY (BPM), MASRVI (BMCI), SEDAD (BMI), CLICK (BNM) et BIM BANK Mobile dans son cartouche de modalités avec QR Code, ainsi que vos identifiants bancaires RIB.",
    },
    {
      category: "Conformité NIF & DGI",
      question: "Les factures PDF générées sont-elles certifiées et opposables fiscalement en Mauritanie ?",
      answer:
        "Oui. Tous les documents PDF A4 émis comportent votre numéro NIF officiel (ou mention dérogatoire si dispensé), votre Registre de Commerce (RC), la numérotation séquentielle inviolable et les mentions légales conformes à la Direction Générale des Impôts.",
    },
    {
      category: "Comptabilité & Grand Livre",
      question: "Puis-je exporter le grand livre de mes factures vers mon logiciel comptable ?",
      answer:
        "Absolument. Depuis l'onglet Rapports, vous pouvez exporter en un clic un fichier CSV/Excel conforme aux écritures comptables en Ouguiya (MRU) pour vos déclarations périodiques de TVA.",
    },
    {
      category: "Sécurité & Archivage",
      question: "Où sont hébergées et conservées mes factures professionnelles ?",
      answer:
        "Vos factures sont conservées et archivées avec chiffrement de bout en bout TLS 1.3 et AES-256 avec sauvegardes journalières redondantes conformément aux obligations légales de conservation des pièces comptables en Mauritanie (Loi 2017-020).",
    },
  ];

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast.error("Veuillez renseigner l'objet et le message de votre demande");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Envoi de votre demande au support technique...", { id: "ticket" });

    try {
      await createSupportTicket({
        subject: ticketSubject.trim(),
        category: ticketCategory,
        priority: ticketPriority,
        message: `${ticketMessage.trim()}${contactEmail ? ` | Contact: ${contactEmail} (${contactPhone})` : ""}`,
      });
      toast.success(
        "Votre demande a été enregistrée avec succès ! Notre équipe à Nouakchott vous répondra sous 2 heures ouvrées.",
        { id: "ticket", duration: 5000 }
      );
      setTicketSubject("");
      setTicketMessage("");
      setContactEmail("");
      setContactPhone("");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement de la demande", { id: "ticket" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      <LandingHeader />

      <main className="flex-1 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full space-y-10">
        {/* En-tête de page */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-sky-800 text-xs font-bold tracking-wide shadow-2xs">
            <Sparkles size={14} className="text-sky-600" />
            <span>Assistance Dédiée Mauritanie</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
            {t.support.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            {t.support.subtitle}
          </p>
        </div>

        {/* 3 Canaux de Contact Rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* WhatsApp Direct */}
          <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                <MessageCircle size={24} className="stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{t.support.whatsappTitle}</h3>
                <p className="text-xs text-slate-500 mt-1">Réponse instantanée 7j/7 pour vos urgences de facturation.</p>
              </div>
            </div>
            <div className="pt-5 border-t border-slate-100 mt-4">
              <a
                href="https://wa.me/22236000000"
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all"
              >
                <span>Ouvrir WhatsApp (+222 36 00 00 00)</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Hotline Téléphonique */}
          <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-sky-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-2xs">
                <Phone size={24} className="stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{t.support.hotlineTitle}</h3>
                <p className="text-xs text-slate-500 mt-1">Ligne directe Nouakchott du lundi au samedi de 8h à 18h.</p>
              </div>
            </div>
            <div className="pt-5 border-t border-slate-100 mt-4">
              <a
                href="tel:+22245000000"
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all"
              >
                <span>Appeler le +222 45 00 00 00</span>
                <Phone size={14} />
              </a>
            </div>
          </div>

          {/* Email Officiel */}
          <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
                <Mail size={24} className="stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{t.support.emailTitle}</h3>
                <p className="text-xs text-slate-500 mt-1">Transmission de documents, audits fiscaux et demandes spécifiques.</p>
              </div>
            </div>
            <div className="pt-5 border-t border-slate-100 mt-4">
              <a
                href="mailto:contact@facturim.net"
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all"
              >
                <span>contact@facturim.net</span>
                <Mail size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Section Formulaire de Ticket & FAQ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Formulaire de Ticket à Gauche (5 colonnes) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-5">
            <div>
              <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-200">
                Ticket d&apos;Assistance
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                {t.support.ticketFormTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Décrivez votre demande. Un ticket priorisé est immédiatement affecté à notre équipe technique.
              </p>
            </div>

            <form onSubmit={handleSendTicket} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Votre Email *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="contact@entreprise.mr"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+222 45..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catégorie de la demande</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:border-sky-500 focus:bg-white focus:outline-none"
                >
                  <option value="billing">Facturation & Déclarations DGI</option>
                  <option value="payments">Mobile Banking (Bankily, Sedad, Masrvi, Click)</option>
                  <option value="technical">Assistance Technique & Export PDF</option>
                  <option value="account">Gestion de Compte & Collaborateurs</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Niveau de Priorité</label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-medium focus:border-sky-500 focus:bg-white focus:outline-none"
                >
                  <option value="normal">Normal (Réponse sous 2h ouvrées)</option>
                  <option value="high">Élevé (Facturation bloquée)</option>
                  <option value="urgent">Urgent P1 (Incident critique)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Objet de la demande *</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Ex: Configuration du taux de TVA 16% sur nos forfaits"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:border-sky-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message détaillé *</label>
                <textarea
                  required
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Précisez les détails de votre question, le numéro de facture concerné ou votre besoin spécifique..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:border-sky-500 focus:bg-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold py-3 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Send size={15} />
                <span>{isSubmitting ? "Transmission en cours..." : "Soumettre le ticket d'assistance"}</span>
              </button>
            </form>
          </div>

          {/* FAQ Accordéons à Droite (7 colonnes) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <HelpCircle size={18} className="text-sky-600" />
              <h2 className="text-lg font-extrabold text-slate-900">
                Foire Aux Questions & Conformité Mauritanie
              </h2>
            </div>

            <div className="space-y-3">
              {faqData.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200/90 rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left p-4 flex items-center justify-between gap-3 bg-slate-50/70 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">
                          {faq.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {faq.question}
                        </h4>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-sky-600" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="p-4 bg-white border-t border-slate-100 text-xs text-slate-600 leading-relaxed animate-in fade-in duration-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
