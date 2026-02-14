"use client";

import { LayoutDashboard, CalendarDays, Ticket, Users } from "lucide-react";

const stats = [
  { label: "Next Event", value: "Coming soon", icon: CalendarDays },
  { label: "Total Bookings", value: "0", icon: Ticket },
  { label: "Registered Users", value: "0", icon: Users },
];

export default function AdminDashboardPage() {
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
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-jollof-surface rounded-xl p-8 border border-jollof-border text-center">
        <p className="text-jollof-text-muted">
          Dashboard metrics will populate once events and bookings are created.
        </p>
      </div>
    </div>
  );
}
