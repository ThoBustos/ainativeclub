import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

import { inngest } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import { xpToNextLevel } from "@/types";
import { applyXpGrant } from "@/lib/xp";

const ExtractionSchema = z.object({
  summary: z.string(),
  key_learnings: z.array(z.string()),
  suggested_goals: z.array(z.object({
    title: z.string(),
    xp: z.number(),
  })),
});

export const processCallTranscript = inngest.createFunction(
  { id: "process-call-transcript", idempotency: "event.data.callId" },
  { event: "call/transcript.uploaded" },
  async ({ event, step }) => {
    const { callId, memberId } = event.data;
    const db = createAdminClient();

    async function markFailed() {
      await db.from("calls").update({ status: "failed" }).eq("id", callId);
    }

    try {
      // Step 1: Fetch call + member context
      const { rawText, member } = await step.run("fetch-data", async () => {
        const [cRes, mRes] = await Promise.all([
          db.from("calls").select("raw_text").eq("id", callId).single(),
          db.from("members").select("arr_current, first_name, company").eq("id", memberId).single(),
        ]);
        if (!cRes.data) throw new Error("Call not found");
        if (!mRes.data) throw new Error("Member not found");
        return { rawText: cRes.data.raw_text, member: mRes.data };
      });

      // Step 2: Extract via Claude structured output
      const extraction = await step.run("extract-with-claude", async () => {
        const threshold = xpToNextLevel(member.arr_current);
        const xpRange = threshold >= 200 ? "10-25" : threshold >= 150 ? "20-40" : "30-60";

        const { object } = await generateObject({
          model: anthropic("claude-sonnet-4-6"),
          schema: ExtractionSchema,
          prompt: `Analyze this call transcript for ${member.first_name}${member.company ? ` (${member.company})` : ""}.

Return:
- summary: 2-3 sentences. What was discussed and what was decided. Plain, direct. No em dashes. No filler phrases.
- key_learnings: up to 8 short statements. Decisions made, blockers named, wins logged, metrics mentioned, actions committed to. One sentence each. No em dashes. No filler.
- suggested_goals: 2-4 concrete goals that follow naturally from this session. Each goal should be actionable and specific. XP range: ${xpRange} based on effort.

No emojis. No markdown. No AI slop. Be direct.

Transcript:
${rawText}`,
        });

        return object;
      });

      // Step 3: Save extraction and auto-publish
      await step.run("save-extraction", async () => {
        await db.from("calls").update({
          summary: extraction.summary,
          key_learnings: extraction.key_learnings,
          status: "published",
        }).eq("id", callId);
      });

      // Step 4: Grant 100 XP for the call
      await step.run("grant-call-xp", async () => {
        await applyXpGrant(db, memberId, 100, "Call processed", "call_attended");
      });

      // Step 5: Insert goal suggestions
      if (extraction.suggested_goals.length > 0) {
        await step.run("save-goal-suggestions", async () => {
          await db.from("goal_suggestions").insert(
            extraction.suggested_goals.map(g => ({
              call_id: callId,
              member_id: memberId,
              title: g.title,
              xp: g.xp,
              status: "pending",
            }))
          );
        });
      }
    } catch (err) {
      await markFailed();
      throw err; // re-throw so Inngest logs it
    }
  },
);
