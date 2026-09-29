"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface FacturimLogoProps {
  variant?: "full" | "icon" | "squircle" | "dark" | "monochrome";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  showText?: boolean;
  className?: string;
  alt?: string;
}

const sizeMap = {
  xs: { height: 24, iconSize: 24 },
  sm: { height: 32, iconSize: 32 },
  md: { height: 40, iconSize: 40 },
  lg: { height: 48, iconSize: 48 },
  xl: { height: 56, iconSize: 56 },
};

/**
 * Composant Officiel FACTURIM LOGO
 * Utilise l'image exacte et certifiée de la Déclinaison 4B (Carte de Mauritanie scindée en « F » FinTech)
 * avec une netteté absolue et fidélité intégrale.
 */
export default function FacturimLogo({
  variant = "full",
  size = "md",
  showText = true,
  className,
  alt = "FACTURIM Logo",
}: FacturimLogoProps) {
  const isCustomSize = typeof size === "number";
  const height = isCustomSize ? size : sizeMap[size]?.height || 40;
  const iconSize = isCustomSize ? size : sizeMap[size]?.iconSize || 40;

  const isDark = variant === "dark";
  const isSquircle = variant === "squircle";
  const isIconOnly = variant === "icon" || isSquircle || !showText;

  // Image source path
  let src = "/images/logo/facturim-logo-couleur.png";
  if (isDark) {
    src = "/images/logo/facturim-logo-dark-mode-transparent.png";
  } else if (isIconOnly) {
    src = "/images/logo/facturim-symbole-couleur.png";
  }

  // Squircle (App Icon / Dashboard Sidebar Header)
  if (isSquircle) {
    return (
      <div
        className={cn(
          "rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 overflow-hidden",
          isDark
            ? "bg-slate-900 shadow-md shadow-slate-950/40 border border-slate-800"
            : "bg-white shadow-xs border border-slate-200/90",
          className
        )}
        style={{ width: iconSize + 6, height: iconSize + 6 }}
      >
        <img
          src="/images/logo/facturim-symbole-couleur.png"
          alt={alt}
          className="w-full h-full object-contain p-1"
          style={{ maxHeight: iconSize, maxWidth: iconSize }}
          loading="eager"
        />
      </div>
    );
  }

  // Icon only
  if (isIconOnly) {
    return (
      <div className={cn("inline-flex items-center shrink-0", className)}>
        <img
          src="/images/logo/facturim-symbole-couleur.png"
          alt={alt}
          className="object-contain"
          style={{ height: height, width: "auto" }}
          loading="eager"
        />
      </div>
    );
  }

  // Full Horizontal Brandmark
  return (
    <div className={cn("inline-flex items-center shrink-0 select-none", className)}>
      <img
        src={src}
        alt={alt}
        className="object-contain transition-transform duration-200 group-hover:scale-[1.02]"
        style={{ height: height, width: "auto" }}
        loading="eager"
      />
    </div>
  );
}
