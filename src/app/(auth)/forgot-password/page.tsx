"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Veuillez saisir votre adresse email professionnelle.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMessage("Service d'authentification non connecté. Contactez l'administrateur.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        setErrorMessage(error.message || "Erreur lors de l'envoi du lien de réinitialisation.");
        toast.error("Impossible d'envoyer l'email");
      } else {
        setIsSubmitted(true);
        toast.success("Lien de récupération envoyé !");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Une erreur inattendue est survenue.");
      toast.error("Erreur d'envoi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl shadow-slate-900/15 border border-slate-200/80 bg-slate-900 min-h-[580px] flex flex-col lg:flex-row items-stretch">
        {/* VOLET GAUCHE : Décor inspiré */}
        <div className="relative lg:w-7/12 min-h-[240px] sm:min-h-[300px] lg:min-h-full p-6 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{ backgroundImage: "url('/images/auth-bg.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/50 to-slate-950/40" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>{t.countryName} • Récupération Sécurisée</span>
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              Accès sécurisé à votre trésorerie
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-200 font-medium max-w-md drop-shadow">
              Un lien d&apos;authentification chiffré à usage unique sera expédié à votre adresse professionnelle.
            </p>
          </div>
        </div>

        {/* VOLET DROIT : Formulaire ou confirmation */}
        <div className="lg:w-5/12 bg-white p-6 sm:p-8 lg:p-10 flex flex-col justify-center relative">
          <div className="max-w-sm w-full mx-auto">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 transition-colors mb-6 group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span>Retour à la connexion</span>
            </Link>

            {isSubmitted ? (
              <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 size={28} className="stroke-[2.5]" />
                </div>

                <h3 className="text-xl font-black text-slate-900">
                  Consultez votre messagerie
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Nous venons d&apos;envoyer un lien de réinitialisation sécurisé à <strong className="text-slate-900">{email}</strong>.
                </p>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 text-left space-y-1">
                  <p className="font-semibold text-slate-700 flex items-center gap-1">
                    <ShieldCheck size={13} className="text-sky-600" />
                    Consigne de sécurité :
                  </p>
                  <p>Le lien expire automatiquement sous 1 heure. Si vous ne le recevez pas, vérifiez vos courriers indésirables (spams).</p>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail("");
                    }}
                    className="w-full text-xs font-bold text-sky-600 hover:text-sky-700 py-2 transition-colors cursor-pointer"
                  >
                    Renvoyer à une autre adresse
                  </button>

                  <Link
                    href="/login"
                    className="block w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold transition-all text-center"
                  >
                    Revenir à la page de connexion
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Mot de passe oublié ?
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">
                    Saisissez votre email de compte Facturim pour recevoir les instructions de réinitialisation.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
                    <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    <p className="font-semibold leading-relaxed">{errorMessage}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block font-semibold text-slate-700 text-xs mb-1.5 ml-1">
                      Email professionnel
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contact@votre-entreprise.mr"
                        className="w-full bg-white border border-slate-300 rounded-full px-4 sm:px-5 pl-10 py-2.5 sm:py-3 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                      />
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs sm:text-sm py-3 rounded-full shadow-md shadow-sky-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Transmission en cours...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Envoyer le lien de récupération</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-500">
                    Vous vous souvenez de votre mot de passe ?{" "}
                    <Link href="/login" className="text-sky-600 font-bold hover:underline">
                      Se connecter
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
        <Sparkles size={13} className="text-sky-600" />
        <span>Protégé par chiffrement de bout en bout TLS 1.3 & Supabase Auth</span>
      </div>
    </div>
  );
}
