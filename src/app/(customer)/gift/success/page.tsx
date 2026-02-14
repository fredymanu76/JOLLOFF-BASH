"use client";

import Link from "next/link";
import { PartyPopper, Gift, ArrowRight } from "lucide-react";

export default function GiftSuccessPage() {
  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="bg-jollof-surface rounded-2xl p-8 border border-jollof-border">
        <div className="bg-green-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <PartyPopper size={40} className="text-green-500" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Gift Sent!</h1>
        <p className="text-jollof-text-muted mb-6">
          Your gift ticket has been purchased successfully. The recipient can
          look up their booking using their phone number in the app.
        </p>

        <div className="bg-jollof-bg rounded-xl p-4 border border-jollof-border mb-6">
          <div className="flex items-center gap-3 justify-center text-jollof-amber">
            <Gift size={20} />
            <p className="font-semibold">
              Tell them to check &quot;Redeem Gift&quot; in the app!
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/gift"
            className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
          >
            Send Another Gift <ArrowRight size={16} />
          </Link>
          <Link
            href="/my-bookings"
            className="border border-jollof-border hover:border-jollof-amber text-jollof-text py-2.5 rounded-lg transition-colors"
          >
            View My Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
