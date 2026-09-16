"use client";

import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  height?: number;
  variant?: "badge" | "card" | "inline" | "dark";
  showLabel?: boolean;
}

/**
 * Logo Officiel Authentique Bankily (BPM)
 */
export function BankilyLogo({
  className = "",
  height = 32,
  variant = "inline",
}: LogoProps) {
  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center justify-center bg-white border border-slate-200/90 rounded-xl px-2.5 py-1 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all ${className}`}
      >
        <img
          src="/images/payments/bankily.png"
          alt="Bankily BPM"
          style={{ height: `${height}px`, width: "auto" }}
          className="object-contain max-h-full"
        />
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <div
        className={`inline-flex items-center justify-center bg-white/95 rounded-xl px-2.5 py-1 border border-white/20 shadow-sm ${className}`}
      >
        <img
          src="/images/payments/bankily.png"
          alt="Bankily BPM"
          style={{ height: `${height}px`, width: "auto" }}
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <img
      src="/images/payments/bankily.png"
      alt="Bankily BPM"
      style={{ height: `${height}px`, width: "auto" }}
      className={`object-contain inline-block shrink-0 ${className}`}
    />
  );
}

/**
 * Logo Officiel Authentique Masrvi (BMCI)
 */
export function MasrviLogo({
  className = "",
  height = 32,
  variant = "inline",
}: LogoProps) {
  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center justify-center bg-white border border-slate-200/90 rounded-xl px-2.5 py-1 shadow-2xs hover:border-sky-300 hover:shadow-xs transition-all ${className}`}
      >
        <img
          src="/images/payments/masrvi.png"
          alt="Masrvi BMCI"
          style={{ height: `${height}px`, width: "auto" }}
          className="object-contain max-h-full"
        />
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <div
        className={`inline-flex items-center justify-center bg-white/95 rounded-xl px-2.5 py-1 border border-white/20 shadow-sm ${className}`}
      >
        <img
          src="/images/payments/masrvi.png"
          alt="Masrvi BMCI"
          style={{ height: `${height}px`, width: "auto" }}
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <img
      src="/images/payments/masrvi.png"
      alt="Masrvi BMCI"
      style={{ height: `${height}px`, width: "auto" }}
      className={`object-contain inline-block shrink-0 ${className}`}
    />
  );
}

/**
 * Logo Officiel Authentique Sedad Bank (السداد)
 */
export function SedadLogo({
  className = "",
  height = 32,
  variant = "inline",
}: LogoProps) {
  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center justify-center bg-white border border-slate-200/90 rounded-xl px-2.5 py-1 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all ${className}`}
      >
        <img
          src="/images/payments/sedad.png"
          alt="Sedad Bank"
          style={{ height: `${height}px`, width: "auto" }}
          className="object-contain max-h-full"
        />
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <div
        className={`inline-flex items-center justify-center bg-white/95 rounded-xl px-2.5 py-1 border border-white/20 shadow-sm ${className}`}
      >
        <img
          src="/images/payments/sedad.png"
          alt="Sedad Bank"
          style={{ height: `${height}px`, width: "auto" }}
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <img
      src="/images/payments/sedad.png"
      alt="Sedad Bank"
      style={{ height: `${height}px`, width: "auto" }}
      className={`object-contain inline-block shrink-0 ${className}`}
    />
  );
}

/**
 * Logo Officiel Authentique Eywa
 */
export function EywaLogo({
  className = "",
  height = 32,
  variant = "inline",
}: LogoProps) {
  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center justify-center bg-white border border-slate-200/90 rounded-xl px-2.5 py-1 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all ${className}`}
      >
        <img
          src="/images/payments/eywa.png"
          alt="Eywa"
          style={{ height: `${height}px`, width: "auto" }}
          className="object-contain max-h-full"
        />
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <div
        className={`inline-flex items-center justify-center bg-white/95 rounded-xl px-2.5 py-1 border border-white/20 shadow-sm ${className}`}
      >
        <img
          src="/images/payments/eywa.png"
          alt="Eywa"
          style={{ height: `${height}px`, width: "auto" }}
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <img
      src="/images/payments/eywa.png"
      alt="Eywa"
      style={{ height: `${height}px`, width: "auto" }}
      className={`object-contain inline-block shrink-0 ${className}`}
    />
  );
}

/**
 * Logo BPM
 */
export function BPMLogo({ className = "", height = 24 }: { className?: string; height?: number }) {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <div
        style={{ height: `${height}px`, width: `${height * 1.3}px` }}
        className="rounded-lg bg-[#0F2942] flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs"
      >
        BPM
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-xs sm:text-sm font-black text-slate-900 tracking-wider">BPM</span>
        <span className="text-[8.5px] text-slate-500 font-medium">Banque Populaire</span>
      </div>
    </div>
  );
}

/**
 * Logo BMCI
 */
export function BMCILogo({ className = "", height = 24 }: { className?: string; height?: number }) {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <div
        style={{ height: `${height}px`, width: `${height * 1.3}px` }}
        className="rounded-lg bg-[#004B87] flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs"
      >
        BMCI
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-xs sm:text-sm font-black text-slate-900 tracking-wider">BMCI</span>
        <span className="text-[8.5px] text-slate-500 font-medium">Banque Commerce</span>
      </div>
    </div>
  );
}

/**
 * Rangée compacte des logos de paiement officiels pour les pieds de factures, modales et checkout
 */
export function PaymentIconsRow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <BankilyLogo variant="badge" height={22} />
      <MasrviLogo variant="badge" height={22} />
      <SedadLogo variant="badge" height={22} />
      <EywaLogo variant="badge" height={22} />
    </div>
  );
}
