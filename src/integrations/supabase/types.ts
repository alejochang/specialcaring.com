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
      celebration_categories: {
        Row: {
          child_id: string
          color: string
          created_at: string
          icon: string
          id: string
          is_default: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          child_id: string
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_default?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          child_id?: string
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_default?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "celebration_categories_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
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
      documents: {
        Row: {
          category: string | null
          child_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          path: string
          size: number
          type: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          child_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          path: string
          size: number
          type: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          child_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          path?: string
          size?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_child_id_fkey"
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
          id_number_encrypted: string | null
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
          id_number_encrypted?: string | null
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
          id_number_encrypted?: string | null
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
      employment_agreements: {
        Row: {
          additional_terms: string | null
          caregiver_name: string
          child_id: string
          confidentiality_terms: string | null
          created_at: string
          duties: string | null
          emergency_procedures: string | null
          end_date: string | null
          hourly_rate: string | null
          id: string
          payment_frequency: string | null
          position_title: string
          start_date: string | null
          status: string
          termination_terms: string | null
          updated_at: string
          user_id: string
          work_schedule: string | null
        }
        Insert: {
          additional_terms?: string | null
          caregiver_name?: string
          child_id: string
          confidentiality_terms?: string | null
          created_at?: string
          duties?: string | null
          emergency_procedures?: string | null
          end_date?: string | null
          hourly_rate?: string | null
          id?: string
          payment_frequency?: string | null
          position_title?: string
          start_date?: string | null
          status?: string
          termination_terms?: string | null
          updated_at?: string
          user_id: string
          work_schedule?: string | null
        }
        Update: {
          additional_terms?: string | null
          caregiver_name?: string
          child_id?: string
          confidentiality_terms?: string | null
          created_at?: string
          duties?: string | null
          emergency_procedures?: string | null
          end_date?: string | null
          hourly_rate?: string | null
          id?: string
          payment_frequency?: string | null
          position_title?: string
          start_date?: string | null
          status?: string
          termination_terms?: string | null
          updated_at?: string
          user_id?: string
          work_schedule?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employment_agreements_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      encryption_keys: {
        Row: {
          created_at: string
          id: string
          key: string
          rotated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          rotated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          rotated_at?: string | null
        }
        Relationships: []
      }
      end_of_life_wishes: {
        Row: {
          additional_notes: string | null
          child_id: string
          created_at: string
          funeral_preferences: string | null
          id: string
          legal_guardian: string | null
          medical_directives: string | null
          organ_donation: string | null
          power_of_attorney: string | null
          preferred_hospital: string | null
          preferred_physician: string | null
          religious_cultural_wishes: string | null
          special_instructions: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_notes?: string | null
          child_id: string
          created_at?: string
          funeral_preferences?: string | null
          id?: string
          legal_guardian?: string | null
          medical_directives?: string | null
          organ_donation?: string | null
          power_of_attorney?: string | null
          preferred_hospital?: string | null
          preferred_physician?: string | null
          religious_cultural_wishes?: string | null
          special_instructions?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_notes?: string | null
          child_id?: string
          created_at?: string
          funeral_preferences?: string | null
          id?: string
          legal_guardian?: string | null
          medical_directives?: string | null
          organ_donation?: string | null
          power_of_attorney?: string | null
          preferred_hospital?: string | null
          preferred_physician?: string | null
          religious_cultural_wishes?: string | null
          special_instructions?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "end_of_life_wishes_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_legal_docs: {
        Row: {
          account_number: string | null
          account_number_encrypted: string | null
          child_id: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          doc_type: string
          expiry_date: string | null
          id: string
          institution: string | null
          notes: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          account_number_encrypted?: string | null
          child_id: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          doc_type?: string
          expiry_date?: string | null
          id?: string
          institution?: string | null
          notes?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          account_number_encrypted?: string | null
          child_id?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          doc_type?: string
          expiry_date?: string | null
          id?: string
          institution?: string | null
          notes?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_legal_docs_child_id_fkey"
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
      journey_moments: {
        Row: {
          child_id: string
          created_at: string
          how_we_celebrated: string | null
          id: string
          journey_id: string
          moment_date: string
          notes: string | null
          photo_url: string | null
          title: string
        }
        Insert: {
          child_id: string
          created_at?: string
          how_we_celebrated?: string | null
          id?: string
          journey_id: string
          moment_date?: string
          notes?: string | null
          photo_url?: string | null
          title: string
        }
        Update: {
          child_id?: string
          created_at?: string
          how_we_celebrated?: string | null
          id?: string
          journey_id?: string
          moment_date?: string
          notes?: string | null
          photo_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_moments_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_moments_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          category_id: string | null
          child_id: string
          created_at: string
          description: string | null
          id: string
          is_starred: boolean | null
          stage: string | null
          started_at: string
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          child_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_starred?: boolean | null
          stage?: string | null
          started_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          child_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_starred?: boolean | null
          stage?: string | null
          started_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journeys_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "celebration_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journeys_child_id_fkey"
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
          health_card_number_encrypted: string | null
          id: string
          insurance_number: string | null
          insurance_number_encrypted: string | null
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
          health_card_number_encrypted?: string | null
          id?: string
          insurance_number?: string | null
          insurance_number_encrypted?: string | null
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
          health_card_number_encrypted?: string | null
          id?: string
          insurance_number?: string | null
          insurance_number_encrypted?: string | null
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
          pharmacy: string | null
          prescriber: string | null
          purpose: string | null
          refill_date: string | null
          side_effects: string | null
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
          pharmacy?: string | null
          prescriber?: string | null
          purpose?: string | null
          refill_date?: string | null
          side_effects?: string | null
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
          pharmacy?: string | null
          prescriber?: string | null
          purpose?: string | null
          refill_date?: string | null
          side_effects?: string | null
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
      notification_preferences: {
        Row: {
          appointment_reminders: boolean
          care_team_updates: boolean
          created_at: string
          daily_log_reminders: boolean
          emergency_alerts: boolean
          medication_reminders: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_reminders?: boolean
          care_team_updates?: boolean
          created_at?: string
          daily_log_reminders?: boolean
          emergency_alerts?: boolean
          medication_reminders?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_reminders?: boolean
          care_team_updates?: boolean
          created_at?: string
          daily_log_reminders?: boolean
          emergency_alerts?: boolean
          medication_reminders?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
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
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
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
      security_audit_log: {
        Row: {
          accessed_at: string | null
          action: string
          child_id: string | null
          details: Json | null
          id: string
          ip_address: unknown
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          accessed_at?: string | null
          action: string
          child_id?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_at?: string | null
          action?: string
          child_id?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      emergency_cards_secure: {
        Row: {
          back_image: string | null
          child_id: string | null
          created_at: string | null
          expiry_date: string | null
          front_image: string | null
          id: string | null
          id_number: string | null
          id_type: string | null
          issue_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          back_image?: string | null
          child_id?: string | null
          created_at?: string | null
          expiry_date?: string | null
          front_image?: string | null
          id?: string | null
          id_number?: never
          id_type?: string | null
          issue_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          back_image?: string | null
          child_id?: string | null
          created_at?: string | null
          expiry_date?: string | null
          front_image?: string | null
          id?: string | null
          id_number?: never
          id_type?: string | null
          issue_date?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      financial_legal_docs_secure: {
        Row: {
          account_number: string | null
          child_id: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          description: string | null
          doc_type: string | null
          expiry_date: string | null
          id: string | null
          institution: string | null
          notes: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_number?: never
          child_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          doc_type?: string | null
          expiry_date?: string | null
          id?: string | null
          institution?: string | null
          notes?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_number?: never
          child_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          description?: string | null
          doc_type?: string | null
          expiry_date?: string | null
          id?: string | null
          institution?: string | null
          notes?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_legal_docs_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      key_information_secure: {
        Row: {
          additional_notes: string | null
          address: string | null
          allergies: string | null
          birth_date: string | null
          child_id: string | null
          created_at: string | null
          dislikes: string | null
          do_nots: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          full_name: string | null
          health_card_number: string | null
          id: string | null
          insurance_number: string | null
          insurance_provider: string | null
          likes: string | null
          medical_conditions: string | null
          phone_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          additional_notes?: string | null
          address?: string | null
          allergies?: string | null
          birth_date?: string | null
          child_id?: string | null
          created_at?: string | null
          dislikes?: string | null
          do_nots?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string | null
          health_card_number?: never
          id?: string | null
          insurance_number?: never
          insurance_provider?: string | null
          likes?: string | null
          medical_conditions?: string | null
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          additional_notes?: string | null
          address?: string | null
          allergies?: string | null
          birth_date?: string | null
          child_id?: string | null
          created_at?: string | null
          dislikes?: string | null
          do_nots?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string | null
          health_card_number?: never
          id?: string | null
          insurance_number?: never
          insurance_provider?: string | null
          likes?: string | null
          medical_conditions?: string | null
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string | null
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
    }
    Functions: {
      decrypt_sensitive: { Args: { cipher_text: string }; Returns: string }
      encrypt_sensitive: { Args: { plain_text: string }; Returns: string }
      get_audit_logs: {
        Args: {
          p_child_id?: string
          p_days_back?: number
          p_limit?: number
          p_table_name?: string
        }
        Returns: {
          accessed_at: string
          action: string
          child_id: string
          details: Json
          id: string
          record_id: string
          table_name: string
          user_id: string
        }[]
      }
      get_audit_summary: {
        Args: { p_days_back?: number }
        Returns: {
          deletes: number
          inserts: number
          table_name: string
          total_actions: number
          unique_users: number
          updates: number
        }[]
      }
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
      seed_celebration_categories: {
        Args: { p_child_id: string }
        Returns: undefined
      }
      verify_audit_triggers: {
        Args: never
        Returns: {
          has_audit_trigger: boolean
          table_name: string
        }[]
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
