// All Firestore document types for Jollof Bash

export type UserRole = "USER" | "ADMIN";

export interface User {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  marketingOptIn: boolean;
  createdAt: string;
}

export type EventStatus = "DRAFT" | "PUBLISHED" | "SOLD_OUT" | "CANCELLED" | "COMPLETED";

export interface EventPricing {
  seatPricePence: number;
  corkageFeePence: number;
}

export interface EventVenue {
  name: string;
  address: string;
  postcode: string;
}

export interface JollofEvent {
  id: string;
  dateTime: string;
  monthKey: string; // e.g. "2026-02"
  capacity: number;
  seatsBooked: number;
  pricing: EventPricing;
  status: EventStatus;
  venue: EventVenue;
  menu: string[];
  createdAt: string;
}

// Meal selections
export interface MealSelection {
  starter: string;  // menu item id
  mains: string[];  // menu item ids (buffet style — pick multiple)
  dessert: string;   // menu item id
  dietaryNotes?: string;
}

export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED" | "FAILED";

export interface BookingAddOn {
  addOnId: string;
  name: string;
  quantity: number;
  unitPricePence: number;
}

export interface BookingDiscount {
  discountId: string;
  code: string;
  amountPence: number;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  eventId: string;
  seats: number;
  addOns: BookingAddOn[];
  discounts: BookingDiscount[];
  subtotalPence: number;
  discountTotalPence: number;
  totalPence: number;
  paymentStatus: PaymentStatus;
  stripeSessionId?: string;
  bookingCode: string;
  attended: boolean;
  mealSelections: MealSelection[];  // one per seat
  dietaryNotes?: string;
  createdAt: string;
}

export type GiftTicketStatus = "PURCHASED" | "SENT" | "REDEEMED" | "EXPIRED";

export interface GiftTicket {
  id: string;
  purchaserUserId: string;
  purchaserName: string;
  eventId: string;
  code: string;
  status: GiftTicketStatus;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  redeemedByUserId?: string;
  seats: number;
  mealSelection: MealSelection;
  pricePaidPence: number;
  stripeSessionId?: string;
  createdAt: string;
}

export type DiscountType = "PERCENTAGE" | "FIXED";
export type DiscountScope = "PROMO" | "BUNDLE";

export interface DiscountRule {
  minSeats?: number;
  maxUses?: number;
  currentUses: number;
}

export interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  scope: DiscountScope;
  value: number; // percentage (0-100) or pence amount
  rules: DiscountRule;
  validFrom: string;
  validUntil: string;
  active: boolean;
  createdAt: string;
}

export type AddOnCategory = "WINE" | "BEER" | "SOFT_DRINK" | "SPIRIT" | "OTHER";

export interface AddOn {
  id: string;
  name: string;
  description?: string;
  pricePence: number;
  category: AddOnCategory;
  active: boolean;
  createdAt: string;
}

export type BroadcastChannel = "EMAIL" | "PUSH" | "BOTH";
export type BroadcastAudience = "ALL" | "BOOKED" | "PAST_ATTENDEES";

export interface Broadcast {
  id: string;
  title: string;
  message: string;
  audience: BroadcastAudience;
  channel: BroadcastChannel;
  sentAt?: string;
  recipientCount?: number;
  createdAt: string;
}

export type GalleryMediaType = "IMAGE" | "VIDEO";

export interface GalleryItem {
  id: string;
  url: string;
  storagePath: string;
  mediaType: GalleryMediaType;
  caption?: string;
  eventDate?: string;
  createdAt: string;
}
