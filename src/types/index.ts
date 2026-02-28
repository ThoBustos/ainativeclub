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
import type { Tables, Enums } from "@/lib/database.types";

export type Application = Tables<"applications">;
export type ApplicationInsert = Tables<"applications">; // Same shape for insert
export type Member = Tables<"members">;
export type Waitlist = Tables<"waitlist">;

// Enum types
export type MemberRole = Enums<"member_role">;
export type MemberStatus = Enums<"member_status">;
