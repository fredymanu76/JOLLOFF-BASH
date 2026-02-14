// Pricing (all in pence to avoid floating-point issues)
export const SEAT_PRICE_PENCE = 2500; // £25
export const CORKAGE_FEE_PENCE = 200; // £2

// Event defaults
export const DEFAULT_CAPACITY = 30;
export const EVENT_START_HOUR = 18; // 6:30pm
export const EVENT_START_MINUTE = 30;

// Booking
export const MAX_SEATS_PER_BOOKING = 8;
export const BOOKING_CODE_LENGTH = 8;

// Admin
export const ADMIN_EMAIL = "fredymanu76@gmail.com";

// Stripe
export const STRIPE_CURRENCY = "gbp";

// Theme colors
export const THEME = {
  primary: "#F59E0B",
  accent: "#DC2626",
  background: "#1C1917",
  surface: "#292524",
  text: "#FAFAF9",
  textMuted: "#A8A29E",
  border: "#44403C",
} as const;

// Sister businesses (for landing page links)
export const SISTER_BUSINESSES = [
  {
    name: "Jollof Bash Catering",
    description: "Private event catering with West African flavours",
    url: "#",
  },
  {
    name: "Jollof Bash Meal Prep",
    description: "Weekly meal prep delivery service",
    url: "#",
  },
] as const;
