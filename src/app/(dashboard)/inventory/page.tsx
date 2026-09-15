"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle2,
  Tag,
  Layers,
  Sparkles,
  Edit2,
  Trash2,
  X,
  Receipt,
} from "lucide-react";
import { CatalogItem } from "@/lib/types";
import Tooltip from "@/components/ui/Tooltip";
import toast from "react-hot-toast";
import { getCatalogItems, createCatalogItem } from "@/lib/services/catalogService";
import { useTranslation } from "@/contexts/LanguageContext";

export default function InventoryPage() {
  const { t, formatMoney } = useTranslation();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Formulaire nouvelle prestation
  const [newItemCode, setNewItemCode] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<CatalogItem["category"]>("Developpement");
  const [newItemPrice, setNewItemPrice] = useState<number>(500000);
  const [newItemUnit, setNewItemUnit] = useState("Forfait");
  const [newItemDesc, setNewItemDesc] = useState("");

  const categories = [t.inventory.allCategories, "Developpement", "Cloud & Reseau", "Conseil & Audit", "Maintenance", "Formation"];

  useEffect(() => {
    async function loadCatalog() {
      setIsLoading(true);
      try {
        const dbItems = await getCatalogItems();
        setItems(dbItems || []);
      } catch (err) {
        console.error("Erreur chargement catalogue:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === t.inventory.allCategories || selectedCategory === "Tous" || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreatePrestation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      toast.error("Veuillez renseigner la désignation de l'article");
      return;
    }

    try {
      const created = await createCatalogItem({
        code: newItemCode.trim() || `ART-${Math.floor(1000 + Math.random() * 9000)}`,
        name: newItemName.trim(),
        category: newItemCategory,
        unitPrice: Number(newItemPrice) || 0,
        unit: newItemUnit || "Unité",
        description: newItemDesc.trim() || "Prestation informatique et services numériques",
        taxRate: 16,
        active: true,
      });

      setItems((prev) => [created, ...prev]);
      setIsNewModalOpen(false);
      // Reset
      setNewItemName("");
      setNewItemCode("");
      setNewItemDesc("");
      setNewItemPrice(500000);

      toast.success(`« ${created.name} » enregistré !`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création de l'article");
    }
  };

  const handleDeleteItem = (id: string, name: string) => {
    setItems(items.filter((i) => i.id !== id));
    toast.success(`« ${name} » retiré du catalogue`);
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
              {t.inventory.title}
            </h1>
            <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {items.length} {t.nav.inventory}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.inventory.subtitle}
          </p>
        </div>

        {/* Bouton CTA Primaire Design System */}
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus size={16} className="stroke-[2.5]" />
          <span>{t.inventory.newItem}</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* BANDEAU STATISTIQUES PRESTATIONS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Prestations actives</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-gentle" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {items.filter((i) => i.active).length}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Prêtes à être facturées</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tarif moyen HT</span>
            <Layers size={14} className="text-sky-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-600 mt-1">
            {formatMoney(Math.round(items.reduce((acc, cur) => acc + cur.unitPrice, 0) / (items.length || 1)))}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Base de facturation unitaire</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TVA appliquée</span>
            <span className="text-[10px] font-bold bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded">DGI</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">16 %</div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Taux légal République Islamique de Mauritanie</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm card-interactive">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Catégories</span>
            <Tag size={14} className="text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">5 Familles</div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Services, IT, Maintenance & Audit</p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BARRE DE RECHERCHE & FILTRES PAR CATÉGORIE */}
      {/* ======================================================== */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Recherche textuelle */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par code, nom de prestation ou descriptif..."
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Pilules de catégories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-sky-500 text-white shadow-xs"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* GRILLE DES PRESTATIONS DU CATALOGUE */}
      {/* ======================================================== */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
            <Package size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900">Aucune prestation trouvée</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Aucun article ne correspond à votre filtre. Essayez de réinitialiser la recherche ou ajoutez un nouveau service.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("Tous");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm card-interactive flex flex-col justify-between group"
            >
              <div>
                {/* Badge Code & Statut */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="font-mono text-[11px] font-extrabold text-sky-700 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded-md">
                    {item.code}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                </div>

                {/* Nom & Descriptif */}
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                {/* Tarif et Unité */}
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Prix unitaire HT</span>
                    <span className="text-base sm:text-lg font-black text-slate-900 tabular-nums">
                      {formatMoney(item.unitPrice)}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                    Par {item.unit}
                  </span>
                </div>

                {/* Actions : Facturer directement + Supprimer */}
                <div className="flex items-center gap-2">
                  <Link
                    href="/invoices/new"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs py-2 rounded-xl border border-sky-200/80 transition-all hover:scale-101 active:scale-99"
                  >
                    <Receipt size={13} className="text-sky-600" />
                    <span>Facturer cette prestation</span>
                  </Link>
                  <Tooltip content="Supprimer l'article" icon={Trash2}>
                    <button
                      onClick={() => handleDeleteItem(item.id, item.name)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/90 transition-colors"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALE CRÉATION NOUVELLE PRESTATION (DESIGN SYSTEM) */}
      {/* ======================================================== */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modale */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                  <Package size={16} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Ajouter une prestation au catalogue
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Définissez la référence, l'unité et le tarif de facturation HT.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleCreatePrestation} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-700 text-xs mb-1">
                    Référence Code
                  </label>
                  <input
                    type="text"
                    value={newItemCode}
                    onChange={(e) => setNewItemCode(e.target.value)}
                    placeholder="Ex: WEB-01"
                    className="w-full bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-medium px-3 py-2 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 text-xs mb-1">
                    Famille / Catégorie
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-medium px-3 py-2 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="Developpement">Développement Logiciel</option>
                    <option value="Cloud & Reseau">Cloud, Hébergement & Réseau</option>
                    <option value="Conseil & Audit">Conseil & Audit de Sécurité</option>
                    <option value="Maintenance">Maintenance & Infogérance</option>
                    <option value="Formation">Formation Professionnelle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">
                  Désignation de la prestation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Ex: Développement API Passerelle Bankily / Seddap"
                  className="w-full bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-medium px-3 py-2 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 text-xs mb-1">
                    Tarif Unitaire HT (MRU) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={5000}
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-bold px-3 py-2 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 text-xs mb-1">
                    Unité de mesure
                  </label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-medium px-3 py-2 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="Forfait">Forfait</option>
                    <option value="Mois">Mois</option>
                    <option value="Jour">Journée</option>
                    <option value="Heure">Heure</option>
                    <option value="Mission">Mission</option>
                    <option value="Unité">Unité</option>
                    <option value="Lot">Lot</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1">
                  Descriptif technique détaillé
                </label>
                <textarea
                  rows={2}
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Détail des livrables inclus, méthodologie et conditions d'exécution..."
                  className="w-full bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-medium px-3 py-2 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              {/* Mention DGI Mauritanie */}
              <div className="p-3 bg-sky-50/80 border border-sky-200/60 rounded-xl flex items-center gap-2.5 text-[11px] text-sky-800">
                <Sparkles size={14} className="shrink-0 text-sky-600" />
                <span>Cette prestation sera soumise au taux standard de TVA mauritanien de 16%.</span>
              </div>

              {/* Boutons Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>Enregistrer l'article</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
