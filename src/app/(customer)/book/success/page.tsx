"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PartyPopper, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PostPaymentRegister } from "@/components/shared/PostPaymentRegister";

interface BookingDetails {
  userName: string;
  userEmail: string;
  bookingCode: string;
  userId: string | null;
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");
  const { user } = useAuth();

  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(!!checkoutId);

  useEffect(() => {
    if (!checkoutId) return;

    fetch(`/api/order-details?id=${checkoutId}&type=booking`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setDetails(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [checkoutId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="text-jollof-amber animate-spin" />
      </div>
    );
  }

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

        {details?.bookingCode && (
          <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border mb-6">
            <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-1">
              Booking Code
            </p>
            <p className="text-2xl font-bold tracking-wider">
              {details.bookingCode}
            </p>
          </div>
        )}

        {/* Registration prompt for guest users */}
        {checkoutId && details && !details.userId && !user && (
          <div className="mb-6">
            <PostPaymentRegister
              guestName={details.userName}
              guestEmail={details.userEmail}
              orderId={checkoutId}
              orderType="booking"
            />
          </div>
        )}

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
