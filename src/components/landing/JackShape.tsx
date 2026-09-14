"use client";

import React from "react";

interface JackShapeProps {
  variant: "left" | "right";
  className?: string;
}

/**
 * Composant 3D Organic Jacks / Soft Crosses
 * Reproduit fidèlement la composition volumétrique 3D avec profondeur de champ,
 * matériaux clay (porcelaine blanche, corail chaleureux et bleu doux) et lévitation fluide.
 */
export default function JackShape({ variant, className = "" }: JackShapeProps) {
  if (variant === "left") {
    return (
      <div
        className={`block absolute top-2 left-0 sm:top-1/2 sm:-translate-y-1/2 sm:left-2 xl:left-12 w-[280px] sm:w-[320px] lg:w-[420px] h-[440px] sm:h-[500px] pointer-events-none select-none z-0 scale-[0.52] sm:scale-70 md:scale-85 lg:scale-100 origin-top-left sm:origin-left opacity-80 sm:opacity-90 lg:opacity-100 animate-drift-left-to-right sm:animate-none transition-all duration-300 ${className}`}
        aria-hidden="true"
      >
        {/* Jack d'arrière-plan avec flou de profondeur de champ */}
        <div className="absolute -top-6 left-12 w-36 h-36 opacity-40 blur-[5px] animate-float-back">
          <div className="jack-shape w-full h-full relative">
            <div className="jack-arm clay-white w-32 h-10 top-12 left-2 jack-rot-45" />
            <div className="jack-arm clay-white w-32 h-10 top-12 left-2 jack-rot-neg-45" />
            <div className="jack-arm clay-blue w-10 h-32 top-2 left-12 opacity-60" />
          </div>
        </div>

        {/* Jack intermédiaire Corail doux */}
        <div className="absolute top-8 left-16 w-52 h-52 animate-float-left">
          <div className="jack-shape w-full h-full relative">
            <div className="jack-arm clay-coral w-48 h-16 top-16 left-2 jack-rot-35" />
            <div className="jack-arm clay-coral w-48 h-16 top-16 left-2 jack-rot-neg-55" />
            <div className="jack-arm clay-coral w-16 h-48 top-2 left-18 jack-rot-8" />
          </div>
        </div>

        {/* Jack de premier plan Porcelaine Blanche (Élément Hero majeur) */}
        <div className="absolute bottom-4 -left-4 w-72 h-72 animate-float-left-delayed">
          <div className="jack-shape w-full h-full relative">
            <div className="jack-arm clay-white w-64 h-24 top-24 left-4 jack-rot-42" />
            <div className="jack-arm clay-white w-64 h-24 top-24 left-4 jack-rot-neg-48" />
            <div className="jack-arm clay-white w-24 h-64 top-4 left-24 jack-rot-6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`block absolute bottom-2 right-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:right-2 xl:right-12 w-[280px] sm:w-[320px] lg:w-[420px] h-[440px] sm:h-[500px] pointer-events-none select-none z-0 scale-[0.52] sm:scale-70 md:scale-85 lg:scale-100 origin-bottom-right sm:origin-right opacity-80 sm:opacity-90 lg:opacity-100 animate-drift-right-to-left sm:animate-none transition-all duration-300 ${className}`}
      aria-hidden="true"
    >
      {/* Jack d'arrière-plan avec flou de profondeur de champ */}
      <div className="absolute -top-4 right-14 w-40 h-40 opacity-45 blur-[6px] animate-float-back">
        <div className="jack-shape w-full h-full relative">
          <div className="jack-arm clay-blue w-36 h-12 top-14 left-2 jack-rot-40" />
          <div className="jack-arm clay-blue w-36 h-12 top-14 left-2 jack-rot-neg-50" />
          <div className="jack-arm clay-white w-12 h-36 top-2 left-14" />
        </div>
      </div>

      {/* Jack intermédiaire Corail doux */}
      <div className="absolute top-10 right-10 w-56 h-56 animate-float-right">
        <div className="jack-shape w-full h-full relative">
          <div className="jack-arm clay-coral w-52 h-18 top-18 left-2 jack-rot-48" />
          <div className="jack-arm clay-coral w-52 h-18 top-18 left-2 jack-rot-neg-42" />
          <div className="jack-arm clay-coral w-18 h-52 top-2 left-20 jack-rot-neg-10" />
        </div>
      </div>

      {/* Jack de premier plan Porcelaine Blanche */}
      <div className="absolute bottom-2 right-0 w-72 h-72 animate-float-right-delayed">
        <div className="jack-shape w-full h-full relative">
          <div className="jack-arm clay-white w-64 h-24 top-24 left-4 jack-rot-45" />
          <div className="jack-arm clay-white w-64 h-24 top-24 left-4 jack-rot-neg-45" />
          <div className="jack-arm clay-white w-24 h-64 top-4 left-24 jack-rot-2" />
        </div>
      </div>
    </div>
  );
}
