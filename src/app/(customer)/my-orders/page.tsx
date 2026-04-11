"use client";

import { useState, useEffect } from "react";
import { Package, Loader2 } from "lucide-react";
import { formatPence, formatOrderDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { TakeawayOrder, TakeawayOrderStatus } from "@/types";

const STATUS_STYLES: Record<
  TakeawayOrderStatus,
  { label: string; className: string }
> = {
  PENDING_PAYMENT: {
    label: "Pending Payment",
    className: "bg-jollof-amber/15 text-jollof-amber",
  },
  PAID: {
    label: "Paid",
    className: "bg-green-500/15 text-green-500",
  },
  PREPARING: {
    label: "Preparing",
    className: "bg-jollof-amber/15 text-jollof-amber",
  },
  READY: {
    label: "Ready",
    className: "bg-blue-500/15 text-blue-400",
  },
  COLLECTED: {
    label: "Collected",
    className: "bg-green-500/15 text-green-500",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    className: "bg-blue-500/15 text-blue-400",
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-green-500/15 text-green-500",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-jollof-red/15 text-jollof-red-light",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-jollof-red/15 text-jollof-red-light",
  },
};

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<TakeawayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const url = user?.uid
          ? `/api/takeaway/orders?userId=${user.uid}`
          : "/api/takeaway/orders";
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();
        setOrders(data.orders || []);
      } catch {
        setError("Could not load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Package size={28} className="text-jollof-amber" />
        <h1 className="text-2xl font-bold">My Orders</h1>
      </div>
      <p className="text-jollof-text-muted mb-6">
        Track your next day delivery orders
      </p>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="text-jollof-amber animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-jollof-red/10 border border-jollof-red/30 text-jollof-red-light rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border text-center">
          <Package
            size={40}
            className="text-jollof-text-muted mx-auto mb-3"
          />
          <p className="text-jollof-text-muted">
            You don&apos;t have any orders yet. Place your first next day
            order from our menu!
          </p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = STATUS_STYLES[order.orderStatus] || {
              label: order.orderStatus,
              className: "bg-jollof-surface text-jollof-text-muted",
            };
            const itemsSummary = order.items
              .map((i) => `${i.name} x${i.quantity}`)
              .join(", ");

            return (
              <div
                key={order.id}
                className="bg-jollof-surface rounded-xl p-4 border border-jollof-border"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold tracking-wider text-sm">
                      {order.orderCode}
                    </p>
                    <p className="text-xs text-jollof-text-muted mt-0.5">
                      {formatOrderDate(new Date(order.date + "T00:00:00"))}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <p className="text-sm text-jollof-text-muted line-clamp-1 mb-3">
                  {itemsSummary}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-jollof-border">
                  <span className="text-xs text-jollof-text-muted">
                    Delivery
                    {order.timeSlotLabel ? ` \u2022 ${order.timeSlotLabel}` : ""}
                  </span>
                  <span className="font-bold text-jollof-amber">
                    {formatPence(order.totalPence)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
