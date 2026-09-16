"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useLanguage, useTranslation } from "@/contexts/LanguageContext";

import PartnerMarquee from "./PartnerMarquee";

export default function LandingHero() {
  const { currentLanguage } = useLanguage();
  const { t } = useTranslation();
  const isAr = currentLanguage === "ar";
  const [email, setEmail] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8; // -4deg to +4deg
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
    setMousePos({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((touch.clientY - rect.top) / rect.height - 0.5) * -8;
      setMousePos({ x, y });
    }
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const handleQuickStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      window.location.href = `/register?email=${encodeURIComponent(email.trim())}`;
    } else {
      window.location.href = "/register";
    }
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseLeave}
      className="relative overflow-hidden bg-white min-h-[calc(100vh-5rem)] flex flex-col justify-between"
      data-purpose="hero-clean-minimal"
    >
      {/* Zone centrale Hero pleine largeur (Gauche : Titre + CTA, Droite : Laptop 3D) */}
      <div className="flex-1 flex items-center w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-10 lg:py-12">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* ========================================================================= */}
          {/* COLONNE GAUCHE : ALIGNÉE AU LOGO + TITRE STRICTEMENT SUR 2 LIGNES          */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-start text-left space-y-5 sm:space-y-6 z-10">
            {/* Badge interactif élégant avec pastille vivante */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50/90 border border-sky-200/80 text-sky-800 text-xs font-bold tracking-wide shadow-2xs hover:scale-105 transition-all cursor-default select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>{t.landing.heroBadge}</span>
            </div>

            {/* Titre Principal STRICTEMENT sur 2 lignes avec dégradé fluide animé */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[42px] xl:text-[50px] 2xl:text-[56px] font-black text-slate-950 tracking-tight leading-[1.14]">
              <span className="block whitespace-nowrap">
                {isAr ? "مرحباً بكم في" : "Bienvenue dans votre"}
              </span>
              <span className="block whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-sky-700 to-sky-500 animate-gradient-flow">
                {isAr ? "منصة الفوترة والتحصيل" : "solution de facturation"}
              </span>
            </h1>

            {/* Formulaire Pill Épuré Responsive : Email + Bouton Démarrer avec Shimmer */}
            <div className="w-full max-w-lg space-y-3.5">
              <form
                onSubmit={handleQuickStart}
                className="flex items-center p-1.5 sm:p-2 bg-white rounded-full border border-slate-200 shadow-xl shadow-slate-200/60 hover:border-sky-400 hover:shadow-sky-500/15 transition-all duration-300 focus-within:ring-4 focus-within:ring-sky-500/20 focus-within:border-sky-500"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAr ? "أدخل بريدك الإلكتروني المهني" : "Votre email professionnel..."}
                  required
                  className="w-full px-4 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-base bg-transparent border-none focus:ring-0 text-slate-900 placeholder-slate-400 outline-none"
                />
                <button
                  type="submit"
                  className="hero-cta-btn btn-shimmer-effect shrink-0 px-6 sm:px-8 py-3 sm:py-3.5 text-white font-bold text-xs sm:text-base rounded-full flex items-center space-x-2 cursor-pointer select-none hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-sky-500/30"
                >
                  <span>{isAr ? "ابدأ مجاناً" : "Démarrer"}</span>
                  <ArrowRight size={18} className="hero-cta-arrow stroke-[2.5]" />
                </button>
              </form>

              {/* Lien de redirection Connexion CENTRÉ sous le formulaire */}
              <div className="text-center text-sm sm:text-base font-semibold text-slate-500">
                <Link
                  href="/login"
                  className="text-slate-600 hover:text-sky-600 transition-colors underline underline-offset-4 decoration-slate-300 hover:decoration-sky-500 inline-block hover:scale-105"
                >
                  {isAr ? "لديك حساب بالفعل؟ تسجيل الدخول" : "Déjà un compte ? Se connecter"}
                </Link>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* COLONNE DROITE : LAPTOP 3D ISOLÉ AVEC PARALLAXE & FLOTTEMENT VIVANT       */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 xl:col-span-7 relative flex items-center justify-center lg:justify-end w-full overflow-visible">
            {/* Halo lumineux d'ambiance ultra-subtil */}
            <div
              className="absolute w-[450px] h-[450px] bg-gradient-to-tr from-sky-400/15 via-blue-500/10 to-transparent blur-[80px] rounded-full pointer-events-none animate-pulse-slow"
              aria-hidden="true"
            />

            <div
              className="relative w-full max-w-[580px] sm:max-w-[720px] lg:max-w-[920px] xl:max-w-[1100px] 2xl:max-w-[1240px] will-change-transform"
              style={{
                transform: `perspective(1200px) rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg)`,
                transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* Animation de flottement fluide continue active sur tous supports (Mobile & Desktop) */}
              <div className="relative w-full animate-hero-float will-change-transform">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/images/landing/facturim_cascading_hero_3d.png"
                    alt="Facturim — Logiciel de facturation électronique en Mauritanie"
                    fill
                    priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 60vw"
                    className="object-contain object-center drop-shadow-sm scale-105 sm:scale-108 lg:scale-112 xl:scale-115 transform origin-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PIED DU BLOC HERO : DÉFILEMENT CONTINU DES PARTENAIRES EN BAS DU HERO     */}
      {/* ========================================================================= */}
      <div className="w-full shrink-0">
        <PartnerMarquee />
      </div>
    </section>
  );
}









