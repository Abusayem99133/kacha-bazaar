export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          price: number
          image_url: string
          category: string
          stock: number
          admin_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          price: number
          image_url: string
          category: string
          stock: number
          admin_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          price?: number
          image_url?: string
          category?: string
          stock?: number
          admin_id?: string | null
        }
      }
      cart_items: {
        Row: {
          id: string
          created_at: string
          user_id: string
          product_id: string
          quantity: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          product_id: string
          quantity: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          product_id?: string
          quantity?: number
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          user_id: string
          total_amount: number
          status: string
          payment_intent_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          total_amount: number
          status: string
          payment_intent_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          total_amount?: number
          status?: string
          payment_intent_id?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          created_at: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Update: {
          id?: string
          created_at?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          role: string
        }
        Insert: {
          id: string
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: string
        }
        Update: {
          id?: string
          created_at?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          role?: string
        }
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
  }
}