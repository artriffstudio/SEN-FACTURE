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
      name: "FACTURIM",
      email: "contact@facturim.net",
      phone: "+222 45 00 00 00",
      address: "Avenue Moktar Ould Daddah, Tevragh-Zeina",
      city: "Nouakchott",
      country: "Mauritanie",
      taxId: "00987654-MR",
      currency: "MRU",
      taxRate: 16.0,
      invoicePrefix: "FAC-2025-",
      nextInvoiceNumber: 4,
      defaultPaymentTerms: "Paiement à réception",
      bankRib: "MR12 00010 01001 12345678901 23 (BPM Mauritanie)",
      bankilyPhone: "+222 45 12 34 56",
      masrviPhone: "+222 22 12 34 56",
      sedadPhone: "+222 36 78 90 12",
      clickPhone: "+222 49 12 34 56",
      bimBankPhone: "+222 33 12 34 56",
      termsAndConditions:
        "Paiement à réception par virement bancaire ou Mobile Money (BANKILY / MASRVI / SEDAD / CLICK / BIM BANK). Conformément aux règles de facturation en Mauritanie.",
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
    city: data.city || "Nouakchott",
    country: data.country || "Mauritanie",
    taxId: data.tax_id || "",
    currency: (data.currency as any) || "MRU",
    taxRate: Number(data.tax_rate) || 16.0,
    logoUrl: data.logo_url || undefined,
    invoicePrefix: data.invoice_prefix || "FAC-2025-",
    nextInvoiceNumber: data.next_invoice_number || 1,
    defaultPaymentTerms: data.default_payment_terms || "Paiement à réception",
    bankRib: data.bank_rib || "MR12 00010 01001 12345678901 23 (BPM Mauritanie)",
    bankilyPhone: data.wave_phone || data.bankily_phone || "+222 45 12 34 56",
    masrviPhone: data.masrvi_phone || "+222 22 12 34 56",
    sedadPhone: data.om_phone || data.sedad_phone || "+222 36 78 90 12",
    clickPhone: data.click_phone || "+222 49 12 34 56",
    bimBankPhone: data.bim_bank_phone || "+222 33 12 34 56",
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
  if (updates.defaultPaymentTerms !== undefined)
    payload.default_payment_terms = updates.defaultPaymentTerms;
  if (updates.bankRib !== undefined) payload.bank_rib = updates.bankRib;
  if (updates.bankilyPhone !== undefined) {
    payload.wave_phone = updates.bankilyPhone;
    payload.bankily_phone = updates.bankilyPhone;
  }
  if (updates.masrviPhone !== undefined) payload.masrvi_phone = updates.masrviPhone;
  if (updates.sedadPhone !== undefined) {
    payload.om_phone = updates.sedadPhone;
    payload.sedad_phone = updates.sedadPhone;
  }
  if (updates.clickPhone !== undefined) payload.click_phone = updates.clickPhone;
  if (updates.bimBankPhone !== undefined) payload.bim_bank_phone = updates.bimBankPhone;
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
    console.warn("Mise à jour Supabase, sauvegarde locale de secours:", error.message);
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
