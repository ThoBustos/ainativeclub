import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { MemberDetail } from "./MemberDetail";

export const dynamic = "force-dynamic";

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createAdminClient();

  const [memberRes, goalsRes, eventsRes, sessionsRes, feedRes] = await Promise.all([
    db.from("members").select("*").eq("id", id).single(),
    db.from("goals").select("*").eq("member_id", id).order("created_at", { ascending: true }),
    db.from("level_events").select("*").eq("member_id", id).order("created_at", { ascending: false }).limit(20),
    db.from("sessions").select("*").eq("member_id", id).order("scheduled_at", { ascending: false }),
    db.from("thomas_feed").select("*").eq("member_id", id).order("created_at", { ascending: false }),
  ]);

  if (!memberRes.data) notFound();

  return (
    <MemberDetail
      member={memberRes.data}
      goals={goalsRes.data ?? []}
      levelEvents={eventsRes.data ?? []}
      sessions={sessionsRes.data ?? []}
      thomasFeed={feedRes.data ?? []}
    />
  );
}
