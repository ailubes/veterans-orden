-- Migration: Add marketplace tables for products, orders, and order items
-- Date: 2025-12-27
-- Description: Adds complete marketplace system with physical products, digital items, and event tickets

-- Create product type enum
DO $$ BEGIN
  CREATE TYPE product_type AS ENUM (
    'physical',
    'digital',
    'event_ticket'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create product status enum
DO $$ BEGIN
  CREATE TYPE product_status AS ENUM (
    'draft',
    'active',
    'out_of_stock',
    'discontinued'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create order status enum
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name VARCHAR(255) NOT NULL,
  name_uk VARCHAR(255) NOT NULL,
  description TEXT,
  description_uk TEXT,
  slug VARCHAR(255) NOT NULL UNIQUE,

  -- Product configuration
  type product_type NOT NULL,
  status product_status NOT NULL DEFAULT 'draft',

  -- Pricing
  price_points INTEGER NOT NULL,
  price_uah INTEGER, -- Optional UAH price (in kopecks)

  -- Inventory
  stock_quantity INTEGER, -- null = unlimited
  max_per_user INTEGER DEFAULT 1,

  -- Media
  image_url TEXT,
  images JSONB,

  -- Shipping (for physical products)
  requires_shipping BOOLEAN DEFAULT false,
  weight INTEGER, -- grams
  dimensions JSONB, -- { length, width, height } in cm

  -- Digital delivery (for digital products)
  digital_asset_url TEXT,
  download_limit INTEGER, -- null = unlimited

  -- Access control
  required_level INTEGER DEFAULT 1,
  required_role VARCHAR(50),

  -- Availability
  available_from TIMESTAMP,
  available_until TIMESTAMP,

  -- Metadata
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  tags JSONB,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by_id UUID REFERENCES users(id)
);

-- Create indexes for products
CREATE INDEX IF NOT EXISTS products_type_idx ON products(type);
CREATE INDEX IF NOT EXISTS products_status_idx ON products(status);
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON products(slug);
CREATE INDEX IF NOT EXISTS products_featured_idx ON products(featured);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) NOT NULL UNIQUE,

  -- User
  user_id UUID NOT NULL REFERENCES users(id),

  -- Status
  status order_status NOT NULL DEFAULT 'pending',

  -- Pricing
  total_points INTEGER NOT NULL,
  total_uah INTEGER DEFAULT 0, -- In kopecks

  -- Shipping info (for physical products)
  requires_shipping BOOLEAN DEFAULT false,
  shipping_address JSONB,

  -- Nova Poshta delivery
  nova_poshta_city VARCHAR(100),
  nova_poshta_city_ref VARCHAR(50),
  nova_poshta_branch VARCHAR(100),
  nova_poshta_branch_ref VARCHAR(50),

  -- Fulfillment
  tracking_number VARCHAR(100),
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,

  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,

  -- Metadata
  metadata JSONB,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMP,
  refunded_at TIMESTAMP
);

-- Create indexes for orders
CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status);
CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_idx ON orders(order_number);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders(created_at);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),

  -- Item details
  quantity INTEGER NOT NULL DEFAULT 1,
  price_points INTEGER NOT NULL, -- Price at time of purchase
  price_uah INTEGER, -- UAH price at time of purchase (kopecks)

  -- Product snapshot (in case product changes/deleted)
  product_name VARCHAR(255) NOT NULL,
  product_type product_type NOT NULL,

  -- Variant info (size, color, etc)
  variant JSONB,

  -- Digital delivery
  download_url TEXT,
  download_count INTEGER DEFAULT 0,
  download_expires_at TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for order_items
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_idx ON order_items(product_id);

-- Add comments for documentation
COMMENT ON TABLE products IS 'Marketplace products (physical, digital, event tickets)';
COMMENT ON COLUMN products.price_points IS 'Price in points (1 point = 0.1 UAH)';
COMMENT ON COLUMN products.price_uah IS 'Optional UAH price in kopecks (100 kopecks = 1 UAH)';
COMMENT ON COLUMN products.stock_quantity IS 'Available quantity (null = unlimited stock)';
COMMENT ON COLUMN products.max_per_user IS 'Maximum quantity per user order';
COMMENT ON COLUMN products.required_level IS 'Minimum user level required to purchase';

COMMENT ON TABLE orders IS 'User orders from marketplace';
COMMENT ON COLUMN orders.order_number IS 'Unique order number (e.g., ORD-20250127-001)';
COMMENT ON COLUMN orders.total_points IS 'Total points spent';
COMMENT ON COLUMN orders.total_uah IS 'Total UAH amount in kopecks';

COMMENT ON TABLE order_items IS 'Individual items within an order';
COMMENT ON COLUMN order_items.price_points IS 'Points price at time of purchase (snapshot)';
COMMENT ON COLUMN order_items.product_name IS 'Product name snapshot (preserved if product deleted)';
