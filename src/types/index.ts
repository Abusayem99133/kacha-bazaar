import { ProductType, CartItemType, OrderType } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: string;
}

export interface CartContextType {
  cartItems: CartItemWithProduct[];
  cartCount: number;
  addToCart: (product: ProductType, quantity: number) => Promise<void>;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
}

export interface CartItemWithProduct extends CartItemType {
  product: ProductType;
}

export interface BannerSlide {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}