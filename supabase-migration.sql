-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create products table with SKU field
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL NOT NULL,
  image_url TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample categories
INSERT INTO categories (name, icon) VALUES
('Backpack', 'backpack'),
('Men Sling Bag', 'shopping-bag'),
('Women Bag', 'shopping-bag'),
('Messenger Bag', 'briefcase'),
('Thaila Bag', 'shopping-bag'),
('Trolly Section', 'briefcase');

-- Insert sample product
INSERT INTO products (name, price, image_url, category_id, sku) 
SELECT 'Reflex Backpack', 1000, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', id, 'ROLEX-001'
FROM categories WHERE name = 'Backpack' LIMIT 1;

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete categories" ON categories FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete products" ON products FOR DELETE USING (true);

-- Add optional price_max to support price ranges
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_max DECIMAL;
UPDATE products SET price_max = price WHERE price_max IS NULL;