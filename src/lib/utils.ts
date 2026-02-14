import {
  SEAT_PRICE_PENCE,
  CORKAGE_FEE_PENCE,
  BOOKING_CODE_LENGTH,
  EVENT_START_HOUR,
  EVENT_START_MINUTE,
} from "./constants";

/**
 * Get the last Saturday of a given month.
 * Returns a Date set to 18:30 (6:30pm).
 */
export function getLastSaturday(year: number, month: number): Date {
  // Start from the last day of the month
  const lastDay = new Date(year, month + 1, 0);
  const dayOfWeek = lastDay.getDay();
  // Saturday = 6. Calculate days to subtract to reach Saturday.
  const diff = (dayOfWeek + 1) % 7; // days after Saturday
  const lastSaturday = new Date(year, month + 1, 0 - diff);
  lastSaturday.setHours(EVENT_START_HOUR, EVENT_START_MINUTE, 0, 0);
  return lastSaturday;
}

/**
 * Get the next upcoming event date (last Saturday of current or next month).
 */
export function getNextEventDate(): Date {
  const now = new Date();
  const thisMonth = getLastSaturday(now.getFullYear(), now.getMonth());

  if (thisMonth > now) {
    return thisMonth;
  }

  // Move to next month
  const nextMonth = now.getMonth() + 1;
  const nextYear = nextMonth > 11 ? now.getFullYear() + 1 : now.getFullYear();
  return getLastSaturday(nextYear, nextMonth % 12);
}

/**
 * Generate a unique booking code (uppercase alphanumeric).
 */
export function generateBookingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 for readability
  let code = "JB-";
  for (let i = 0; i < BOOKING_CODE_LENGTH; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate a gift ticket code.
 */
export function generateGiftCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "GIFT-";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Calculate booking total in pence.
 * Corkage is only added when byob is true.
 */
export function calculateBookingTotal(
  seats: number,
  addOnsTotalPence: number,
  discountPence: number,
  byob: boolean = false
): number {
  const seatsCost = seats * SEAT_PRICE_PENCE;
  const corkage = byob ? seats * CORKAGE_FEE_PENCE : 0;
  const subtotal = seatsCost + corkage + addOnsTotalPence;
  return Math.max(0, subtotal - discountPence);
}

/**
 * Format pence as GBP string (e.g. 2500 -> "£25.00").
 */
export function formatPence(pence: number): string {
  return `\u00A3${(pence / 100).toFixed(2)}`;
}

/**
 * Format a date for display.
 */
export function formatEventDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format time for display.
 */
export function formatEventTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Generate a month key like "2026-02".
 */
export function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Calculate countdown to a date.
 */
export function getCountdown(targetDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
} {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false,
  };
}

/**
 * Classname helper (simple cn function).
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
