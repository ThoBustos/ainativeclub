import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { PortalData, FeaturesEnabled, ArrHistoryEntry } from "@/types";
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

  const [memberRes, goalsRes, eventsRes, sessionRes, pastSessionsRes, feedRes, messagesRes] = await Promise.all([
    db.from("members").select("*").eq("id", memberId).single(),
    db.from("goals").select("*").eq("member_id", memberId).order("created_at", { ascending: true }),
    db.from("level_events").select("*").eq("member_id", memberId).order("created_at", { ascending: false }).limit(10),
    db.from("sessions").select("*").eq("member_id", memberId).is("completed_at", null).order("scheduled_at", { ascending: true }).limit(1).maybeSingle(),
    db.from("sessions").select("*").eq("member_id", memberId).not("completed_at", "is", null).order("completed_at", { ascending: false }).limit(10),
    db.from("thomas_feed").select("*").eq("member_id", memberId).order("created_at", { ascending: false }).limit(5),
    db.from("messages").select("*").eq("member_id", memberId).order("created_at", { ascending: true }).limit(50),
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

  const portalData: PortalData = {
    member,
    goals: goalsRes.data ?? [],
    levelEvents: eventsRes.data ?? [],
    nextSession: sessionRes.data ?? null,
    pastSessions: pastSessionsRes.data ?? [],
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
