"use server";

import { z } from "zod";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";

// Zod schema for application data validation
const applicationSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  building: z.string().min(1, "Please describe what you're building"),
  website: z.string().url("Invalid website URL"),
  github: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  role: z.string().min(1, "Role is required"),
  arr: z.string().min(1, "ARR is required"),
  painPoints: z.string().min(1, "Please share your challenges"),
});

type ApplicationData = z.infer<typeof applicationSchema>;

export async function submitApplication(data: ApplicationData) {
  // Validate input
  const parsed = applicationSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid input",
    };
  }

  const validData = parsed.data;
  const env = serverEnv();
  const supabase = createAdminClient();
  const resend = new Resend(env.RESEND_API_KEY);

  // Insert into Supabase
  const { error } = await supabase.from("applications").insert({
    email: validData.email,
    first_name: validData.firstName,
    last_name: validData.lastName,
    building: validData.building,
    website: validData.website,
    github: validData.github || null,
    linkedin: validData.linkedin || null,
    role: validData.role,
    arr: validData.arr,
    pain_points: validData.painPoints,
  });

  if (error) {
    console.error("Supabase error:", error);
    return { success: false, error: "Failed to save application" };
  }

  // Send notification email to admin
  try {
    await resend.emails.send({
      from: `AI Native Club <${env.RESEND_FROM_EMAIL || "notifications@ainativeclub.com"}>`,
      to: env.NOTIFICATION_EMAIL,
      subject: `New Application: ${validData.firstName} ${validData.lastName}`,
      html: `
        <h2>New Application Received</h2>
        <p><strong>Name:</strong> ${validData.firstName} ${validData.lastName}</p>
        <p><strong>Email:</strong> ${validData.email}</p>
        <p><strong>Role:</strong> ${validData.role}</p>
        <p><strong>ARR:</strong> ${validData.arr}</p>
        <p><strong>Building:</strong> ${validData.building}</p>
        <p><strong>Website:</strong> ${validData.website}</p>
        <p><strong>Challenge:</strong> ${validData.painPoints}</p>
        ${validData.github ? `<p><strong>GitHub:</strong> ${validData.github}</p>` : ""}
        ${validData.linkedin ? `<p><strong>LinkedIn:</strong> ${validData.linkedin}</p>` : ""}
      `,
    });
  } catch (emailError) {
    console.error("Admin email error:", emailError);
  }

  // Send confirmation email to applicant
  try {
    await resend.emails.send({
      from: `AI Native Club <hello@ainativeclub.com>`,
      to: validData.email,
      subject: "Application received",
      html: `
        <p>Hey ${validData.firstName},</p>
        <p>Got your application. We review every one personally and will get back to you within 48 hours.</p>
        <p>In the meantime, if you have questions, just reply to this email.</p>
        <p>— Thomas</p>
        <p style="color: #666; font-size: 12px; margin-top: 24px;">AI Native Club</p>
      `,
    });
  } catch (emailError) {
    console.error("Confirmation email error:", emailError);
  }

  return { success: true };
}
