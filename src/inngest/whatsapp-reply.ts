import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import twilio from "twilio";

import { inngest } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchMemberContext, buildSystemPrompt } from "@/lib/ai/context";

export const handleWhatsAppMessage = inngest.createFunction(
  {
    id: "whatsapp-reply",
    idempotency: "event.data.messageSid",
  },
  { event: "whatsapp/message.received" },
  async ({ event, step }) => {
    const { from, body, messageSid } = event.data;
    // Normalize: "whatsapp:+1234567890" → "+1234567890"
    const phone = from.replace(/^whatsapp:/, "");
    const db = createAdminClient();

    // 1. Look up member by phone number
    const member = await step.run("lookup-member", async () => {
      const { data } = await db
        .from("members")
        .select("id")
        .eq("phone", phone)
        .maybeSingle();
      return data;
    });

    if (!member) {
      // Unknown number — politely decline and exit
      await step.run("unknown-number-reply", async () => {
        const client = twilio(
          process.env.TWILIO_ACCOUNT_SID!,
          process.env.TWILIO_AUTH_TOKEN!,
        );
        await client.messages.create({
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
          to: from,
          body: "I don't recognize this number. Log in to your AI Native Club portal to get started.",
        });
      });
      return;
    }

    // 2. Dedup — Twilio can retry webhooks; skip if we've already processed this sid
    const alreadyProcessed = await step.run("check-dedup", async () => {
      const { data } = await db
        .from("messages")
        .select("id")
        .eq("twilio_sid", messageSid)
        .maybeSingle();
      return !!data;
    });

    if (alreadyProcessed) return;

    // 3. Fetch member context + recent WhatsApp history in parallel
    const { context, history } = await step.run("fetch-context", async () => {
      const [ctx, histRes] = await Promise.all([
        fetchMemberContext(member.id),
        db
          .from("messages")
          .select("role, content")
          .eq("member_id", member.id)
          .eq("channel", "whatsapp")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      return {
        context: ctx,
        history: (histRes.data ?? []).reverse(),
      };
    });

    if (!context) return;

    // 4. Persist user message before generating reply
    await step.run("save-user-message", async () => {
      await db.from("messages").insert({
        member_id: member.id,
        role: "user",
        content: body,
        channel: "whatsapp",
        twilio_sid: messageSid,
      });
    });

    // 5. Generate AI reply (non-streaming — WhatsApp needs full text before sending)
    const reply = await step.run("generate-reply", async () => {
      const systemPrompt = buildSystemPrompt(
        context.member,
        context.goals,
        context.feed,
        context.events,
      );

      const messages = [
        ...history.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: body },
      ];

      const { text } = await generateText({
        model: anthropic("claude-sonnet-4-6"),
        system: systemPrompt,
        messages,
      });

      return text;
    });

    // 6. Persist assistant reply
    await step.run("save-assistant-message", async () => {
      await db.from("messages").insert({
        member_id: member.id,
        role: "assistant",
        content: reply,
        channel: "whatsapp",
      });
    });

    // 7. Send reply via Twilio REST API
    await step.run("send-reply", async () => {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID!,
        process.env.TWILIO_AUTH_TOKEN!,
      );
      await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: from,
        body: reply,
      });
    });
  },
);
