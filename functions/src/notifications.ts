export async function sendBookingConfirmation(
  email: string,
  name: string,
  bookingCode: string
): Promise<void> {
  // TODO: Integrate SendGrid for email notifications
  // For now, log the confirmation
  console.log(
    `Booking confirmation for ${name} (${email}): Code ${bookingCode}`
  );
}

export async function sendGiftTicketEmail(
  recipientEmail: string,
  purchaserName: string,
  giftCode: string,
  eventDate: string
): Promise<void> {
  // TODO: Integrate SendGrid for gift ticket emails
  console.log(
    `Gift ticket from ${purchaserName} to ${recipientEmail}: Code ${giftCode}, Event: ${eventDate}`
  );
}
