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
      documents: {
        Row: {
          content: string
          created_at: string
          number: number
          reference_numbers: number[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          number: number
          reference_numbers?: number[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          number?: number
          reference_numbers?: number[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_document: {
        Args: {
          p_user_id: string
          p_content?: string
          p_reference_numbers?: number[]
          p_title?: string
        }
        Returns: {
          user_id: string
          number: number
          title: string
          content: string
          reference_numbers: number[]
          created_at: string
          updated_at: string
        }[]
      }
      get_document_by_number: {
        Args: { doc_number: number }
        Returns: {
          id: string
          number: number
          title: string
          content: string
          parent_document_id: string
          parent_document_number: number
          referenced_document_ids: string[]
          referenced_document_numbers: number[]
          created_at: string
          updated_at: string
        }[]
      }
      get_document_hierarchy: {
        Args: { root_document_id: string }
        Returns: {
          id: string
          title: string
          level: number
          path: string[]
        }[]
      }
      get_document_hierarchy_by_number: {
        Args: { root_document_number: number }
        Returns: {
          id: string
          number: number
          title: string
          level: number
          path: number[]
        }[]
      }
      get_documents_referencing: {
        Args:
          | { p_user_id: string; p_target_number: number }
          | { target_document_id: string }
        Returns: {
          id: string
          title: string
          created_at: string
          updated_at: string
        }[]
      }
      get_documents_referencing_by_number: {
        Args: { target_document_number: number }
        Returns: {
          id: string
          number: number
          title: string
          created_at: string
          updated_at: string
        }[]
      }
      get_next_document_number: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_referenced_documents: {
        Args: { p_user_id: string; p_source_number: number }
        Returns: {
          user_id: string
          number: number
          title: string
          content: string
          created_at: string
          updated_at: string
        }[]
      }
      get_user_document: {
        Args: { p_user_id: string; p_number: number }
        Returns: {
          user_id: string
          number: number
          title: string
          content: string
          reference_numbers: number[]
          created_at: string
          updated_at: string
        }[]
      }
      search_user_documents: {
        Args: { p_user_id: string; p_search_term: string }
        Returns: {
          user_id: string
          number: number
          title: string
          content: string
          created_at: string
          updated_at: string
          rank: number
        }[]
      }
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

// Application specific types
export type SaveStatus = 'saving' | 'saved' | 'error' | 'pending' | 'idle'

export interface DocumentStats {
  wordCount: number
  charCount: number
  readabilityScore?: number
}

// Document type from database
export type Document = Database['public']['Tables']['documents']['Row']

export const Constants = {
  public: {
    Enums: {},
  },
} as const
