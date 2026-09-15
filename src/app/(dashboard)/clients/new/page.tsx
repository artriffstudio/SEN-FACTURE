"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Tooltip from "@/components/ui/Tooltip";
import { createClient, uploadClientLogo } from "@/lib/services/clientService";
import { useTranslation } from "@/contexts/LanguageContext";

export default function NewClientPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "Nouakchott",
    country: "Mauritanie",
    taxId: "",
    notes: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Le fichier dépasse 2 Mo. Veuillez choisir une image plus légère.");
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoUrl(result);
      toast.success("Logo du client sélectionné !");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogoUrl(null);
    setLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Logo du client retiré");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Veuillez renseigner au moins le nom et l'email du client");
      return;
    }

    if (isSaving) return;
    try {
      setIsSaving(true);
      toast.loading("Enregistrement du client...", { id: "save-client" });

      let finalLogoUrl = logoUrl || undefined;
      if (logoFile) {
        try {
          finalLogoUrl = await uploadClientLogo(logoFile, logoFile.name);
        } catch (uploadErr) {
          console.warn("Upload logo failed, saving client without logo URL:", uploadErr);
        }
      }

      const created = await createClient({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city || "Nouakchott",
        country: formData.country || "Mauritanie",
        taxId: formData.taxId.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        logoUrl: finalLogoUrl,
      });

      toast.success(`Client ${created.name} créé avec succès !`, {
        id: "save-client",
      });
      router.push("/clients");
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.message || "Erreur lors de la création du client",
        { id: "save-client" }
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input de fichier masqué pour le logo client */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoFileChange}
        accept="image/png, image/jpeg, image/svg+xml, image/webp"
        className="hidden"
      />

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/clients"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-2xs hover:scale-105 active:scale-95 transition-all shrink-0"
            title={t.nav.clients}
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.clients.newClient}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {t.clients.subtitle}
            </p>
          </div>
        </div>

        {/* Bouton Enregistrer (responsive) */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Save size={15} />
          <span className="hidden sm:inline">{isSaving ? "..." : t.clients.saveClient}</span>
          <span className="sm:hidden">{isSaving ? "..." : t.clients.saveClient}</span>
        </button>
      </div>

      {/* Formulaire */}
      <div className="max-w-3xl">
        <form
          onSubmit={handleSave}
          className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-6"
        >
          {/* Logo du client */}
          <div className="space-y-2 pb-4 border-b border-slate-100">
            <label className="block font-semibold text-slate-700 text-xs">
              {t.clients.uploadLogo}
            </label>
            <div className="flex items-center gap-4">
              {/* Cadre pointillé de téléversement interactif */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border-2 border-dashed border-slate-300 hover:border-sky-400 bg-slate-50/80 hover:bg-sky-50/40 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group shrink-0 relative"
                title={t.clients.uploadLogo}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo Client"
                    className="w-full h-full object-contain p-1.5"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-sky-600 transition-colors">
                    <Upload size={22} className="stroke-[2]" />
                  </div>
                )}
              </div>

              {/* Textes et actions du logo */}
              <div className="space-y-1 min-w-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer block text-left"
                >
                  {logoUrl ? t.settings.logoUpload : t.clients.uploadLogo}
                </button>
                <p className="text-[11px] text-slate-400">
                  {t.settings.uploadHint}
                </p>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer pt-0.5"
                  >
                    <X size={12} />
                    <span>{t.invoices.removeItem}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Identité */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Building2 size={15} className="text-sky-600" />
              <span>{t.clients.clientName}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.clients.clientName} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Ex: Société Mauritanienne d'Ingénierie SARL"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.clients.email} *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="contact@client.mr"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.clients.phone} ({t.countryName})
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+222 45 00 00 00"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <MapPin size={15} className="text-sky-600" />
              <span>{t.clients.address}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.clients.address}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Ex: Tevragh Zeina, Nouakchott"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.clients.city}
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="Nouakchott"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>
          </div>

          {/* Fiscalité Mauritanie */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <ShieldCheck size={15} className="text-sky-600" />
              <span>{t.taxIdLabel} ({t.countryName})</span>
            </h2>

            <div className="text-xs">
              <label className="block font-semibold text-slate-700 mb-1">
                {t.settings.nifNumber} / {t.settings.rcNumber}
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => updateField("taxId", e.target.value)}
                placeholder="Ex: 00123456-MR"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 max-w-md"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Ce numéro sera imprimé sur les factures certifiées DGI ({t.countryName}).
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="pt-4 border-t border-slate-100 text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              {t.invoices.notes}
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Conditions particulières de règlement, remises..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-normal focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 resize-none"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
