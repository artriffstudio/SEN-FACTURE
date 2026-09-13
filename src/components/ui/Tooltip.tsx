"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: ReactNode;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

/**
 * Composant d'infobulle instantanée épurée :
 * - Fond BLANC (bg-white) avec ombre douce et bordure fine
 * - Texte en noir/anthracite (text-slate-900 font-bold)
 * - Icône en BLEU (text-sky-600)
 * - Affiche UNIQUEMENT le nom / titre du bouton, sans texte superflu
 */
export default function Tooltip({
  content,
  children,
  icon: Icon,
  position = "top",
  className,
}: TooltipProps) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-white border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-white border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-white border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-white border-y-transparent border-l-transparent",
  };

  return (
    <div className={cn("relative group/tooltip inline-flex items-center justify-center", className)}>
      {children}

      {/* Bulle d'information blanche avec icône en bleu */}
      <div
        role="tooltip"
        className={cn(
          "absolute z-50 pointer-events-none hidden group-hover/tooltip:flex flex-col items-center",
          "opacity-0 group-hover/tooltip:opacity-100 transition-all duration-150 ease-out transform scale-95 group-hover/tooltip:scale-100",
          positionClasses[position]
        )}
      >
        <div className="bg-white text-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold shadow-lg border border-slate-200/90 whitespace-nowrap flex items-center gap-2 ring-1 ring-slate-900/5">
          {Icon && <Icon size={14} className="text-sky-600 shrink-0 stroke-[2.3]" />}
          <span className="leading-none tracking-tight">{content}</span>
        </div>
        {/* Flèche blanche */}
        <div className={cn("w-0 h-0 border-4 drop-shadow-xs", arrowClasses[position])} />
      </div>
    </div>
  );
}
