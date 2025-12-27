// Marketplace TypeScript types

export type ProductType = 'physical' | 'digital' | 'event_ticket';
export type ProductStatus = 'draft' | 'active' | 'out_of_stock' | 'discontinued';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface Product {
  id: string;
  name: string;
  nameUk: string;
  description?: string;
  descriptionUk?: string;
  slug: string;
  type: ProductType;
  status: ProductStatus;
  pricePoints: number;
  priceUah?: number; // In kopecks
  stockQuantity?: number; // null = unlimited
  maxPerUser: number;
  imageUrl?: string;
  images?: string[];
  requiresShipping: boolean;
  weight?: number; // grams
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  digitalAssetUrl?: string;
  downloadLimit?: number;
  requiredLevel: number;
  requiredRole?: string;
  availableFrom?: string;
  availableUntil?: string;
  featured: boolean;
  sortOrder: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdById?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  totalPoints: number;
  totalUah: number; // In kopecks
  requiresShipping: boolean;
  shippingAddress?: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    oblast: string;
    postalCode: string;
  };
  novaPoshtaCity?: string;
  novaPoshtaCityRef?: string;
  novaPoshtaBranch?: string;
  novaPoshtaBranchRef?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  customerNotes?: string;
  adminNotes?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  refundedAt?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  pricePoints: number;
  priceUah?: number;
  productName: string;
  productType: ProductType;
  variant?: {
    size?: string;
    color?: string;
    [key: string]: any;
  };
  downloadUrl?: string;
  downloadCount: number;
  downloadExpiresAt?: string;
  createdAt: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CreateProductParams {
  name: string;
  nameUk: string;
  description?: string;
  descriptionUk?: string;
  slug: string;
  type: ProductType;
  pricePoints: number;
  priceUah?: number;
  stockQuantity?: number;
  maxPerUser?: number;
  imageUrl?: string;
  images?: string[];
  requiresShipping?: boolean;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  digitalAssetUrl?: string;
  downloadLimit?: number;
  requiredLevel?: number;
  requiredRole?: string;
  availableFrom?: string;
  availableUntil?: string;
  featured?: boolean;
  tags?: string[];
  createdById: string;
}

export interface UpdateProductParams extends Partial<CreateProductParams> {
  id: string;
  status?: ProductStatus;
}

export interface CreateOrderParams {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    variant?: Record<string, any>;
  }>;
  shippingAddress?: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    oblast: string;
    postalCode: string;
  };
  novaPoshtaCity?: string;
  novaPoshtaCityRef?: string;
  novaPoshtaBranch?: string;
  novaPoshtaBranchRef?: string;
  customerNotes?: string;
}

export interface ProductFilters {
  type?: ProductType;
  status?: ProductStatus;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  search?: string;
}

export interface OrderFilters {
  userId?: string;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: Record<string, any>;
}

export interface CheckoutResult {
  order: OrderWithItems;
  pointsTransaction: {
    id: string;
    amount: number;
    balanceAfter: number;
  };
}
