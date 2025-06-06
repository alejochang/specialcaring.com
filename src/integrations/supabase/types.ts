export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          id_number: string
          id_type: string
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
      key_information: {
        Row: {
          additional_notes: string | null
          address: string
          birth_date: string
          created_at: string
          email: string | null
          emergency_contact: string
          emergency_phone: string
          full_name: string
          id: string
          insurance_number: string | null
          insurance_provider: string | null
          phone_number: string
          ssn: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_notes?: string | null
          address: string
          birth_date: string
          created_at?: string
          email?: string | null
          emergency_contact: string
          emergency_phone: string
          full_name: string
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          phone_number: string
          ssn?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_notes?: string | null
          address?: string
          birth_date?: string
          created_at?: string
          email?: string | null
          emergency_contact?: string
          emergency_phone?: string
          full_name?: string
          id?: string
          insurance_number?: string | null
          insurance_provider?: string | null
          phone_number?: string
          ssn?: string | null
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
          is_primary: boolean | null
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
          is_primary?: boolean | null
          name: string
          notes?: string | null
          phone_number: string
          specialty?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
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
          pharmacy: string | null
          prescribed_by: string | null
          purpose: string | null
          refill_date: string | null
          side_effects: string | null
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dosage: string
          end_date?: string | null
          frequency: string
          id?: string
          instructions?: string | null
          name: string
          pharmacy?: string | null
          prescribed_by?: string | null
          purpose?: string | null
          refill_date?: string | null
          side_effects?: string | null
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
          pharmacy?: string | null
          prescribed_by?: string | null
          purpose?: string | null
          refill_date?: string | null
          side_effects?: string | null
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
          category: string
          contact_phone: string
          created_at?: string
          dosage_or_size: string
          id?: string
          inventory_threshold?: number | null
          item_name: string
          last_order_date?: string | null
          notes?: string | null
          ordering_instructions?: string | null
          provider_name: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
