"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-jollof-bg/90 backdrop-blur-md border-b border-jollof-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-jollof-amber">
          Jollof Bash
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/#about"
            className="text-jollof-text-muted hover:text-jollof-text transition-colors"
          >
            About
          </Link>
          <Link
            href="/#next-event"
            className="text-jollof-text-muted hover:text-jollof-text transition-colors"
          >
            Next Event
          </Link>
          <Link
            href="/login"
            className="text-jollof-text-muted hover:text-jollof-text transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-jollof-text"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-jollof-surface border-b border-jollof-border px-4 py-4 flex flex-col gap-4">
          <Link
            href="/#about"
            onClick={() => setMenuOpen(false)}
            className="text-jollof-text-muted hover:text-jollof-text"
          >
            About
          </Link>
          <Link
            href="/#next-event"
            onClick={() => setMenuOpen(false)}
            className="text-jollof-text-muted hover:text-jollof-text"
          >
            Next Event
          </Link>
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="text-jollof-text-muted hover:text-jollof-text"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-4 py-2 rounded-lg text-center transition-colors"
          >
            Book Now
          </Link>
        </div>
      )}
    </nav>
  );
}
