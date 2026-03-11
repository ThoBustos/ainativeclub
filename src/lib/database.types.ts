export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          arr: string
          building: string
          created_at: string
          email: string
          first_name: string
          github: string | null
          id: string
          last_name: string
          linkedin: string | null
          pain_points: string
          role: string
          status: string
          website: string
        }
        Insert: {
          arr: string
          building: string
          created_at?: string
          email: string
          first_name: string
          github?: string | null
          id?: string
          last_name: string
          linkedin?: string | null
          pain_points: string
          role: string
          status?: string
          website: string
        }
        Update: {
          arr?: string
          building?: string
          created_at?: string
          email?: string
          first_name?: string
          github?: string | null
          id?: string
          last_name?: string
          linkedin?: string | null
          pain_points?: string
          role?: string
          status?: string
          website?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          member_id: string
          submitted_at: string | null
          title: string
          xp: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          member_id: string
          submitted_at?: string | null
          title: string
          xp?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          member_id?: string
          submitted_at?: string | null
          title?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "goals_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      level_events: {
        Row: {
          action: string
          created_at: string
          event_type: Database["public"]["Enums"]["level_event_type"]
          id: string
          level_after: number
          member_id: string
          xp: number
        }
        Insert: {
          action: string
          created_at?: string
          event_type: Database["public"]["Enums"]["level_event_type"]
          id?: string
          level_after: number
          member_id: string
          xp: number
        }
        Update: {
          action?: string
          created_at?: string
          event_type?: Database["public"]["Enums"]["level_event_type"]
          id?: string
          level_after?: number
          member_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "level_events_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          application_id: string | null
          arr_current: number
          arr_history: Json
          arr_target: number
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          email: string
          features_enabled: Json
          first_name: string | null
          id: string
          last_name: string | null
          level: number
          linkedin_url: string | null
          next_call_at: string | null
          onboarded_at: string | null
          phone: string | null
          role: Database["public"]["Enums"]["member_role"] | null
          status: Database["public"]["Enums"]["member_status"] | null
          updated_at: string | null
          user_id: string | null
          xp_current: number
        }
        Insert: {
          application_id?: string | null
          arr_current?: number
          arr_history?: Json
          arr_target?: number
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          features_enabled?: Json
          first_name?: string | null
          id?: string
          last_name?: string | null
          level?: number
          linkedin_url?: string | null
          next_call_at?: string | null
          onboarded_at?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["member_role"] | null
          status?: Database["public"]["Enums"]["member_status"] | null
          updated_at?: string | null
          user_id?: string | null
          xp_current?: number
        }
        Update: {
          application_id?: string | null
          arr_current?: number
          arr_history?: Json
          arr_target?: number
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          features_enabled?: Json
          first_name?: string | null
          id?: string
          last_name?: string | null
          level?: number
          linkedin_url?: string | null
          next_call_at?: string | null
          onboarded_at?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["member_role"] | null
          status?: Database["public"]["Enums"]["member_status"] | null
          updated_at?: string | null
          user_id?: string | null
          xp_current?: number
        }
        Relationships: [
          {
            foreignKeyName: "members_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          channel: string
          content: string
          created_at: string
          id: string
          member_id: string
          role: string
          twilio_sid: string | null
        }
        Insert: {
          channel?: string
          content: string
          created_at?: string
          id?: string
          member_id: string
          role: string
          twilio_sid?: string | null
        }
        Update: {
          channel?: string
          content?: string
          created_at?: string
          id?: string
          member_id?: string
          role?: string
          twilio_sid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          member_id: string
          notes: string | null
          scheduled_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          member_id: string
          notes?: string | null
          scheduled_at: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          member_id?: string
          notes?: string | null
          scheduled_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      thomas_feed: {
        Row: {
          created_at: string
          id: string
          member_id: string
          note: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_id: string
          note: string
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "thomas_feed_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      level_event_type: "goal_completed" | "call_attended" | "manual_grant" | "arr_update"
      member_role: "member" | "admin"
      member_status: "pending" | "active" | "suspended"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      level_event_type: ["goal_completed", "call_attended", "manual_grant", "arr_update"],
      member_role: ["member", "admin"],
      member_status: ["pending", "active", "suspended"],
    },
  },
} as const
