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
      bookings: {
        Row: {
          booking_type: string
          check_in: string | null
          check_out: string | null
          created_at: string | null
          guests: number | null
          id: string
          itinerary_id: string | null
          notes: string | null
          service_id: string | null
          status: string
          total_price: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_type: string
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          guests?: number | null
          id?: string
          itinerary_id?: string | null
          notes?: string | null
          service_id?: string | null
          status?: string
          total_price?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_type?: string
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          guests?: number | null
          id?: string
          itinerary_id?: string | null
          notes?: string | null
          service_id?: string | null
          status?: string
          total_price?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          participant_1: string
          participant_2: string
          service_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          participant_1: string
          participant_2: string
          service_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          participant_1?: string
          participant_2?: string
          service_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      itineraries: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_days: number | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          name: string
          points: Json | null
          price: number | null
          region_id: string | null
          short_description: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_days?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name: string
          points?: Json | null
          price?: number | null
          region_id?: string | null
          short_description?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_days?: number | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          name?: string
          points?: Json | null
          price?: number | null
          region_id?: string | null
          short_description?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itineraries_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_points: {
        Row: {
          balance: number
          created_at: string | null
          id: string
          total_earned: number
          total_redeemed: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          id?: string
          total_earned?: number
          total_redeemed?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          id?: string
          total_earned?: number
          total_redeemed?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          booking_id: string | null
          created_at: string | null
          description: string | null
          id: string
          points: number
          reward_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          points: number
          reward_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number
          reward_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      regions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          images: string[] | null
          location_id: string | null
          rating: number
          service_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          images?: string[] | null
          location_id?: string | null
          rating: number
          service_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          images?: string[] | null
          location_id?: string | null
          rating?: number
          service_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "tourist_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_redemptions: {
        Row: {
          code: string
          created_at: string | null
          id: string
          points_spent: number
          reward_id: string
          status: string
          user_id: string
        }
        Insert: {
          code?: string
          created_at?: string | null
          id?: string
          points_spent: number
          reward_id: string
          status?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          points_spent?: number
          reward_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          discount_percent: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          points_cost: number
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          points_cost: number
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          discount_percent?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          points_cost?: number
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          address: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          images: string[] | null
          is_available: boolean | null
          is_featured: boolean | null
          location_id: string | null
          name: string
          phone: string | null
          price: number | null
          price_unit: string | null
          provider_id: string
          region_id: string | null
          short_description: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          is_featured?: boolean | null
          location_id?: string | null
          name: string
          phone?: string | null
          price?: number | null
          price_unit?: string | null
          provider_id: string
          region_id?: string | null
          short_description?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          is_featured?: boolean | null
          location_id?: string | null
          name?: string
          phone?: string | null
          price?: number | null
          price_unit?: string | null
          provider_id?: string
          region_id?: string | null
          short_description?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "tourist_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      tourist_locations: {
        Row: {
          address: string | null
          category_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_virtual_tour: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          region_id: string | null
          short_description: string | null
          updated_at: string | null
          virtual_tour_url: string | null
        }
        Insert: {
          address?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_virtual_tour?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          region_id?: string | null
          short_description?: string | null
          updated_at?: string | null
          virtual_tour_url?: string | null
        }
        Update: {
          address?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_virtual_tour?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          region_id?: string | null
          short_description?: string | null
          updated_at?: string | null
          virtual_tour_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tourist_locations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tourist_locations_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      award_loyalty_points: {
        Args: {
          _booking_id?: string
          _description?: string
          _points: number
          _type?: string
          _user_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "tourist" | "provider"
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
      app_role: ["admin", "tourist", "provider"],
    },
  },
} as const
