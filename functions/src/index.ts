import { onSchedule } from "firebase-functions/v2/scheduler";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { generateMonthlyEvent } from "./eventGenerator";
import { sendBookingConfirmation } from "./notifications";

// Generate next month's event on the 1st of each month at midnight
export const createMonthlyEvent = onSchedule("0 0 1 * *", async () => {
  await generateMonthlyEvent();
});

// Send confirmation when a new booking is created with PAID status
export const onBookingCreated = onDocumentCreated(
  "bookings/{bookingId}",
  async (event) => {
    const booking = event.data?.data();
    if (booking && booking.paymentStatus === "PAID") {
      await sendBookingConfirmation(
        booking.userEmail,
        booking.userName,
        booking.bookingCode
      );
    }
  }
);

// Re-export webhook handlers
export { handleStripeWebhook } from "./stripeWebhooks";
