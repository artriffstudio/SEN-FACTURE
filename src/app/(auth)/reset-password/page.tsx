"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 12) {
      setErrorMessage("Le mot de passe doit comporter au moins 12 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        setErrorMessage(error.message || "Erreur lors du changement de mot de passe.");
        toast.error("Échec de la mise à jour");
      } else {
        setIsSuccess(true);
        toast.success("Mot de passe mis à jour avec succès !");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Une erreur inattendue est survenue.");
      toast.error("Erreur inattendue");
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
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t.countryName} • Réinitialisation de Mot de Passe</span>
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              Définissez votre nouveau mot de passe
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-200 font-medium max-w-md drop-shadow">
              Sécurisez l&apos;accès à votre facturation et à vos relevés bancaires avec un mot de passe renforcé.
            </p>
          </div>
        </div>

        {/* VOLET DROIT : Formulaire */}
        <div className="lg:w-5/12 bg-white p-6 sm:p-8 lg:p-10 flex flex-col justify-center relative">
          <div className="max-w-sm w-full mx-auto">
            {isSuccess ? (
              <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 size={28} className="stroke-[2.5]" />
                </div>

                <h3 className="text-xl font-black text-slate-900">
                  Mot de passe modifié !
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Votre nouveau mot de passe a été enregistré avec succès. Redirection vers votre tableau de bord en cours...
                </p>

                <div className="pt-2">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-sky-500/20"
                  >
                    <span>Accéder directement</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Nouveau mot de passe
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">
                    Choisissez une combinaison d&apos;au moins 12 caractères.
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
                      Nouveau mot de passe (min. 12 car.)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-white border border-slate-300 rounded-full px-4 sm:px-5 pr-11 py-2.5 sm:py-3 text-slate-900 text-xs font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Jauge de force */}
                    {password && (
                      <div className="mt-2 space-y-1 px-1">
                        <div className="flex gap-1 h-1.5">
                          <div className={`flex-1 rounded-full ${strength >= 1 ? "bg-rose-500" : "bg-slate-200"}`} />
                          <div className={`flex-1 rounded-full ${strength >= 2 ? "bg-amber-500" : "bg-slate-200"}`} />
                          <div className={`flex-1 rounded-full ${strength >= 3 ? "bg-sky-500" : "bg-slate-200"}`} />
                          <div className={`flex-1 rounded-full ${strength >= 4 ? "bg-emerald-500" : "bg-slate-200"}`} />
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {strength < 2 && "Trop faible (min. 12 caractères requis)"}
                          {strength === 2 && "Moyen"}
                          {strength === 3 && "Bon mot de passe"}
                          {strength >= 4 && "Excellent mot de passe"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 text-xs mb-1.5 ml-1">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white border border-slate-300 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-slate-900 text-xs font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs sm:text-sm py-3 rounded-full shadow-md shadow-sky-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Mise à jour en cours...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={15} />
                        <span>Enregistrer le nouveau mot de passe</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
