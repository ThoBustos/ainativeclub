import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { PortalData, FeaturesEnabled, ArrHistoryEntry, Call, CallSchedule } from "@/types";
import { computeNextCallDate } from "@/types";
import PortalLoading from "./loading";
import { PortalDashboard } from "./PortalDashboard";
import { OnboardingWizard } from "./OnboardingWizard";

export const dynamic = "force-dynamic";

async function PortalContent() {
  const headersList = await headers();
  const memberId = headersList.get("x-member-id");

  // Middleware guarantees this header on the app subdomain for active members.
  // This is a defensive fallback only.
  if (!memberId) {
    redirect("/login");
  }

  const db = createAdminClient();

  const [memberRes, goalsRes, eventsRes, callSkipsRes, feedRes, messagesRes, callsRes] = await Promise.all([
    db.from("members").select("*").eq("id", memberId).single(),
    db.from("goals").select("*").eq("member_id", memberId).order("created_at", { ascending: true }),
    db.from("level_events").select("*").eq("member_id", memberId).order("created_at", { ascending: false }).limit(10),
    db.from("call_skips").select("skipped_date").eq("member_id", memberId),
    db.from("thomas_feed").select("*").eq("member_id", memberId).order("created_at", { ascending: false }).limit(5),
    db.from("messages").select("*").eq("member_id", memberId).order("created_at", { ascending: true }).limit(50),
    db.from("calls")
      .select("id, call_date, summary, key_learnings, raw_text, created_at, member_id, status")
      .eq("member_id", memberId)
      .eq("status", "published")
      .order("call_date", { ascending: false }),
  ]);

  if (!memberRes.data) {
    redirect("/login");
  }

  const member = memberRes.data;

  const featuresEnabled: FeaturesEnabled = (member.features_enabled as FeaturesEnabled) ?? {
    session_log: false,
    insights: false,
    playbooks: false,
    community: false,
    peer_calls: false,
  };

  const arrHistory: ArrHistoryEntry[] = Array.isArray(member.arr_history)
    ? (member.arr_history as ArrHistoryEntry[])
    : [];

  const callSchedule = member.call_schedule as CallSchedule | null;
  const scheduleStart = member.call_schedule_start as string | null;
  const skips = (callSkipsRes.data ?? []).map(s => s.skipped_date);
  const nextCallDate = callSchedule ? computeNextCallDate(callSchedule, scheduleStart, skips) : null;

  const portalData: PortalData = {
    member,
    goals: goalsRes.data ?? [],
    levelEvents: eventsRes.data ?? [],
    nextCallDate,
    calls: (callsRes.data ?? []) as Call[],
    thomasFeed: feedRes.data ?? [],
    featuresEnabled,
    arrHistory,
    chatHistory: messagesRes.data ?? [],
  };

  // Sign out server action — passed to client component as prop
  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  // Not yet onboarded — show wizard (Phase 1: member fills in; Phase 2: Thomas activates)
  // Admins bypass onboarding entirely — Thomas should never be gated by his own flow.
  if (!member.onboarded_at && member.role !== "admin") {
    return <OnboardingWizard member={member} />;
  }

  return <PortalDashboard data={portalData} signOut={signOut} />;
}

export default function PortalPage() {
  return (
    <Suspense fallback={<PortalLoading />}>
      <PortalContent />
    </Suspense>
  );
}
