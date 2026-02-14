"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  Tags,
  Wine,
  ImageIcon,
  Megaphone,
  UtensilsCrossed,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: CalendarDays },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/discounts", label: "Discounts", icon: Tags },
  { href: "/admin/drinks", label: "Drinks Menu", icon: Wine },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/broadcasts", label: "Broadcasts", icon: Megaphone },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-jollof-bg">
      <header className="fixed top-0 left-0 right-0 z-50 bg-jollof-red/10 border-b border-jollof-red/30 h-16 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden mr-4 text-jollof-text"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <Link href="/admin" className="text-xl font-bold text-jollof-amber">
          Jollof Bash
          <span className="text-jollof-red text-xs font-normal ml-2">
            ADMIN
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-jollof-text-muted hidden sm:block">
            {user?.email}
          </span>
          <button
            onClick={signOut}
            className="text-jollof-text-muted hover:text-jollof-text transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="flex pt-16">
        <aside
          className={cn(
            "fixed md:static inset-y-0 left-0 z-40 w-64 bg-jollof-surface border-r border-jollof-border pt-20 md:pt-4 transition-transform",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <nav className="px-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  pathname === item.href
                    ? "bg-jollof-amber/10 text-jollof-amber font-semibold"
                    : "text-jollof-text-muted hover:text-jollof-text hover:bg-jollof-bg"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-6 md:p-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
