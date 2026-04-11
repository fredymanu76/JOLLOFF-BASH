"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PartyPopper, Gift, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PostPaymentRegister } from "@/components/shared/PostPaymentRegister";

interface GiftDetails {
  purchaserName: string;
  purchaserEmail: string;
  giftCode: string;
  purchaserUserId: string | null;
  recipientName: string;
}

export default function GiftSuccessPage() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");
  const { user } = useAuth();

  const [details, setDetails] = useState<GiftDetails | null>(null);
  const [loading, setLoading] = useState(!!checkoutId);

  useEffect(() => {
    if (!checkoutId) {
      setLoading(false);
      return;
    }

    fetch(`/api/order-details?id=${checkoutId}&type=gift`)
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

        <h1 className="text-2xl font-bold mb-2">Gift Sent!</h1>
        <p className="text-jollof-text-muted mb-6">
          Your gift ticket has been purchased successfully. The recipient can
          look up their booking using their phone number in the app.
        </p>

        {details?.giftCode && (
          <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border mb-4">
            <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-1">
              Gift Code
            </p>
            <p className="text-2xl font-bold tracking-wider">
              {details.giftCode}
            </p>
            {details.recipientName && (
              <p className="text-xs text-jollof-text-muted mt-1">
                For {details.recipientName}
              </p>
            )}
          </div>
        )}

        <div className="bg-jollof-bg rounded-xl p-4 border border-jollof-border mb-6">
          <div className="flex items-center gap-3 justify-center text-jollof-amber">
            <Gift size={20} />
            <p className="font-semibold">
              Tell them to check &quot;Redeem Gift&quot; in the app!
            </p>
          </div>
        </div>

        {/* Registration prompt for guest users */}
        {checkoutId && details && !details.purchaserUserId && !user && (
          <div className="mb-6">
            <PostPaymentRegister
              guestName={details.purchaserName}
              guestEmail={details.purchaserEmail}
              orderId={checkoutId}
              orderType="gift"
            />
          </div>
        )}

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
