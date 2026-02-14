import { getFirestore } from "firebase-admin/app";
import * as admin from "firebase-admin";

const SEAT_PRICE_PENCE = 2500;
const CORKAGE_FEE_PENCE = 200;
const DEFAULT_CAPACITY = 30;

function getLastSaturday(year: number, month: number): Date {
  const lastDay = new Date(year, month + 1, 0);
  const dayOfWeek = lastDay.getDay();
  const diff = (dayOfWeek + 1) % 7;
  const lastSaturday = new Date(year, month + 1, 0 - diff);
  lastSaturday.setHours(18, 30, 0, 0);
  return lastSaturday;
}

function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export async function generateMonthlyEvent(): Promise<void> {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  const db = admin.firestore();

  const now = new Date();
  const targetDate = getLastSaturday(now.getFullYear(), now.getMonth());

  // If this month's event is in the past, skip
  if (targetDate < now) return;

  const monthKey = getMonthKey(targetDate);

  // Check if event already exists for this month
  const existing = await db
    .collection("events")
    .where("monthKey", "==", monthKey)
    .limit(1)
    .get();

  if (!existing.empty) return;

  await db.collection("events").add({
    dateTime: targetDate.toISOString(),
    monthKey,
    capacity: DEFAULT_CAPACITY,
    seatsBooked: 0,
    pricing: {
      seatPricePence: SEAT_PRICE_PENCE,
      corkageFeePence: CORKAGE_FEE_PENCE,
    },
    status: "DRAFT",
    venue: {
      name: "",
      address: "",
      postcode: "",
    },
    menu: [],
    createdAt: new Date().toISOString(),
  });

  console.log(`Created event for ${monthKey}: ${targetDate.toISOString()}`);
}
