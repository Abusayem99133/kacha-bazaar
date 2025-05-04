import { useState, useEffect } from 'react';
import { Banner } from '@/components/Banner';
import { ProductList } from '@/components/ProductList';
import { supabase, ProductType } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export default function HomePage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error: any) {
        console.error('Error fetching products:', error.message);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Banner />
      <ProductList 
        title="Fresh Products" 
        products={products} 
        loading={loading} 
      />
    </>
  );
}