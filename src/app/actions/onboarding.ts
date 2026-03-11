"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { nextArrRung } from "@/types";
import type { ArrHistoryEntry } from "@/types";

export async function saveOnboardingData(
  memberId: string,
  data: { company: string; arrCurrent: number; obstacle: string }
) {
  const h = await headers();
  if (h.get("x-member-id") !== memberId) throw new Error("Forbidden");

  const db = createAdminClient();

  const arrTarget = nextArrRung(data.arrCurrent);

  const arrHistory: ArrHistoryEntry[] = [
    {
      date: new Date().toISOString().split("T")[0],
      value: data.arrCurrent,
      note: "Starting ARR at onboarding",
    },
  ];

  const { error } = await db
    .from("members")
    .update({
      company: data.company,
      arr_current: data.arrCurrent,
      arr_target: arrTarget,
      arr_history: arrHistory,
      bio: data.obstacle, // Thomas reads this before first session
    })
    .eq("id", memberId);

  if (error) throw new Error("Failed to save onboarding data");
}
