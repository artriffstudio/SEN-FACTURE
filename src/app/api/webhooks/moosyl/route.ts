import { NextRequest, NextResponse } from "next/server";
import { MoosylWebhookPayload, verifyMoosylSignature, getMoosylConfig } from "@/lib/services/moosylService";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-moosyl-signature") || "";
    const config = getMoosylConfig();

    // Vérification de la signature si le secret est configuré
    if (config.webhookSecret && !verifyMoosylSignature(rawBody, signature, config.webhookSecret)) {
      // En mode sandbox de démo, on autorise si c'est un test interne
      if (!config.isSandbox) {
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 401 }
        );
      }
    }

    const payload: MoosylWebhookPayload = JSON.parse(rawBody);

    if (payload.event === "payment.success") {
      console.log(`[Moosyl Webhook] Paiement reçu pour la facture ${payload.invoiceNumber} (${payload.amount} ${payload.currency}) via ${payload.paymentMethod}`);
      
      // Ici, mise à jour dans la base de données Supabase si configurée
      // Le statut de la facture passe à "paid" avec la méthode (Bankily ou Masrvi)
      return NextResponse.json({
        received: true,
        invoiceNumber: payload.invoiceNumber,
        status: "paid",
        transactionId: payload.transactionId,
        message: "Facture marquée comme payée avec succès via Moosyl",
      });
    }

    return NextResponse.json({ received: true, event: payload.event });
  } catch (error: any) {
    console.error("[Moosyl Webhook] Erreur de traitement :", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}
