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
      child_access: {
        Row: {
          child_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["child_access_role"]
          user_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["child_access_role"]
          user_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["child_access_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_access_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      child_invites: {
        Row: {
          child_id: string
          created_at: string
          expires_at: string
          id: string
          invite_code: string
          invited_by: string
          invited_email: string | null
          role: Database["public"]["Enums"]["child_access_role"]
          status: string
        }
        Insert: {
          child_id: string
          created_at?: string
          expires_at?: string
          id?: string
          invite_code?: string
          invited_by: string
          invited_email?: string | null
          role?: Database["public"]["Enums"]["child_access_role"]
          status?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          invite_code?: string
          invited_by?: string
          invited_email?: string | null
          role?: Database["public"]["Enums"]["child_access_role"]
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_invites_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_log_entries: {
        Row: {
          category: string
          child_id: string
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
          child_id: string
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
          child_id?: string
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
        Relationships: [
          {
            foreignKeyName: "daily_log_entries_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_cards: {
        Row: {
          back_image: string | null
          child_id: string
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
          child_id: string
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
          child_id?: string
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
        Relationships: [
          {
            foreignKeyName: "emergency_cards_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_protocols: {
        Row: {
          additional_notes: string | null
          child_id: string
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
          child_id: string
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
          child_id?: string
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
        Relationships: [
          {
            foreignKeyName: "emergency_protocols_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      home_safety_checks: {
        Row: {
          check_id: string
          child_id: string
          completed_at: string
          id: string
          user_id: string
        }
        Insert: {
          check_id: string
          child_id: string
          completed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          check_id?: string
          child_id?: string
          completed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "home_safety_checks_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      key_information: {
        Row: {
          additional_notes: string | null
          address: string
          allergies: string | null
          birth_date: string
          child_id: string
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
          child_id: string
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
          child_id?: string
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
        Relationships: [
          {
            foreignKeyName: "key_information_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_contacts: {
        Row: {
          address: string | null
          child_id: string
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
          child_id: string
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
          child_id?: string
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
        Relationships: [
          {
            foreignKeyName: "medical_contacts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          child_id: string
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
          child_id: string
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
          child_id?: string
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
        Relationships: [
          {
            foreignKeyName: "medications_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
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
          child_id: string
          id: string
          saved_at: string
          service_id: string
          user_id: string
        }
        Insert: {
          child_id: string
          id?: string
          saved_at?: string
          service_id: string
          user_id: string
        }
        Update: {
          child_id?: string
          id?: string
          saved_at?: string
          service_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_community_services_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          brand_or_strength: string | null
          category: string
          child_id: string
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
          child_id: string
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
          child_id?: string
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
        Relationships: [
          {
            foreignKeyName: "suppliers_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean
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
      has_child_access: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_child_owner: {
        Args: { _child_id: string; _user_id: string }
        Returns: boolean
      }
      redeem_invite: {
        Args: { _invite_code: string; _user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "caregiver" | "viewer"
      child_access_role: "owner" | "caregiver" | "viewer"
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
      child_access_role: ["owner", "caregiver", "viewer"],
    },
  },
} as const
