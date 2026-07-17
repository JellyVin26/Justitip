import { z } from 'zod';

// Auth
export const registerSchema = z.object({
  email: z.string().email('Must be a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100),
  role: z.enum(['BUYER', 'SELLER'], { errorMap: () => ({ message: "Role must be BUYER or SELLER" }) }),
  phoneNumber: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email('Must be a valid email'),
  password: z.string().min(1, 'Password is required')
});

// Trips
export const createTripSchema = z.object({
  sellerId: z.string().uuid('sellerId must be a valid UUID'),
  destinationCountry: z.string().min(2, 'Destination country is required'),
  startDate: z.string().refine(d => !isNaN(Date.parse(d)), { message: 'startDate must be a valid date' }),
  endDate: z.string().refine(d => !isNaN(Date.parse(d)), { message: 'endDate must be a valid date' }),
  markupRules: z.any().optional(),
  notes: z.string().optional()
});

// Listings
export const createListingSchema = z.object({
  tripId: z.string().uuid('tripId must be a valid UUID'),
  sellerId: z.string().uuid('sellerId must be a valid UUID'),
  productName: z.string().min(1, 'Product name is required').max(200),
  description: z.string().optional(),
  price: z.number({ invalid_type_error: 'Price must be a number' }).positive('Price must be positive'),
  localCurrency: z.string().min(2, 'Local currency is required'),
  imageUrl: z.string().url('imageUrl must be a valid URL').optional().or(z.literal('')),
  maxQuantity: z.number().int().positive().optional(),
  category: z.string().optional()
});

// Orders
export const createOrderSchema = z.object({
  tripId: z.string().uuid('tripId must be a valid UUID'),
  buyerId: z.string().uuid('buyerId must be a valid UUID'),
  productName: z.string().min(1, 'Product name is required').max(200),
  productLink: z.string().url('productLink must be a valid URL').optional().or(z.literal('')),
  productImageUrl: z.string().url('productImageUrl must be a valid URL').optional().or(z.literal('')),
  quantity: z.number().int().positive().default(1),
  localCurrency: z.string().min(2, 'Local currency is required'),
  category: z.string().optional(),
  estimatedPrice: z.number().positive('Estimated price must be positive').optional().nullable()
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(
    ['REQUEST_SUBMITTED', 'TRIP_CONFIRMED', 'PAID', 'ITEM_PURCHASED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'COMPLETED'],
    { errorMap: () => ({ message: 'Invalid order status' }) }
  )
});

export const updateOrderPricingSchema = z.object({
  originalPrice: z.number({ invalid_type_error: 'originalPrice must be a number' }).positive(),
  exchangeRate: z.number({ invalid_type_error: 'exchangeRate must be a number' }).positive(),
  markupFee: z.number({ invalid_type_error: 'markupFee must be a number' }).nonnegative(),
  shippingFee: z.number().nonnegative().optional(),
  paymentQrUrl: z.string().optional()
});

// Reviews
export const createReviewSchema = z.object({
  orderId: z.string().uuid('orderId must be a valid UUID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().optional()
});
