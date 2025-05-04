import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, ProductType, CartItemType } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { CartContextType, CartItemWithProduct } from '@/types';
import { toast } from '@/hooks/use-toast';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCartItems = async () => {
    if (!user) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product: products (*)
        `)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setCartItems(data as CartItemWithProduct[]);
    } catch (error: any) {
      console.error('Error fetching cart items:', error.message);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  const addToCart = async (product: ProductType, quantity: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Check if product is in stock
      if (product.stock < quantity) {
        toast({
          title: "Out of Stock",
          description: "This product doesn't have enough stock",
          variant: "destructive",
        });
        return;
      }

      // Check if product already in cart
      const existingItem = cartItems.find(item => item.product_id === product.id);

      if (existingItem) {
        // Update quantity if already in cart
        const newQuantity = existingItem.quantity + quantity;
        
        if (product.stock < newQuantity) {
          toast({
            title: "Insufficient Stock",
            description: `Only ${product.stock} items available`,
            variant: "destructive",
          });
          return;
        }

        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Add new item to cart
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: quantity
          });

        if (error) throw error;
      }

      await fetchCartItems();
      toast({
        title: "Success",
        description: "Item added to cart!",
      });
    } catch (error: any) {
      console.error('Error adding to cart:', error.message);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCartItemQuantity = async (cartItemId: string, quantity: number) => {
    if (!user) return;

    setLoading(true);
    try {
      const cartItem = cartItems.find(item => item.id === cartItemId);
      if (!cartItem) return;

      if (cartItem.product.stock < quantity) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${cartItem.product.stock} items available`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) throw error;
      await fetchCartItems();
    } catch (error: any) {
      console.error('Error updating cart item:', error.message);
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      await fetchCartItems();
      toast({
        title: "Success",
        description: "Item removed from cart",
      });
    } catch (error: any) {
      console.error('Error removing from cart:', error.message);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems([]);
      toast({
        title: "Success",
        description: "Cart has been cleared",
      });
    } catch (error: any) {
      console.error('Error clearing cart:', error.message);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const contextValue: CartContextType = {
    cartItems,
    cartCount,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    loading,
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};