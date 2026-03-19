"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  Users,
  Loader2,
} from "lucide-react";
import type { JollofEvent } from "@/types";
import { formatEventDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [nextEvent, setNextEvent] = useState<string>("Loading...");
  const [totalBookings, setTotalBookings] = useState<string>("0");
  const [totalUsers, setTotalUsers] = useState<string>("0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        const events: JollofEvent[] = data.items || [];

        // Find next upcoming PUBLISHED event (future dateTime, status PUBLISHED)
        const now = new Date().toISOString();
        const upcoming = events
          .filter((e) => e.status === "PUBLISHED" && e.dateTime > now)
          .sort((a, b) => a.dateTime.localeCompare(b.dateTime));

        if (upcoming.length > 0) {
          const dt = new Date(upcoming[0].dateTime);
          setNextEvent(formatEventDate(dt));
        } else {
          // Check if there's any published event at all (even past)
          const anyPublished = events.find((e) => e.status === "PUBLISHED");
          if (anyPublished) {
            const dt = new Date(anyPublished.dateTime);
            setNextEvent(formatEventDate(dt));
          } else {
            setNextEvent("No events published");
          }
        }

        // Count bookings and users if we have events
        // For now show event count context
        const publishedCount = events.filter(
          (e) => e.status === "PUBLISHED"
        ).length;
        const totalSeats = events.reduce((sum, e) => sum + e.seatsBooked, 0);
        setTotalBookings(String(totalSeats));
        setTotalUsers(String(publishedCount));
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
