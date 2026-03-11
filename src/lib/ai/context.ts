import { createAdminClient } from "@/lib/supabase/admin";
import type { Member, Goal, ThomasFeedEntry, LevelEvent } from "@/types";
import { fmtArr } from "@/lib/format";

export type MemberContext = {
  member: Member;
  goals: Goal[];
  feed: ThomasFeedEntry[];
  events: LevelEvent[];
};

export async function fetchMemberContext(memberId: string): Promise<MemberContext | null> {
  const db = createAdminClient();
  const [memberRes, goalsRes, feedRes, eventsRes] = await Promise.all([
    db.from("members").select("*").eq("id", memberId).single(),
    db.from("goals").select("*").eq("member_id", memberId).order("created_at", { ascending: true }),
    db.from("thomas_feed").select("*").eq("member_id", memberId).order("created_at", { ascending: false }).limit(5),
    db.from("level_events").select("*").eq("member_id", memberId).order("created_at", { ascending: false }).limit(10),
  ]);

  if (!memberRes.data) return null;

  return {
    member: memberRes.data,
    goals: goalsRes.data ?? [],
    feed: feedRes.data ?? [],
    events: eventsRes.data ?? [],
  };
}

export function buildSystemPrompt(
  member: Member,
  goals: Goal[],
  feed: ThomasFeedEntry[],
  events: LevelEvent[],
): string {
  const name = [member.first_name, member.last_name].filter(Boolean).join(" ") || member.email;
  const activeGoals = goals.filter(g => !g.completed_at);
  const completedGoals = goals.filter(g => g.completed_at);

  const goalsBlock = activeGoals.length > 0
    ? activeGoals.map(g => `- ${g.title} (${g.xp} XP${g.submitted_at ? " — pending approval" : ""})`).join("\n")
    : "No active goals yet.";

  const completedBlock = completedGoals.length > 0
    ? completedGoals.slice(-5).map(g => `- ${g.title}`).join("\n")
    : "None yet.";

  const feedBlock = feed.length > 0
    ? feed.map(f => `[${new Date(f.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}] ${f.note}`).join("\n\n")
    : "No notes yet.";

  const eventsBlock = events.length > 0
    ? events.map(e => `[${new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}] ${e.action} (+${e.xp} XP → Level ${e.level_after})`).join("\n")
    : "No XP events yet.";

  return `You are an embedded AI advisor in the AI Native Club portal — a private community for technical co-founders on the $0 → $2M ARR path.

You are speaking directly with ${name}${member.company ? `, co-founder of ${member.company}` : ""}.

## Their Current Status
- Level: ${member.level} (${member.xp_current} XP)
- ARR: ${fmtArr(member.arr_current)} → ${fmtArr(member.arr_target)} target
${member.arr_current >= 2_000_000 ? "- Status: GRADUATED — reached $2M ARR" : ""}

## Active Goals (set by Thomas)
${goalsBlock}

## Recently Completed Goals
${completedBlock}

## Thomas's Notes (most recent first)
${feedBlock}

## Recent XP Events
${eventsBlock}

---

You are Thomas's AI counterpart. You know this founder's full arc. You speak directly, tactically, and with full context. You are here to help them move faster, think clearer, and act on what matters.

Reference their specific situation. Ask sharp questions. Help them unstick goals. Call out what's stuck. Be concise — founders are busy. Respond in plain text, no markdown headers. No em-dash. No AI slop.`;
}
