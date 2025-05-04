import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MinusCircle, PlusCircle, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function CartPage() {
  const { cartItems, updateCartItemQuantity, removeFromCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [processingItem, setProcessingItem] = useState<string | null>(null);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    setProcessingItem(cartItemId);
    try {
      await updateCartItemQuantity(cartItemId, newQuantity);
    } finally {
      setProcessingItem(null);
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    setProcessingItem(cartItemId);
    try {
      await removeFromCart(cartItemId);
    } finally {
      setProcessingItem(null);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add products to your cart before checkout",
        variant: "destructive",
      });
      return;
    }
    navigate('/checkout');
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto px-4 py-24 pt-32">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {cartLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : cartItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="h-16 w-16 text-gray-300" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Button asChild>
            <Link to="/products">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="divide-y">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={item.product.image_url} 
                        alt={item.product.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <Link 
                        to={`/products/${item.product_id}`}
                        className="text-lg font-medium hover:text-green-600"
                      >
                        {item.product.title}
                      </Link>
                      
                      <div className="mt-1 text-green-700 font-medium">
                        ${item.product.price.toFixed(2)}
                      </div>
                      
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center border rounded-md">
                          <button
                            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || !!processingItem}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 text-center min-w-[40px]">
                            {processingItem === item.id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock || !!processingItem}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <button
                          className="text-red-500 hover:text-red-700 flex items-center disabled:opacity-50"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={!!processingItem}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          <span className="text-sm">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <Button variant="outline" asChild className="flex items-center">
                <Link to="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold">Total</span>
                  <span className="text-xl font-semibold">${subtotal.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}