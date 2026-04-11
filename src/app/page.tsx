import Link from "next/link";
import {
  UtensilsCrossed,
  CalendarDays,
  Users,
  Gift,
  ArrowRight,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { MenuShowcase } from "@/components/shared/MenuShowcase";
import { GalleryCarousel } from "@/components/shared/GalleryCarousel";
import { getNextEventDate, formatEventDate, formatEventTime, formatPence } from "@/lib/utils";
import { SEAT_PRICE_PENCE, CORKAGE_FEE_PENCE, SISTER_BUSINESSES } from "@/lib/constants";

export default function LandingPage() {
  const nextEvent = getNextEventDate();

  return (
    <>
      <Navbar />

      <main>
        <GalleryCarousel />

        {/* Hero Section — Split Cards */}
        <section className="flex flex-col items-center justify-center px-4 py-16 text-center bg-gradient-to-b from-jollof-bg via-jollof-surface to-jollof-bg">
          <div className="max-w-3xl mb-10">
            <p className="text-jollof-amber font-semibold mb-4 tracking-wide uppercase text-sm">
              West African Cuisine
            </p>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Jollof{" "}
              <span className="text-jollof-amber">Bash</span>
            </h1>
            <p className="text-xl md:text-2xl text-jollof-text-muted max-w-2xl mx-auto">
              A celebration of West African flavours. Monthly supper club events &amp; takeaway ordering.
            </p>
          </div>

          {/* Split Hero Cards */}
          <div className="max-w-4xl w-full grid md:grid-cols-2 gap-6 mb-12">
            {/* Event Card */}
            <div className="bg-jollof-surface rounded-2xl p-6 border border-jollof-border text-left">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays size={20} className="text-jollof-amber" />
                <h2 className="font-bold text-lg">Jollof Bash Event</h2>
              </div>
              <div className="mb-4">
                <p className="text-sm text-jollof-text-muted mb-1">Next event</p>
                <p className="font-semibold">{formatEventDate(nextEvent)}</p>
                <p className="text-sm text-jollof-text-muted">
                  {formatEventTime(nextEvent)} &mdash; {formatPence(SEAT_PRICE_PENCE)} per seat
                </p>
              </div>
              <div className="text-sm text-jollof-text-muted mb-4 space-y-1">
                <p className="flex items-center gap-2">
                  <UtensilsCrossed size={14} className="text-jollof-amber" />
                  Set menu &mdash; food served Mezze/Buffet style
                </p>
                <p className="flex items-center gap-2">
                  <Users size={14} className="text-jollof-amber" />
                  Intimate setting, last Saturday monthly
                </p>
              </div>
              <Link
                href="/book"
                className="w-full bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-6 py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                Book Your Seat <ArrowRight size={16} />
              </Link>
            </div>

            {/* Takeaway Card */}
            <div className="bg-jollof-surface rounded-2xl p-6 border border-jollof-border text-left">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag size={20} className="text-jollof-amber" />
                <h2 className="font-bold text-lg">Next Day Order</h2>
              </div>
              <div className="mb-4">
                <p className="text-lg font-semibold">
                  Fresh West African food, delivered tomorrow
                </p>
                <p className="text-sm text-jollof-text-muted mt-1">
                  Browse our menu and order for next day delivery
                </p>
              </div>
              <div className="text-sm text-jollof-text-muted mb-4 space-y-1">
                <p className="flex items-center gap-2">
                  <Truck size={14} className="text-jollof-amber" />
                  Next day delivery to your door
                </p>
                <p className="flex items-center gap-2">
                  <ShoppingBag size={14} className="text-jollof-amber" />
                  Order today, enjoy tomorrow
                </p>
              </div>
              <Link
                href="/order"
                className="w-full bg-jollof-red hover:bg-jollof-red/90 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                Order Now <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 justify-center text-sm text-jollof-text-muted">
            <div className="flex items-center gap-2">
              <UtensilsCrossed size={16} className="text-jollof-amber" />
              <span>West African Cuisine</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-jollof-amber" />
              <span>Last Saturday Monthly</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift size={16} className="text-jollof-amber" />
              <span>Gift Tickets Available</span>
            </div>
          </div>
        </section>

        {/* Next Event Section */}
        <section id="next-event" className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Next <span className="text-jollof-amber">Event</span>
            </h2>

            <div className="bg-jollof-surface rounded-2xl p-8 border border-jollof-border">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-jollof-amber font-semibold text-sm uppercase tracking-wide mb-2">
                    Date &amp; Time
                  </p>
                  <p className="text-2xl font-bold mb-1">
                    {formatEventDate(nextEvent)}
                  </p>
                  <p className="text-jollof-text-muted text-lg">
                    {formatEventTime(nextEvent)}
                  </p>
                </div>

                <div>
                  <p className="text-jollof-amber font-semibold text-sm uppercase tracking-wide mb-2">
                    Pricing
                  </p>
                  <p className="text-2xl font-bold mb-1">
                    {formatPence(SEAT_PRICE_PENCE)} per seat
                  </p>
                  <p className="text-jollof-text-muted">
                    BYOB welcome &mdash; {formatPence(CORKAGE_FEE_PENCE)} corkage if bringing your own drinks
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-jollof-border text-center">
                <Link
                  href="/book"
                  className="bg-jollof-amber hover:bg-jollof-amber-dark text-jollof-bg font-semibold px-8 py-3 rounded-lg text-lg transition-colors inline-flex items-center gap-2"
                >
                  Reserve Your Spot <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Menu Section */}
        <MenuShowcase />

        {/* About Section */}
        <section id="about" className="py-20 px-4 bg-jollof-surface">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              About <span className="text-jollof-amber">Jollof Bash</span>
            </h2>
            <p className="text-lg text-jollof-text-muted mb-8 max-w-2xl mx-auto">
              Jollof Bash is more than a meal — it&apos;s a monthly gathering that
              brings people together through the rich, vibrant flavours of West
              African cooking. From perfectly spiced jollof rice to suya, egusi,
              and more, every dish is crafted with love and tradition.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-jollof-bg rounded-xl p-6 border border-jollof-border">
                <UtensilsCrossed
                  size={32}
                  className="text-jollof-amber mx-auto mb-4"
                />
                <h3 className="font-semibold mb-2">Authentic Cuisine</h3>
                <p className="text-sm text-jollof-text-muted">
                  Traditional recipes with a modern twist, freshly prepared for
                  each event.
                </p>
              </div>
              <div className="bg-jollof-bg rounded-xl p-6 border border-jollof-border">
                <Users size={32} className="text-jollof-amber mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Community</h3>
                <p className="text-sm text-jollof-text-muted">
                  An intimate setting where strangers become friends over shared
                  plates.
                </p>
              </div>
              <div className="bg-jollof-bg rounded-xl p-6 border border-jollof-border">
                <ShoppingBag size={32} className="text-jollof-amber mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Next Day Delivery</h3>
                <p className="text-sm text-jollof-text-muted">
                  Order your favourite West African dishes for next day
                  delivery to your door.
                </p>
              </div>
            </div>

            {/* Food Hygiene Rating */}
            <div className="mt-12 flex flex-col items-center">
              <img
                src="/food-hygiene-rating.jpg"
                alt="Food Standards Agency – Food Hygiene Rating 5 (Very Good)"
                className="w-64 md:w-80 rounded-xl"
              />
              <p className="text-xs text-jollof-text-muted mt-3">
                Rated 5 (Very Good) by the Food Standards Agency
              </p>
            </div>
          </div>
        </section>

        {/* Sister Businesses */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              The Jollof <span className="text-jollof-amber">Family</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {SISTER_BUSINESSES.map((biz) => (
                <a
                  key={biz.name}
                  href={biz.url}
                  className="bg-jollof-surface rounded-xl p-6 border border-jollof-border hover:border-jollof-amber transition-colors text-left"
                >
                  <h3 className="font-semibold text-lg mb-2">{biz.name}</h3>
                  <p className="text-sm text-jollof-text-muted">
                    {biz.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
