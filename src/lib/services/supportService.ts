import { supabase } from "@/lib/supabase";
import { getEffectiveCompanyId } from "@/lib/services/companyService";

export async function createSupportTicket(ticket: {
  subject: string;
  category: string;
  priority: string;
  message: string;
}): Promise<boolean> {
  const companyId = await getEffectiveCompanyId();

  const { error } = await supabase.from("support_tickets").insert([
    {
      company_id: companyId,
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      message: ticket.message,
      status: "Ouvert",
    },
  ]);

  if (error) {
    throw new Error(`Erreur enregistrement ticket: ${error.message}`);
  }

  return true;
}

export async function createContactLead(lead: {
  fullName: string;
  email: string;
  phone: string;
  need?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from("support_tickets").insert([
      {
        subject: `Demande Démo Commerciale - ${lead.fullName}`,
        category: "Commercial / Démo",
        priority: "Haute",
        message: `Nom: ${lead.fullName}\nEmail: ${lead.email}\nTéléphone: ${lead.phone}\nBesoin: ${lead.need || "Non spécifié"}`,
        status: "Ouvert",
      },
    ]);

    if (error) {
      console.warn("Note enregistrement lead Supabase:", error.message);
    }
  } catch (err) {
    console.warn("Supabase lead submission:", err);
  }

  return true;
}
