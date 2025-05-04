/*
  # Initial schema for Kacha Bazar e-commerce

  1. New Tables
    - `products` - Stores product information
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `title` (text, not null)
      - `description` (text, not null)
      - `price` (numeric, not null)
      - `image_url` (text, not null)
      - `category` (text, not null)
      - `stock` (integer, not null)
      - `admin_id` (uuid, references auth.users)
    
    - `profiles` - Stores user profile information
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `first_name` (text)
      - `last_name` (text)
      - `avatar_url` (text)
      - `role` (text, not null)
    
    - `cart_items` - Stores shopping cart items
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `user_id` (uuid, references profiles)
      - `product_id` (uuid, references products)
      - `quantity` (integer, not null)
    
    - `orders` - Stores order information
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `user_id` (uuid, references profiles)
      - `total_amount` (numeric, not null)
      - `status` (text, not null)
      - `payment_intent_id` (text)
    
    - `order_items` - Stores items within orders
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `order_id` (uuid, references orders)
      - `product_id` (uuid, references products)
      - `quantity` (integer, not null)
      - `price` (numeric, not null)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
    - Add policies for admins to read/write all data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user'
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  admin_id UUID REFERENCES auth.users
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users,
  product_id UUID NOT NULL REFERENCES products,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users,
  total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending',
  payment_intent_id TEXT
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  order_id UUID NOT NULL REFERENCES orders ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC NOT NULL CHECK (price >= 0)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create auth trigger to create profile
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user();

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Cart items policies
CREATE POLICY "Users can view their own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Order items policies
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Sample data for testing
INSERT INTO products (title, description, price, image_url, category, stock)
VALUES 
  ('Fresh Organic Tomatoes', 'Locally grown organic tomatoes, picked at the peak of ripeness.', 3.99, 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Vegetables', 50),
  ('Organic Bananas', 'Sweet and nutritious organic bananas, perfect for snacking.', 2.49, 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Fruits', 75),
  ('Farm Fresh Eggs', 'Free-range, organic eggs from locally raised chickens.', 4.99, 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Dairy', 30),
  ('Organic Spinach', 'Fresh, crisp organic spinach leaves, washed and ready to use.', 3.49, 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Vegetables', 40),
  ('Raw Honey', 'Unfiltered, pure honey from local beekeepers.', 7.99, 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Pantry', 25),
  ('Whole Grain Bread', 'Freshly baked, organic whole grain bread.', 4.49, 'https://images.pexels.com/photos/1756061/pexels-photo-1756061.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Bakery', 20),
  ('Organic Apples', 'Sweet and crisp organic apples, perfect for snacking or baking.', 1.99, 'https://images.pexels.com/photos/1510392/pexels-photo-1510392.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Fruits', 60),
  ('Grass-Fed Ground Beef', 'Premium quality grass-fed ground beef from local farms.', 8.99, 'https://images.pexels.com/photos/618775/pexels-photo-618775.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Meat', 15),
  ('Organic Carrots', 'Fresh, crisp organic carrots, perfect for snacking or cooking.', 2.99, 'https://images.pexels.com/photos/4997822/pexels-photo-4997822.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Vegetables', 45),
  ('Organic Milk', 'Fresh, organic whole milk from grass-fed cows.', 5.49, 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Dairy', 35),
  ('Organic Avocados', 'Ripe and creamy organic avocados, perfect for guacamole or toast.', 2.49, 'https://images.pexels.com/photos/2228553/pexels-photo-2228553.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Fruits', 40),
  ('Organic Quinoa', 'Organic, pre-washed quinoa, ready to cook.', 6.99, 'https://images.pexels.com/photos/7412100/pexels-photo-7412100.jpeg?auto=compress&cs=tinysrgb&w=1600', 'Grains', 30);