import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type ProductType = Database['public']['Tables']['products']['Row'];
export type CartItemType = Database['public']['Tables']['cart_items']['Row'];
export type OrderType = Database['public']['Tables']['orders']['Row'];