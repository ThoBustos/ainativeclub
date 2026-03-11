import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { handleWhatsAppMessage } from "@/inngest/whatsapp-reply";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [handleWhatsAppMessage],
});
