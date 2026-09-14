"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Vérification et confirmation de votre compte...");

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        const code = searchParams.get("code");
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type") as any;

        // 1. Si échange de code PKCE
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        // 2. Si validation par token hash OTP
        else if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type,
          });
          if (error) throw error;
        }
        // 3. Vérifier si une session est maintenant active (y compris via fragments de hash)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        setStatus("success");
        setMessage("Votre adresse email a été confirmée avec succès !");
        toast.success("Compte activé ! Redirection vers votre espace...");

        // Rediriger vers l'espace après un court instant
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1500);
      } catch (err: any) {
        console.error("Erreur confirmation email:", err);
        setStatus("error");
        setMessage(
          err?.message ||
            "Le lien de confirmation est invalide ou a expiré. Veuillez réessayer ou demander un nouvel email."
        );
      }
    }

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl text-center">
        {status === "loading" && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">
              Confirmation de votre compte
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              {message}
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4 py-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
              <CheckCircle2 size={30} className="stroke-[2.5]" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Email Confirmé !
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              {message}
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-sky-500/20"
              >
                <span>Accéder à SEN FACTURE</span>
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4 py-4 animate-in fade-in duration-200">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
              <AlertCircle size={28} className="stroke-[2.2]" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Échec de la confirmation
            </h2>
            <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200/60 leading-relaxed">
              {message}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
              >
                <span>Retour à la page de connexion</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-lg font-bold text-slate-900">Chargement...</h2>
            <p className="text-xs text-slate-500">Validation de votre lien de confirmation...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
