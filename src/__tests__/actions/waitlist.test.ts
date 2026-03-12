import { vi, describe, it, expect, beforeEach } from "vitest";
import { joinWaitlist } from "@/app/actions/waitlist";

const mockInsert = vi.hoisted(() => vi.fn().mockResolvedValue({ error: null }));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue("127.0.0.1"),
  }),
}));

vi.mock("@/lib/ratelimit", () => ({
  waitlistRatelimit: {
    limit: vi.fn().mockResolvedValue({ success: true }),
  },
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({ insert: mockInsert })),
  })),
}));

describe("joinWaitlist", () => {
  beforeEach(() => {
    mockInsert.mockResolvedValue({ error: null });
  });

  it("accepts valid email", async () => {
    const result = await joinWaitlist("test@example.com");
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", async () => {
    const result = await joinWaitlist("not-an-email");
    expect(result.success).toBe(false);
  });

  it("handles duplicate email gracefully", async () => {
    mockInsert.mockResolvedValueOnce({ error: { code: "23505", message: "duplicate" } });
    const result = await joinWaitlist("test@example.com");
    expect(result.success).toBe(true);
    expect(result.message).toBe("Already on waitlist");
  });

  it("returns error on Supabase failure", async () => {
    mockInsert.mockResolvedValueOnce({ error: { code: "500", message: "DB error" } });
    const result = await joinWaitlist("test@example.com");
    expect(result.success).toBe(false);
  });
});
