"use client";

import { useState, useEffect } from "react";
import type { GalleryItem } from "@/types";

export function GalleryCarousel() {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch("/api/gallery");
        const data = await res.json();
        setItems(data.items || []);
      } catch {
        // Silently fail — gallery simply won't show
      }
    }
    fetchGallery();
  }, []);

  if (items.length === 0) return null;

  // Duplicate items for seamless infinite scroll
  const scrollItems = [...items, ...items];

  return (
    <section id="gallery" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
          The <span className="text-jollof-amber">Gallery</span>
        </h2>
        <p className="text-center text-jollof-text-muted mb-10">
          Past Events
        </p>

        <div className="gallery-scroll-container">
          <div className="gallery-scroll-strip">
            {scrollItems.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="gallery-scroll-item">
                {item.mediaType === "VIDEO" ? (
                  <video
                    src={item.url}
                    muted
                    playsInline
                    loop
                    autoPlay
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.caption || "Gallery image"}
                    className="w-full h-full object-cover rounded-xl"
                  />
                )}
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent rounded-b-xl px-4 py-3">
                    <p className="text-sm text-white font-medium">
                      {item.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
