"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { waitlistRatelimit } from "@/lib/ratelimit";

// Zod schema for email validation
const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export async function joinWaitlist(email: string) {
  // Rate limiting
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "127.0.0.1";
  const { success: rateLimitOk } = await waitlistRatelimit.limit(ip);
  if (!rateLimitOk) {
    return { success: false, error: "Too many submissions. Please try again later." };
  }

  // Validate input
  const parsed = waitlistSchema.safeParse({ email });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid email",
    };
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("waitlist").insert({ email: parsed.data.email });

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
