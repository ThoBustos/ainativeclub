import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { handleWhatsAppMessage } from "@/inngest/whatsapp-reply";
import { processCallTranscript } from "@/inngest/transcript-processing";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [handleWhatsAppMessage, processCallTranscript],
});
