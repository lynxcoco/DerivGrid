export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          country: string | null
          referral_code: string | null
          referred_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          country?: string | null
          referral_code?: string | null
          referred_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          country?: string | null
          referral_code?: string | null
          referred_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          wallet_type: Database["public"]["Enums"]["wallet_type"]
          balance_cents: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wallet_type: Database["public"]["Enums"]["wallet_type"]
          balance_cents?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wallet_type?: Database["public"]["Enums"]["wallet_type"]
          balance_cents?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          wallet_id: string
          type: Database["public"]["Enums"]["transaction_type"]
          amount_cents: number
          currency: string
          description: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wallet_id: string
          type: Database["public"]["Enums"]["transaction_type"]
          amount_cents: number
          currency?: string
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wallet_id?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          amount_cents?: number
          currency?: string
          description?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      deposits: {
        Row: {
          id: string
          user_id: string
          wallet_id: string
          amount_cents: number
          currency: string
          method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["payment_status"]
          provider_ref: string | null
          phone: string | null
          payload: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wallet_id: string
          amount_cents: number
          currency?: string
          method: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"]
          provider_ref?: string | null
          phone?: string | null
          payload?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wallet_id?: string
          amount_cents?: number
          currency?: string
          method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"]
          provider_ref?: string | null
          phone?: string | null
          payload?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      withdrawals: {
        Row: {
          id: string
          user_id: string
          wallet_id: string
          amount_cents: number
          currency: string
          method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["payment_status"]
          provider_ref: string | null
          phone: string | null
          account_details: Json | null
          payload: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          wallet_id: string
          amount_cents: number
          currency?: string
          method: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"]
          provider_ref?: string | null
          phone?: string | null
          account_details?: Json | null
          payload?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wallet_id?: string
          amount_cents?: number
          currency?: string
          method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"]
          provider_ref?: string | null
          phone?: string | null
          account_details?: Json | null
          payload?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          symbol: string
          name: string
          category: Database["public"]["Enums"]["asset_category"]
          is_active: boolean
          pip_size: number
          contract_size: number
          created_at: string
        }
        Insert: {
          id?: string
          symbol: string
          name: string
          category: Database["public"]["Enums"]["asset_category"]
          is_active?: boolean
          pip_size?: number
          contract_size?: number
          created_at?: string
        }
        Update: {
          id?: string
          symbol?: string
          name?: string
          category?: Database["public"]["Enums"]["asset_category"]
          is_active?: boolean
          pip_size?: number
          contract_size?: number
          created_at?: string
        }
      }
      positions: {
        Row: {
          id: string
          user_id: string
          asset_id: string
          side: Database["public"]["Enums"]["trade_side"]
          lot_size: number
          entry_price: number
          exit_price: number | null
          take_profit: number | null
          stop_loss: number | null
          status: Database["public"]["Enums"]["position_status"]
          pnl_cents: number | null
          opened_at: string
          closed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          asset_id: string
          side: Database["public"]["Enums"]["trade_side"]
          lot_size: number
          entry_price: number
          exit_price?: number | null
          take_profit?: number | null
          stop_loss?: number | null
          status?: Database["public"]["Enums"]["position_status"]
          pnl_cents?: number | null
          opened_at?: string
          closed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          asset_id?: string
          side?: Database["public"]["Enums"]["trade_side"]
          lot_size?: number
          entry_price?: number
          exit_price?: number | null
          take_profit?: number | null
          stop_loss?: number | null
          status?: Database["public"]["Enums"]["position_status"]
          pnl_cents?: number | null
          opened_at?: string
          closed_at?: string | null
        }
      }
      price_alerts: {
        Row: {
          id: string
          user_id: string
          asset_id: string
          target_price: number
          condition: Database["public"]["Enums"]["alert_condition"]
          is_triggered: boolean
          note: string | null
          created_at: string
          triggered_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          asset_id: string
          target_price: number
          condition: Database["public"]["Enums"]["alert_condition"]
          is_triggered?: boolean
          note?: string | null
          created_at?: string
          triggered_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          asset_id?: string
          target_price?: number
          condition?: Database["public"]["Enums"]["alert_condition"]
          is_triggered?: boolean
          note?: string | null
          created_at?: string
          triggered_at?: string | null
        }
      }
      watchlist: {
        Row: {
          id: string
          user_id: string
          asset_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          asset_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          asset_id?: string
          created_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string
          subject: string
          status: Database["public"]["Enums"]["ticket_status"]
          priority: Database["public"]["Enums"]["ticket_priority"]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          status?: Database["public"]["Enums"]["ticket_status"]
          priority?: Database["public"]["Enums"]["ticket_priority"]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          priority?: Database["public"]["Enums"]["ticket_priority"]
          created_at?: string
          updated_at?: string
        }
      }
      ticket_messages: {
        Row: {
          id: string
          ticket_id: string
          user_id: string
          body: string
          is_staff: boolean
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          user_id: string
          body: string
          is_staff?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          user_id?: string
          body?: string
          is_staff?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string
          type: string
          is_read: boolean
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body: string
          type?: string
          is_read?: boolean
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string
          type?: string
          is_read?: boolean
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: { _user_id: string; _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      get_wallet_balance: {
        Args: { _user_id: string; _wallet_type: Database["public"]["Enums"]["wallet_type"] }
        Returns: number
      }
    }
    Enums: {
      app_role: "user" | "admin" | "support"
      wallet_type: "main" | "trading"
      transaction_type: "deposit" | "withdrawal" | "transfer_in" | "transfer_out" | "trade_profit" | "trade_loss" | "fee"
      payment_method: "mpesa" | "card" | "bank"
      payment_status: "pending" | "processing" | "completed" | "failed" | "cancelled"
      asset_category: "forex" | "synthetic" | "volatility" | "commodity" | "crypto" | "stock" | "index"
      trade_side: "buy" | "sell"
      position_status: "open" | "closed" | "cancelled"
      alert_condition: "above" | "below"
      ticket_status: "open" | "pending" | "resolved" | "closed"
      ticket_priority: "low" | "medium" | "high" | "urgent"
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

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin", "support"] as const,
      wallet_type: ["main", "trading"] as const,
      transaction_type: ["deposit", "withdrawal", "transfer_in", "transfer_out", "trade_profit", "trade_loss", "fee"] as const,
      payment_method: ["mpesa", "card", "bank"] as const,
      payment_status: ["pending", "processing", "completed", "failed", "cancelled"] as const,
      asset_category: ["forex", "synthetic", "volatility", "commodity", "crypto", "stock", "index"] as const,
      trade_side: ["buy", "sell"] as const,
      position_status: ["open", "closed", "cancelled"] as const,
      alert_condition: ["above", "below"] as const,
      ticket_status: ["open", "pending", "resolved", "closed"] as const,
      ticket_priority: ["low", "medium", "high", "urgent"] as const,
    },
  },
} as const
