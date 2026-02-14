import * as admin from "firebase-admin";

interface DiscountResult {
  valid: boolean;
  discountPence: number;
  message: string;
}

export async function validateDiscount(
  code: string,
  seats: number,
  subtotalPence: number
): Promise<DiscountResult> {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  const db = admin.firestore();

  const snap = await db
    .collection("discounts")
    .where("code", "==", code.toUpperCase())
    .where("active", "==", true)
    .limit(1)
    .get();

  if (snap.empty) {
    return { valid: false, discountPence: 0, message: "Invalid discount code." };
  }

  const discount = snap.docs[0].data();
  const now = new Date().toISOString();

  // Check validity period
  if (now < discount.validFrom || now > discount.validUntil) {
    return { valid: false, discountPence: 0, message: "Discount code has expired." };
  }

  // Check usage limits
  if (
    discount.rules.maxUses &&
    discount.rules.currentUses >= discount.rules.maxUses
  ) {
    return {
      valid: false,
      discountPence: 0,
      message: "Discount code has reached its usage limit.",
    };
  }

  // Check minimum seats
  if (discount.rules.minSeats && seats < discount.rules.minSeats) {
    return {
      valid: false,
      discountPence: 0,
      message: `Minimum ${discount.rules.minSeats} seats required for this discount.`,
    };
  }

  // Calculate discount
  let discountPence: number;
  if (discount.type === "PERCENTAGE") {
    discountPence = Math.round(subtotalPence * (discount.value / 100));
  } else {
    discountPence = discount.value; // Fixed amount in pence
  }

  // Increment usage
  await snap.docs[0].ref.update({
    "rules.currentUses": admin.firestore.FieldValue.increment(1),
  });

  return {
    valid: true,
    discountPence,
    message: `Discount applied: ${discount.type === "PERCENTAGE" ? `${discount.value}%` : `£${(discount.value / 100).toFixed(2)}`} off`,
  };
}
