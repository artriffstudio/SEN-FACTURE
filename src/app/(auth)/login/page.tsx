"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, resendConfirmationEmail } = useAuth();

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
    } catch (err: any) {
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
      router.push("/");
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
      {/* Conteneur principal inspiré de la maquette (style carte flottante avec image de fond & carte blanche intérieure) */}
      <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl shadow-slate-900/15 border border-slate-200/80 bg-slate-900 min-h-[580px] flex flex-col lg:flex-row items-stretch">
        {/* ========================================================================= */}
        {/* VOLET GAUCHE : Décor inspiré (espace de travail moderne + courbes abstraites) */}
        {/* ========================================================================= */}
        <div className="relative lg:w-7/12 min-h-[260px] sm:min-h-[320px] lg:min-h-full p-6 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden">
          {/* Image de fond en haute définition */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: "url('/images/auth-bg.jpg')",
            }}
          />

          {/* Voile sombre doux & harmonieux pour assurer une lisibilité parfaite des textes */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/45 to-slate-950/40" />

          {/* Courbes vectorielles géométriques et organiques blanches (inspirées de la capture) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 600 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="160"
              cy="200"
              r="170"
              stroke="white"
              strokeWidth="2.5"
              strokeOpacity="0.4"
            />
            <circle
              cx="160"
              cy="200"
              r="270"
              stroke="white"
              strokeWidth="1.8"
              strokeDasharray="6 6"
              strokeOpacity="0.25"
            />
            <ellipse
              cx="140"
              cy="420"
              rx="230"
              ry="180"
              stroke="white"
              strokeWidth="2.5"
              strokeOpacity="0.35"
            />
            <path
              d="M-40 120 C140 60 260 320 480 220"
              stroke="white"
              strokeWidth="2.5"
              strokeOpacity="0.4"
            />
            <path
              d="M-20 380 C180 280 320 560 560 420"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="8 8"
              strokeOpacity="0.25"
            />
          </svg>

          {/* Badge supérieur */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md text-slate-800 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
              <span>Bonjour !</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* Message d'accueil (inspiré fidèlement de la capture) */}
          <div className="relative z-10 mt-12 lg:mt-auto text-white space-y-3 max-w-md">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-tight text-white drop-shadow-sm font-normal">
              <span className="font-extrabold text-white">Bon retour</span> sur
              votre espace personnel !
            </h2>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium drop-shadow-xs">
              Nous sommes ravis de vous retrouver parmi nous.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VOLET DROIT : Carte blanche épurée « Se connecter »                         */}
        {/* ========================================================================= */}
        <div className="relative lg:w-5/12 flex items-center justify-center p-3 sm:p-5 lg:p-6 bg-slate-900/60 lg:bg-transparent backdrop-blur-xs lg:backdrop-blur-none">
          <div className="w-full bg-white rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 lg:p-10 shadow-xl border border-slate-100 flex flex-col justify-center">
            {/* En-tête : Titre et sous-titre demandés */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Se connecter
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
                Accédez à votre espace personnel
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
                      Un lien d&apos;activation a été envoyé lors de votre inscription. Veuillez consulter votre boîte de réception (et vos <strong>Courriers indésirables / Spams</strong>) pour valider votre compte.
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

            {/* Formulaire avec les champs exacts demandés */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Champ : Email */}
              <div>
                <label className="block font-semibold text-slate-700 text-xs mb-1.5 ml-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Entrez votre email"
                    className="w-full bg-white border border-slate-300 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Champ : Mot de passe */}
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
                    placeholder="Entrez votre mot de passe"
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

                {/* Lien Mot de passe oublié ? */}
                <div className="text-right mt-1.5 pr-1">
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      toast(
                        "Pour réinitialiser votre mot de passe, contactez l'administrateur ou le support SEN FACTURE.",
                        { icon: "ℹ️" }
                      );
                    }}
                    className="text-[11px] text-slate-500 hover:text-sky-600 transition-colors underline cursor-pointer"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>
              </div>

              {/* Bouton CTA : Connexion */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:from-sky-700 active:to-sky-800 text-white font-bold text-xs sm:text-sm py-3 rounded-full shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Connexion...</span>
                  </>
                ) : (
                  <span>Connexion</span>
                )}
              </button>
            </form>

            {/* Séparateur élégant OU */}
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

            {/* Lien Créer un compte demandé par l'utilisateur */}
            <div className="text-center">
              <p className="text-xs text-slate-600 font-medium">
                Pas encore de compte ?{" "}
                <Link
                  href="/register"
                  className="text-sky-600 hover:text-sky-700 font-bold hover:underline transition-all inline-flex items-center gap-1 ml-1"
                >
                  <span>Créer un compte</span>
                  <ArrowRight size={13} />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Petit rappel de conformité sous la carte */}
      <div className="mt-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
        <Sparkles size={13} className="text-sky-600" />
        <span>
          Facturation électronique certifiée conforme DGID & SYSCOHADA UEMOA
        </span>
      </div>
    </div>
  );
}
