"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: UserRole;
  setRole: (role: UserRole) => void;
  canViewGlobalRevenue: () => boolean;
  canAccessReports: () => boolean;
  canManageTeam: () => boolean;
  canEditBankDetails: () => boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    companyName: string
  ) => Promise<{ error: any; user: User | null; session: Session | null }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_COMPANY_ID = "00000000-0000-0000-0000-000000000001";

async function linkOrRegisterCompany(userId: string, email: string, companyName?: string) {
  try {
    const { data: userComp } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (userComp) return userComp.id;

    const { data: defaultComp } = await supabase
      .from("companies")
      .select("id, user_id")
      .eq("id", DEFAULT_COMPANY_ID)
      .maybeSingle();

    if (defaultComp && !defaultComp.user_id) {
      await supabase
        .from("companies")
        .update({
          user_id: userId,
          name: companyName?.trim() || "FACTURIM Entreprise",
          email: email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", DEFAULT_COMPANY_ID);
      return DEFAULT_COMPANY_ID;
    }

    const { data: newComp } = await supabase
      .from("companies")
      .insert({
        user_id: userId,
        name: companyName?.trim() || "Mon Entreprise",
        email: email,
        city: "Nouakchott",
        country: "Mauritanie",
        currency: "MRU",
        tax_rate: 16.0,
        invoice_prefix: "FAC-2025-",
        next_invoice_number: 1,
      })
      .select("id")
      .single();

    return newComp?.id || DEFAULT_COMPANY_ID;
  } catch (err) {
    console.error("Erreur association entreprise utilisateur:", err);
    return DEFAULT_COMPANY_ID;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRoleState] = useState<UserRole>("owner");

  useEffect(() => {
    // Récupérer le rôle éventuellement persisté pour les tests / profil
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("facturim_active_role") as UserRole;
      if (savedRole && ["owner", "admin", "accountant", "sales", "viewer"].includes(savedRole)) {
        setRoleState(savedRole);
      }
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("facturim_active_role", newRole);
    }
  };

  const canViewGlobalRevenue = () => {
    // L'opérateur guichet (sales) ne peut PAS voir le CA global de l'entreprise
    return role === "owner" || role === "admin" || role === "accountant";
  };

  const canAccessReports = () => {
    return role === "owner" || role === "admin" || role === "accountant";
  };

  const canManageTeam = () => {
    return role === "owner" || role === "admin";
  };

  const canEditBankDetails = () => {
    return role === "owner" || role === "admin";
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setSession(data.session);
          setUser(data.session?.user || null);
          if (data.session?.user) {
            linkOrRegisterCompany(
              data.session.user.id,
              data.session.user.email || "",
              data.session.user.user_metadata?.company_name
            );
          }
        }
      } catch (err) {
        console.error("Erreur initialisation session:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user || null);
      setLoading(false);

      if (newSession?.user) {
        await linkOrRegisterCompany(
          newSession.user.id,
          newSession.user.email || "",
          newSession.user.user_metadata?.company_name
        );
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (!error && data.user) {
      await linkOrRegisterCompany(
        data.user.id,
        data.user.email || email,
        data.user.user_metadata?.company_name
      );
    }

    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    companyName: string
  ) => {
    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName.trim(),
          company_name: companyName.trim(),
        },
      },
    });

    if (!error && data.user) {
      await linkOrRegisterCompany(
        data.user.id,
        email,
        companyName
      );
    }

    return { error, user: data.user, session: data.session };
  };

  const resendConfirmationEmail = async (email: string) => {
    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    return await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
  };

  const resetPassword = async (email: string) => {
    const redirectUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?type=recovery`
        : undefined;

    return await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl,
    });
  };

  const updatePassword = async (newPassword: string) => {
    return await supabase.auth.updateUser({
      password: newPassword,
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role,
        setRole,
        canViewGlobalRevenue,
        canAccessReports,
        canManageTeam,
        canEditBankDetails,
        signIn,
        signUp,
        resendConfirmationEmail,
        resetPassword,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un <AuthProvider>");
  }
  return context;
}
