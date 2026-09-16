import { supabase } from "@/lib/supabase";
import {
  Invoice,
  InvoiceFormData,
  InvoiceStatus,
  DashboardStats,
  MonthlyRevenue,
  Client,
} from "@/lib/types";
import { getEffectiveCompanyId } from "@/lib/services/companyService";

export async function getInvoices(
  statusFilter?: string,
  searchQuery?: string
): Promise<Invoice[]> {
  const companyId = await getEffectiveCompanyId();

  let query = supabase
    .from("invoices")
    .select("*, clients(*), invoice_items(*)")
    .eq("company_id", companyId)
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
          city: inv.clients.city || "Nouakchott",
          country: inv.clients.country || "Mauritanie",
          taxId: inv.clients.tax_id || "",
          logoUrl: inv.clients.logo_url || undefined,
          createdAt: inv.clients.created_at,
          updatedAt: inv.clients.updated_at,
        }
      : undefined;

    const subtotalNum = Number(inv.subtotal) || 0;
    const totalNum = Number(inv.total) || 0;
    const depAmt = inv.deposit_amount ? Number(inv.deposit_amount) : undefined;
    const depPct = inv.deposit_percentage ? Number(inv.deposit_percentage) : undefined;
    const remAmt = inv.remaining_amount ? Number(inv.remaining_amount) : depAmt ? totalNum - depAmt : undefined;

    return {
      id: inv.id,
      companyId: inv.company_id,
      clientId: inv.client_id,
      client,
      invoiceNumber: inv.invoice_number,
      status: inv.status as InvoiceStatus,
      issueDate: inv.issue_date,
      dueDate: inv.due_date,
      subtotal: subtotalNum,
      taxRate: Number(inv.tax_rate) || 16,
      taxAmount: Number(inv.tax_amount) || 0,
      total: totalNum,
      depositAmount: depAmt,
      depositPercentage: depPct,
      remainingAmount: remAmt,
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
        city: inv.clients.city || "Nouakchott",
        country: inv.clients.country || "Mauritanie",
        taxId: inv.clients.tax_id || "",
        logoUrl: inv.clients.logo_url || undefined,
        createdAt: inv.clients.created_at,
        updatedAt: inv.clients.updated_at,
      }
    : undefined;

  const subtotalNum = Number(inv.subtotal) || 0;
  const totalNum = Number(inv.total) || 0;
  const depAmt = inv.deposit_amount ? Number(inv.deposit_amount) : undefined;
  const depPct = inv.deposit_percentage ? Number(inv.deposit_percentage) : undefined;
  const remAmt = inv.remaining_amount ? Number(inv.remaining_amount) : depAmt ? totalNum - depAmt : undefined;

  return {
    id: inv.id,
    companyId: inv.company_id,
    clientId: inv.client_id,
    client,
    invoiceNumber: inv.invoice_number,
    status: inv.status as InvoiceStatus,
    issueDate: inv.issue_date,
    dueDate: inv.due_date,
    subtotal: subtotalNum,
    taxRate: Number(inv.tax_rate) || 16,
    taxAmount: Number(inv.tax_amount) || 0,
    total: totalNum,
    depositAmount: depAmt,
    depositPercentage: depPct,
    remainingAmount: remAmt,
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
  const companyId = await getEffectiveCompanyId();

  // 1. Calculer les montants
  const subtotal = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxRate = 16.0; // TVA Standard Mauritanie DGI 16%
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + taxAmount;

  // 2. Récupérer le prochain numéro de facture depuis l'entreprise
  const { data: comp } = await supabase
    .from("companies")
    .select("invoice_prefix, next_invoice_number")
    .eq("id", companyId)
    .single();

  const prefix = comp?.invoice_prefix || "FAC-2025-";
  const num = comp?.next_invoice_number || 1;
  const invoiceNumber = `${prefix}${String(num).padStart(3, "0")}`;

  // Incrémenter pour la prochaine fois
  await supabase
    .from("companies")
    .update({ next_invoice_number: num + 1 })
    .eq("id", companyId);

  // 3. Insérer la facture
  const invoiceInsertPayload: Record<string, any> = {
    company_id: companyId,
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
  };

  if (data.depositAmount !== undefined && data.depositAmount > 0) {
    invoiceInsertPayload.deposit_amount = data.depositAmount;
  }
  if (data.depositPercentage !== undefined && data.depositPercentage > 0) {
    invoiceInsertPayload.deposit_percentage = data.depositPercentage;
  }

  const { data: createdInv, error: invError } = await supabase
    .from("invoices")
    .insert([invoiceInsertPayload])
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
  const companyId = await getEffectiveCompanyId();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("status, total, deposit_amount, deposit_percentage")
    .eq("company_id", companyId);

  const { count: clientCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId);

  let totalRevenue = 0;
  let pendingAmount = 0;
  let overdueAmount = 0;
  let paidCount = 0;
  let overdueCount = 0;
  let draftCount = 0;

  if (invoices) {
    for (const inv of invoices) {
      const amount = Number(inv.total) || 0;
      const dep = Number(inv.deposit_amount) || (inv.deposit_percentage ? Math.round(amount * (Number(inv.deposit_percentage) / 100)) : 0);

      if (inv.status === "paid") {
        totalRevenue += amount;
        paidCount++;
      } else if (inv.status === "partially_paid") {
        totalRevenue += dep > 0 ? dep : Math.round(amount * 0.5);
        pendingAmount += amount - (dep > 0 ? dep : Math.round(amount * 0.5));
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
  const companyId = await getEffectiveCompanyId();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("issue_date, total, status")
    .eq("company_id", companyId);

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
