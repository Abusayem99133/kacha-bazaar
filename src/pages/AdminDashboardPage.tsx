import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase, ProductType } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PlusCircle, Package, ShoppingBag, Users, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface AdminDashboardStats {
  productCount: number;
  orderCount: number;
  userCount: number;
  revenue: number;
}

interface OrderWithUser {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  user: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<AdminDashboardStats>({
    productCount: 0,
    orderCount: 0,
    userCount: 0,
    revenue: 0,
  });
  
  const [products, setProducts] = useState<ProductType[]>([]);
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [productFormData, setProductFormData] = useState({
    id: '',
    title: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    stock: '',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        const [
          { count: productCount }, 
          { count: orderCount },
          { count: userCount },
          { data: revenueData }
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('total_amount')
        ]);
        
        const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
        
        setStats({
          productCount: productCount || 0,
          orderCount: orderCount || 0,
          userCount: userCount || 0,
          revenue: totalRevenue,
        });
        
        // Fetch recent products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (productsError) throw productsError;
        setProducts(productsData || []);
        
        // Fetch recent orders with user info
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            user:profiles(email:auth.users!id(email), first_name, last_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (ordersError) throw ordersError;
        setOrders(ordersData as OrderWithUser[] || []);
      } catch (error: any) {
        console.error('Error fetching admin data:', error.message);
        toast({
          title: "Error",
          description: "Failed to load admin dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, [user, isAdmin, navigate]);
  
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newProduct = {
        title: productFormData.title,
        description: productFormData.description,
        price: parseFloat(productFormData.price),
        image_url: productFormData.image_url,
        category: productFormData.category,
        stock: parseInt(productFormData.stock),
        admin_id: user?.id,
      };
      
      if (productFormData.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(newProduct)
          .eq('id', productFormData.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Product updated successfully!",
        });
      } else {
        // Add new product
        const { error } = await supabase
          .from('products')
          .insert(newProduct);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Product added successfully!",
        });
      }
      
      // Refresh products list
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setProducts(data || []);
      
      // Reset form
      setProductFormData({
        id: '',
        title: '',
        description: '',
        price: '',
        image_url: '',
        category: '',
        stock: '',
      });
      
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving product:', error.message);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };
  
  const handleEditProduct = (product: ProductType) => {
    setProductFormData({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      image_url: product.image_url,
      category: product.category,
      stock: product.stock.toString(),
    });
    
    setIsDialogOpen(true);
  };
  
  const confirmDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
  };
  
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete);
      
      if (error) throw error;
      
      // Update products list
      setProducts(products.filter(p => p.id !== productToDelete));
      
      toast({
        title: "Success",
        description: "Product deleted successfully!",
      });
    } catch (error: any) {
      console.error('Error deleting product:', error.message);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-24 pt-32">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
          setProductFormData({
            id: '',
            title: '',
            description: '',
            price: '',
            image_url: '',
            category: '',
            stock: '',
          });
          setIsDialogOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Products</p>
                <h3 className="text-2xl font-bold">{stats.productCount}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orders</p>
                <h3 className="text-2xl font-bold">{stats.orderCount}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customers</p>
                <h3 className="text-2xl font-bold">{stats.userCount}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <h3 className="text-2xl font-bold">${stats.revenue.toFixed(2)}</h3>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="products">
        <TabsList className="mb-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Recent Products</CardTitle>
              <CardDescription>Manage your product inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          No products found. Add your first product!
                        </TableCell>
                      </TableRow>
                    ) : (
                      products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                              <img 
                                src={product.image_url} 
                                alt={product.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{product.title}</TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => confirmDeleteProduct(product.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" asChild>
                <Link to="/admin/products">View All Products</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6">
                          No orders found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                          <TableCell>{format(new Date(order.created_at), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            {order.user.first_name} {order.user.last_name}
                          </TableCell>
                          <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/admin/orders/${order.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" asChild>
                <Link to="/admin/orders">View All Orders</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {productFormData.id ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              Fill in the product details below.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Name</Label>
              <Input
                id="title"
                value={productFormData.title}
                onChange={(e) => setProductFormData({ ...productFormData, title: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={productFormData.description}
                onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                placeholder="Enter product description"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={productFormData.price}
                  onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={productFormData.stock}
                  onChange={(e) => setProductFormData({ ...productFormData, stock: e.target.value })}
                  placeholder="0"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={productFormData.category}
                onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                placeholder="Enter product category"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={productFormData.image_url}
                onChange={(e) => setProductFormData({ ...productFormData, image_url: e.target.value })}
                placeholder="Enter image URL"
                required
              />
            </div>
            
            <DialogFooter>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {productFormData.id ? 'Update Product' : 'Add Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductToDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProduct}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}