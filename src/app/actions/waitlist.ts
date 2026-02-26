"use server";

import { createServerClient } from "@/lib/supabase-server";

export async function joinWaitlist(email: string) {
  const supabase = createServerClient();

  const { error } = await supabase.from("waitlist").insert({ email });

  if (error) {
    if (error.code === "23505") {
      // Unique violation - already on waitlist
      return { success: true, message: "Already on waitlist" };
    }
    console.error("Waitlist error:", error);
    return { success: false, error: "Failed to join waitlist" };
  }

  return { success: true };
}
