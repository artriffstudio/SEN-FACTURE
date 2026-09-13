import { supabase } from "@/lib/supabase";

const DEFAULT_COMPANY_ID = "00000000-0000-0000-0000-000000000001";

export async function createSupportTicket(ticket: {
  subject: string;
  category: string;
  priority: string;
  message: string;
}): Promise<boolean> {
  const { error } = await supabase.from("support_tickets").insert([
    {
      company_id: DEFAULT_COMPANY_ID,
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
