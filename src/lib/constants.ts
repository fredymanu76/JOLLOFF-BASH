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

// SumUp
export const SUMUP_CURRENCY = "GBP";
export const SUMUP_API_URL = "https://api.sumup.com/v0.1";

// Venue
export const VENUE = {
  name: "CosyUpperRoom",
  location: "Upstairs ZoeTrends",
  address: "10 Market St",
  postcode: "TF1 1DT",
  phone: "01952 794764",
} as const;

// Menu — from the Jollof Bash flyer
export type MenuCategory = "STARTER" | "MAIN" | "DESSERT";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: MenuCategory;
  emoji: string;
}

export const MENU_STARTERS: MenuItem[] = [
  {
    id: "starter-chicken-wing",
    name: "Chicken Wing",
    description: "Crispy spiced chicken wings with a West African kick",
    category: "STARTER",
    emoji: "🍗",
  },
  {
    id: "starter-puff-puff",
    name: "Puff Puff",
    description: "Sweet fried dough balls — a beloved West African classic",
    category: "STARTER",
    emoji: "🧁",
  },
];

export const MENU_MAINS: MenuItem[] = [
  {
    id: "main-jollof-rice",
    name: "Jollof Rice",
    description: "The star of the show — smoky, rich, perfectly spiced tomato rice",
    category: "MAIN",
    emoji: "🍚",
  },
  {
    id: "main-guinea-fowl-stew",
    name: "Guinea Fowl Stew",
    description: "Slow-cooked guinea fowl in a rich traditional stew",
    category: "MAIN",
    emoji: "🍲",
  },
  {
    id: "main-fried-plantain",
    name: "Fried Plantain",
    description: "Golden caramelised plantain slices",
    category: "MAIN",
    emoji: "🍌",
  },
  {
    id: "main-fried-fish",
    name: "Fried Fish",
    description: "Whole fried fish seasoned with African spices",
    category: "MAIN",
    emoji: "🐟",
  },
  {
    id: "main-garden-salad",
    name: "Garden Salad",
    description: "Fresh mixed greens with a light dressing",
    category: "MAIN",
    emoji: "🥗",
  },
  {
    id: "main-coleslaw",
    name: "Coleslaw",
    description: "Creamy homemade coleslaw",
    category: "MAIN",
    emoji: "🥬",
  },
  {
    id: "main-shito",
    name: "Shito",
    description: "Ghanaian hot pepper sauce — a fiery condiment",
    category: "MAIN",
    emoji: "🌶️",
  },
];

export const MENU_DESSERTS: MenuItem[] = [
  {
    id: "dessert-ice-cream",
    name: "Ice Cream",
    description: "A cool finish to your West African feast",
    category: "DESSERT",
    emoji: "🍨",
  },
  {
    id: "dessert-fruit-platter",
    name: "Fruit Platter",
    description: "Seasonal tropical fruits beautifully presented",
    category: "DESSERT",
    emoji: "🍉",
  },
];

export const FULL_MENU = [...MENU_STARTERS, ...MENU_MAINS, ...MENU_DESSERTS];

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
