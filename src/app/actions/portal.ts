"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Member marks a goal as done (sets submitted_at).
 * Thomas approves in admin → sets completed_at and grants XP.
 * Completed goals (completed_at set) cannot be toggled.
 */
export async function toggleGoalSubmitted(goalId: string, submitted: boolean) {
  const h = await headers();
  const memberId = h.get("x-member-id");
  if (!memberId) throw new Error("Forbidden");

  const db = createAdminClient();

  // Verify goal belongs to the current member
  const { data: goal } = await db
    .from("goals")
    .select("member_id")
    .eq("id", goalId)
    .maybeSingle();

  if (!goal || goal.member_id !== memberId) throw new Error("Forbidden");

  const { error } = await db
    .from("goals")
    .update({ submitted_at: submitted ? new Date().toISOString() : null })
    .eq("id", goalId)
    .is("completed_at", null); // guard: never touch already-approved goals

  if (error) throw new Error("Failed to update goal");
  revalidatePath("/portal");
}
