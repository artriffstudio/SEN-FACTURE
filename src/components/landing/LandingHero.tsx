"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import JackShape from "./JackShape";

export default function LandingHero() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    // Redirige vers la page d'inscription avec l'email prérempli
    router.push(`/register?email=${encodeURIComponent(email.trim())}`);
  };

  return (
    <section
      className="relative overflow-hidden min-h-[calc(100svh-80px-68px)] sm:min-h-[calc(100vh-80px-74px)] flex flex-col justify-center items-center py-12 sm:py-16 lg:py-20 bg-white"
      data-purpose="hero-section"
    >
      {/* Halo lumineux atmosphérique en arrière-plan */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] hero-atmospheric-glow blur-[130px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Composition 3D Jack Gauche */}
      <JackShape variant="left" />

      {/* Composition 3D Jack Droite */}
      <JackShape variant="right" />

      {/* Contenu Central du Hero épuré et parfaitement dimensionné */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center w-full my-auto">
        {/* Titre Principal percutant avec grand gradient */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-950 tracking-tight leading-[1.08] mb-10 sm:mb-12">
          Bienvenue dans votre <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-sky-800 to-sky-600">
            solution de facturation
          </span>
        </h1>

        {/* Formulaire Pill avec micro-animations au hover & click */}
        <div className="max-w-md sm:max-w-lg mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex items-center p-1.5 sm:p-2 bg-white rounded-full border border-slate-200/90 shadow-xl shadow-slate-200/60 hover:border-sky-300/80 transition-all focus-within:ring-2 focus-within:ring-sky-500/25 focus-within:border-sky-400"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre email professionnel"
              required
              className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-base bg-transparent border-none focus:ring-0 text-slate-900 placeholder-slate-400 outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="hero-cta-btn shrink-0 px-5 sm:px-7 py-3 text-white font-bold text-xs sm:text-base rounded-full flex items-center space-x-2 cursor-pointer select-none"
            >
              <span>{isSubmitting ? "Chargement..." : "Commencer gratuitement"}</span>
              <ArrowRight size={16} className="hero-cta-arrow stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
