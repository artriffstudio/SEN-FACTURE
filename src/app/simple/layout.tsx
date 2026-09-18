"use client";

import { useState } from "react";
import SimpleHeader from "@/components/simple/SimpleHeader";
import SimpleSidebar from "@/components/simple/SimpleSidebar";
import SimpleInvoiceModal from "@/components/simple/SimpleInvoiceModal";

export default function SimpleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50/70 overflow-hidden font-sans text-slate-900 antialiased">
      {/* Sidebar épurée */}
      <SimpleSidebar />

      {/* Zone principale */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SimpleHeader
          onNewInvoice={() => setIsInvoiceModalOpen(true)}
          onSearch={(q) => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("simple-invoice-search", { detail: q })
              );
            }
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6 no-scrollbar">
          {children}
        </main>
      </div>

      {/* Modale de facturation rapide */}
      <SimpleInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSuccess={() => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("simple-invoice-refresh"));
          }
        }}
      />
    </div>
  );
}
