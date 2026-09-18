import { createClient } from "@supabase/supabase-js";

// Identifiants publics du projet Supabase FACTURIM
// Note : La clé anon est une clé publique (publishable) conçue par Supabase pour être intégrée
// au client web et sécurisée par les politiques Row Level Security (RLS) dans PostgreSQL.
const DEFAULT_SUPABASE_URL = "https://cooamqsuvyqhhihpzyxq.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvb2FtcXN1dnlxaGhpaHB6eXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMTAyMjcsImV4cCI6MjEwNDg4NjIyN30.Io7jspYQcvyfwQo8mX6jjk7Et6LPnm79u01oNvLPo8s";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Vérifie si Supabase est correctement configuré avec de vraies clés.
 */
export function isSupabaseConfigured(): boolean {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes("placeholder")
  );
}
