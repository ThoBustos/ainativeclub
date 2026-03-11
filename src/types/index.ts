/**
 * Centralized type exports for the application.
 * Import types from here instead of directly from database.types.ts
 */

export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  Json,
} from "@/lib/database.types";

// Convenience type aliases for common tables
import type { Tables, TablesInsert, TablesUpdate, Enums, Json } from "@/lib/database.types";

export type Application = Tables<"applications">;
export type ApplicationInsert = TablesInsert<"applications">;

export type Member = Tables<"members">;
export type MemberInsert = TablesInsert<"members">;
export type MemberUpdate = TablesUpdate<"members">;

export type Goal = Tables<"goals">;
export type GoalInsert = TablesInsert<"goals">;
export type GoalUpdate = TablesUpdate<"goals">;

export type LevelEvent = Tables<"level_events">;
export type LevelEventInsert = TablesInsert<"level_events">;

export type Session = Tables<"sessions">;
export type SessionInsert = TablesInsert<"sessions">;
export type SessionUpdate = TablesUpdate<"sessions">;

export type ThomasFeedEntry = Tables<"thomas_feed">;
export type ThomasFeedInsert = TablesInsert<"thomas_feed">;

export type Message = Tables<"messages">;
export type MessageInsert = TablesInsert<"messages">;

export type Waitlist = Tables<"waitlist">;

// Enum types
export type MemberRole = Enums<"member_role">;
export type MemberStatus = Enums<"member_status">;
export type LevelEventType = Enums<"level_event_type">;

// ARR milestone rungs — fixed ladder, $20K → $2M graduation
export const ARR_RUNGS = [20_000, 50_000, 100_000, 250_000, 500_000, 750_000, 1_000_000, 1_500_000, 2_000_000] as const;
export type ArrRung = typeof ARR_RUNGS[number];

/** Returns the next ARR milestone rung above current ARR. Returns 2_000_000 if already at top. */
export function nextArrRung(current: number): number {
  return ARR_RUNGS.find(r => r > current) ?? 2_000_000;
}

/** XP required to level up, based on ARR stage. */
export function xpToNextLevel(arrCurrent: number): number {
  if (arrCurrent < 100_000) return 100;
  if (arrCurrent < 500_000) return 150;
  return 200;
}

// Typed shape for arr_history JSONB entries
export type ArrHistoryEntry = {
  date: string;   // ISO date string
  value: number;  // ARR in dollars
  note: string;
};

// Typed shape for features_enabled JSONB
export type FeaturesEnabled = {
  session_log: boolean;
  insights: boolean;
  playbooks: boolean;
  community: boolean;
  peer_calls: boolean;
};

// Portal data bundle — what portal/page.tsx fetches and passes to PortalDashboard
export type PortalData = {
  member: Member;
  goals: Goal[];
  levelEvents: LevelEvent[];     // last 10, DESC
  nextSession: Session | null;   // next upcoming (completed_at IS NULL)
  pastSessions: Session[];       // completed sessions, DESC
  thomasFeed: ThomasFeedEntry[]; // last 5, DESC
  featuresEnabled: FeaturesEnabled;
  arrHistory: ArrHistoryEntry[];
  chatHistory: Message[];        // last 50, ASC (chronological for chat display)
};
