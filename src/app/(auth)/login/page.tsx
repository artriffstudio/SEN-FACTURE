"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
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

export default function LoginPage() {
  const router = useRouter();
  const { signIn, resendConfirmationEmail } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleResendEmail = async () => {
    if (!email.trim()) {
      toast.error("Veuillez renseigner votre email ci-dessus.");
      return;
    }
    setIsResending(true);
    try {
      const { error } = await resendConfirmationEmail(email);
      if (error) {
        toast.error(error.message || "Erreur lors du renvoi de l'email");
      } else {
        toast.success(`Email de confirmation envoyé à ${email} !`);
      }
    } catch {
      toast.error("Erreur inattendue");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsEmailUnconfirmed(false);

    if (!email.trim() || !password) {
      setErrorMessage("Veuillez renseigner votre email et mot de passe.");
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
      const { error } = await signIn(email, password);

      if (error) {
        if (error.message?.toLowerCase().includes("invalid login credentials")) {
          setErrorMessage("Identifiants incorrects. Veuillez vérifier votre email et mot de passe.");
        } else if (error.message?.toLowerCase().includes("email not confirmed")) {
          setErrorMessage("Votre adresse email n'a pas encore été confirmée.");
          setIsEmailUnconfirmed(true);
        } else {
          setErrorMessage(error.message || "Erreur de connexion.");
        }
        toast.error("Échec de la connexion");
        return;
      }

      toast.success("Connexion réussie !");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err?.message || "Une erreur inattendue est survenue.");
      toast.error("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Conteneur principal style carte flottante */}
      <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl shadow-slate-900/15 border border-slate-200/80 bg-slate-900 min-h-[580px] flex flex-col lg:flex-row items-stretch">
        {/* VOLET GAUCHE : Décor inspiré */}
        <div className="relative lg:w-7/12 min-h-[260px] sm:min-h-[320px] lg:min-h-full p-6 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: "url('/images/auth-bg.jpg')",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/45 to-slate-950/40" />

          {/* Décor vectoriel subtil */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg className="w-full h-full" viewBox="0 0 500 500" fill="none">
              <circle cx="250" cy="250" r="200" stroke="white" strokeWidth="1.5" strokeDasharray="6 6" />
              <circle cx="250" cy="250" r="140" stroke="white" strokeWidth="1" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>{t.countryName} • {t.brandName}</span>
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              {t.auth.welcomeBack}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-200 font-medium max-w-md drop-shadow">
              {t.auth.welcomeBackSubtitle}
            </p>
          </div>
        </div>

        {/* VOLET DROIT : Carte blanche intérieure formulaire */}
        <div className="lg:w-5/12 bg-white p-6 sm:p-8 lg:p-10 flex flex-col justify-center relative">
          <div className="max-w-sm w-full mx-auto">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t.auth.loginTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
                {t.auth.loginSubtitle}
              </p>
            </div>

            {/* Message d'erreur éventuel */}
            {errorMessage && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-xs text-rose-800 animate-in fade-in duration-200 space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <p className="font-semibold leading-relaxed">{errorMessage}</p>
                </div>

                {isEmailUnconfirmed && (
                  <div className="pt-2 border-t border-rose-200/70 space-y-2 text-[11px] text-rose-700">
                    <p className="leading-relaxed">
                      Un lien d&apos;activation a été envoyé lors de votre inscription. Veuillez consulter votre boîte de réception pour valider votre compte.
                    </p>
                    <button
                      type="button"
                      onClick={handleResendEmail}
                      disabled={isResending}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-3 rounded-full transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
                    >
                      {isResending ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Envoi en cours...</span>
                        </>
                      ) : (
                        <>
                          <Mail size={13} />
                          <span>Renvoyer l&apos;email de confirmation</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Formulaire de connexion */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1.5 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.emailPlaceholder}
                  className="w-full bg-white border border-slate-300 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1.5 ml-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.auth.passwordPlaceholder}
                    className="w-full bg-white border border-slate-300 rounded-full px-4 sm:px-5 pr-11 py-2.5 sm:py-3 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="text-right mt-1.5 pr-1">
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      toast(
                        `Pour réinitialiser votre mot de passe, contactez l'administrateur ou le support ${t.brandName}.`,
                        { icon: "ℹ️" }
                      );
                    }}
                    className="text-[11px] text-slate-500 hover:text-sky-600 transition-colors underline cursor-pointer"
                  >
                    {t.auth.forgotPassword}
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:from-sky-700 active:to-sky-800 text-white font-bold text-xs sm:text-sm py-3 rounded-full shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Chargement...</span>
                  </>
                ) : (
                  <span>{t.auth.loginButton}</span>
                )}
              </button>
            </form>

            <div className="relative my-6">
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
                {t.auth.noAccount}{" "}
                <Link
                  href="/register"
                  className="text-sky-600 hover:text-sky-700 font-bold hover:underline transition-all inline-flex items-center gap-1 ml-1"
                >
                  <span>{t.auth.createAccount}</span>
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
          Facturation électronique certifiée conforme DGI Mauritanie (TVA 16%)
        </span>
      </div>
    </div>
  );
}
