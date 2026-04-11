"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  Loader2,
  ChevronDown,
  ChevronUp,
  Truck,
  Store,
} from "lucide-react";
import { formatPence, formatOrderDate } from "@/lib/utils";
import type { TakeawayOrder, TakeawayOrderStatus, FulfilmentType } from "@/types";

const STATUS_LABELS: Record<TakeawayOrderStatus, string> = {
  PENDING_PAYMENT: "Pending Payment",
  PAID: "Paid",
  PREPARING: "Preparing",
  READY: "Ready",
  COLLECTED: "Collected",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const STATUS_COLORS: Record<TakeawayOrderStatus, string> = {
  PENDING_PAYMENT: "bg-stone-600/30 text-stone-300",
  PAID: "bg-green-600/20 text-green-400",
  PREPARING: "bg-amber-600/20 text-amber-400",
  READY: "bg-blue-600/20 text-blue-400",
  COLLECTED: "bg-green-600/20 text-green-400",
  OUT_FOR_DELIVERY: "bg-purple-600/20 text-purple-400",
  DELIVERED: "bg-green-600/20 text-green-400",
  CANCELLED: "bg-red-600/20 text-red-400",
  REFUNDED: "bg-red-600/20 text-red-400",
};

const NEXT_STATUS: Partial<Record<TakeawayOrderStatus, TakeawayOrderStatus[]>> = {
  PAID: ["PREPARING"],
  PREPARING: ["READY"],
  READY: ["COLLECTED", "OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
};

export default function AdminTakeawayOrdersPage() {
  const [orders, setOrders] = useState<TakeawayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [fulfilmentFilter, setFulfilmentFilter] = useState<string>("ALL");

  const fetchOrders = useCallback(async () => {
    try {
      let url = "/api/takeaway/orders";
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function updateStatus(orderId: string, newStatus: TakeawayOrderStatus) {
    setUpdatingId(orderId);
    setError("");

    try {
      const res = await fetch("/api/takeaway/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, orderStatus: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, orderStatus: newStatus } : o
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (fulfilmentFilter !== "ALL" && o.fulfilmentType !== fulfilmentFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <ShoppingBag size={28} className="text-jollof-amber" />
        <div>
          <h1 className="text-2xl font-bold">Next Day Orders</h1>
          <p className="text-xs text-jollof-text-muted">
            Manage next day delivery orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setLoading(true);
          }}
          className="bg-jollof-bg border border-jollof-border rounded-lg px-3 py-2 text-sm text-jollof-text focus:border-jollof-amber focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="PAID">Paid</option>
          <option value="PREPARING">Preparing</option>
          <option value="READY">Ready</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="COLLECTED">Collected</option>
          <option value="DELIVERED">Delivered</option>
        </select>

      </div>

      {error && (
        <div className="bg-jollof-red/10 border border-jollof-red/30 text-jollof-red-light rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="text-jollof-amber animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border text-center">
          <p className="text-jollof-text-muted">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = expandedId === order.id;
            const nextStatuses = NEXT_STATUS[order.orderStatus] || [];

            return (
              <div
                key={order.id}
                className="bg-jollof-surface rounded-xl border border-jollof-border"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {order.fulfilmentType === "DELIVERY" ? (
                        <Truck size={16} className="text-jollof-amber" />
                      ) : (
                        <Store size={16} className="text-jollof-amber" />
                      )}
                      <span className="font-mono font-bold text-sm">
                        {order.orderCode}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        STATUS_COLORS[order.orderStatus]
                      }`}
                    >
                      {STATUS_LABELS[order.orderStatus]}
                    </span>
                    <div className="ml-auto flex items-center gap-3">
                      <span className="text-sm font-semibold text-jollof-amber">
                        {formatPence(order.totalPence)}
                      </span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-jollof-text-muted">
                    <span>{order.userName}</span>
                    <span>{formatOrderDate(new Date(order.date))}</span>
                    <span>{order.timeSlotLabel}</span>
                    <span>{order.items.length} items</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-jollof-border p-4 space-y-3">
                    {/* Items */}
                    <div>
                      <p className="text-xs font-semibold text-jollof-amber uppercase mb-2">Items</p>
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{item.name} x {item.quantity}</span>
                          <span className="text-jollof-text-muted">
                            {formatPence(item.unitPricePence * item.quantity)}
                          </span>
                        </div>
                      ))}
                      {order.deliveryFeePence > 0 && (
                        <div className="flex justify-between text-sm mt-1 pt-1 border-t border-jollof-border">
                          <span>Delivery fee</span>
                          <span className="text-jollof-text-muted">
                            {formatPence(order.deliveryFeePence)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Delivery address */}
                    {order.deliveryAddress && (
                      <div>
                        <p className="text-xs font-semibold text-jollof-amber uppercase mb-1">
                          Delivery Address
                        </p>
                        <p className="text-sm text-jollof-text-muted">
                          {order.deliveryAddress.line1}
                          {order.deliveryAddress.line2 && `, ${order.deliveryAddress.line2}`}
                          , {order.deliveryAddress.city}, {order.deliveryAddress.postcode}
                        </p>
                        <p className="text-sm text-jollof-text-muted">
                          Phone: {order.deliveryAddress.phone}
                        </p>
                      </div>
                    )}

                    {/* Dietary notes */}
                    {order.dietaryNotes && (
                      <div>
                        <p className="text-xs font-semibold text-jollof-amber uppercase mb-1">
                          Dietary Notes
                        </p>
                        <p className="text-sm text-jollof-text-muted">{order.dietaryNotes}</p>
                      </div>
                    )}

                    {/* Status actions */}
                    {nextStatuses.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {nextStatuses.map((ns) => (
                          <button
                            key={ns}
                            onClick={() => updateStatus(order.id, ns)}
                            disabled={updatingId === order.id}
                            className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 text-sm inline-flex items-center gap-2"
                          >
                            {updatingId === order.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : null}
                            {STATUS_LABELS[ns]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
