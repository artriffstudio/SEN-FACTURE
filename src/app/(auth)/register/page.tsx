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
  Mail,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signIn } = useAuth();

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
        "Base de données Supabase non connectée. Veuillez ajouter les variables NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans les paramètres Vercel."
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
        } else if (
          error.message?.toLowerCase().includes("fetch") ||
          error.message?.toLowerCase().includes("network")
        ) {
          setErrorMessage(
            "Connexion réseau à Supabase impossible. Vérifiez que les variables d'environnement Vercel sont bien configurées."
          );
        } else {
          setErrorMessage(error.message || "Erreur lors de l'inscription.");
        }
        toast.error("Échec de la création du compte");
        return;
      }

      toast.success("Compte créé avec succès ! Bienvenue sur SEN FACTURE.");

      if (!session) {
        // En cas de besoin, initialiser la session immédiatement
        await signIn(email, password);
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err?.message || "Une erreur inattendue est survenue.");
      toast.error("Erreur d'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-4">
      {/* Conteneur principal inspiré de la maquette (style carte flottante avec image de fond & carte blanche intérieure) */}
      <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl shadow-slate-900/15 border border-slate-200/80 bg-slate-900 min-h-[620px] flex flex-col lg:flex-row items-stretch">
        {/* ========================================================================= */}
        {/* VOLET GAUCHE : Décor inspiré (espace de travail moderne + courbes abstraites) */}
        {/* ========================================================================= */}
        <div className="relative lg:w-5/12 min-h-[220px] sm:min-h-[280px] lg:min-h-full p-6 sm:p-10 flex flex-col justify-between overflow-hidden">
          {/* Image de fond en haute définition */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: "url('/images/auth-bg.jpg')",
            }}
          />

          {/* Voile sombre doux */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/50 to-slate-950/45" />

          {/* Courbes vectorielles décoratives blanches */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 600 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="140"
              cy="180"
              r="160"
              stroke="white"
              strokeWidth="2.5"
              strokeOpacity="0.4"
            />
            <circle
              cx="140"
              cy="180"
              r="250"
              stroke="white"
              strokeWidth="1.8"
              strokeDasharray="6 6"
              strokeOpacity="0.25"
            />
            <ellipse
              cx="120"
              cy="400"
              rx="220"
              ry="170"
              stroke="white"
              strokeWidth="2.5"
              strokeOpacity="0.35"
            />
          </svg>

          {/* Badge supérieur */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md text-slate-800 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
              <span>Bienvenue !</span>
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            </div>
          </div>

          {/* Message d'accueil */}
          <div className="relative z-10 mt-8 lg:mt-auto text-white space-y-2 max-w-sm">
            <h2 className="text-xl sm:text-2xl lg:text-3xl leading-tight tracking-tight text-white drop-shadow-sm font-normal">
              <span className="font-extrabold text-white">Créer votre compte</span>{" "}
              d&apos;entreprise
            </h2>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium drop-shadow-xs">
              Pilotez vos factures, devis et encaissements aux normes sénégalaises et SYSCOHADA.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VOLET DROIT : Carte blanche épurée « Créer un compte »                      */}
        {/* ========================================================================= */}
        <div className="relative lg:w-7/12 flex items-center justify-center p-3 sm:p-5 lg:p-6 bg-slate-900/60 lg:bg-transparent backdrop-blur-xs lg:backdrop-blur-none">
          <div className="w-full bg-white rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 lg:p-10 shadow-xl border border-slate-100 flex flex-col justify-center">
                {/* En-tête */}
                <div className="text-center mb-5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Créer un compte
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                    Enregistrez votre entreprise sur SEN FACTURE
                  </p>
                </div>

                {/* Message d'erreur éventuel */}
                {errorMessage && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-200">
                    <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    <p className="font-medium leading-relaxed">{errorMessage}</p>
                  </div>
                )}

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Nom & Prénom */}
                    <div>
                      <label className="block font-semibold text-slate-700 text-xs mb-1 ml-1">
                        Nom & Prénom
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Mamadou Diop"
                        className="w-full bg-white border border-slate-300 rounded-full px-4 py-2.5 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                      />
                    </div>

                    {/* Entreprise */}
                    <div>
                      <label className="block font-semibold text-slate-700 text-xs mb-1 ml-1">
                        Entreprise / Société
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Teranga Digital SARL"
                        className="w-full bg-white border border-slate-300 rounded-full px-4 py-2.5 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-semibold text-slate-700 text-xs mb-1 ml-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Entrez votre email"
                      className="w-full bg-white border border-slate-300 rounded-full px-4 py-2.5 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Mot de passe */}
                    <div>
                      <label className="block font-semibold text-slate-700 text-xs mb-1 ml-1">
                        Mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Entrez votre mot de passe"
                          className="w-full bg-white border border-slate-300 rounded-full px-4 pr-10 py-2.5 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirmer */}
                    <div>
                      <label className="block font-semibold text-slate-700 text-xs mb-1 ml-1">
                        Confirmer mot de passe
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmez mot de passe"
                        className="w-full bg-white border border-slate-300 rounded-full px-4 py-2.5 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Conditions d'utilisation */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer mt-0.5 shrink-0"
                      />
                      <span className="text-[11px] text-slate-500 leading-tight">
                        J&apos;accepte les conditions d&apos;utilisation et la conformité SYSCOHADA / DGID Sénégal.
                      </span>
                    </label>
                  </div>

                  {/* Bouton CTA */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:from-sky-700 active:to-sky-800 text-white font-bold text-xs sm:text-sm py-3 rounded-full shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Création du compte...</span>
                      </>
                    ) : (
                      <span>Créer mon compte</span>
                    )}
                  </button>
                </form>

                {/* Séparateur */}
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

                {/* Lien Connexion */}
                <div className="text-center">
                  <p className="text-xs text-slate-600 font-medium">
                    Vous avez déjà un compte ?{" "}
                    <Link
                      href="/login"
                      className="text-sky-600 hover:text-sky-700 font-bold hover:underline transition-all inline-flex items-center gap-1 ml-1"
                    >
                      <span>Se connecter</span>
                      <ArrowRight size={13} />
                    </Link>
                  </p>
                </div>
          </div>
        </div>
      </div>

      {/* Petit rappel sous la carte */}
      <div className="mt-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
        <Sparkles size={13} className="text-sky-600" />
        <span>
          Facturation électronique conforme SYSCOHADA & intégration Wave / Orange Money
        </span>
      </div>
    </div>
  );
}
