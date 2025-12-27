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
      bee_sightings: {
        Row: {
          address: string | null
          analysis_result: Json | null
          behavior: Database["public"]["Enums"]["colony_behavior"] | null
          confidence_score: number | null
          created_at: string
          id: string
          image_url: string | null
          latitude: number
          longitude: number
          notes: string | null
          proximity_warning: boolean | null
          species: Database["public"]["Enums"]["bee_species"] | null
          status: Database["public"]["Enums"]["sighting_status"] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          analysis_result?: Json | null
          behavior?: Database["public"]["Enums"]["colony_behavior"] | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          latitude: number
          longitude: number
          notes?: string | null
          proximity_warning?: boolean | null
          species?: Database["public"]["Enums"]["bee_species"] | null
          status?: Database["public"]["Enums"]["sighting_status"] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          analysis_result?: Json | null
          behavior?: Database["public"]["Enums"]["colony_behavior"] | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          latitude?: number
          longitude?: number
          notes?: string | null
          proximity_warning?: boolean | null
          species?: Database["public"]["Enums"]["bee_species"] | null
          status?: Database["public"]["Enums"]["sighting_status"] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          badges: Json | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          sightings_count: number | null
          updated_at: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          badges?: Json | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          sightings_count?: number | null
          updated_at?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          badges?: Json | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          sightings_count?: number | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      relocation_requests: {
        Row: {
          additional_notes: string | null
          completed_at: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          guardian_id: string | null
          id: string
          request_type: string
          requester_id: string | null
          scheduled_date: string | null
          sighting_id: string
          status: string | null
          updated_at: string
          urgency: string | null
        }
        Insert: {
          additional_notes?: string | null
          completed_at?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          guardian_id?: string | null
          id?: string
          request_type?: string
          requester_id?: string | null
          scheduled_date?: string | null
          sighting_id: string
          status?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          additional_notes?: string | null
          completed_at?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          guardian_id?: string | null
          id?: string
          request_type?: string
          requester_id?: string | null
          scheduled_date?: string | null
          sighting_id?: string
          status?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relocation_requests_sighting_id_fkey"
            columns: ["sighting_id"]
            isOneToOne: false
            referencedRelation: "bee_sightings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      bee_species:
        | "apis_dorsata"
        | "apis_cerana"
        | "apis_florea"
        | "apis_mellifera"
        | "unknown"
      colony_behavior: "calm" | "agitated" | "shimmering" | "unknown"
      sighting_status:
        | "reported"
        | "verified"
        | "relocated"
        | "monitoring"
        | "resolved"
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
      bee_species: [
        "apis_dorsata",
        "apis_cerana",
        "apis_florea",
        "apis_mellifera",
        "unknown",
      ],
      colony_behavior: ["calm", "agitated", "shimmering", "unknown"],
      sighting_status: [
        "reported",
        "verified",
        "relocated",
        "monitoring",
        "resolved",
      ],
    },
  },
} as const
