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

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: "Fiscalité & TVA",
    question: "Comment fonctionne la TVA à 18% selon le code général des impôts sénégalais ?",
    answer:
      "SEN FACTURE calcule automatiquement la TVA standard de 18% en vigueur au Sénégal et dans la zone UEMOA. Vous pouvez également émettre des factures exonérées à 0% pour les exportations ou les régimes dérogatoires agréés (Code des Investissements).",
  },
  {
    category: "Règlements & Mobile Money",
    question: "Comment mes clients peuvent-ils régler leurs factures par Wave et Orange Money ?",
    answer:
      "Chaque facture générée intègre automatiquement vos coordonnées Wave Mobile Money et Orange Money dans son cartouche de modalités, ainsi que vos identifiants bancaires (RIB / BICIS). Vos clients peuvent ainsi procéder au paiement immédiatement dès réception de la facture.",
  },
  {
    category: "Conformité Légale",
    question: "Les factures PDF générées sont-elles certifiées et opposables fiscalement ?",
    answer:
      "Oui. Tous les documents PDF A4 émis comportent votre numéro NINEA officiel, votre Registre de Commerce (RC), la numérotation séquentielle inviolable et les mentions légales obligatoires selon le référentiel SYSCOHADA Révisé.",
  },
  {
    category: "Comptabilité",
    question: "Puis-je exporter le grand livre de mes factures vers mon logiciel comptable ?",
    answer:
      "Absolument. Depuis l'onglet Rapports ou depuis le registre des factures, vous pouvez exporter en un clic un fichier CSV/Excel conforme aux comptes du plan comptable SYSCOHADA (Comptes 701, 411 et 443).",
  },
  {
    category: "Sécurité des Données",
    question: "Où sont hébergées et conservées mes factures professionnelles ?",
    answer:
      "Vos factures sont conservées et archivées avec redondance et chiffrement de bout en bout conformément à l'obligation légale de conservation des pièces justificatives comptables pendant 10 ans au Sénégal.",
  },
];

export default function SupportPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("billing");
  const [ticketPriority, setTicketPriority] = useState("normal");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        "Votre ticket a été enregistré avec succès dans Supabase ! Un conseiller SEN FACTURE vous répondra sous 2 heures.",
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
      "Bonjour le support SEN FACTURE, je vous contacte concernant une assistance sur mon compte de facturation.";
    window.open(`https://wa.me/221778901234?text=${encodeURIComponent(text)}`, "_blank");
    toast.success("Redirection vers WhatsApp Business");
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
              Assistance & Support Client
            </h1>
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Équipe en direct
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Une équipe dédiée basée à Dakar pour vous accompagner dans votre facturation et votre fiscalité SYSCOHADA.
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
                Le plus rapide
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">WhatsApp Business Direct</h3>
              <p className="text-xs text-slate-500 mt-1">
                Échangez en direct avec un chargé d&apos;assistance pour toute question urgente sur une facture ou un encaissement.
              </p>
            </div>
            <p className="font-mono text-sm font-bold text-slate-800">
              +221 77 890 12 34
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

        {/* Canal 2 : Hotline Téléphonique Dakar */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-200/60 shadow-2xs">
                <Phone size={20} />
              </div>
              <span className="bg-sky-50 text-sky-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                Dakar Plateau
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hotline Téléphonique</h3>
              <p className="text-xs text-slate-500 mt-1">
                Ligne d&apos;assistance réservée aux entreprises abonnées du lundi au samedi.
              </p>
            </div>
            <p className="font-mono text-sm font-bold text-slate-800">
              +221 33 820 45 67
            </p>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Clock size={12} />
              <span>08h30 – 18h30 (Heure de Dakar)</span>
            </div>
          </div>

          <Tooltip content="Copier le numéro" icon={Phone}>
            <button
              onClick={() => {
                navigator.clipboard.writeText("+221 33 820 45 67");
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
              <h3 className="text-sm font-bold text-slate-900">Assistance Email & Fiscale</h3>
              <p className="text-xs text-slate-500 mt-1">
                Pour l&apos;envoi de pièces justificatives, questions relatives aux régularisations TVA ou contrats.
              </p>
            </div>
            <p className="font-mono text-sm font-bold text-slate-800">
              support@senfacture.sn
            </p>
          </div>

          <Tooltip content="Envoyer un email" icon={Mail}>
            <button
              onClick={() => {
                window.location.href = "mailto:support@senfacture.sn?subject=Demande d'assistance SEN FACTURE";
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
                Ouvrir un ticket d&apos;assistance
              </h2>
              <p className="text-xs text-slate-500">
                Renseignez votre demande pour une prise en charge rapide par nos techniciens
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
                  Catégorie de la demande
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="billing">Factures & Numérotation séquentielle</option>
                  <option value="tax">Fiscalité & Déclaration TVA 18% (DGID)</option>
                  <option value="payment">Paiements Mobile Money (Wave / OM)</option>
                  <option value="pdf">Génération et export PDF A4</option>
                  <option value="account">Paramètres de l&apos;entreprise & NINEA</option>
                  <option value="other">Autre demande générale</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Niveau de priorité
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
                Objet du ticket *
              </label>
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Ex: Question sur la conformité de l'exonération TVA"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Description détaillée *
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
                <span className="truncate">Ticket horodaté et certifié Teranga Digital</span>
              </div>

              {/* Bouton CTA Primaire du Design System (redimensionné pour mobile) */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:from-sky-700 active:to-sky-800 text-white font-bold text-xs px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer disabled:opacity-50 shrink-0 self-end sm:self-auto"
              >
                <Send size={14} className="shrink-0" />
                <span>{isSubmitting ? "Envoi..." : "Envoyer le ticket"}</span>
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
                Questions Fréquentes (FAQ)
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
              <span>Bureaux & Centre d&apos;accueil :</span>
            </div>
            <p className="text-[11px] pl-5">
              46 Boulevard de la République, Dakar Plateau, Sénégal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
