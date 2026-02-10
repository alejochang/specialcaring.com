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
      daily_log_entries: {
        Row: {
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          mood: string
          priority: string
          tags: string[] | null
          time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          mood?: string
          priority?: string
          tags?: string[] | null
          time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          mood?: string
          priority?: string
          tags?: string[] | null
          time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      emergency_cards: {
        Row: {
          back_image: string | null
          created_at: string
          expiry_date: string | null
          front_image: string | null
          id: string
          id_number: string
          id_type: string
          issue_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          back_image?: string | null
          created_at?: string
          expiry_date?: string | null
          front_image?: string | null
          id?: string
          id_number?: string
          id_type?: string
          issue_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          back_image?: string | null
          created_at?: string
          expiry_date?: string | null
          front_image?: string | null
          id?: string
          id_number?: string
          id_type?: string
          issue_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      emergency_protocols: {
        Row: {
          additional_notes: string | null
          created_at: string
          emergency_contacts: string
          id: string
          immediate_steps: string
          severity: string
          title: string
          updated_at: string
          user_id: string
          when_to_call_911: string | null
        }
        Insert: {
          additional_notes?: string | null
          created_at?: string
          emergency_contacts?: string
          id?: string
          immediate_steps?: string
          severity?: string
          title: string
          updated_at?: string
          user_id: string
          when_to_call_911?: string | null
        }
        Update: {
          additional_notes?: string | null
          created_at?: string
          emergency_contacts?: string
          id?: string
          immediate_steps?: string
          severity?: string
          title?: string
          updated_at?: string
          user_id?: string
          when_to_call_911?: string | null
        }
        Relationships: []
      }
      home_safety_checks: {
        Row: {
          check_id: string
          completed_at: string
          id: string
          user_id: string
        }
        Insert: {
          check_id: string
          completed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          check_id?: string
          completed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      key_information: {
        Row: {
          additional_notes: string | null
          address: string
          allergies: string | null
          birth_date: string
          created_at: string
          dislikes: string | null
          do_nots: string | null
          email: string | null
          emergency_contact: string
          emergency_phone: string
          full_name: string
          health_card_number: string | null
          id: string
          insurance_number: string | null
          insurance_provider: string | null
          likes: string | null
          medical_conditions: string | null
          phone_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_notes?: string | null
          address?: string
          allergies?: string | null
          birth_date?: string
          created_at?: string
          dislikes?: string | null
          do_nots?: string | null
          email?: string | null
          emergency_contact?: string
          emergency_phone?: string
          full_name?: string
          health_card_number?: string | null
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          likes?: string | null
          medical_conditions?: string | null
          phone_number?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_notes?: string | null
          address?: string
          allergies?: string | null
          birth_date?: string
          created_at?: string
          dislikes?: string | null
          do_nots?: string | null
          email?: string | null
          emergency_contact?: string
          emergency_phone?: string
          full_name?: string
          health_card_number?: string | null
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          likes?: string | null
          medical_conditions?: string | null
          phone_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medical_contacts: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          is_primary: boolean
          name: string
          notes: string | null
          phone_number: string
          specialty: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          name: string
          notes?: string | null
          phone_number?: string
          specialty?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          name?: string
          notes?: string | null
          phone_number?: string
          specialty?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string
          dosage: string
          end_date: string | null
          frequency: string
          id: string
          instructions: string | null
          name: string
          prescriber: string | null
          purpose: string | null
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          name: string
          prescriber?: string | null
          purpose?: string | null
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dosage?: string
          end_date?: string | null
          frequency?: string
          id?: string
          instructions?: string | null
          name?: string
          prescriber?: string | null
          purpose?: string | null
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_community_services: {
        Row: {
          id: string
          saved_at: string
          service_id: string
          user_id: string
        }
        Insert: {
          id?: string
          saved_at?: string
          service_id: string
          user_id: string
        }
        Update: {
          id?: string
          saved_at?: string
          service_id?: string
          user_id?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          brand_or_strength: string | null
          category: string
          contact_phone: string
          created_at: string
          dosage_or_size: string
          id: string
          inventory_threshold: number | null
          item_name: string
          last_order_date: string | null
          notes: string | null
          ordering_instructions: string | null
          provider_name: string
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          brand_or_strength?: string | null
          category?: string
          contact_phone?: string
          created_at?: string
          dosage_or_size?: string
          id?: string
          inventory_threshold?: number | null
          item_name: string
          last_order_date?: string | null
          notes?: string | null
          ordering_instructions?: string | null
          provider_name?: string
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          brand_or_strength?: string | null
          category?: string
          contact_phone?: string
          created_at?: string
          dosage_or_size?: string
          id?: string
          inventory_threshold?: number | null
          item_name?: string
          last_order_date?: string | null
          notes?: string | null
          ordering_instructions?: string | null
          provider_name?: string
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "caregiver" | "viewer"
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
      app_role: ["admin", "caregiver", "viewer"],
    },
  },
} as const
