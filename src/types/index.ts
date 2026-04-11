// All Firestore document types for Jollof Bash

export type UserRole = "USER" | "ADMIN";

// Menu availability tagging for dual-system
export type MenuItemAvailability = "EVENT" | "TAKEAWAY" | "BOTH";
export type MenuCategory = "STARTER" | "MAIN" | "DESSERT";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  emoji: string;
  availability: MenuItemAvailability;
  pricePence?: number;
  active: boolean;
}

// Takeaway types
export type FulfilmentType = "PICKUP" | "DELIVERY";

export type TakeawayOrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PREPARING"
  | "READY"
  | "COLLECTED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface TakeawayOrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPricePence: number;
}

export interface DeliveryAddress {
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  phone: string;
}

export interface TakeawayOrder {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  items: TakeawayOrderItem[];
  fulfilmentType: FulfilmentType;
  date: string;
  timeSlotId: string;
  timeSlotLabel: string;
  deliveryAddress?: DeliveryAddress;
  deliveryFeePence: number;
  subtotalPence: number;
  totalPence: number;
  paymentStatus: PaymentStatus;
  orderStatus: TakeawayOrderStatus;
  orderCode: string;
  dietaryNotes?: string;
  sumupCheckoutId?: string;
  createdAt: string;
}

export interface TimeSlot {
  id: string;
  dayOfWeek?: number;
  specificDate?: string;
  label: string;
  startTime: string;
  endTime: string;
  maxOrders: number;
  currentOrders: number;
  active: boolean;
}

export interface TakeawaySettings {
  deliveryFeePence: number;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  leadTimeHours: number;
  minimumOrderPence?: number;
}

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

/** @deprecated Kept for backward compatibility with historical booking data */
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
  userId?: string;
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
  sumupCheckoutId?: string;
  bookingCode: string;
  attended: boolean;
  /** @deprecated No longer written for new bookings — event food is set menu */
  mealSelections?: MealSelection[];
  dietaryNotes?: string;
  createdAt: string;
}

export type GiftTicketStatus = "PURCHASED" | "SENT" | "REDEEMED" | "EXPIRED";

export interface GiftTicket {
  id: string;
  purchaserUserId?: string;
  purchaserName: string;
  eventId: string;
  code: string;
  status: GiftTicketStatus;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  redeemedByUserId?: string;
  seats: number;
  /** @deprecated No longer written for new gifts — event food is set menu */
  mealSelection?: MealSelection;
  pricePaidPence: number;
  sumupCheckoutId?: string;
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
