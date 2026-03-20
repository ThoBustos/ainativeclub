import { streamText, convertToModelMessages, isTextUIPart } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildSystemPrompt, fetchMemberContext } from "@/lib/ai/context";

export const maxDuration = 30;

export async function POST(req: Request) {
  // Verify auth via Supabase cookies — never trust client-provided identity
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const db = createAdminClient();

  // Get member by auth user — this is the source of truth
  const { data: memberRecord } = await db
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!memberRecord) {
    return new Response("Forbidden", { status: 403 });
  }

  const memberId = memberRecord.id;

  const { messages } = await req.json();

  // Extract text from the last user message for persistence
  const lastUserMessage = messages?.[messages.length - 1];
  const userText = lastUserMessage?.parts
    ?.filter(isTextUIPart)
    .map((p: { text: string }) => p.text)
    .join("") ?? "";

  // Persist user message before streaming
  if (userText) {
    await db.from("messages").insert({
      member_id: memberId,
      role: "user",
      content: userText,
    });
  }

  const context = await fetchMemberContext(memberId);
  if (!context) {
    return new Response("Member not found", { status: 404 });
  }

  const systemPrompt = buildSystemPrompt(context.member, context.goals, context.feed, context.events, context.calls);

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      if (text) {
        await db.from("messages").insert({
          member_id: memberId,
          role: "assistant",
          content: text,
        });
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
