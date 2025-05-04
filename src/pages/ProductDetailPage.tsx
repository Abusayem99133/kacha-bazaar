import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, ProductType } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MinusCircle, PlusCircle, ShoppingCart } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);
        
        if (data) {
          // Fetch related products in the same category
          const { data: relatedData, error: relatedError } = await supabase
            .from('products')
            .select('*')
            .eq('category', data.category)
            .neq('id', id)
            .limit(4);
            
          if (!relatedError) {
            setRelatedProducts(relatedData || []);
          }
        }
      } catch (error: any) {
        console.error('Error fetching product:', error.message);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    setAddingToCart(true);
    try {
      await addToCart(product, quantity);
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 pt-32">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 pt-32">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/products')}>Back to Products</Button>
        </div>
      </div>
    );
  }

  const isInStock = product.stock > 0;

  return (
    <div className="container mx-auto px-4 py-24 pt-32">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-lg bg-gray-100">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-auto object-cover"
          />
          <Badge 
            className={cn(
              "absolute top-4 left-4",
              isInStock 
                ? "bg-green-600 hover:bg-green-600" 
                : "bg-red-600 hover:bg-red-600"
            )}
          >
            {isInStock ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <p className="text-2xl text-green-700 font-semibold mb-4">${product.price.toFixed(2)}</p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-500 mb-2">Availability:</p>
            <p className={cn(
              "font-medium",
              isInStock ? "text-green-600" : "text-red-600"
            )}>
              {isInStock ? `In Stock (${product.stock} items)` : 'Out of Stock'}
            </p>
          </div>
          
          <p className="text-gray-700 mb-8">{product.description}</p>

          {isInStock && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <p className="font-medium">Quantity:</p>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button 
                className="w-full md:w-auto bg-green-600 hover:bg-green-700"
                size="lg"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <ShoppingCart className="mr-2 h-5 w-5" />
                )}
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProd) => (
              <div 
                key={relProd.id} 
                className="border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md"
                onClick={() => navigate(`/products/${relProd.id}`)}
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={relProd.image_url}
                    alt={relProd.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium line-clamp-1">{relProd.title}</h3>
                  <p className="text-green-700 font-semibold">${relProd.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}