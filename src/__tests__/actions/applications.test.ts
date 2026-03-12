import { vi, describe, it, expect, beforeEach } from "vitest";
import { submitApplication } from "@/app/actions/applications";

const mockInsert = vi.hoisted(() => vi.fn().mockResolvedValue({ error: null }));
const mockEmailSend = vi.hoisted(() => vi.fn().mockResolvedValue({}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue("127.0.0.1"),
  }),
}));

vi.mock("@/lib/ratelimit", () => ({
  applicationRatelimit: {
    limit: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({ insert: mockInsert })),
  })),
}));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function(this: { emails: { send: typeof mockEmailSend } }) {
    this.emails = { send: mockEmailSend };
  }),
}));

vi.mock("@/lib/env", () => ({
  serverEnv: vi.fn(() => ({
    SUPABASE_SERVICE_ROLE_KEY: "test-service-key",
    RESEND_API_KEY: "test-resend-key",
    NOTIFICATION_EMAIL: "admin@test.com",
  })),
  clientEnv: {
    NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-key",
  },
}));

const validData = {
  email: "founder@startup.com",
  firstName: "John",
  lastName: "Doe",
  building: "AI-native CRM",
  website: "https://startup.com",
  github: "",
  linkedin: "",
  role: "technical-cofounder",
  arr: "20k-500k",
  painPoints: "Scaling the team",
};

describe("submitApplication", () => {
  beforeEach(() => {
    mockInsert.mockResolvedValue({ error: null });
    mockEmailSend.mockResolvedValue({});
  });

  it("accepts valid application", async () => {
    const result = await submitApplication(validData);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", async () => {
    const result = await submitApplication({ ...validData, email: "not-an-email" });
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("rejects empty building field", async () => {
    const result = await submitApplication({ ...validData, building: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid website URL", async () => {
    const result = await submitApplication({ ...validData, website: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("returns error on Supabase insert failure", async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: "DB error", code: "500" } });
    const result = await submitApplication(validData);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to save application");
  });
});
