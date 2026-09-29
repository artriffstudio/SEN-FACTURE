"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  ShieldCheck,
  Building,
  CheckCircle2,
  Lock,
  Scale,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

export default function TermsPage() {
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col justify-between"
      dir={isAr ? "rtl" : "ltr"}
    >
      <LandingHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* FIL D'ARIANE / RETOUR */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors"
          >
            <ArrowLeft size={14} className={isAr ? "rotate-180" : ""} />
            <span>{isAr ? "العودة إلى الصفحة الرئيسية" : "Retour à l'accueil"}</span>
          </Link>
        </div>

        {/* EN-TÊTE DE PAGE */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-bold mb-4">
              <Scale size={13} className="text-sky-600" />
              <span>{isAr ? "الإطار القانوني والتجاري" : "Cadre Contractuel B2B Mauritanie"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {isAr
                ? "الشروط العامة للاستخدام والخدمة (CGU)"
                : "Conditions Générales d'Utilisation et de Service"}
            </h1>

            <p className="text-sm text-slate-500 mt-2 font-medium">
              {isAr
                ? "آخر تحديث: 28 سبتمبر 2026 — تنطبق على جميع مستخدمي منصة فاكتوريم في موريتانيا."
                : "Dernière mise à jour : 28 Septembre 2026 — Applicable à l'ensemble des entreprises et professionnels utilisant FACTURIM."}
            </p>
          </div>
        </div>

        {/* CONTENU PRINCIPAL DES CGU */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-10 text-sm text-slate-700 leading-relaxed">
          {/* ARTICLE 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="text-sky-600">1.</span>
              <span>{isAr ? "الهدف ونطاق التطبيق" : "Objet et Champ d'Application"}</span>
            </h2>
            <p>
              Les présentes Conditions Générales d&apos;Utilisation (ci-après les « <strong>CGU</strong> ») régissent
              l&apos;accès et l&apos;utilisation de la plateforme logicielle SaaS <strong>FACTURIM</strong> (ci-après le « Service »),
              éditée pour les entreprises, professionnels indépendants, PME et institutions établis en République Islamique de Mauritanie ou commerçant avec celle-ci.
            </p>
            <p>
              Toute création de compte ou utilisation du Service implique l&apos;acceptation pleine, entière et sans réserve des présentes CGU.
            </p>
          </section>

          {/* ARTICLE 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="text-sky-600">2.</span>
              <span>{isAr ? "وصف الخدمات ومحرك الفوترة" : "Description des Services & Moteur Fiscal"}</span>
            </h2>
            <p>FACTURIM met à disposition des professionnels :</p>
            <ul className="space-y-2 pl-4 list-disc marker:text-sky-500">
              <li>Un moteur de création, d&apos;émission et de gestion de devis et de factures normalisées.</li>
              <li>
                Le calcul automatisé et paramétrable de la <strong>TVA légale (16% standard DGI, 18% télécoms, 0% exonéré/export)</strong>.
              </li>
              <li>
                La génération de documents certifiés au format PDF A4 avec identifiants fiscaux (NIF optionnel/légal, RC), mention automatique de la somme en toutes lettres et code QR de vérification.
              </li>
              <li>
                Le suivi des encaissements compatible avec les solutions bancaires et mobile money de Mauritanie : <strong>BANKILY (BPM), MASRVI (BMCI), SEDAD (BMI), CLICK (BNM), BIM BANK Mobile</strong> et virements bancaires.
              </li>
              <li>Un journal comptable d&apos;écritures, un grand livre et des rapports de chiffre d&apos;affaires en Ouguiya (MRU).</li>
            </ul>
          </section>

          {/* ARTICLE 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="text-sky-600">3.</span>
              <span>{isAr ? "إنشاء الحساب والأمان وحماية البيانات" : "Accès, Sécurité des Mots de Passe & Rôles"}</span>
            </h2>
            <p>
              3.1. <strong>Politique de mot de passe</strong> : Tout mot de passe doit comporter un minimum de 12 caractères combinant majuscules, minuscules, chiffres et caractères spéciaux.
            </p>
            <p>
              3.2. <strong>Rôles et Confidentialité</strong> : FACTURIM intègre une séparation stricte des accès (RBAC). Le Chef d&apos;entreprise (Owner) a la possibilité de masquer le chiffre d&apos;affaires global et les rapports fiscaux aux employés guichetiers et facturiers.
            </p>
          </section>

          {/* ARTICLE 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="text-sky-600">4.</span>
              <span>{isAr ? "القواعد الضريبية وعدم قابلية التعديل (Immuabilité)" : "Conformité Fiscale & Immuabilité des Factures"}</span>
            </h2>
            <p>
              4.1. <strong>Immuabilité</strong> : Conformément aux règles de l&apos;administration fiscale mauritanienne (DGI), toute facture définitivement validée et émise ne peut être supprimée physiquement de la base de données.
            </p>
            <p>
              4.2. Toute modification d&apos;une facture émise doit obligatoirement passer par l&apos;émission d&apos;une <strong>facture d&apos;avoir (Credit Note)</strong> ou d&apos;une annulation formellement tracée dans la piste d&apos;audit.
            </p>
          </section>

          {/* ARTICLE 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="text-sky-600">5.</span>
              <span>{isAr ? "وسائل الدفع والمسؤولية المالية" : "Moyens de Paiement & Flux Bancaires"}</span>
            </h2>
            <p>
              Facturim fournit une solution logicielle et ne se substitue pas aux établissements bancaires ou émetteurs de monnaie électronique agréés par la Banque Centrale de Mauritanie (BCM). Les règlements s&apos;opèrent directement entre le client final et les comptes marchands de l&apos;entreprise émettrice.
            </p>
          </section>

          {/* ARTICLE 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="text-sky-600">6.</span>
              <span>{isAr ? "الملكية الفكرية وسرية البيانات" : "Propriété des Données & Non-Commercialisation"}</span>
            </h2>
            <p>
              L&apos;entreprise utilisatrice conserve l&apos;entière et exclusive propriété de ses données clients, factures et écritures comptables. <strong>FACTURIM s&apos;engage formellement à ne jamais vendre, céder ou exploiter commercialement les données de facturation.</strong>
            </p>
          </section>

          {/* ARTICLE 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="text-sky-600">7.</span>
              <span>{isAr ? "القانون المطبق والاختصاص القضائي" : "Droit Applicable & Juridiction"}</span>
            </h2>
            <p>
              Les présentes CGU sont régies par le droit en vigueur en République Islamique de Mauritanie. Tout litige relève de la compétence exclusive des tribunaux de Nouakchott.
            </p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
