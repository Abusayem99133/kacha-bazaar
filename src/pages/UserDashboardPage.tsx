import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { User, ShoppingCart, ShoppingBag, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';

interface UserOrderType {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  item_count: number;
}

export default function UserDashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<UserOrderType[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchOrders = async () => {
      try {
        // Get orders with count of items
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items:order_items(count)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        
        const formattedOrders = data.map(order => ({
          ...order,
          item_count: order.order_items[0].count
        }));
        
        setOrders(formattedOrders);
      } catch (error: any) {
        console.error('Error fetching orders:', error.message);
        toast({
          title: "Error",
          description: "Failed to load your orders",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user, navigate]);
  
  if (!user) return null;
  
  return (
    <div className="container mx-auto px-4 py-24 pt-32">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <User className="h-12 w-12 text-gray-600" />
                </div>
                <h2 className="text-xl font-semibold">
                  {profile?.first_name} {profile?.last_name}
                </h2>
                <p className="text-gray-500">{user.email}</p>
                
                <div className="w-full mt-6 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full border-green-600 text-green-600 hover:bg-green-50" 
                    asChild
                  >
                    <Link to="/profile/edit">Edit Profile</Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-green-600 text-green-600 hover:bg-green-50" 
                    asChild
                  >
                    <Link to="/orders">View All Orders</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest purchase history</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No orders yet</h3>
                  <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link to="/products">Start Shopping</Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2 font-medium">Order</th>
                        <th className="text-left pb-2 font-medium">Date</th>
                        <th className="text-left pb-2 font-medium">Items</th>
                        <th className="text-left pb-2 font-medium">Total</th>
                        <th className="text-left pb-2 font-medium">Status</th>
                        <th className="text-right pb-2 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b">
                          <td className="py-3">#{order.id.slice(0, 8)}</td>
                          <td className="py-3">{format(new Date(order.created_at), 'MMM d, yyyy')}</td>
                          <td className="py-3">{order.item_count}</td>
                          <td className="py-3">${order.total_amount.toFixed(2)}</td>
                          <td className="py-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/orders/${order.id}`}>Details</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {orders.length > 0 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" asChild>
                    <Link to="/orders">View All Orders</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">My Cart</h3>
                    <p className="text-sm text-gray-500">View and checkout your cart</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link to="/cart">Go to Cart</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <ClipboardList className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">My Wishlist</h3>
                    <p className="text-sm text-gray-500">View your saved items</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link to="/wishlist">View Wishlist</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}