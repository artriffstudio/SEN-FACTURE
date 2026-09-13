"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Mail, Phone, MapPin, Building2, Share2, ArrowUpRight, X } from "lucide-react";
import { getClients } from "@/lib/services/clientService";
import { Client } from "@/lib/types";
import { getInitials } from "@/lib/utils";
import Tooltip from "@/components/ui/Tooltip";
import toast from "react-hot-toast";

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getClients().then((data) => {
      setClients(data || []);
      setIsLoading(false);
    });
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.city || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMoney = (amount: number) => {
    return `${amount.toLocaleString("fr-FR")} FCFA`;
  };

  const handleWhatsAppContact = (client: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const message = `Bonjour ${client.name}, je vous contacte depuis SEN FACTURE.`;
    window.open(`https://wa.me/${(client.phone || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
    toast.success(`WhatsApp ouvert pour ${client.name}`);
  };

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* EN-TÊTE DE LA PAGE */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Clients & Entreprises
            </h1>
            <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {clients.length} Partenaires
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gérez votre répertoire de clients professionnels, leurs coordonnées et leurs encours financiers.
          </p>
        </div>

        {/* Bouton CTA Primaire (Design System) */}
        <Tooltip content="Nouveau client" icon={Plus}>
          <Link
            href="/clients/new"
            className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:from-sky-700 active:to-sky-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all shrink-0 cursor-pointer"
          >
            <Plus size={16} className="stroke-[2.5]" />
            <span>Nouveau client</span>
          </Link>
        </Tooltip>
      </div>

      {/* ======================================================== */}
      {/* BARRE DE RECHERCHE & FILTRES */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 bg-white rounded-xl px-3.5 py-2.5 border border-slate-200/90 shadow-2xs max-w-md focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par nom, ville, email..."
          className="bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none w-full font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* GRILLE DES CLIENTS (CARTE INTERACTIVE) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 group cursor-pointer block"
          >
            {/* Header du client */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0 tracking-tighter group-hover:bg-sky-600 transition-colors">
                  {getInitials(client.name)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                    {client.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <span>{client.city}, Sénégal</span>
                  </p>
                </div>
              </div>

              {/* Action WhatsApp rapide */}
              <Tooltip content="WhatsApp direct" icon={Share2}>
                <button
                  onClick={(e) => handleWhatsAppContact(client, e)}
                  className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center hover:bg-emerald-100 hover:scale-110 active:scale-95 transition-all shrink-0 cursor-pointer shadow-2xs"
                >
                  <Share2 size={13} />
                </button>
              </Tooltip>
            </div>

            {/* Coordonnées */}
            <div className="space-y-1.5 pt-1 text-xs text-slate-600">
              <div className="flex items-center gap-2 truncate">
                <Mail size={13} className="text-slate-400 shrink-0" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-slate-400 shrink-0" />
                <span>{client.phone}</span>
              </div>
            </div>

            {/* Statistiques et Chiffre d'Affaires */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Factures
                </p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {client.invoiceCount || 0} émise(s)
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Encaissé
                </p>
                <p className="text-sm font-black text-sky-600 mt-0.5">
                  {formatMoney(client.totalRevenue || 0)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {clients.length === 0 ? (
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-500 shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-600 shadow-sm">
            <Building2 size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Aucun client enregistré pour le moment
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Enregistrez vos clients et entreprises partenaires sénégalais avec leurs coordonnées NINEA et contact pour émettre des factures en un clic.
          </p>
          <Link
            href="/clients/new"
            className="mt-1 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Ajouter mon premier client</span>
          </Link>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-500">
          <p className="text-sm font-semibold">Aucun client ne correspond à votre recherche « {searchQuery} ».</p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-3 text-xs font-bold text-sky-600 hover:underline cursor-pointer"
          >
            Réinitialiser la recherche
          </button>
        </div>
      ) : null}
    </div>
  );
}
