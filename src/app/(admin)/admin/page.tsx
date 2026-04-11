"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  Users,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import type { JollofEvent, TakeawayOrder } from "@/types";
import { formatEventDate, formatPence } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [nextEvent, setNextEvent] = useState<string>("Loading...");
  const [totalBookings, setTotalBookings] = useState<string>("0");
  const [totalUsers, setTotalUsers] = useState<string>("0");
  const [todayOrders, setTodayOrders] = useState<string>("0");
  const [takeawayRevenue, setTakeawayRevenue] = useState<string>("£0.00");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch event stats
        const eventsRes = await fetch("/api/events");
        const eventsData = await eventsRes.json();
        const events: JollofEvent[] = eventsData.items || [];

        const now = new Date().toISOString();
        const upcoming = events
          .filter((e) => e.status === "PUBLISHED" && e.dateTime > now)
          .sort((a, b) => a.dateTime.localeCompare(b.dateTime));

        if (upcoming.length > 0) {
          const dt = new Date(upcoming[0].dateTime);
          setNextEvent(formatEventDate(dt));
        } else {
          const anyPublished = events.find((e) => e.status === "PUBLISHED");
          if (anyPublished) {
            const dt = new Date(anyPublished.dateTime);
            setNextEvent(formatEventDate(dt));
          } else {
            setNextEvent("No events published");
          }
        }

        const publishedCount = events.filter(
          (e) => e.status === "PUBLISHED"
        ).length;
        const totalSeats = events.reduce((sum, e) => sum + e.seatsBooked, 0);
        setTotalBookings(String(totalSeats));
        setTotalUsers(String(publishedCount));

        // Fetch takeaway stats
        try {
          const ordersRes = await fetch("/api/takeaway/orders");
          const ordersData = await ordersRes.json();
          const orders: TakeawayOrder[] = ordersData.orders || [];

          // Today's orders
          const today = new Date().toISOString().split("T")[0];
          const todaysOrders = orders.filter(
            (o) => o.date && o.date.startsWith(today) && o.orderStatus !== "CANCELLED"
          );
          setTodayOrders(String(todaysOrders.length));

          // Total takeaway revenue (PAID+)
          const revenue = orders
            .filter((o) => o.paymentStatus === "PAID")
            .reduce((sum, o) => sum + o.totalPence, 0);
          setTakeawayRevenue(formatPence(revenue));
        } catch {
          // Takeaway not set up yet — keep defaults
        }
      } catch {
        setNextEvent("Coming soon");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const stats = [
    { label: "Next Event", value: nextEvent, icon: CalendarDays },
    { label: "Seats Booked", value: totalBookings, icon: Ticket },
    { label: "Published Events", value: totalUsers, icon: Users },
    { label: "Today's Delivery Orders", value: todayOrders, icon: ShoppingBag },
    { label: "Delivery Revenue", value: takeawayRevenue, icon: ShoppingBag },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard size={28} className="text-jollof-amber" />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-jollof-surface rounded-xl p-6 border border-jollof-border"
          >
            <div className="flex items-center gap-3 mb-2">
              <stat.icon size={20} className="text-jollof-amber" />
              <span className="text-sm text-jollof-text-muted">
                {stat.label}
              </span>
            </div>
            {loading ? (
              <Loader2
                size={20}
                className="text-jollof-amber animate-spin mt-2"
              />
            ) : (
              <p className="text-2xl font-bold">{stat.value}</p>
            )}
          </div>
        ))}
      </div>

      {!loading && nextEvent === "No events published" && (
        <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border text-center">
          <p className="text-jollof-text-muted">
            Create and publish an event to see dashboard metrics.
          </p>
        </div>
      )}
    </div>
  );
}
