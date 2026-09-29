"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  Database,
  UserCheck,
  Server,
  FileCheck2,
  Mail,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

export default function PrivacyPage() {
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between"
      dir={isAr ? "rtl" : "ltr"}
    >
      <LandingHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors"
          >
            <ArrowLeft size={14} className={isAr ? "rotate-180" : ""} />
            <span>{isAr ? "العودة إلى الصفحة الرئيسية" : "Retour à l'accueil"}</span>
          </Link>
        </div>

        {/* EN-TÊTE */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold mb-4">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>{isAr ? "القانون الموريتاني رقم 2017-020" : "Loi Mauritanienne n° 2017-020"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {isAr
                ? "سياسة الخصوصية وحماية البيانات الشخصية"
                : "Politique de Confidentialité & Protection des Données"}
            </h1>

            <p className="text-sm text-slate-500 mt-2 font-medium">
              {isAr
                ? "التزام رسمي بحماية بيانات شركتك وعملائك وعدم تسويقها أو بيعها لأي طرف ثالث."
                : "Engagement de souveraineté, de chiffrement et de non-commercialisation absolue des données d'entreprise."}
            </p>
          </div>
        </div>

        {/* CONTENU */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-10 text-sm text-slate-700 leading-relaxed">
          {/* SECTION 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Lock size={18} className="text-emerald-600" />
              <span>{isAr ? "1. التزام فاكتوريم بالسرية التامة" : "1. Notre Engagement de Confidentialité"}</span>
            </h2>
            <p>
              La protection des données financières, fiscales et commerciales de votre entreprise est la priorité absolue de FACTURIM.
              Nous appliquons les principes stricts de la <strong>Loi n° 2017-020 relative à la protection des données à caractère personnel</strong> en République Islamique de Mauritanie.
            </p>
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center gap-3">
              <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
              <span>
                FACTURIM ne vend, ne loue, n&apos;échange et ne monétise JAMAIS les données de vos factures, de vos clients ou de vos chiffres d&apos;affaires à des tiers ou régies publicitaires.
              </span>
            </div>
          </section>

          {/* SECTION 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Database size={18} className="text-emerald-600" />
              <span>{isAr ? "2. البيانات التي يتم جمعها والغرض منها" : "2. Données Collectées & Finalités"}</span>
            </h2>
            <p>Nous collectons uniquement les informations nécessaires à l&apos;exécution du service :</p>
            <ul className="space-y-2 pl-4 list-disc marker:text-emerald-500">
              <li>
                <strong>Données de l&apos;entreprise</strong> : Raison sociale, NIF (optionnel), RC, adresses, RIB, coordonnées de paiement mobile (BANKILY, MASRVI, SEDAD, CLICK, BIM BANK Mobile).
              </li>
              <li>
                <strong>Données de facturation</strong> : Coordonnées des clients destinataires, articles, montants en Ouguiya (MRU), taux de TVA (16%, 18%, 0%).
              </li>
              <li>
                <strong>Journaux de sécurité</strong> : Horodatage des actions, adresse IP et empreinte de connexion pour la piste d&apos;audit immuable et la prévention de la fraude.
              </li>
            </ul>
          </section>

          {/* SECTION 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Server size={18} className="text-emerald-600" />
              <span>{isAr ? "3. الأمان الفني والتشفير" : "3. Sécurité Technique & Chiffrement"}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-xs mb-1">Chiffrement en Transit</h3>
                <p className="text-xs text-slate-600">Protocoles TLS 1.3 avec certificats SSL SHA-256 pour tous les transferts de données.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-xs mb-1">Chiffrement au Repos</h3>
                <p className="text-xs text-slate-600">Bases de données et pièces jointes chiffrées selon la norme AES-256.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-xs mb-1">Isolation Multi-Tenant</h3>
                <p className="text-xs text-slate-600">Verrouillage hermétique des données inter-entreprises via Row Level Security (RLS).</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 text-xs mb-1">Sauvegardes Quotidiennes</h3>
                <p className="text-xs text-slate-600">Sauvegardes automatisées chiffrées avec RPO de 15 min et RTO de 2 heures.</p>
              </div>
            </div>
          </section>

          {/* SECTION 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <UserCheck size={18} className="text-emerald-600" />
              <span>{isAr ? "4. حقوق المستخدمين (الوصول، التعديل والتصدير)" : "4. Vos Droits d'Accès, d'Export et de Rectification"}</span>
            </h2>
            <p>
              Conformément à la législation mauritanienne, vous disposez d&apos;un droit d&apos;accès, de rectification et d&apos;exportation intégrale de vos données (formats CSV, Excel et PDF) à tout moment.
            </p>
            <p>
              Pour toute question relative à la protection de vos données ou pour exercer vos droits, contactez notre Délégué à la Protection des Données :{" "}
              <a href="mailto:privacy@facturim.net" className="text-sky-600 font-bold hover:underline">
                privacy@facturim.net
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
