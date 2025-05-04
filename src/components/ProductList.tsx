import { useState, useEffect } from 'react';
import { ProductType } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductListProps {
  title?: string;
  initialProductCount?: number;
  incrementAmount?: number;
  products: ProductType[];
  loading: boolean;
}

export const ProductList = ({
  title = 'Featured Products',
  initialProductCount = 12,
  incrementAmount = 3,
  products,
  loading,
}: ProductListProps) => {
  const [visibleProducts, setVisibleProducts] = useState<number>(initialProductCount);

  const handleLoadMore = () => {
    setVisibleProducts((prev) => prev + incrementAmount);
  };

  const canLoadMore = visibleProducts < products.length;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        {title && <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{title}</h2>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: initialProductCount }).map((_, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/4 mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        {title && <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{title}</h2>}
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No products found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {title && <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{title}</h2>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.slice(0, visibleProducts).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {canLoadMore && (
        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="border-green-600 text-green-600 hover:bg-green-50"
            onClick={handleLoadMore}
          >
            See More Products
          </Button>
        </div>
      )}
    </div>
  );
};