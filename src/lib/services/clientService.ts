import { supabase } from "@/lib/supabase";
import { Client, ClientFormData, Invoice } from "@/lib/types";
import { getEffectiveCompanyId } from "./companyService";

export async function getClients(): Promise<Client[]> {
  const companyId = await getEffectiveCompanyId();

  const { data: clientsData, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (clientError || !clientsData) {
    console.error("Erreur récupération clients:", clientError?.message);
    return [];
  }

  // Récupérer les factures pour calculer le CA et le nombre de factures par client
  const { data: invoicesData } = await supabase
    .from("invoices")
    .select("client_id, total, status")
    .eq("company_id", companyId);

  const statsByClient: Record<string, { count: number; revenue: number }> = {};
  if (invoicesData) {
    for (const inv of invoicesData) {
      if (!statsByClient[inv.client_id]) {
        statsByClient[inv.client_id] = { count: 0, revenue: 0 };
      }
      statsByClient[inv.client_id].count += 1;
      if (inv.status === "paid") {
        statsByClient[inv.client_id].revenue += Number(inv.total) || 0;
      }
    }
  }

  return clientsData.map((c) => ({
    id: c.id,
    companyId: c.company_id,
    name: c.name,
    email: c.email,
    phone: c.phone || "",
    address: c.address || "",
    city: c.city || "Nouakchott",
    country: c.country || "Mauritanie",
    taxId: c.tax_id || "",
    notes: c.notes || "",
    logoUrl: c.logo_url || undefined,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    invoiceCount: statsByClient[c.id]?.count || 0,
    totalRevenue: statsByClient[c.id]?.revenue || 0,
  }));
}

export async function getClientById(
  id: string
): Promise<{ client: Client; invoices: Invoice[] } | null> {
  const { data: c, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !c) {
    return null;
  }

  const { data: invData } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("client_id", id)
    .order("issue_date", { ascending: false });

  const invoices: Invoice[] = (invData || []).map((inv) => ({
    id: inv.id,
    companyId: inv.company_id,
    clientId: inv.client_id,
    invoiceNumber: inv.invoice_number,
    status: inv.status,
    issueDate: inv.issue_date,
    dueDate: inv.due_date,
    subtotal: Number(inv.subtotal),
    taxRate: Number(inv.tax_rate),
    taxAmount: Number(inv.tax_amount),
    total: Number(inv.total),
    notes: inv.notes,
    createdAt: inv.created_at,
    updatedAt: inv.updated_at,
    paidAt: inv.paid_at,
    items: (inv.invoice_items || []).map((item: any) => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      total: Number(item.total),
      sortOrder: item.sort_order || 0,
    })),
  }));

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);

  const client: Client = {
    id: c.id,
    companyId: c.company_id,
    name: c.name,
    email: c.email,
    phone: c.phone || "",
    address: c.address || "",
    city: c.city || "Nouakchott",
    country: c.country || "Mauritanie",
    taxId: c.tax_id || "",
    notes: c.notes || "",
    logoUrl: c.logo_url || undefined,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    invoiceCount: invoices.length,
    totalRevenue,
  };

  return { client, invoices };
}

export async function createClient(data: ClientFormData): Promise<Client> {
  const companyId = await getEffectiveCompanyId();

  const { data: created, error } = await supabase
    .from("clients")
    .insert([
      {
        company_id: companyId,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || "Nouakchott",
        country: data.country || "Mauritanie",
        tax_id: data.taxId || null,
        notes: data.notes || null,
        logo_url: data.logoUrl || null,
      },
    ])
    .select()
    .single();

  if (error || !created) {
    throw new Error(`Échec création client: ${error?.message}`);
  }

  return {
    id: created.id,
    companyId: created.company_id,
    name: created.name,
    email: created.email,
    phone: created.phone || "",
    address: created.address || "",
    city: created.city || "Nouakchott",
    country: created.country || "Mauritanie",
    taxId: created.tax_id || "",
    notes: created.notes || "",
    logoUrl: created.logo_url || undefined,
    createdAt: created.created_at,
    updatedAt: created.updated_at,
    invoiceCount: 0,
    totalRevenue: 0,
  };
}

export async function updateClient(
  id: string,
  data: Partial<ClientFormData>
): Promise<boolean> {
  const payload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (data.name !== undefined) payload.name = data.name;
  if (data.email !== undefined) payload.email = data.email;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.address !== undefined) payload.address = data.address;
  if (data.city !== undefined) payload.city = data.city;
  if (data.country !== undefined) payload.country = data.country;
  if (data.taxId !== undefined) payload.tax_id = data.taxId;
  if (data.notes !== undefined) payload.notes = data.notes;
  if (data.logoUrl !== undefined) payload.logo_url = data.logoUrl;

  const { error } = await supabase.from("clients").update(payload).eq("id", id);
  if (error) {
    throw new Error(`Échec mise à jour client: ${error.message}`);
  }
  return true;
}

export async function deleteClient(id: string): Promise<boolean> {
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) {
    throw new Error(`Échec suppression client: ${error.message}`);
  }
  return true;
}

export async function uploadClientLogo(
  file: File | Blob,
  fileName: string
): Promise<string> {
  const ext = fileName.split(".").pop() || "png";
  const path = `clients/client-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("company-assets")
    .upload(path, file, {
      upsert: true,
      contentType: file.type || "image/png",
    });

  if (error) {
    throw new Error(`Erreur téléversement logo client: ${error.message}`);
  }

  const { data } = supabase.storage.from("company-assets").getPublicUrl(path);
  return data.publicUrl;
}
