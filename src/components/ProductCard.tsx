import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductType } from '@/lib/supabase';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, MinusCircle, PlusCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: ProductType;
  className?: string;
}

export const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const isInStock = product.stock > 0;

  const handleAddToCart = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    setIsAdding(true);
    try {
      await addToCart(product, quantity);
    } finally {
      setIsAdding(false);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <Link to={`/products/${product.id}`} className="block relative">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <Badge 
          className={cn(
            "absolute top-3 left-3",
            isInStock 
              ? "bg-green-600 hover:bg-green-600" 
              : "bg-red-600 hover:bg-red-600"
          )}
        >
          {isInStock ? 'In Stock' : 'Out of Stock'}
        </Badge>
      </Link>
      
      <CardContent className="p-4">
        <div className="mb-1 flex justify-between">
          <Link to={`/products/${product.id}`} className="font-medium hover:text-green-600 line-clamp-1">
            {product.title}
          </Link>
        </div>
        <div className="text-lg font-semibold text-green-700">
          ${product.price.toFixed(2)}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={decrementQuantity}
              disabled={quantity <= 1 || !isInStock}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full"
              onClick={incrementQuantity}
              disabled={quantity >= product.stock || !isInStock}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Button 
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          disabled={!isInStock || isAdding}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isAdding ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
};