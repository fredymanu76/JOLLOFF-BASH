import {
  MENU_STARTERS,
  MENU_MAINS,
  MENU_DESSERTS,
  VENUE,
  type MenuItem,
} from "@/lib/constants";

function MenuSection({
  title,
  items,
  accent,
}: {
  title: string;
  items: MenuItem[];
  accent: string;
}) {
  return (
    <div>
      <h3
        className="text-xl font-bold mb-4 pb-2 border-b-2"
        style={{ borderColor: accent }}
      >
        {title}
      </h3>
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <span className="text-3xl">{item.emoji}</span>
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-jollof-text-muted">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MenuShowcase() {
  return (
    <section id="menu" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-jollof-amber font-semibold text-sm uppercase tracking-wide mb-2">
            What&apos;s Cooking
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The <span className="text-jollof-amber">Menu</span>
          </h2>
          <p className="text-jollof-text-muted max-w-lg mx-auto">
            Food served mezze/buffet style at{" "}
            <span className="text-jollof-text font-medium">
              {VENUE.name}
            </span>
            , {VENUE.location}, {VENUE.address}, {VENUE.postcode}
          </p>
        </div>

        {/* Kente pattern divider */}
        <div className="flex justify-center gap-1 mb-12">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor:
                  i % 4 === 0
                    ? "#DC2626"
                    : i % 4 === 1
                      ? "#F59E0B"
                      : i % 4 === 2
                        ? "#16A34A"
                        : "#1C1917",
              }}
            />
          ))}
        </div>

        {/* Menu grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-jollof-surface rounded-2xl p-6 border border-jollof-border">
            <MenuSection
              title="Starter"
              items={MENU_STARTERS}
              accent="#F59E0B"
            />
          </div>

          <div className="bg-jollof-surface rounded-2xl p-6 border border-jollof-border md:row-span-1">
            <MenuSection
              title="Main Course"
              items={MENU_MAINS}
              accent="#DC2626"
            />
          </div>

          <div className="bg-jollof-surface rounded-2xl p-6 border border-jollof-border">
            <MenuSection
              title="Dessert"
              items={MENU_DESSERTS}
              accent="#F59E0B"
            />
          </div>
        </div>

        {/* Food images row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-amber-600 to-red-700 flex items-center justify-center text-6xl">
            🍚
          </div>
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-green-700 to-emerald-900 flex items-center justify-center text-6xl">
            🥗
          </div>
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-orange-600 to-amber-800 flex items-center justify-center text-6xl">
            🍗
          </div>
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-red-600 to-rose-900 flex items-center justify-center text-6xl">
            🍲
          </div>
        </div>

        {/* BYOB notice */}
        <div className="bg-jollof-amber/10 border border-jollof-amber/30 rounded-xl p-6 text-center">
          <p className="text-lg font-semibold text-jollof-amber mb-1">
            BYOB — Bring Your Own Bottle!
          </p>
          <p className="text-jollof-text-muted">
            Corkage fee of just &pound;2 per person. Unsure or have allergies?
            Please ask first before tasting.
          </p>
        </div>
      </div>
    </section>
  );
}
