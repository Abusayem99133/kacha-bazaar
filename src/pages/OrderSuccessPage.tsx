import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = location.state || {};

  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-24 pt-32">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        
        <p className="text-gray-600 mb-2">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
        
        <div className="bg-gray-50 rounded-lg p-4 my-6">
          <p className="text-sm text-gray-500">Order Reference</p>
          <p className="font-medium">{orderId}</p>
        </div>
        
        <p className="mb-6 text-gray-600">
          We've sent a confirmation email with your order details and tracking information.
        </p>
        
        <div className="space-y-3">
          <Button asChild className="w-full bg-green-600 hover:bg-green-700">
            <Link to="/orders">
              <ShoppingBag className="mr-2 h-4 w-4" />
              View My Orders
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link to="/products">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}