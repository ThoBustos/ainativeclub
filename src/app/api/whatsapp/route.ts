import { type NextRequest } from "next/server";
import twilio from "twilio";

import { inngest } from "@/inngest/client";
import { serverEnv } from "@/lib/env";

export const maxDuration = 10;

const EMPTY_TWIML = '<Response></Response>';
const XML_HEADERS = { "Content-Type": "text/xml" };

export async function POST(request: NextRequest): Promise<Response> {
  const env = serverEnv();

  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    console.error("[whatsapp] webhook called but Twilio env vars are not set");
    return new Response("Service not configured", { status: 503 });
  }

  // Twilio sends application/x-www-form-urlencoded
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = value.toString();
  });

  // Validate Twilio signature — reject anything not signed by our account
  const signature = request.headers.get("x-twilio-signature") ?? "";
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host = request.headers.get("host") ?? "";
  const url = `${proto}://${host}/api/whatsapp`;

  const valid = twilio.validateRequest(env.TWILIO_AUTH_TOKEN, signature, url, params);
  if (!valid) {
    console.warn("[whatsapp] invalid Twilio signature", { url });
    return new Response("Forbidden", { status: 403 });
  }

  const from = params["From"] ?? "";
  const body = params["Body"] ?? "";
  const messageSid = params["MessageSid"] ?? "";
  const numMedia = parseInt(params["NumMedia"] ?? "0", 10);

  // Ignore media messages for now — text only
  if (numMedia > 0 || !from || !body || !messageSid) {
    return new Response(EMPTY_TWIML, { status: 200, headers: XML_HEADERS });
  }

  // Hand off to Inngest immediately — reply is sent async via Twilio REST API
  await inngest.send({
    name: "whatsapp/message.received",
    data: { from, body, messageSid, numMedia },
  });

  // Empty TwiML response — Twilio requires 200 within ~5s
  return new Response(EMPTY_TWIML, { status: 200, headers: XML_HEADERS });
}
