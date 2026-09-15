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
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signIn } = useAuth();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !companyName.trim() || !email.trim() || !password) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!acceptTerms) {
      setErrorMessage("Veuillez accepter les conditions d'utilisation.");
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
          setErrorMessage("Un compte existe déjà avec cette adresse email. Veuillez vous connecter.");
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
    <div className="w-full max-w-5xl mx-auto">
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
              <span>{t.auth.instantAccess}</span>
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              {t.auth.joinFacturim}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-200 font-medium drop-shadow">
              {t.auth.joinSubtitle}
            </p>
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
                    Nom du dirigeant *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Mohamed Lemine"
                    className="w-full bg-white border border-slate-300 rounded-full px-4 py-2 sm:py-2.5 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 text-xs mb-1 ml-1">
                    Nom de l&apos;entreprise *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={t.auth.companyNamePlaceholder}
                    className="w-full bg-white border border-slate-300 rounded-full px-4 py-2 sm:py-2.5 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1 ml-1">
                  Email professionnel *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@votre-entreprise.mr"
                  className="w-full bg-white border border-slate-300 rounded-full px-4 py-2 sm:py-2.5 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 text-xs mb-1 ml-1">
                    Mot de passe *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 caractères"
                      className="w-full bg-white border border-slate-300 rounded-full px-4 pr-10 py-2 sm:py-2.5 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
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
                    Confirmer mot de passe *
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    className="w-full bg-white border border-slate-300 rounded-full px-4 py-2 sm:py-2.5 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 ml-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="terms" className="text-[11px] text-slate-600 cursor-pointer">
                  J&apos;accepte les conditions d&apos;utilisation et la conformité DGI Mauritanie
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:from-sky-700 active:to-sky-800 text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-full shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                  Ou
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
          Facturation électronique conforme à la législation fiscale en Mauritanie (TVA 16%)
        </span>
      </div>
    </div>
  );
}
