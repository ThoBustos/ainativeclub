"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";
import { escapeHtml } from "@/lib/utils";
import { xpToNextLevel, nextArrRung } from "@/types";
import type { LevelEventType, ArrHistoryEntry, FeaturesEnabled } from "@/types";

async function requireAdmin() {
  const h = await headers();
  if (h.get("x-member-role") !== "admin") {
    throw new Error("Forbidden");
  }
}

// ─── Internal XP helper ───────────────────────────────────────────────────────
// Adds XP to a member, handles level-ups, inserts level_event row.

async function applyXpGrant(
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

  // Handle level-ups (including multi-level from large grants)
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

// ─── Applications ─────────────────────────────────────────────────────────────

export async function approveApplication(applicationId: string) {
  await requireAdmin();
  const db = createAdminClient();
  const env = serverEnv();
  const resend = new Resend(env.RESEND_API_KEY);

  const { data: app } = await db
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .single();

  if (!app) throw new Error("Application not found");

  // Create member record (user_id linked on first login via auth/callback)
  const { error: memberError } = await db.from("members").insert({
    email: app.email,
    first_name: app.first_name,
    last_name: app.last_name,
    company: app.building, // Thomas can refine in member detail
    role: "member",
    status: "active",
    application_id: applicationId,
  });

  if (memberError) throw new Error("Failed to create member: " + memberError.message);

  // Mark application accepted
  await db.from("applications").update({ status: "accepted" }).eq("id", applicationId);

  const e = (s: string) => escapeHtml(s);

  // Welcome email
  try {
    await resend.emails.send({
      from: "AI Native Club <hello@ainativeclub.com>",
      to: app.email,
      subject: "You're in — AI Native Club",
      html: `
        <p>Hey ${e(app.first_name)},</p>
        <p>You're approved. Log in to access your portal and get set up before our first call.</p>
        <p><a href="https://app.ainativeclub.com/login">app.ainativeclub.com/login</a></p>
        <p>— Thomas</p>
        <p style="color:#666;font-size:12px;margin-top:24px">AI Native Club</p>
      `,
    });
  } catch (err) {
    console.error("Welcome email failed:", err);
  }

  revalidatePath("/admin/applications");
  revalidatePath("/admin");
}

export async function rejectApplication(applicationId: string) {
  await requireAdmin();
  const db = createAdminClient();
  const env = serverEnv();
  const resend = new Resend(env.RESEND_API_KEY);

  const { data: app } = await db
    .from("applications")
    .select("email, first_name")
    .eq("id", applicationId)
    .single();

  if (!app) throw new Error("Application not found");

  await db.from("applications").update({ status: "rejected" }).eq("id", applicationId);

  const e = (s: string) => escapeHtml(s);

  try {
    await resend.emails.send({
      from: "AI Native Club <hello@ainativeclub.com>",
      to: app.email,
      subject: "AI Native Club — application update",
      html: `
        <p>Hey ${e(app.first_name)},</p>
        <p>Thank you for applying. After reviewing your application, we're not moving forward right now.</p>
        <p>Feel free to reach out if you have questions or want to reapply down the road.</p>
        <p>— Thomas</p>
        <p style="color:#666;font-size:12px;margin-top:24px">AI Native Club</p>
      `,
    });
  } catch (err) {
    console.error("Rejection email failed:", err);
  }

  revalidatePath("/admin/applications");
}

// ─── Member status ────────────────────────────────────────────────────────────

export async function activateMember(memberId: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db
    .from("members")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", memberId);

  if (error) throw new Error("Failed to activate: " + error.message);
  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/admin");
}

export async function suspendMember(memberId: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db
    .from("members")
    .update({ status: "suspended" })
    .eq("id", memberId);

  if (error) throw new Error("Failed to suspend: " + error.message);
  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/admin");
}

export async function reactivateMember(memberId: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db
    .from("members")
    .update({ status: "active" })
    .eq("id", memberId);

  if (error) throw new Error("Failed to reactivate: " + error.message);
  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/admin");
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export async function addGoal(memberId: string, title: string, xp: number) {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("goals").insert({ member_id: memberId, title, xp });
  if (error) throw new Error("Failed to add goal: " + error.message);
  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/portal");
}

export async function deleteGoal(goalId: string, memberId: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("goals").delete().eq("id", goalId);
  if (error) throw new Error("Failed to delete goal: " + error.message);
  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/portal");
}

export async function approveGoal(goalId: string, memberId: string) {
  await requireAdmin();
  const db = createAdminClient();

  // Get goal title + XP before approving
  const { data: goal } = await db
    .from("goals")
    .select("title, xp")
    .eq("id", goalId)
    .is("completed_at", null)
    .single();

  if (!goal) throw new Error("Goal not found or already approved");

  // Mark completed
  const { error } = await db
    .from("goals")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", goalId);

  if (error) throw new Error("Failed to approve goal: " + error.message);

  // Grant XP
  await applyXpGrant(db, memberId, goal.xp, goal.title, "goal_completed");

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/portal");
}

// ─── XP grants ────────────────────────────────────────────────────────────────

export async function grantXp(
  memberId: string,
  xp: number,
  action: string,
  eventType: "call_attended" | "manual_grant",
) {
  await requireAdmin();
  const db = createAdminClient();
  await applyXpGrant(db, memberId, xp, action, eventType);
  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/portal");
}

// ─── ARR ──────────────────────────────────────────────────────────────────────

export async function updateArrCurrent(memberId: string, value: number, note: string) {
  await requireAdmin();
  const db = createAdminClient();

  // Get current arr_history
  const { data: m } = await db
    .from("members")
    .select("arr_history")
    .eq("id", memberId)
    .single();

  if (!m) throw new Error("Member not found");

  const existing: ArrHistoryEntry[] = Array.isArray(m.arr_history)
    ? (m.arr_history as ArrHistoryEntry[])
    : [];

  const newEntry: ArrHistoryEntry = {
    date: new Date().toISOString().split("T")[0],
    value,
    note,
  };

  const { error } = await db.from("members").update({
    arr_current: value,
    arr_target: nextArrRung(value),
    arr_history: [...existing, newEntry],
  }).eq("id", memberId);

  if (error) throw new Error("Failed to update ARR: " + error.message);

  // +5 XP for ARR update
  await applyXpGrant(db, memberId, 5, `ARR updated to ${note || `$${value.toLocaleString()}`}`, "arr_update");

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/portal");
}

// ─── Thomas Feed ──────────────────────────────────────────────────────────────

export async function addThomasFeedNote(memberId: string, note: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("thomas_feed").insert({ member_id: memberId, note });
  if (error) throw new Error("Failed to add note: " + error.message);
  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/portal");
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function scheduleSession(memberId: string, scheduledAt: string) {
  await requireAdmin();
  const db = createAdminClient();

  // Store scheduled time and update next_call_at on member
  const [sessionResult] = await Promise.all([
    db.from("sessions").insert({ member_id: memberId, scheduled_at: scheduledAt }),
    db.from("members").update({ next_call_at: scheduledAt }).eq("id", memberId),
  ]);

  if (sessionResult.error) throw new Error("Failed to schedule session: " + sessionResult.error.message);

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/portal");
}

export async function completeSession(sessionId: string, memberId: string, notes: string) {
  await requireAdmin();
  const db = createAdminClient();

  const { error } = await db.from("sessions").update({
    completed_at: new Date().toISOString(),
    notes,
  }).eq("id", sessionId);

  if (error) throw new Error("Failed to complete session: " + error.message);

  // Clear next_call_at — will be re-set when next session is scheduled
  await db.from("members").update({ next_call_at: null }).eq("id", memberId);

  // +25 XP for attending the call
  await applyXpGrant(db, memberId, 25, "Call attended", "call_attended");

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/portal");
}

// ─── Features ─────────────────────────────────────────────────────────────────

export async function updateFeature(
  memberId: string,
  feature: keyof FeaturesEnabled,
  enabled: boolean,
) {
  await requireAdmin();
  const db = createAdminClient();

  const { data: m } = await db
    .from("members")
    .select("features_enabled")
    .eq("id", memberId)
    .single();

  if (!m) throw new Error("Member not found");

  const current: FeaturesEnabled = (m.features_enabled as FeaturesEnabled) ?? {
    session_log: false,
    insights: false,
    playbooks: false,
    community: false,
    peer_calls: false,
  };

  const { error } = await db
    .from("members")
    .update({ features_enabled: { ...current, [feature]: enabled } })
    .eq("id", memberId);

  if (error) throw new Error("Failed to update feature: " + error.message);

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/portal");
}
