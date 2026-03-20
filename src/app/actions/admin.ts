"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";
import { escapeHtml } from "@/lib/utils";
import { nextArrRung } from "@/types";
import type { ArrHistoryEntry, FeaturesEnabled, CallSchedule } from "@/types";
import type { Json } from "@/lib/database.types";
import { applyXpGrant } from "@/lib/xp";
import { computeNextCallDate } from "@/types";

async function requireAdmin() {
  const h = await headers();
  if (h.get("x-member-role") !== "admin") {
    throw new Error("Forbidden");
  }
}

// ─── Invite ───────────────────────────────────────────────────────────────────

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional().transform((v) => v?.trim() ?? ""),
});

export async function inviteMember(email: string, firstName: string, lastName: string) {
  await requireAdmin();

  const parsed = inviteSchema.safeParse({
    email: email.trim(),
    firstName: firstName.trim(),
    lastName,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { success: false as const, error: issue?.message || "Invalid input", emailSent: false };
  }

  const { email: normalizedEmail, firstName: validFirstName, lastName: validLastName } = parsed.data;

  const db = createAdminClient();
  const env = serverEnv();
  const resend = new Resend(env.RESEND_API_KEY);

  // Check for existing member
  const { data: existing } = await db
    .from("members")
    .select("id")
    .eq("email", normalizedEmail.toLowerCase())
    .maybeSingle();

  if (existing) {
    return { success: false as const, error: "A member with this email already exists.", emailSent: false };
  }

  const { error: memberError } = await db.from("members").insert({
    email: normalizedEmail.toLowerCase(),
    first_name: validFirstName,
    last_name: validLastName,
    role: "member",
    status: "active",
  });

  if (memberError) {
    return { success: false as const, error: "Failed to create member.", emailSent: false };
  }

  const e = (s: string) => escapeHtml(s);
  let emailSent = false;

  try {
    await resend.emails.send({
      from: "AI Native Club <hello@ainativeclub.com>",
      to: normalizedEmail,
      subject: "You're in. AI Native Club",
      html: `
        <p>Hey ${e(validFirstName)},</p>
        <p>Thomas has invited you to AI Native Club. Log in to access your portal and get set up before your first call.</p>
        <p><a href="https://app.ainativeclub.com/login">app.ainativeclub.com/login</a></p>
        <p>Thomas</p>
        <p style="color:#666;font-size:12px;margin-top:24px">AI Native Club</p>
      `,
    });
    emailSent = true;
  } catch (err) {
    console.error("Invite email failed:", err);
  }

  revalidatePath("/admin");
  return { success: true as const, emailSent };
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
      subject: "You're in. AI Native Club",
      html: `
        <p>Hey ${e(app.first_name)},</p>
        <p>You're approved. Log in to access your portal and get set up before our first call.</p>
        <p><a href="https://app.ainativeclub.com/login">app.ainativeclub.com/login</a></p>
        <p>Thomas</p>
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
      subject: "AI Native Club application update",
      html: `
        <p>Hey ${e(app.first_name)},</p>
        <p>Thank you for applying. After reviewing your application, we're not moving forward right now.</p>
        <p>Feel free to reach out if you have questions or want to reapply down the road.</p>
        <p>Thomas</p>
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

// ─── Call schedule ────────────────────────────────────────────────────────────

export async function setCallSchedule(memberId: string, schedule: CallSchedule | null, scheduleStart?: string) {
  await requireAdmin();
  const db = createAdminClient();

  const nextCallAt = schedule
    ? computeNextCallDate(schedule, scheduleStart ?? null, [])
    : null;

  await db.from("members").update({
    call_schedule: schedule as Json,
    call_schedule_start: scheduleStart ?? null,
    next_call_at: nextCallAt,
  }).eq("id", memberId);

  if (!schedule) {
    await db.from("call_skips").delete().eq("member_id", memberId);
  }

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/admin");
}

export async function skipNextCall(memberId: string, date: string) {
  await requireAdmin();
  const db = createAdminClient();

  await db.from("call_skips").upsert({ member_id: memberId, skipped_date: date });

  // Recompute next_call_at with the new skip included
  const { data: m } = await db
    .from("members")
    .select("call_schedule, call_schedule_start")
    .eq("id", memberId)
    .single();

  if (m?.call_schedule) {
    const { data: skips } = await db
      .from("call_skips")
      .select("skipped_date")
      .eq("member_id", memberId);

    const nextCallAt = computeNextCallDate(
      m.call_schedule as unknown as import("@/types").CallSchedule,
      m.call_schedule_start as string | null,
      (skips ?? []).map(s => s.skipped_date),
    );

    await db.from("members").update({ next_call_at: nextCallAt }).eq("id", memberId);
  }

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/admin");
}

// ─── Calls ────────────────────────────────────────────────────────────────────

export async function logCall(memberId: string, callDate: string, rawText: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { data, error } = await db.from("calls").insert({
    member_id: memberId,
    call_date: callDate,
    raw_text: rawText,
    status: "processing",
  }).select("id").single();
  if (error || !data) throw new Error("Failed to save call");
  const { inngest } = await import("@/inngest/client");
  await inngest.send({ name: "call/transcript.uploaded", data: { callId: data.id, memberId } });
  revalidatePath(`/admin/members/${memberId}`);
  return { callId: data.id };
}

export async function deleteCall(callId: string, memberId: string) {
  await requireAdmin();
  const db = createAdminClient();
  await db.from("calls").delete().eq("id", callId);
  revalidatePath(`/admin/members/${memberId}`);
}

export async function acceptGoalSuggestion(suggestionId: string, memberId: string) {
  await requireAdmin();
  const db = createAdminClient();

  const { data: suggestion } = await db
    .from("goal_suggestions")
    .select("title, xp")
    .eq("id", suggestionId)
    .single();

  if (!suggestion) throw new Error("Suggestion not found");

  await Promise.all([
    db.from("goal_suggestions").update({ status: "accepted" }).eq("id", suggestionId),
    db.from("goals").insert({ member_id: memberId, title: suggestion.title, xp: suggestion.xp }),
  ]);

  revalidatePath(`/admin/members/${memberId}`);
  revalidatePath("/portal");
}

export async function rejectGoalSuggestion(suggestionId: string, memberId: string) {
  await requireAdmin();
  const db = createAdminClient();
  await db.from("goal_suggestions").update({ status: "rejected" }).eq("id", suggestionId);
  revalidatePath(`/admin/members/${memberId}`);
}

// ─── Phone ────────────────────────────────────────────────────────────────────

export async function updateMemberPhone(memberId: string, phone: string) {
  await requireAdmin();
  const db = createAdminClient();
  // Normalize: store as E.164 (+1234567890), strip whatsapp: prefix if pasted
  const normalized = phone.replace(/^whatsapp:/i, "").trim() || null;
  const { error } = await db
    .from("members")
    .update({ phone: normalized })
    .eq("id", memberId);
  if (error) throw new Error("Failed to update phone: " + error.message);
  revalidatePath(`/admin/members/${memberId}`);
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
