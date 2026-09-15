"use client";

import { useState } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";
import Tooltip from "@/components/ui/Tooltip";
import { createSupportTicket } from "@/lib/services/supportService";
import { useTranslation } from "@/contexts/LanguageContext";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function SupportPage() {
  const { t } = useTranslation();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("billing");
  const [ticketPriority, setTicketPriority] = useState("normal");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqData: FAQItem[] = [
    {
      category: `${t.vatRateLabel} & DGI`,
      question: "Comment fonctionne la TVA à 16% selon le code général des impôts mauritanien ?",
      answer:
        "Facturim calcule automatiquement la TVA standard de 16% en vigueur en République Islamique de Mauritanie (DGI). Vous pouvez également émettre des factures exonérées à 0% pour les exportations ou régimes dérogatoires.",
    },
    {
      category: "Bankily & Masrvi (Moosyl)",
      question: "Comment mes clients peuvent-ils régler leurs factures par Bankily et Masrvi ?",
      answer:
        "Chaque facture générée intègre automatiquement vos coordonnées Bankily (BPM) et Masrvi / Seddap dans son cartouche de modalités avec QR Code Moosyl, ainsi que vos identifiants bancaires RIB.",
    },
    {
      category: "Conformité NIF & DGI",
      question: "Les factures PDF générées sont-elles certifiées et opposables fiscalement en Mauritanie ?",
      answer:
        "Oui. Tous les documents PDF A4 émis comportent votre numéro NIF officiel, votre Registre de Commerce (RC), la numérotation séquentielle inviolable et les mentions légales conformes à la Direction Générale des Impôts.",
    },
    {
      category: "Comptabilité & Grand Livre",
      question: "Puis-je exporter le grand livre de mes factures vers mon logiciel comptable ?",
      answer:
        "Absolument. Depuis l'onglet Rapports, vous pouvez exporter en un clic un fichier CSV/Excel conforme aux écritures comptables en Ouguiya (MRU).",
    },
    {
      category: "Sécurité & Archivage",
      question: "Où sont hébergées et conservées mes factures professionnelles ?",
      answer:
        "Vos factures sont conservées et archivées avec chiffrement et redondance conformément aux obligations légales de conservation des pièces comptables en Mauritanie.",
    },
  ];

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      toast.error("Veuillez renseigner l'objet et le message de votre ticket");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Envoi du ticket au support technique...", { id: "ticket" });

    try {
      await createSupportTicket({
        subject: ticketSubject.trim(),
        category: ticketCategory,
        priority: ticketPriority,
        message: ticketMessage.trim(),
      });
      toast.success(
        "Votre ticket a été enregistré avec succès ! Notre équipe à Nouakchott vous répondra sous 2 heures.",
        { id: "ticket", duration: 5000 }
      );
      setTicketSubject("");
      setTicketMessage("");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement du ticket", { id: "ticket" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWhatsApp = () => {
    const text =
      "Bonjour le support Facturim Mauritanie, je vous contacte concernant une assistance sur mon compte.";
    window.open(`https://wa.me/22245250000?text=${encodeURIComponent(text)}`, "_blank");
    toast.success("Redirection vers WhatsApp Business Mauritanie");
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* EN-TÊTE DE LA PAGE */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.support.title}
            </h1>
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Nouakchott Support
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.support.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 bg-white border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-2xs">
            Délai moyen de réponse : <strong className="text-sky-600 font-bold">&lt; 5 minutes</strong>
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3 CANAUX DE CONTACT DIRECT (CARTE INTERACTIVE) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Canal 1 : WhatsApp Business */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-2xs">
                <MessageCircle size={20} />
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                WhatsApp Direct
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.support.whatsappTitle}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Échangez en direct avec un conseiller à Nouakchott pour toute question urgente sur une facture ou un encaissement.
              </p>
            </div>
            <p className="font-mono text-sm font-bold text-slate-800">
              +222 45 25 00 00
            </p>
          </div>

          <Tooltip content="Ouvrir WhatsApp" icon={MessageCircle}>
            <button
              onClick={handleOpenWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5 active:scale-98 cursor-pointer"
            >
              <MessageCircle size={15} />
              <span>Démarrer la discussion</span>
            </button>
          </Tooltip>
        </div>

        {/* Canal 2 : Hotline Téléphonique Nouakchott */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200/60 shadow-2xs">
                <Phone size={20} />
              </div>
              <span className="bg-sky-50 text-sky-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                Tevragh Zeina
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.support.hotlineTitle}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Ligne d&apos;assistance réservée aux entreprises abonnées du lundi au samedi.
              </p>
            </div>
            <p className="font-mono text-sm font-bold text-slate-800">
              {t.support.hotlineNumber}
            </p>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Clock size={12} />
              <span>08h30 – 18h30 (Heure de Nouakchott)</span>
            </div>
          </div>

          <Tooltip content="Copier le numéro" icon={Phone}>
            <button
              onClick={() => {
                navigator.clipboard.writeText("+222 45 25 00 00");
                toast.success("Numéro de téléphone copié dans le presse-papier !");
              }}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Phone size={15} className="text-sky-600" />
              <span>Copier le numéro</span>
            </button>
          </Tooltip>
        </div>

        {/* Canal 3 : Support par Email */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60 shadow-2xs">
                <Mail size={20} />
              </div>
              <span className="bg-purple-50 text-purple-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                Garanti 2h
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.support.emailTitle}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Pour l&apos;envoi de pièces justificatives, questions relatives aux déclarations TVA 16% ou contrats.
              </p>
            </div>
            <p className="font-mono text-sm font-bold text-slate-800">
              support@facturim.mr
            </p>
          </div>

          <Tooltip content="Envoyer un email" icon={Mail}>
            <button
              onClick={() => {
                window.location.href = "mailto:support@facturim.mr?subject=Demande d'assistance Facturim";
              }}
              className="w-full flex items-center justify-center gap-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 font-bold text-xs py-2.5 px-4 rounded-xl shadow-2xs transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Mail size={15} />
              <span>Écrire un email</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION DU MILIEU : FORMULAIRE DE TICKET + FOIRE AUX QUESTIONS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* FORMULAIRE DE CRÉATION DE TICKET */}
        <div className="lg:col-span-7 card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {t.support.ticketFormTitle}
              </h2>
              <p className="text-xs text-slate-500">
                Renseignez votre demande pour une prise en charge rapide par nos techniciens à Nouakchott.
              </p>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
              Ticket Sécurisé
            </span>
          </div>

          <form onSubmit={handleSendTicket} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="billing">Factures &amp; Numérotation DGI</option>
                  <option value="tax">Fiscalité &amp; TVA 16% (Mauritanie)</option>
                  <option value="payment">Paiements Moosyl (Bankily / Masrvi)</option>
                  <option value="pdf">Génération &amp; Export PDF A4</option>
                  <option value="account">Paramètres d&apos;entreprise &amp; NIF</option>
                  <option value="other">Autre demande générale</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.support.priority}
                </label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="normal">Normale (Sous 24h)</option>
                  <option value="high">Élevée (Sous 4h)</option>
                  <option value="urgent">Urgente (Sous 1h — Bloquant)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.support.subject} *
              </label>
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Ex: Configuration du compte Bankily ou déclaration TVA"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.support.message} *
              </label>
              <textarea
                required
                rows={5}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Expliquez en quelques lignes votre besoin ou le blocage rencontré..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-normal focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 resize-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 min-w-0">
                <ShieldCheck size={14} className="text-sky-600 shrink-0" />
                <span className="truncate">Ticket sécurisé Facturim Mauritanie</span>
              </div>

              {/* Bouton CTA Primaire du Design System */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:from-sky-700 active:to-sky-800 text-white font-bold text-xs px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-50 shrink-0 self-end sm:self-auto"
              >
                <Send size={14} className="shrink-0" />
                <span>{isSubmitting ? "..." : t.support.sendTicket}</span>
              </button>
            </div>
          </form>
        </div>

        {/* FOIRE AUX QUESTIONS (ACCORDÉON INTERACTIF) */}
        <div className="lg:col-span-5 card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle size={18} className="text-sky-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {t.support.faqTitle}
              </h2>
            </div>
            <span className="text-xs text-slate-400">5 réponses</span>
          </div>

          <div className="space-y-2.5">
            {faqData.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "border-sky-300 bg-sky-50/40 shadow-xs"
                      : "border-slate-200/70 bg-white hover:border-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-3 text-left flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                        {faq.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 mt-0.5 leading-snug">
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
                    <div className="px-3 pb-3 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100/80 animate-in fade-in duration-150">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Localisation et permanence */}
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <MapPin size={14} className="text-sky-600" />
              <span>Bureaux &amp; Centre de support :</span>
            </div>
            <p className="text-[11px] pl-5">
              Avenue du Roi Fayçal, Tevragh Zeina, Nouakchott, Mauritanie
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
