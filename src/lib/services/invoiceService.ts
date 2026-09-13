import { supabase } from "@/lib/supabase";
import {
  Invoice,
  InvoiceFormData,
  InvoiceStatus,
  DashboardStats,
  MonthlyRevenue,
  Client,
} from "@/lib/types";

const DEFAULT_COMPANY_ID = "00000000-0000-0000-0000-000000000001";

export async function getInvoices(
  statusFilter?: string,
  searchQuery?: string
): Promise<Invoice[]> {
  let query = supabase
    .from("invoices")
    .select("*, clients(*), invoice_items(*)")
    .eq("company_id", DEFAULT_COMPANY_ID)
    .order("issue_date", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Erreur récupération factures:", error?.message);
    return [];
  }

  let invoices: Invoice[] = data.map((inv) => {
    const client: Client | undefined = inv.clients
      ? {
          id: inv.clients.id,
          companyId: inv.clients.company_id,
          name: inv.clients.name,
          email: inv.clients.email,
          phone: inv.clients.phone || "",
          address: inv.clients.address || "",
          city: inv.clients.city || "Dakar",
          country: inv.clients.country || "Sénégal",
          taxId: inv.clients.tax_id || "",
          logoUrl: inv.clients.logo_url || undefined,
          createdAt: inv.clients.created_at,
          updatedAt: inv.clients.updated_at,
        }
      : undefined;

    return {
      id: inv.id,
      companyId: inv.company_id,
      clientId: inv.client_id,
      client,
      invoiceNumber: inv.invoice_number,
      status: inv.status as InvoiceStatus,
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
    };
  });

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    invoices = invoices.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.client?.name.toLowerCase().includes(q) ||
        inv.items.some((it) => it.description.toLowerCase().includes(q))
    );
  }

  return invoices;
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const { data: inv, error } = await supabase
    .from("invoices")
    .select("*, clients(*), invoice_items(*)")
    .eq("id", id)
    .single();

  if (error || !inv) {
    return null;
  }

  const client: Client | undefined = inv.clients
    ? {
        id: inv.clients.id,
        companyId: inv.clients.company_id,
        name: inv.clients.name,
        email: inv.clients.email,
        phone: inv.clients.phone || "",
        address: inv.clients.address || "",
        city: inv.clients.city || "Dakar",
        country: inv.clients.country || "Sénégal",
        taxId: inv.clients.tax_id || "",
        logoUrl: inv.clients.logo_url || undefined,
        createdAt: inv.clients.created_at,
        updatedAt: inv.clients.updated_at,
      }
    : undefined;

  return {
    id: inv.id,
    companyId: inv.company_id,
    clientId: inv.client_id,
    client,
    invoiceNumber: inv.invoice_number,
    status: inv.status as InvoiceStatus,
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
  };
}

export async function createInvoice(data: InvoiceFormData): Promise<Invoice> {
  // 1. Calculer les montants
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxRate = 18.0;
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + taxAmount;

  // 2. Récupérer le prochain numéro de facture depuis l'entreprise
  const { data: comp } = await supabase
    .from("companies")
    .select("invoice_prefix, next_invoice_number")
    .eq("id", DEFAULT_COMPANY_ID)
    .single();

  const prefix = comp?.invoice_prefix || "FAC-2025-";
  const num = comp?.next_invoice_number || 1;
  const invoiceNumber = `${prefix}${String(num).padStart(3, "0")}`;

  // Incrémenter pour la prochaine fois
  await supabase
    .from("companies")
    .update({ next_invoice_number: num + 1 })
    .eq("id", DEFAULT_COMPANY_ID);

  // 3. Insérer la facture
  const { data: createdInv, error: invError } = await supabase
    .from("invoices")
    .insert([
      {
        company_id: DEFAULT_COMPANY_ID,
        client_id: data.clientId,
        invoice_number: invoiceNumber,
        status: data.status,
        issue_date: data.issueDate,
        due_date: data.dueDate,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        notes: data.notes || null,
        paid_at: data.status === "paid" ? new Date().toISOString() : null,
      },
    ])
    .select()
    .single();

  if (invError || !createdInv) {
    throw new Error(`Échec création facture: ${invError?.message}`);
  }

  // 4. Insérer les lignes d'articles
  if (data.items.length > 0) {
    const itemsPayload = data.items.map((it, idx) => ({
      invoice_id: createdInv.id,
      description: it.description,
      quantity: it.quantity,
      unit_price: it.unitPrice,
      total: it.quantity * it.unitPrice,
      sort_order: idx + 1,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsPayload);

    if (itemsError) {
      console.error("Erreur insertion lignes de facture:", itemsError.message);
    }
  }

  const fullInvoice = await getInvoiceById(createdInv.id);
  if (!fullInvoice) {
    throw new Error("Facture créée mais impossible de la relire");
  }
  return fullInvoice;
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus
): Promise<boolean> {
  const payload: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
    paid_at: status === "paid" ? new Date().toISOString() : null,
  };

  const { error } = await supabase.from("invoices").update(payload).eq("id", id);
  if (error) {
    throw new Error(`Échec mise à jour statut: ${error.message}`);
  }
  return true;
}

export async function deleteInvoice(id: string): Promise<boolean> {
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) {
    throw new Error(`Échec suppression facture: ${error.message}`);
  }
  return true;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data: invoices } = await supabase
    .from("invoices")
    .select("status, total")
    .eq("company_id", DEFAULT_COMPANY_ID);

  const { count: clientCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("company_id", DEFAULT_COMPANY_ID);

  let totalRevenue = 0;
  let pendingAmount = 0;
  let overdueAmount = 0;
  let paidCount = 0;
  let overdueCount = 0;
  let draftCount = 0;

  if (invoices) {
    for (const inv of invoices) {
      const amount = Number(inv.total) || 0;
      if (inv.status === "paid") {
        totalRevenue += amount;
        paidCount++;
      } else if (inv.status === "sent") {
        pendingAmount += amount;
      } else if (inv.status === "overdue") {
        overdueAmount += amount;
        overdueCount++;
      } else if (inv.status === "draft") {
        draftCount++;
      }
    }
  }

  return {
    totalRevenue,
    pendingAmount,
    overdueAmount,
    totalClients: clientCount || 0,
    invoiceCount: invoices?.length || 0,
    paidCount,
    overdueCount,
    draftCount,
  };
}

export async function getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  const { data: invoices } = await supabase
    .from("invoices")
    .select("issue_date, total, status")
    .eq("company_id", DEFAULT_COMPANY_ID);

  const monthsMap: Record<string, { revenue: number; count: number }> = {
    Jan: { revenue: 0, count: 0 },
    Fév: { revenue: 0, count: 0 },
    Mar: { revenue: 0, count: 0 },
    Avr: { revenue: 0, count: 0 },
    Mai: { revenue: 0, count: 0 },
    Juin: { revenue: 0, count: 0 },
  };

  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

  if (invoices) {
    for (const inv of invoices) {
      if (inv.issue_date) {
        const date = new Date(inv.issue_date);
        const mName = monthNames[date.getMonth()];
        if (monthsMap[mName] !== undefined) {
          if (inv.status === "paid") {
            monthsMap[mName].revenue += Number(inv.total) || 0;
          }
          monthsMap[mName].count += 1;
        }
      }
    }
  }

  return Object.entries(monthsMap).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    count: data.count,
  }));
}
