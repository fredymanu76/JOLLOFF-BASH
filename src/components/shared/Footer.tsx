import Link from "next/link";
import { SISTER_BUSINESSES } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-jollof-surface border-t border-jollof-border">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-jollof-amber mb-2">
              Jollof Bash
            </h3>
            <p className="text-jollof-text-muted text-sm">
              A monthly supper club celebrating West African cuisine. Every last
              Saturday of the month.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <div className="flex flex-col gap-2 text-sm text-jollof-text-muted">
              <Link href="/#about" className="hover:text-jollof-text">
                About
              </Link>
              <Link href="/#next-event" className="hover:text-jollof-text">
                Next Event
              </Link>
              <Link href="/login" className="hover:text-jollof-text">
                Sign In
              </Link>
              <Link href="/register" className="hover:text-jollof-text">
                Register
              </Link>
            </div>
          </div>

          {/* Sister businesses */}
          <div>
            <h4 className="font-semibold mb-3">Our Family</h4>
            <div className="flex flex-col gap-2 text-sm text-jollof-text-muted">
              {SISTER_BUSINESSES.map((biz) => (
                <a
                  key={biz.name}
                  href={biz.url}
                  className="hover:text-jollof-text"
                >
                  {biz.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-jollof-border text-center text-sm text-jollof-text-muted">
          &copy; {new Date().getFullYear()} Jollof Bash. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
