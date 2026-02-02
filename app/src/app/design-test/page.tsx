"use client";

import { useState } from "react";

// Mock contact data for testing
const mockContact = {
  name: "Sarah Chen",
  location: "San Francisco, CA",
  cadence: "Weekly",
  lastContact: "3 days ago",
  preferences: ["Coffee enthusiast", "Trail running", "Book club"],
  health: "thriving" as const,
};

type BackgroundOption = "none" | "grove" | "forest-sunset" | "forest-dawn";

// Background paths
const BACKGROUNDS: Record<Exclude<BackgroundOption, "none">, string> = {
  grove: "/backgrounds/aad895_49c557_blob_scene_3k_square.svg",
  "forest-sunset": "/backgrounds/Calming forest silhouette at sunset.webp",
  "forest-dawn": "/backgrounds/Serene forest mist at dawn.webp",
};

export default function DesignTestPage() {
  const [activeBackground, setActiveBackground] =
    useState<BackgroundOption>("grove");
  // Locked settings from Phase 0
  const blurLevel = 12;
  const translucency = 60;
  const borderStrength = 50;
  const pressScale = 0.98;

  // Get background style - either solid color or image
  const getBackgroundStyle = () => {
    if (activeBackground === "none") {
      return { backgroundColor: "#FDFCFB" };
    }
    return {
      backgroundImage: `url(${BACKGROUNDS[activeBackground]})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  };

  return (
    <div
      className="min-h-screen p-6 transition-all duration-500"
      style={getBackgroundStyle()}
    >
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center py-8">
          <h1 className="font-serif text-4xl text-ink-rich mb-2">
            Grove Design System
          </h1>
          <p className="text-ink-muted">
            Phase 1: Design tokens and CSS utilities
          </p>
          <p className="text-sm text-ink-muted/60 mt-2">
            Dev reference · Not linked in nav
          </p>
        </header>

        {/* Section 1: Typography */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl text-stone-800 border-b border-stone-200 pb-2">
            1. Typography
          </h2>

          <div className="glass-card rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wide text-ink-muted mb-4">
              Cormorant Garamond (headers) + Karla (body)
            </p>
            <h3 className="font-serif text-3xl text-ink-rich mb-3">
              Your Grove is Flourishing
            </h3>
            <h4 className="font-serif text-2xl text-ink-rich mb-3">
              Sarah Chen
            </h4>
            <p className="font-sans text-base text-ink-rich mb-2">
              Nurture your relationships with intention. Grove helps you
              remember the details that matter.
            </p>
            <p className="font-sans text-sm text-ink-muted">
              Last contact: 3 days ago · Weekly cadence
            </p>
          </div>

          {/* Header size reference */}
          <div className="glass-card rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wide text-ink-muted mb-4">
              Header Size Reference (24px minimum for serif)
            </p>
            <div className="space-y-3">
              <p className="font-serif text-[32px] text-ink-rich">
                32px - Your Grove
              </p>
              <p className="font-serif text-[28px] text-ink-rich">
                28px - Your Grove
              </p>
              <p className="font-serif text-[24px] text-ink-rich">
                24px - Your Grove ✓
              </p>
              <p className="font-serif text-[20px] text-ink-muted">
                20px - Below minimum
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Glassmorphism Layers (Option D: Layered Depth) */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl text-stone-800 border-b border-stone-200 pb-2">
            2. Glassmorphism Layers
          </h2>

          {/* Locked settings display */}
          <div className="flex flex-wrap gap-4 p-4 bg-white/60 border border-white/50 rounded-xl">
            <div className="text-sm">
              <span className="text-stone-500">Blur:</span>{" "}
              <span className="font-medium text-stone-800">{blurLevel}px</span>
            </div>
            <div className="text-sm">
              <span className="text-stone-500">Translucency:</span>{" "}
              <span className="font-medium text-stone-800">{translucency}%</span>
            </div>
            <div className="text-sm">
              <span className="text-stone-500">Border:</span>{" "}
              <span className="font-medium text-stone-800">{borderStrength}%</span>
            </div>
            <div className="text-sm">
              <span className="text-stone-500">Press Scale:</span>{" "}
              <span className="font-medium text-stone-800">{pressScale}</span>
            </div>
          </div>

          {/* Layer examples using new CSS utilities */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* glass-background */}
            <div className="glass-background rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wide text-ink-muted mb-2">
                glass-background
              </p>
              <p className="text-sm text-ink-rich">blur: 12px</p>
              <p className="text-xs text-ink-muted">Page overlays</p>
            </div>

            {/* glass-container */}
            <div className="glass-container p-4">
              <p className="text-xs uppercase tracking-wide text-ink-muted mb-2">
                glass-container
              </p>
              <p className="text-sm text-ink-rich">blur: 4px</p>
              <p className="text-xs text-ink-muted">Dashboard sections</p>
            </div>

            {/* glass-card */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wide text-ink-muted mb-2">
                glass-card
              </p>
              <p className="text-sm text-ink-rich">no blur</p>
              <p className="text-xs text-ink-muted">Contact cards, list items</p>
            </div>

            {/* glass-floating */}
            <div className="glass-floating rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wide text-ink-muted mb-2">
                glass-floating
              </p>
              <p className="text-sm text-ink-rich">blur: 12px + shadow</p>
              <p className="text-xs text-ink-muted">FAB, modals</p>
            </div>
          </div>
        </section>

        {/* Section 3: Background */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl text-stone-800 border-b border-stone-200 pb-2">
            3. Grove Background
          </h2>

          <p className="text-stone-600 text-sm">
            Testing background options. Click to preview each with glassmorphism layers.
          </p>

          <div className="flex flex-wrap gap-3">
            {(["none", "grove", "forest-sunset", "forest-dawn"] as BackgroundOption[]).map((bg) => {
              const labels: Record<BackgroundOption, string> = {
                none: "No Background",
                grove: "Grove (Current)",
                "forest-sunset": "Forest Sunset",
                "forest-dawn": "Forest Dawn",
              };
              return (
                <button
                  key={bg}
                  onClick={() => setActiveBackground(bg)}
                  className={`px-4 py-2 rounded-xl text-sm transition-all soft-press ${
                    activeBackground === bg
                      ? "bg-grove-primary text-white"
                      : "bg-white border border-stone-200 text-stone-700 hover:border-emerald-300"
                  }`}
                >
                  {labels[bg]}
                </button>
              );
            })}
          </div>

          {/* Preview thumbnails */}
          <div className="grid grid-cols-3 gap-4">
            {(["grove", "forest-sunset", "forest-dawn"] as const).map((bg) => {
              const labels = {
                grove: "Grove (Current)",
                "forest-sunset": "Forest Sunset",
                "forest-dawn": "Forest Dawn",
              };
              const isActive = activeBackground === bg;
              return (
                <button
                  key={bg}
                  onClick={() => setActiveBackground(bg)}
                  className={`text-left soft-press ${isActive ? "ring-2 ring-grove-primary ring-offset-2" : ""}`}
                >
                  <div className="aspect-square rounded-xl overflow-hidden border border-stone-200">
                    <img
                      src={BACKGROUNDS[bg]}
                      alt={`${labels[bg]} preview`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className={`text-xs mt-2 ${isActive ? "text-grove-primary font-medium" : "text-ink-muted"}`}>
                    {labels[bg]}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 4: Animations */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl text-stone-800 border-b border-stone-200 pb-2">
            4. Soft Press Animations
          </h2>

          <p className="text-stone-600 text-sm">
            Use the <code className="bg-stone-100 px-1 rounded">soft-press</code> CSS class.
            Click/tap each button to feel the effect (scale: {pressScale}):
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Primary button */}
            <button className="bg-grove-primary hover:bg-grove-primary-hover text-white px-6 py-4 rounded-2xl font-medium soft-press">
              Primary Button
            </button>

            {/* Secondary button */}
            <button className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-6 py-4 rounded-2xl font-medium soft-press">
              Secondary Button
            </button>

            {/* Glass floating button */}
            <button className="glass-floating text-stone-800 px-6 py-4 rounded-2xl font-medium soft-press hover:bg-white/70">
              Glass Button
            </button>
          </div>

          {/* Card with soft press */}
          <div className="space-y-3">
            <p className="text-stone-600 text-sm">Card with soft press (using glass-card class):</p>
            <button className="w-full text-left glass-card rounded-3xl p-5 soft-press">
              <h3 className="font-serif text-xl text-stone-900 mb-2">
                {mockContact.name}
              </h3>
              <p className="text-sm text-stone-600">{mockContact.location}</p>
              <p className="text-xs text-grove-thriving mt-2">
                ✓ Thriving · Last contact {mockContact.lastContact}
              </p>
            </button>
          </div>
        </section>

        {/* Section 5: Combined Preview (Layered Depth Demo) */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl text-stone-800 border-b border-stone-200 pb-2">
            5. Layered Depth Preview
          </h2>

          <p className="text-stone-600 text-sm">
            Demonstrates the 4-layer glassmorphism approach:
            <span className="block mt-1 text-xs text-stone-400">
              Background (blur 12px) → Container (blur 4px) → Cards (no blur) → Floating (blur 12px)
            </span>
          </p>

          {/* Mock dashboard preview using new CSS classes */}
          <div className="glass-container p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-2xl text-ink-rich">
                Your Grove
              </h2>
              <button className="bg-grove-primary hover:bg-grove-primary-hover text-white px-4 py-2 rounded-xl text-sm font-medium soft-press">
                + Add Contact
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Contact card 1 - Thriving */}
              <button className="text-left glass-card rounded-2xl p-4 soft-press">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-grove-thriving/20 rounded-2xl flex items-center justify-center text-grove-thriving font-medium">
                    SC
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-ink-rich">
                      Sarah Chen
                    </h3>
                    <p className="text-xs text-ink-muted">San Francisco</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-grove-thriving/20 text-grove-thriving rounded-full text-xs">
                    Thriving
                  </span>
                  <span className="px-2 py-1 bg-white/50 text-ink-muted rounded-full text-xs">
                    3 days ago
                  </span>
                </div>
              </button>

              {/* Contact card 2 - Parched */}
              <button className="text-left glass-card rounded-2xl p-4 soft-press">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-grove-parched/20 rounded-2xl flex items-center justify-center text-grove-parched font-medium">
                    MR
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-ink-rich">
                      Marcus Rivera
                    </h3>
                    <p className="text-xs text-ink-muted">Austin, TX</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-grove-parched/20 text-grove-parched rounded-full text-xs">
                    Needs attention
                  </span>
                  <span className="px-2 py-1 bg-white/50 text-ink-muted rounded-full text-xs">
                    3 weeks ago
                  </span>
                </div>
              </button>
            </div>

            {/* Floating element demo */}
            <div className="mt-6 pt-4 border-t border-white/30">
              <p className="text-xs text-ink-muted mb-3">Floating layer (glass-floating):</p>
              <div className="glass-floating rounded-2xl p-4 inline-block">
                <span className="text-sm text-ink-rich">🎙️ Voice Recorder FAB</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-ink-muted/60 text-sm">
          Grove Design System · Issue #31
        </footer>
      </div>
    </div>
  );
}
