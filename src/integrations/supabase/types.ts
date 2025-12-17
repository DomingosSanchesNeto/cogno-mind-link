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
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          password_hash: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          password_hash: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          password_hash?: string
        }
        Relationships: []
      }
      aut_responses: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          object_image_url: string | null
          object_name: string
          participant_id: string
          response_text: string | null
          started_at: string | null
          stimulus_id: string
          submitted_at: string | null
          version_tag: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          object_image_url?: string | null
          object_name: string
          participant_id: string
          response_text?: string | null
          started_at?: string | null
          stimulus_id: string
          submitted_at?: string | null
          version_tag?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          object_image_url?: string | null
          object_name?: string
          participant_id?: string
          response_text?: string | null
          started_at?: string | null
          stimulus_id?: string
          submitted_at?: string | null
          version_tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aut_responses_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aut_responses_stimulus_id_fkey"
            columns: ["stimulus_id"]
            isOneToOne: false
            referencedRelation: "aut_stimuli"
            referencedColumns: ["id"]
          },
        ]
      }
      aut_stimuli: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          instruction_text: string | null
          is_active: boolean
          object_name: string
          suggested_time_seconds: number | null
          updated_at: string
          version_tag: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          instruction_text?: string | null
          is_active?: boolean
          object_name: string
          suggested_time_seconds?: number | null
          updated_at?: string
          version_tag?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          instruction_text?: string | null
          is_active?: boolean
          object_name?: string
          suggested_time_seconds?: number | null
          updated_at?: string
          version_tag?: string | null
        }
        Relationships: []
      }
      dilemma_responses: {
        Row: {
          created_at: string
          dilemma_id: string
          duration_seconds: number | null
          id: string
          justification: string | null
          likert_value: number | null
          participant_id: string
          started_at: string | null
          submitted_at: string | null
          version_tag: string | null
        }
        Insert: {
          created_at?: string
          dilemma_id: string
          duration_seconds?: number | null
          id?: string
          justification?: string | null
          likert_value?: number | null
          participant_id: string
          started_at?: string | null
          submitted_at?: string | null
          version_tag?: string | null
        }
        Update: {
          created_at?: string
          dilemma_id?: string
          duration_seconds?: number | null
          id?: string
          justification?: string | null
          likert_value?: number | null
          participant_id?: string
          started_at?: string | null
          submitted_at?: string | null
          version_tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dilemma_responses_dilemma_id_fkey"
            columns: ["dilemma_id"]
            isOneToOne: false
            referencedRelation: "ethical_dilemmas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dilemma_responses_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      ethical_dilemmas: {
        Row: {
          created_at: string
          dilemma_text: string
          display_order: number
          id: string
          is_active: boolean
          likert_scale_type: number
          updated_at: string
          version_tag: string | null
        }
        Insert: {
          created_at?: string
          dilemma_text: string
          display_order?: number
          id?: string
          is_active?: boolean
          likert_scale_type?: number
          updated_at?: string
          version_tag?: string | null
        }
        Update: {
          created_at?: string
          dilemma_text?: string
          display_order?: number
          id?: string
          is_active?: boolean
          likert_scale_type?: number
          updated_at?: string
          version_tag?: string | null
        }
        Relationships: []
      }
      fiq_responses: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          participant_id: string
          presentation_order: number | null
          response_text: string | null
          started_at: string | null
          stimulus_id: string
          submitted_at: string | null
          version_tag: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          participant_id: string
          presentation_order?: number | null
          response_text?: string | null
          started_at?: string | null
          stimulus_id: string
          submitted_at?: string | null
          version_tag?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          participant_id?: string
          presentation_order?: number | null
          response_text?: string | null
          started_at?: string | null
          stimulus_id?: string
          submitted_at?: string | null
          version_tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fiq_responses_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiq_responses_stimulus_id_fkey"
            columns: ["stimulus_id"]
            isOneToOne: false
            referencedRelation: "fiq_stimuli"
            referencedColumns: ["id"]
          },
        ]
      }
      fiq_stimuli: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          question_text: string
          title: string
          updated_at: string
          version_tag: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          question_text: string
          title: string
          updated_at?: string
          version_tag?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          question_text?: string
          title?: string
          updated_at?: string
          version_tag?: string | null
        }
        Relationships: []
      }
      participants: {
        Row: {
          completed_at: string | null
          consent_given: boolean
          created_at: string
          device_type: string | null
          id: string
          participant_id: string
          screen_resolution: string | null
          started_at: string
          status: string
          tcle_version_tag: string | null
          user_agent: string | null
        }
        Insert: {
          completed_at?: string | null
          consent_given?: boolean
          created_at?: string
          device_type?: string | null
          id?: string
          participant_id?: string
          screen_resolution?: string | null
          started_at?: string
          status?: string
          tcle_version_tag?: string | null
          user_agent?: string | null
        }
        Update: {
          completed_at?: string | null
          consent_given?: boolean
          created_at?: string
          device_type?: string | null
          id?: string
          participant_id?: string
          screen_resolution?: string | null
          started_at?: string
          status?: string
          tcle_version_tag?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      screen_timestamps: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          participant_id: string
          screen_name: string
          started_at: string | null
          submitted_at: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          participant_id: string
          screen_name: string
          started_at?: string | null
          submitted_at?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          participant_id?: string
          screen_name?: string
          started_at?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "screen_timestamps_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      sociodemographic_data: {
        Row: {
          age: number | null
          ai_experience: boolean | null
          created_at: string
          education_level: string | null
          id: string
          participant_id: string
          profession: string | null
          sex: string | null
          socioeconomic_class: string | null
        }
        Insert: {
          age?: number | null
          ai_experience?: boolean | null
          created_at?: string
          education_level?: string | null
          id?: string
          participant_id: string
          profession?: string | null
          sex?: string | null
          socioeconomic_class?: string | null
        }
        Update: {
          age?: number | null
          ai_experience?: boolean | null
          created_at?: string
          education_level?: string | null
          id?: string
          participant_id?: string
          profession?: string | null
          sex?: string | null
          socioeconomic_class?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sociodemographic_data_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "participants"
            referencedColumns: ["id"]
          },
        ]
      }
      tcle_config: {
        Row: {
          content: string
          created_at: string
          file_url: string | null
          id: string
          is_active: boolean
          updated_at: string
          version_tag: string
        }
        Insert: {
          content: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          version_tag?: string
        }
        Update: {
          content?: string
          created_at?: string
          file_url?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          version_tag?: string
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
    Enums: {},
  },
} as const
