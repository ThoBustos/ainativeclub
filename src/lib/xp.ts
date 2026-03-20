import { createAdminClient } from "@/lib/supabase/admin";
import { xpToNextLevel } from "@/types";
import type { LevelEventType } from "@/types";

export async function applyXpGrant(
  db: ReturnType<typeof createAdminClient>,
  memberId: string,
  xp: number,
  action: string,
  eventType: LevelEventType,
) {
  const { data: m } = await db
    .from("members")
    .select("level, xp_current, arr_current")
    .eq("id", memberId)
    .single();

  if (!m) throw new Error("Member not found");

  const threshold = xpToNextLevel(m.arr_current);
  let xpNew = m.xp_current + xp;
  let levelNew = m.level;

  while (xpNew >= threshold) {
    xpNew -= threshold;
    levelNew++;
  }

  const [updateResult, insertResult] = await Promise.all([
    db.from("members").update({ xp_current: xpNew, level: levelNew }).eq("id", memberId),
    db.from("level_events").insert({
      member_id: memberId,
      event_type: eventType,
      action,
      xp,
      level_after: levelNew,
    }),
  ]);

  if (updateResult.error) throw new Error("XP update failed: " + updateResult.error.message);
  if (insertResult.error) throw new Error("Level event insert failed: " + insertResult.error.message);
}
