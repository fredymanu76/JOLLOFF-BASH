"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ArrowRight, Loader2, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { PostPaymentRegister } from "@/components/shared/PostPaymentRegister";
import type { DeliveryAddress } from "@/types";

interface OrderDetails {
  userName: string;
  userEmail: string;
  orderCode: string;
  userId: string | null;
  timeSlotLabel: string;
  date: string;
  deliveryAddress: DeliveryAddress | null;
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");
  const { user } = useAuth();

  const [details, setDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(!!checkoutId);

  useEffect(() => {
    if (!checkoutId) {
      setLoading(false);
      return;
    }

    fetch(`/api/order-details?id=${checkoutId}&type=takeaway`)
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
          <CheckCircle size={40} className="text-green-500" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-jollof-text-muted mb-6">
          Your next day delivery order has been placed successfully.
        </p>

        {details && (
          <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border text-left mb-6 space-y-3">
            {details.orderCode && (
              <div>
                <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-1">
                  Order Code
                </p>
                <p className="text-lg font-bold tracking-wider">
                  {details.orderCode}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-1">
                Delivery
              </p>
              <p className="text-sm">Next day delivery</p>
            </div>

            {details.timeSlotLabel && (
              <div>
                <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-1">
                  Time Slot
                </p>
                <p className="text-sm">
                  {details.timeSlotLabel}
                  {details.date &&
                    ` on ${new Date(details.date + "T00:00:00").toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}`}
                </p>
              </div>
            )}

            {details.deliveryAddress && (
              <div>
                <p className="text-xs text-jollof-amber font-semibold uppercase tracking-wide mb-1">
                  Delivery Address
                </p>
                <div className="flex items-start gap-1.5 text-sm text-jollof-text-muted">
                  <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p>{details.deliveryAddress.line1}</p>
                    {details.deliveryAddress.line2 && (
                      <p>{details.deliveryAddress.line2}</p>
                    )}
                    <p>
                      {details.deliveryAddress.city},{" "}
                      {details.deliveryAddress.postcode}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!details && (
          <div className="bg-jollof-bg rounded-lg p-4 border border-jollof-border mb-6">
            <p className="text-sm text-jollof-text-muted">
              You will receive confirmation details shortly.
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
              orderType="takeaway"
            />
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/my-orders"
            className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
          >
            View My Orders <ArrowRight size={16} />
          </Link>
          <Link
            href="/"
            className="border border-jollof-border hover:border-jollof-amber text-jollof-text py-2.5 rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
