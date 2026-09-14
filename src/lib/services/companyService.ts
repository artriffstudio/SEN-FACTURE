import { supabase } from "@/lib/supabase";
import { Company } from "@/lib/types";

export const DEFAULT_COMPANY_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Récupère l'ID de l'entreprise associée à l'utilisateur actuellement authentifié,
 * ou l'ID par défaut si non authentifié.
 */
export async function getEffectiveCompanyId(): Promise<string> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user?.id) {
      const { data: comp } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", authData.user.id)
        .maybeSingle();

      if (comp?.id) {
        return comp.id;
      }
    }
  } catch (err) {
    console.warn("getEffectiveCompanyId fallback:", err);
  }
  return DEFAULT_COMPANY_ID;
}

export async function getCompany(): Promise<Company> {
  const companyId = await getEffectiveCompanyId();

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single();

  if (error || !data) {
    console.warn("Erreur chargement entreprise depuis Supabase:", error?.message);
    // Valeurs par défaut si indisponible
    return {
      id: companyId,
      userId: "",
      name: "ARTRIFF STUDIO",
      email: "contact@artriffstudio.com",
      phone: "+221 77 890 12 34",
      address: "Almadies, Zone 4",
      city: "Dakar",
      country: "Sénégal",
      taxId: "SN-009876543-2B",
      currency: "XOF",
      taxRate: 18.0,
      invoicePrefix: "FAC-2025-",
      nextInvoiceNumber: 4,
      termsAndConditions:
        "Paiement à réception par virement bancaire BICIS ou Mobile Money (Wave / Orange Money). Conformément aux règles de facturation SYSCOHADA en vigueur au Sénégal.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    id: data.id,
    userId: data.user_id || "",
    name: data.name,
    email: data.email,
    phone: data.phone || "",
    address: data.address || "",
    city: data.city || "Dakar",
    country: data.country || "Sénégal",
    taxId: data.tax_id || "",
    currency: (data.currency as any) || "XOF",
    taxRate: Number(data.tax_rate) || 18.0,
    logoUrl: data.logo_url || undefined,
    invoicePrefix: data.invoice_prefix || "FAC-2025-",
    nextInvoiceNumber: data.next_invoice_number || 1,
    termsAndConditions: data.terms_and_conditions || "",
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateCompany(
  updates: Partial<Company>
): Promise<Company> {
  const companyId = await getEffectiveCompanyId();

  const payload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.phone !== undefined) payload.phone = updates.phone;
  if (updates.address !== undefined) payload.address = updates.address;
  if (updates.city !== undefined) payload.city = updates.city;
  if (updates.country !== undefined) payload.country = updates.country;
  if (updates.taxId !== undefined) payload.tax_id = updates.taxId;
  if (updates.taxRate !== undefined) payload.tax_rate = updates.taxRate;
  if (updates.invoicePrefix !== undefined)
    payload.invoice_prefix = updates.invoicePrefix;
  if (updates.termsAndConditions !== undefined)
    payload.terms_and_conditions = updates.termsAndConditions;
  if (updates.logoUrl !== undefined) payload.logo_url = updates.logoUrl;

  const { data, error } = await supabase
    .from("companies")
    .update(payload)
    .eq("id", companyId)
    .select()
    .single();

  if (error) {
    throw new Error(`Échec de la mise à jour de l'entreprise: ${error.message}`);
  }

  return getCompany();
}

/**
 * Téléverse un logo dans le bucket Cloud Supabase Storage 'company-assets'
 */
export async function uploadCompanyLogo(
  file: File | Blob,
  fileName: string
): Promise<string> {
  const ext = fileName.split(".").pop() || "png";
  const path = `logos/company-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("company-assets")
    .upload(path, file, {
      upsert: true,
      contentType: file.type || "image/png",
    });

  if (uploadError) {
    throw new Error(
      `Erreur téléversement logo Supabase: ${uploadError.message}`
    );
  }

  const { data } = supabase.storage
    .from("company-assets")
    .getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error("Impossible de générer l'URL publique du logo.");
  }

  // Mettre à jour l'enregistrement entreprise avec la nouvelle URL
  await updateCompany({ logoUrl: data.publicUrl });

  return data.publicUrl;
}
