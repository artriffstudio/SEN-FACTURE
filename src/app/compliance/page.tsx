"use client";

import React from "react";
import Link from "next/link";
import {
  FileCheck,
  ArrowLeft,
  Scale,
  Landmark,
  BadgePercent,
  CheckCircle2,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";

export default function CompliancePage() {
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
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold mb-4">
              <Landmark size={13} className="text-amber-600" />
              <span>{isAr ? "الإدارة العامة للضرائب (DGI)" : "Conformité Fiscale & Réglementaire"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {isAr
                ? "الامتثال للأنظمة والمعايير الضريبية الموريتانية"
                : "Conformité DGI, TVA 16% & Réglementation BCM"}
            </h1>

            <p className="text-sm text-slate-500 mt-2 font-medium">
              {isAr
                ? "دليل الامتثال لمتطلبات الفوترة القانونية، ضريبة القيمة المضافة والمصادقة الإلكترونية في موريتانيا."
                : "Référentiel des exigences légales mauritaniennes intégrées nativement dans Facturim."}
            </p>
          </div>
        </div>

        {/* EXIGENCES FISCALES DGI */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-10 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <BadgePercent size={18} className="text-sky-600" />
              <span>{isAr ? "1. معدلات ضريبة القيمة المضافة (TVA)" : "1. Gestion des Taux de TVA (Code Général des Impôts)"}</span>
            </h2>
            <p>
              Le moteur fiscal de Facturim applique avec exactitude les dispositions du Code Général des Impôts mauritanien :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500 uppercase">Taux Normal DGI</span>
                <p className="text-2xl font-black text-sky-600 my-1">16.00 %</p>
                <p className="text-xs text-slate-600">Applicable aux prestations de services, commerce et industrie générale.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500 uppercase">Taux Télécoms</span>
                <p className="text-2xl font-black text-amber-600 my-1">18.00 %</p>
                <p className="text-xs text-slate-600">Applicable aux opérateurs de télécommunication et services réseau.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-bold text-slate-500 uppercase">Exonération Légale</span>
                <p className="text-2xl font-black text-emerald-600 my-1">0.00 %</p>
                <p className="text-xs text-slate-600">Exportations et régimes dérogatoires avec mention légale obligatoire.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileCheck size={18} className="text-sky-600" />
              <span>{isAr ? "2. البيانات الإلزامية على الفاتورة" : "2. Mentions Légales & Identifiants Fiscaux"}</span>
            </h2>
            <ul className="space-y-2.5 pl-4 list-disc marker:text-sky-500">
              <li>
                <strong>Identification du fournisseur</strong> : Raison sociale, adresses physiques à Nouakchott/Nouadhibou, téléphone, email.
              </li>
              <li>
                <strong>NIF (Numéro d&apos;Identification Fiscale)</strong> : Obligatoire pour les entreprises assujetties, et optionnel pour les TPE et indépendants non immatriculés.
              </li>
              <li>
                <strong>Registre de Commerce (RC)</strong> : Mention légale du numéro d&apos;immatriculation au greffe.
              </li>
              <li>
                <strong>Série ininterrompue</strong> : Numérotation chronologique continue et infalsifiable sans rupture de séquence.
              </li>
              <li>
                <strong>Mention de la somme en toutes lettres</strong> : Formule légale automatique <em>« Arrêtée la présente facture à la somme de : ... Ouguiyas (MRU) »</em>.
              </li>
              <li>
                <strong>Code QR d&apos;authenticité</strong> : Empreinte cryptographique scellée permettant la vérification instantanée.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Landmark size={18} className="text-sky-600" />
              <span>{isAr ? "3. معايير البنك المركزي الموريتاني (BCM) للمدفوعات الرقمية" : "3. Cadre BCM sur les Paiements Numériques"}</span>
            </h2>
            <p>
              Conformément à la stratégie nationale de paiement numérique 2023-2028 de la Banque Centrale de Mauritanie, Facturim intègre la compatibilité avec l&apos;ensemble des services de paiement agréés :
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {["BANKILY (BPM)", "MASRVI (BMCI)", "SEDAD (BMI)", "CLICK (BNM)", "BIM BANK Mobile", "Virements Bancaires"].map(
                (p, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200"
                  >
                    <CheckCircle2 size={13} className="text-sky-600" />
                    <span>{p}</span>
                  </span>
                )
              )}
            </div>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
