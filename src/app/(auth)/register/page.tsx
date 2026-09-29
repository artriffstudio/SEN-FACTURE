"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation, useLanguage } from "@/contexts/LanguageContext";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signIn } = useAuth();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Évaluation de la robustesse du mot de passe (Standard B2B / OWASP)
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 12) score += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 1;
    return score;
  };

  const passwordStrength = calculatePasswordStrength(password);
  const strengthLabels = isAr
    ? ["ضعيف جداً", "متوسط", "قوي", "ممتاز وحصين"]
    : ["Très faible", "Moyen", "Robuste", "Sécurité maximale"];
  const strengthColors = [
    "bg-rose-500",
    "bg-amber-500",
    "bg-sky-500",
    "bg-emerald-500",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !companyName.trim() || !email.trim() || !password) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (password.length < 12) {
      setErrorMessage(
        "Sécurité B2B : Le mot de passe doit comporter au minimum 12 caractères pour protéger les données de facturation."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe saisis ne sont pas identiques.");
      return;
    }

    if (!acceptTerms) {
      setErrorMessage(
        "Veuillez accepter les Conditions Générales d'Utilisation et la Politique de Confidentialité."
      );
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMessage(
        "Base de données Supabase non connectée. Veuillez vérifier la configuration de l'application."
      );
      return;
    }

    setIsLoading(true);
    try {
      const { error, session } = await signUp(
        email,
        password,
        fullName,
        companyName
      );

      if (error) {
        if (error.message?.toLowerCase().includes("user already registered")) {
          setErrorMessage(
            "Un compte existe déjà avec cette adresse email. Veuillez vous connecter."
          );
        } else {
          setErrorMessage(error.message || "Erreur lors de l'inscription.");
        }
        toast.error("Échec de la création du compte");
        return;
      }

      toast.success(`Compte créé avec succès ! Bienvenue sur ${t.brandName}.`);

      if (!session) {
        await signIn(email, password);
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err?.message || "Une erreur inattendue est survenue.");
      toast.error("Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl shadow-slate-900/15 border border-slate-200/80 bg-slate-900 min-h-[640px] flex flex-col lg:flex-row items-stretch">
        {/* VOLET GAUCHE */}
        <div className="relative lg:w-5/12 min-h-[220px] sm:min-h-[280px] lg:min-h-full p-6 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: "url('/images/auth-bg.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/50 to-slate-950/40" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isAr ? "معايير الأمان المؤسسية" : "Sécurité & Conformité DGI"}</span>
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              {t.auth.joinFacturim}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-200 font-medium drop-shadow">
              {t.auth.joinSubtitle}
            </p>
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center gap-2 text-[11px] text-slate-300">
              <ShieldCheck size={14} className="text-sky-400 shrink-0" />
              <span>
                {isAr
                  ? "تشفير TLS 1.3 وحماية متوافقة مع قانون موريتانيا 2017-020"
                  : "Chiffrement TLS 1.3 et protection certifiée Loi 2017-020"}
              </span>
            </div>
          </div>
        </div>

        {/* VOLET DROIT */}
        <div className="lg:w-7/12 bg-white p-6 sm:p-8 lg:p-10 flex flex-col justify-center relative">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t.auth.registerTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                {t.auth.registerSubtitle}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs text-rose-800 animate-in fade-in duration-200 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <p className="font-semibold leading-relaxed">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 text-xs mb-1 ml-1">
                    {isAr ? "اسم المسير أو المدير *" : "Nom du dirigeant *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Mohamed Lemine"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 sm:py-2.5 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 text-xs mb-1 ml-1">
                    {isAr ? "اسم الشركة / المؤسسة *" : "Nom de l'entreprise *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={t.auth.companyNamePlaceholder}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 sm:py-2.5 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1 ml-1">
                  {isAr ? "البريد الإلكتروني المهني *" : "Email professionnel *"}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@votre-entreprise.mr"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 sm:py-2.5 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 text-xs mb-1 ml-1">
                    {isAr ? "كلمة المرور (12 حرفاً فأكثر) *" : "Mot de passe (Min. 12 car.) *"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 12 caractères"
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 pr-10 py-2 sm:py-2.5 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 text-xs mb-1 ml-1">
                    {isAr ? "تأكيد كلمة المرور *" : "Confirmer mot de passe *"}
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 sm:py-2.5 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                  />
                </div>
              </div>

              {/* JAUGE DE FORCE DU MOT DE PASSE (STANDARD B2B) */}
              {password.length > 0 && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-slate-600 font-medium">
                      {isAr ? "مستوى أمان كلمة المرور :" : "Robustesse du mot de passe :"}
                    </span>
                    <span className="font-bold text-slate-800">
                      {strengthLabels[Math.max(0, passwordStrength - 1)] || strengthLabels[0]}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[0, 1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`rounded-full transition-all duration-300 ${
                          step < passwordStrength
                            ? strengthColors[passwordStrength - 1] || "bg-slate-300"
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="mt-1.5 text-[10px] text-slate-500 flex items-center gap-1">
                    {password.length >= 12 ? (
                      <Check size={11} className="text-emerald-600" />
                    ) : (
                      <X size={11} className="text-rose-500" />
                    )}
                    <span>{isAr ? "12 حرفاً على الأقل" : "12 caractères minimum requis"}</span>
                  </div>
                </div>
              )}

              {/* CASE À COCHER CGU & POLITIQUE DE CONFIDENTIALITÉ */}
              <div className="flex items-start gap-2.5 pt-1.5 ml-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer shrink-0"
                />
                <label htmlFor="terms" className="text-[11px] text-slate-600 leading-relaxed cursor-pointer">
                  {isAr ? (
                    <>
                      أوافق على{" "}
                      <Link href="/terms" target="_blank" className="text-sky-600 hover:underline font-bold">
                        الشروط العامة للاستخدام (CGU)
                      </Link>{" "}
                      و{" "}
                      <Link href="/privacy" target="_blank" className="text-sky-600 hover:underline font-bold">
                        سياسة الخصوصية وحماية البيانات (Loi 2017-020)
                      </Link>
                    </>
                  ) : (
                    <>
                      J&apos;accepte les{" "}
                      <Link href="/terms" target="_blank" className="text-sky-600 hover:underline font-bold">
                        Conditions Générales d&apos;Utilisation (CGU)
                      </Link>{" "}
                      et la{" "}
                      <Link href="/privacy" target="_blank" className="text-sky-600 hover:underline font-bold">
                        Politique de Confidentialité
                      </Link>{" "}
                      de Facturim conforme DGI Mauritanie.
                    </>
                  )}
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:from-sky-700 active:to-sky-800 text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Création du compte...</span>
                  </>
                ) : (
                  <span>{t.auth.registerButton}</span>
                )}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                <span className="bg-white px-3 text-slate-400">
                  {isAr ? "أو" : "Ou"}
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-600 font-medium">
                {t.auth.haveAccount}{" "}
                <Link
                  href="/login"
                  className="text-sky-600 hover:text-sky-700 font-bold hover:underline transition-all inline-flex items-center gap-1 ml-1"
                >
                  <span>{t.auth.signIn}</span>
                  <ArrowRight size={13} />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
        <Sparkles size={13} className="text-sky-600" />
        <span>
          {isAr
            ? "فوترة إلكترونية متوافقة مع معايير الضرائب والبنك المركزي في موريتانيا"
            : "Facturation électronique sécurisée et conforme à la législation fiscale en Mauritanie (TVA 16%)"}
        </span>
      </div>
    </div>
  );
}
