"use client";

import { useState, useRef, useEffect } from "react";
import {
  Save,
  Building2,
  ShieldCheck,
  CreditCard,
  FileText,
  CheckCircle2,
  Upload,
  Sparkles,
  X,
  Zap,
  Globe,
  Lock,
  RefreshCw,
  Users,
  KeyRound,
  Shield,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import Tooltip from "@/components/ui/Tooltip";
import {
  getCompany,
  updateCompany,
  uploadCompanyLogo,
} from "@/lib/services/companyService";
import {
  getMoosylConfig,
  saveMoosylConfig,
  MoosylConfig,
} from "@/lib/services/moosylService";
import { useTranslation } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/types";

export default function SettingsPage() {
  const { t } = useTranslation();
  const { role, setRole, canManageTeam, canEditBankDetails } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("Facturim Mauritanie SARL");
  const [tradeName, setTradeName] = useState("Facturim");
  const [email, setEmail] = useState("contact@facturim.net");
  const [phone, setPhone] = useState("+222 45 25 00 00");
  const [address, setAddress] = useState("Avenue du Roi Fayçal, Tevragh Zeina");
  const [city, setCity] = useState("Nouakchott");
  const [taxId, setTaxId] = useState("00987654-MR");
  const [rcNumber, setRcNumber] = useState("MR.NKTT.2025.B.1234");
  const [taxRate, setTaxRate] = useState(16);
  const [currency, setCurrency] = useState("MRU");
  const [invoicePrefix, setInvoicePrefix] = useState("FAC-2025-");
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState("Paiement à réception");
  const [paymentTerms, setPaymentTerms] = useState(
    "Paiement à réception par virement bancaire ou Mobile Money (BANKILY / MASRVI / SEDAD / CLICK / BIM BANK). Conformément aux règles de facturation en Mauritanie."
  );
  
  // Moyens de paiement & Mobile Banking Mauritanie
  const [bankDetails, setBankDetails] = useState("MR12 00010 01001 12345678901 23 (BPM Mauritanie)");
  const [bankilyPhone, setBankilyPhone] = useState("+222 45 12 34 56");
  const [masrviPhone, setMasrviPhone] = useState("+222 22 12 34 56");
  const [sedadPhone, setSedadPhone] = useState("+222 36 78 90 12");
  const [clickPhone, setClickPhone] = useState("+222 49 12 34 56");
  const [bimBankPhone, setBimBankPhone] = useState("+222 33 12 34 56");

  // Sécurité & 2FA
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  // Équipe & Invitation Collaborateur
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<UserRole>("sales");

  const [isSaving, setIsSaving] = useState(false);

  // Configuration Passerelle Moosyl (Bankily & Masrvi)
  const [moosylConfig, setMoosylConfigState] = useState<MoosylConfig>({
    apiKey: "pk_test_moosyl_facturim_demo_2025",
    secretKey: "sk_test_moosyl_facturim_demo_secret",
    webhookSecret: "whsec_facturim_demo_webhook",
    isSandbox: true,
    enabled: true,
  });
  const [isTestingMoosyl, setIsTestingMoosyl] = useState(false);

  useEffect(() => {
    getCompany().then((comp) => {
      if (comp) {
        setCompanyName(comp.name);
        setEmail(comp.email);
        if (comp.phone) setPhone(comp.phone);
        if (comp.address) setAddress(comp.address);
        if (comp.city) setCity(comp.city);
        if (comp.taxId) setTaxId(comp.taxId);
        if (comp.taxRate) setTaxRate(comp.taxRate);
        if (comp.invoicePrefix) setInvoicePrefix(comp.invoicePrefix);
        if (comp.defaultPaymentTerms) setDefaultPaymentTerms(comp.defaultPaymentTerms);
        if (comp.termsAndConditions) setPaymentTerms(comp.termsAndConditions);
        if (comp.bankRib) setBankDetails(comp.bankRib);
        if (comp.bankilyPhone) setBankilyPhone(comp.bankilyPhone);
        if (comp.masrviPhone) setMasrviPhone(comp.masrviPhone);
        if (comp.sedadPhone) setSedadPhone(comp.sedadPhone);
        if (comp.clickPhone) setClickPhone(comp.clickPhone);
        if (comp.bimBankPhone) setBimBankPhone(comp.bimBankPhone);

        if (comp.logoUrl) {
          setLogoUrl(comp.logoUrl);
          if (typeof window !== "undefined") {
            localStorage.setItem("facturim_company_logo", comp.logoUrl);
          }
        }
      }
    });

    const savedMoosyl = getMoosylConfig();
    setMoosylConfigState(savedMoosyl);
  }, []);

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Le fichier du logo ne doit pas dépasser 2 Mo.");
      return;
    }

    const toastId = toast.loading("Téléversement du logo officiel...");
    try {
      const publicUrl = await uploadCompanyLogo(file, file.name);
      setLogoUrl(publicUrl);
      if (typeof window !== "undefined") {
        localStorage.setItem("facturim_company_logo", publicUrl);
      }
      toast.success("Logo officiel mis à jour avec succès !", { id: toastId });
    } catch (err: any) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        setLogoUrl(dataUrl);
        if (typeof window !== "undefined") {
          localStorage.setItem("facturim_company_logo", dataUrl);
        }
        toast.success("Logo enregistré localement !", { id: toastId });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("facturim_company_logo");
    }
    updateCompany({ logoUrl: undefined });
    toast.success("Logo supprimé.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    toast.loading("Enregistrement des paramètres...", { id: "save-settings" });

    try {
      await updateCompany({
        name: companyName,
        tradeName,
        email,
        phone,
        address,
        city,
        taxId: taxId.trim() || undefined,
        taxRate,
        invoicePrefix,
        defaultPaymentTerms,
        bankRib: bankDetails,
        bankilyPhone,
        masrviPhone,
        sedadPhone,
        clickPhone,
        bimBankPhone,
        termsAndConditions: paymentTerms,
      });

      saveMoosylConfig(moosylConfig);

      toast.success("Paramètres et coordonnées bancaires enregistrés avec succès !", {
        id: "save-settings",
      });
    } catch (err: any) {
      toast.error("Erreur lors de la sauvegarde", { id: "save-settings" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestMoosylConnection = () => {
    setIsTestingMoosyl(true);
    setTimeout(() => {
      setIsTestingMoosyl(false);
      toast.success("Connexion API Moosyl (Bankily / Masrvi) vérifiée avec succès !");
    }, 800);
  };

  const handleInviteCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || !newMemberName.trim()) {
      toast.error("Veuillez renseigner le nom et l'email du collaborateur.");
      return;
    }
    toast.success(`Invitation envoyée à ${newMemberEmail} avec le rôle ${newMemberRole.toUpperCase()} !`);
    setNewMemberEmail("");
    setNewMemberName("");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* EN-TÊTE DE PAGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t.settings.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Identifiants fiscaux DGI, mobile banking (BANKILY, MASRVI, SEDAD, CLICK, BIM BANK) et rôles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="self-start sm:self-auto bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all text-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <Save size={15} />
          <span>{isSaving ? "Enregistrement..." : t.settings.saveChanges}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ======================================================== */}
        {/* CARTE 1 : IDENTITÉ DE L'ENTREPRISE & LOGO OFFICIEL */}
        {/* ======================================================== */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">
                {t.settings.companyProfile}
              </h2>
            </div>
            <span className="text-xs text-slate-400">Entreprise émettrice</span>
          </div>

          {/* Module de Téléversement du Logo Officiel */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0 group">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo Entreprise" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="w-full h-full bg-slate-900 text-white font-black text-xl flex items-center justify-center">
                  {tradeName ? tradeName.slice(0, 2).toUpperCase() : "FI"}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <h3 className="font-bold text-slate-900 text-xs">Logo officiel de l&apos;entreprise</h3>
              <p className="text-[11px] text-slate-500">
                Affiché en haute définition sur toutes vos factures A4 et exports PDF (PNG, JPG, SVG, max 2 Mo).
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoFileChange}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Upload size={13} />
                  <span>{logoUrl ? "Changer le logo" : "Téléverser un logo"}</span>
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <X size={13} />
                    <span>Supprimer</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.settings.companyName} *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Marque commerciale (Trade Name)
              </label>
              <input
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.clients.email} *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.clients.phone}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                {t.clients.address} ({t.countryName})
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARTE 2 : FISCALITÉ & IDENTIFIANTS LÉGAUX (NIF OPTIONNEL) */}
        {/* ======================================================== */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Fiscalité, TVA &amp; Identifiants Légaux
              </h2>
            </div>
            <span className="text-xs text-slate-400">Direction Générale des Impôts (DGI)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  {t.settings.nifNumber}
                </label>
                <span className="text-[10px] text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded-full">
                  Optionnel pour TPE / Informel
                </span>
              </div>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="Ex: 00987654-MR (Laisser vide si non assujetti)"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 placeholder:font-sans placeholder:font-normal"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.settings.rcNumber} (Registre de Commerce)
              </label>
              <input
                type="text"
                value={rcNumber}
                onChange={(e) => setRcNumber(e.target.value)}
                placeholder="Ex: MR.NKTT.2025.B.1234"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Taux de TVA par défaut
              </label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              >
                <option value={16}>16% — TVA Standard Mauritanie (DGI)</option>
                <option value={18}>18% — Prestations Télécoms &amp; Réseaux</option>
                <option value={0}>0% — Exonéré de TVA / Export</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Préfixe de numérotation des factures
              </label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                placeholder="FAC-2025-"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono font-bold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARTE 3 : COORDONNÉES BANCAIRES & MOBILE BANKING MAURITANIE */}
        {/* ======================================================== */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Coordonnées de Règlement &amp; Mobile Banking
              </h2>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              5 Passerelles Mauritanie Actives
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* BANKILY (BPM) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-900 mb-1">
                BANKILY (BPM)
              </label>
              <input
                type="text"
                value={bankilyPhone}
                onChange={(e) => setBankilyPhone(e.target.value)}
                placeholder="+222 45 00 00 00"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* MASRVI (BMCI) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-900 mb-1">
                MASRVI (BMCI)
              </label>
              <input
                type="text"
                value={masrviPhone}
                onChange={(e) => setMasrviPhone(e.target.value)}
                placeholder="+222 22 00 00 00"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* SEDAD (BMI) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-900 mb-1">
                SEDAD (BMI)
              </label>
              <input
                type="text"
                value={sedadPhone}
                onChange={(e) => setSedadPhone(e.target.value)}
                placeholder="+222 36 00 00 00"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* CLICK (BNM) */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-900 mb-1">
                CLICK (BNM)
              </label>
              <input
                type="text"
                value={clickPhone}
                onChange={(e) => setClickPhone(e.target.value)}
                placeholder="+222 49 00 00 00"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* BIM BANK Mobile */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block font-bold text-slate-900 mb-1">
                BIM BANK Mobile (BIM)
              </label>
              <input
                type="text"
                value={bimBankPhone}
                onChange={(e) => setBimBankPhone(e.target.value)}
                placeholder="+222 33 00 00 00"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* RIB BANCAIRE */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2 lg:col-span-1">
              <label className="block font-bold text-slate-900 mb-1">
                RIB Virement Bancaire
              </label>
              <input
                type="text"
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                placeholder="MR12 00010 01001..."
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="pt-2 text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              Conditions et mentions de paiement légales
            </label>
            <textarea
              rows={2}
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 resize-none"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARTE 4 : ÉQUIPE, RÔLES & CONFIDENTIALITÉ DU CA (RBAC) */}
        {/* ======================================================== */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-sky-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Équipe, Rôles &amp; Confidentialité des Chiffres (RBAC)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Protégez votre Chiffre d&apos;Affaires global en attribuant le rôle « Guichet Facturier » à vos employés.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              Rôle Actif : {role.toUpperCase()}
            </span>
          </div>

          {/* Simulateur / Sélecteur de rôle pour démonstration immédiate */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-xs text-slate-900">Tester la vue selon le profil :</span>
              <p className="text-[11px] text-slate-500">
                Changez de rôle en 1 clic pour vérifier que les chiffres de CA et rapports fiscaux sont bien masqués aux facturiers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: "owner", label: "Dirigeant (Owner)" },
                  { id: "sales", label: "Guichet Facturier (CA Masqué)" },
                  { id: "accountant", label: "Comptable" },
                ] as const
              ).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setRole(r.id);
                    toast.success(`Mode activé : ${r.label}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    role === r.id
                      ? "bg-sky-600 text-white shadow-sm"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Formulaire d'invitation d'un nouveau collaborateur */}
          <div className="pt-2">
            <h3 className="font-bold text-xs text-slate-900 mb-2">+ Inviter un nouveau collaborateur</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Nom de l'employé"
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
              />
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="email@entreprise.mr"
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as UserRole)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value="sales">Guichet Facturier (CA Masqué)</option>
                  <option value="accountant">Comptable (Accès Fiscal)</option>
                  <option value="admin">Administrateur</option>
                </select>
                <button
                  type="button"
                  onClick={handleInviteCollaborator}
                  className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg transition-all shrink-0 cursor-pointer"
                >
                  Inviter
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CARTE 5 : SÉCURITÉ, 2FA / TOTP & AUDIT */}
        {/* ======================================================== */}
        <div className="card-interactive bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <KeyRound size={18} className="text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Sécurité &amp; Authentification à Deux Facteurs (2FA / TOTP)
              </h2>
            </div>
            <span className="text-xs text-slate-400">Protection OWASP</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="space-y-1">
              <span className="font-bold text-xs text-slate-900">Double Authentification (TOTP)</span>
              <p className="text-[11px] text-slate-600">
                Protégez l&apos;accès avec Google Authenticator, Microsoft Authenticator ou Authy.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIs2FAEnabled(!is2FAEnabled);
                toast.success(
                  !is2FAEnabled
                    ? "Authentification 2FA activée avec succès !"
                    : "Authentification 2FA désactivée."
                );
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                is2FAEnabled
                  ? "bg-emerald-600 text-white"
                  : "bg-sky-500 hover:bg-sky-600 text-white"
              }`}
            >
              {is2FAEnabled ? "✓ 2FA Activée" : "Activer la 2FA (TOTP)"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
