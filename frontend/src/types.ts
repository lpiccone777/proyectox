export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'host' | 'tenant' | 'both';
  phone?: string;
  profilePicture?: string;
  verifiedEmail: boolean;
  verifiedPhone: boolean;
}

export interface SpaceImage {
  id: number;
  url: string;
  order: number;
}

export interface Space {
  id: number;
  title: string;
  description: string;
  type: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  size: number; // in square meters
  pricePerMonth: number;
  pricePerDay?: number;
  available: boolean;
  features?: string[];
  rules?: string;
  minBookingDays?: number;
  maxBookingDays?: number;
  images?: SpaceImage[];
  averageRating?: number;
  totalReviews?: number;
  hostId?: number;
  host?: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: number;
  spaceId: number;
  tenantId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  specialInstructions?: string;
  cancellationReason?: string;
  space: Space;
  tenant?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  bookingId: number;
  spaceId: number;
  reviewerId: number;
  reviewedId: number;
  reviewType: 'host_to_tenant' | 'tenant_to_host' | 'tenant_to_space';
  rating: number;
  comment: string;
  reviewer?: User;
  reviewed?: User;
  space?: Space;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  bookingId: number;
  mercadopagoPaymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  payerEmail?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Draft types for localStorage
export interface DraftSpace {
  id: string;
  title?: string;
  description?: string;
  type?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  size?: number;
  pricePerMonth?: number;
  pricePerDay?: number;
  features?: string[];
  rules?: string;
  minBookingDays?: number;
  maxBookingDays?: number;
  images?: string[]; // Base64 encoded images for drafts
  createdAt: string;
  updatedAt: string;
}