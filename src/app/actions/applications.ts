"use server";

import { Resend } from "resend";
import { createServerClient } from "@/lib/supabase-server";

interface ApplicationData {
  email: string;
  firstName: string;
  lastName: string;
  building: string;
  website: string;
  github?: string;
  linkedin?: string;
  role: string;
  arr: string;
  painPoints: string;
}

export async function submitApplication(data: ApplicationData) {
  const supabase = createServerClient();
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Insert into Supabase
  const { error } = await supabase.from("applications").insert({
    email: data.email,
    first_name: data.firstName,
    last_name: data.lastName,
    building: data.building,
    website: data.website,
    github: data.github || null,
    linkedin: data.linkedin || null,
    role: data.role,
    arr: data.arr,
    pain_points: data.painPoints,
  });

  if (error) {
    console.error("Supabase error:", error);
    return { success: false, error: "Failed to save application" };
  }

  // Send notification email to admin
  try {
    await resend.emails.send({
      from: `AI Native Club <${process.env.RESEND_FROM_EMAIL || "notifications@ainativeclub.com"}>`,
      to: process.env.NOTIFICATION_EMAIL!,
      subject: `New Application: ${data.firstName} ${data.lastName}`,
      html: `
        <h2>New Application Received</h2>
        <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Role:</strong> ${data.role}</p>
        <p><strong>ARR:</strong> ${data.arr}</p>
        <p><strong>Building:</strong> ${data.building}</p>
        <p><strong>Website:</strong> ${data.website}</p>
        <p><strong>Challenge:</strong> ${data.painPoints}</p>
        ${data.github ? `<p><strong>GitHub:</strong> ${data.github}</p>` : ""}
        ${data.linkedin ? `<p><strong>LinkedIn:</strong> ${data.linkedin}</p>` : ""}
      `,
    });
  } catch (emailError) {
    console.error("Admin email error:", emailError);
  }

  // Send confirmation email to applicant
  try {
    await resend.emails.send({
      from: `AI Native Club <hello@ainativeclub.com>`,
      to: data.email,
      subject: "Application received",
      html: `
        <p>Hey ${data.firstName},</p>
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
