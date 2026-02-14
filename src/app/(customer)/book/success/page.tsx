"use client";

import Link from "next/link";
import { PartyPopper, ArrowRight } from "lucide-react";

export default function BookingSuccessPage() {
  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="bg-jollof-surface rounded-2xl p-8 border border-jollof-border">
        <div className="bg-green-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <PartyPopper size={40} className="text-green-500" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-jollof-text-muted mb-6">
          Your seats at Jollof Bash have been reserved. You&apos;ll receive a
          confirmation with your booking code.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/my-bookings"
            className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
          >
            View My Bookings <ArrowRight size={16} />
          </Link>
          <Link
            href="/gift"
            className="border border-jollof-border hover:border-jollof-amber text-jollof-text py-2.5 rounded-lg transition-colors"
          >
            Gift a Ticket to a Friend
          </Link>
        </div>
      </div>
    </div>
  );
}
