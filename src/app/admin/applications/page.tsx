import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ApplicationsList } from "./ApplicationsList";

export const dynamic = "force-dynamic";

const MONO: React.CSSProperties = { fontFamily: "var(--font-geist-mono, monospace)" };
const T = { fgMute: "oklch(0.65 0 0)" };

async function ApplicationsFetcher() {
  const headersList = await headers();
  const role = headersList.get("x-member-role");
  if (role !== "admin") redirect("/");

  const db = createAdminClient();
  const { data } = await db
    .from("applications")
    .select("*")
    .in("status", ["pending", "reviewing"])
    .order("created_at", { ascending: false });

  return <ApplicationsList initialApps={data ?? []} />;
}

function ApplicationsLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <span style={{ ...MONO, fontSize: 13, color: T.fgMute }}>Loading...</span>
    </div>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<ApplicationsLoading />}>
      <ApplicationsFetcher />
    </Suspense>
  );
}
