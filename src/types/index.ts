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

export type ThomasFeedEntry = Tables<"thomas_feed">;
export type ThomasFeedInsert = TablesInsert<"thomas_feed">;

export type Message = Tables<"messages">;
export type MessageInsert = TablesInsert<"messages">;

export type Waitlist = Tables<"waitlist">;

export type GoalSuggestion = Tables<"goal_suggestions">;
export type GoalSuggestionInsert = TablesInsert<"goal_suggestions">;

export type Call = Tables<"calls">;
export type CallInsert = TablesInsert<"calls">;
export type CallSkip = Tables<"call_skips">;

export type CallWithSuggestions = Call & {
  goal_suggestions: GoalSuggestion[];
};

// Enum types
export type MemberRole = Enums<"member_role">;
export type MemberStatus = Enums<"member_status">;
export type LevelEventType = "goal_completed" | "call_attended" | "manual_grant" | "arr_update";

// ARR milestone rungs — fixed ladder, $20K → $2M graduation
export const ARR_RUNGS = [20_000, 50_000, 100_000, 250_000, 500_000, 750_000, 1_000_000, 1_500_000, 2_000_000] as const;
export type ArrRung = typeof ARR_RUNGS[number];

/** Returns the next ARR milestone rung above current ARR. Returns 2_000_000 if already at top. */
export function nextArrRung(current: number): number {
  return ARR_RUNGS.find(r => r > current) ?? 2_000_000;
}

/** XP required to level up. Higher ARR = lower threshold = faster progression. */
export function xpToNextLevel(arrCurrent: number): number {
  if (arrCurrent >= 500_000) return 100;
  if (arrCurrent >= 100_000) return 150;
  return 200;
}

/** Returns the rung directly below target — used as baseline for progress bar. */
export function prevArrRung(target: number): number {
  const idx = ARR_RUNGS.indexOf(target as ArrRung);
  return idx > 0 ? ARR_RUNGS[idx - 1] : 0;
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

// Call schedule JSONB shape
export interface CallSchedule {
  frequency: 'weekly' | 'biweekly';
  day_of_week: number; // 0=Sun, 1=Mon, ..., 6=Sat
  hour: number;        // 0-23
  minute: number;      // 0-59
  timezone: string;    // IANA timezone e.g. "Europe/Paris"
}

// Compute next call date from schedule
export function computeNextCallDate(
  schedule: CallSchedule,
  scheduleStart: string | null,
  skips: string[],
): string | null {
  const skipSet = new Set(skips);
  const now = new Date();
  const candidate = new Date(now);
  candidate.setDate(candidate.getDate() + 1);
  candidate.setHours(0, 0, 0, 0);

  for (let i = 0; i < 90; i++) {
    if (candidate.getDay() === schedule.day_of_week) {
      if (schedule.frequency === 'biweekly' && scheduleStart) {
        const start = new Date(scheduleStart);
        start.setHours(0, 0, 0, 0);
        const diffDays = Math.round((candidate.getTime() - start.getTime()) / 86400000);
        const diffWeeks = Math.floor(diffDays / 7);
        if (diffWeeks % 2 !== 0) {
          candidate.setDate(candidate.getDate() + 1);
          continue;
        }
      }
      const dateStr = candidate.toISOString().split('T')[0];
      if (!skipSet.has(dateStr)) return dateStr;
    }
    candidate.setDate(candidate.getDate() + 1);
  }
  return null;
}

// Portal data bundle — what portal/page.tsx fetches and passes to PortalDashboard
export type PortalData = {
  member: Member;
  goals: Goal[];
  levelEvents: LevelEvent[];     // last 10, DESC
  nextCallDate: string | null;   // computed from call_schedule
  calls: Call[];                 // published calls DESC
  thomasFeed: ThomasFeedEntry[]; // last 5, DESC
  featuresEnabled: FeaturesEnabled;
  arrHistory: ArrHistoryEntry[];
  chatHistory: Message[];        // last 50, ASC (chronological for chat display)
};
