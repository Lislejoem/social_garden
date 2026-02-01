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

type BackgroundOption = "none" | "aura1" | "aura2" | "aura3" | "aura4" | "aura5";

// Aura background image paths
const AURA_IMAGES: Record<Exclude<BackgroundOption, "none">, string> = {
  aura1: "/backgrounds/aura-1.webp",
  aura2: "/backgrounds/aura-2.webp",
  aura3: "/backgrounds/aura-3.webp",
  aura4: "/backgrounds/aura-4.webp",
  aura5: "/backgrounds/aura-5.webp",
};

export default function DesignTestPage() {
  const [activeBackground, setActiveBackground] =
    useState<BackgroundOption>("none");
  const [blurLevel, setBlurLevel] = useState<8 | 12 | 16>(12);
  const [translucency, setTranslucency] = useState<40 | 50 | 60>(50);
  const [borderStrength, setBorderStrength] = useState<30 | 40 | 50>(40);
  const [pressScale, setPressScale] = useState<0.97 | 0.98 | 0.99>(0.98);

  // Get background style - either solid color or image
  const getBackgroundStyle = () => {
    if (activeBackground === "none") {
      return { backgroundColor: "#FDFCFB" };
    }
    return {
      backgroundImage: `url(${AURA_IMAGES[activeBackground]})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  };

  const getGlassClasses = () => {
    const bgOpacity =
      translucency === 40
        ? "bg-white/40"
        : translucency === 50
          ? "bg-white/50"
          : "bg-white/60";
    const border =
      borderStrength === 30
        ? "border border-white/30"
        : borderStrength === 40
          ? "border border-white/40"
          : "border border-white/50";
    return `${bgOpacity} ${border} shadow-sm`;
  };

  return (
    <div
      className="min-h-screen p-6 transition-all duration-500"
      style={getBackgroundStyle()}
    >
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center py-8">
          <h1 className="font-serif text-4xl text-stone-900 mb-2">
            Design Testing Playground
          </h1>
          <p className="text-stone-600">
            Phase 0: Visual design iteration for Grove
          </p>
          <p className="text-sm text-stone-400 mt-2">
            Not linked in nav - dev only
          </p>
        </header>

        {/* Section 1: Typography */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl text-stone-800 border-b border-stone-200 pb-2">
            1. Typography Comparison
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Current fonts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <p className="text-xs uppercase tracking-wide text-stone-400 mb-4">
                Current: Inter + Playfair Display
              </p>
              <h3 className="font-serif text-3xl text-stone-900 mb-3">
                Your Grove is Flourishing
              </h3>
              <h4 className="font-serif text-2xl text-stone-800 mb-3">
                Sarah Chen
              </h4>
              <p className="font-sans text-base text-stone-700 mb-2">
                Nurture your relationships with intention. Grove helps you
                remember the details that matter.
              </p>
              <p className="font-sans text-sm text-stone-500">
                Last contact: 3 days ago · Weekly cadence
              </p>
            </div>

            {/* New fonts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
              <p className="text-xs uppercase tracking-wide text-stone-400 mb-4">
                New: Karla + Cormorant Garamond
              </p>
              <h3 className="font-serif-new text-3xl text-stone-900 mb-3">
                Your Grove is Flourishing
              </h3>
              <h4 className="font-serif-new text-2xl text-stone-800 mb-3">
                Sarah Chen
              </h4>
              <p className="font-sans-new text-base text-stone-700 mb-2">
                Nurture your relationships with intention. Grove helps you
                remember the details that matter.
              </p>
              <p className="font-sans-new text-sm text-stone-500">
                Last contact: 3 days ago · Weekly cadence
              </p>
            </div>
          </div>

          {/* Header size tests */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <p className="text-xs uppercase tracking-wide text-stone-400 mb-4">
              Cormorant Garamond Header Sizes
            </p>
            <div className="space-y-3">
              <p className="font-serif-new text-[32px] text-stone-900">
                32px - Your Grove
              </p>
              <p className="font-serif-new text-[28px] text-stone-900">
                28px - Your Grove
              </p>
              <p className="font-serif-new text-[24px] text-stone-900">
                24px - Your Grove (minimum recommended)
              </p>
              <p className="font-serif-new text-[20px] text-stone-500">
                20px - Below minimum (not recommended)
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Glassmorphism */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl text-stone-800 border-b border-stone-200 pb-2">
            2. Glassmorphism Cards
          </h2>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 p-4 bg-stone-100 rounded-xl">
            <div>
              <label className="text-xs text-stone-500 block mb-1">
                Blur Level
              </label>
              <select
                value={blurLevel}
                onChange={(e) => setBlurLevel(Number(e.target.value) as 8 | 12 | 16)}
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-sm"
              >
                <option value={8}>8px (subtle)</option>
                <option value={12}>12px (medium)</option>
                <option value={16}>16px (strong)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">
                Translucency
              </label>
              <select
                value={translucency}
                onChange={(e) =>
                  setTranslucency(Number(e.target.value) as 40 | 50 | 60)
                }
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-sm"
              >
                <option value={40}>40% (more glass)</option>
                <option value={50}>50% (balanced)</option>
                <option value={60}>60% (more solid)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-500 block mb-1">
                Border Strength
              </label>
              <select
                value={borderStrength}
                onChange={(e) =>
                  setBorderStrength(Number(e.target.value) as 30 | 40 | 50)
                }
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-sm"
              >
                <option value={30}>30% (subtle)</option>
                <option value={40}>40% (medium)</option>
                <option value={50}>50% (strong)</option>
              </select>
            </div>
          </div>

          {/* Glass cards - Border Styles (reduced shadow, enhanced borders) */}
          <p className="text-stone-500 text-sm font-medium">Border Treatments:</p>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Subtle border */}
            <div className="backdrop-blur-[12px] bg-white/50 border border-white/30 rounded-3xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-stone-500 mb-3">
                Subtle: border-white/30
              </p>
              <h3 className="font-serif-new text-xl text-stone-900 mb-2">
                {mockContact.name}
              </h3>
              <p className="text-sm text-stone-600">{mockContact.location}</p>
              <div className="flex gap-2 mt-3">
                {mockContact.preferences.slice(0, 2).map((pref) => (
                  <span
                    key={pref}
                    className="px-2 py-1 bg-white/40 border border-white/40 rounded-full text-xs text-stone-600"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>

            {/* Medium border */}
            <div className="backdrop-blur-[12px] bg-white/50 border border-white/50 rounded-3xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-stone-500 mb-3">
                Medium: border-white/50
              </p>
              <h3 className="font-serif-new text-xl text-stone-900 mb-2">
                {mockContact.name}
              </h3>
              <p className="text-sm text-stone-600">{mockContact.location}</p>
              <div className="flex gap-2 mt-3">
                {mockContact.preferences.slice(0, 2).map((pref) => (
                  <span
                    key={pref}
                    className="px-2 py-1 bg-white/40 border border-white/50 rounded-full text-xs text-stone-600"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>

            {/* Strong border with gradient effect */}
            <div className="backdrop-blur-[12px] bg-white/50 border-2 border-white/60 rounded-3xl p-5 shadow-sm ring-1 ring-white/20 ring-inset">
              <p className="text-xs uppercase tracking-wide text-stone-500 mb-3">
                Strong: 2px + inner ring
              </p>
              <h3 className="font-serif-new text-xl text-stone-900 mb-2">
                {mockContact.name}
              </h3>
              <p className="text-sm text-stone-600">{mockContact.location}</p>
              <div className="flex gap-2 mt-3">
                {mockContact.preferences.slice(0, 2).map((pref) => (
                  <span
                    key={pref}
                    className="px-2 py-1 bg-white/40 border border-white/60 rounded-full text-xs text-stone-600"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Glass cards - Translucency comparison (updated with new border style) */}
          <p className="text-stone-500 text-sm font-medium mt-8">Translucency Levels (with medium border):</p>
          <div className="grid md:grid-cols-3 gap-6">
            {/* 40% translucency */}
            <div className="backdrop-blur-[12px] bg-white/40 border border-white/40 rounded-3xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-stone-500 mb-3">
                40% Translucency
              </p>
              <h3 className="font-serif-new text-xl text-stone-900 mb-2">
                {mockContact.name}
              </h3>
              <p className="text-sm text-stone-600">{mockContact.location}</p>
              <div className="flex gap-2 mt-3">
                {mockContact.preferences.slice(0, 2).map((pref) => (
                  <span
                    key={pref}
                    className="px-2 py-1 bg-white/30 border border-white/40 rounded-full text-xs text-stone-600"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>

            {/* 60% translucency */}
            <div className="backdrop-blur-[12px] bg-white/60 border border-white/40 rounded-3xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-stone-500 mb-3">
                60% Translucency
              </p>
              <h3 className="font-serif-new text-xl text-stone-900 mb-2">
                {mockContact.name}
              </h3>
              <p className="text-sm text-stone-600">{mockContact.location}</p>
              <div className="flex gap-2 mt-3">
                {mockContact.preferences.slice(0, 2).map((pref) => (
                  <span
                    key={pref}
                    className="px-2 py-1 bg-white/40 border border-white/40 rounded-full text-xs text-stone-600"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>

            {/* 80% translucency */}
            <div className="backdrop-blur-[12px] bg-white/80 border border-white/40 rounded-3xl p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-stone-500 mb-3">
                80% Translucency
              </p>
              <h3 className="font-serif-new text-xl text-stone-900 mb-2">
                {mockContact.name}
              </h3>
              <p className="text-sm text-stone-600">{mockContact.location}</p>
              <div className="flex gap-2 mt-3">
                {mockContact.preferences.slice(0, 2).map((pref) => (
                  <span
                    key={pref}
                    className="px-2 py-1 bg-white/50 border border-white/40 rounded-full text-xs text-stone-600"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic glass card with controls */}
          <p className="text-stone-500 text-sm font-medium mt-8">Dynamic Card (adjust controls above):</p>
          <div
            className={`rounded-3xl p-6 ${getGlassClasses()}`}
            style={{
              backdropFilter: `blur(${blurLevel}px)`,
            }}
          >
            <p className="text-xs uppercase tracking-wide text-stone-500 mb-3">
              Blur: {blurLevel}px · Translucency: {translucency}% · Border: {borderStrength}%
            </p>
            <h3 className="font-serif-new text-2xl text-stone-900 mb-2">
              {mockContact.name}
            </h3>
            <p className="text-stone-600 mb-4">{mockContact.location}</p>
            <div className="flex flex-wrap gap-2">
              {mockContact.preferences.map((pref) => (
                <span
                  key={pref}
                  className={`px-3 py-1.5 bg-white/40 rounded-full text-sm text-stone-700 border border-white/${borderStrength}`}
                >
                  {pref}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Backgrounds */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl text-stone-800 border-b border-stone-200 pb-2">
            3. Aura Backgrounds
          </h2>

          <p className="text-stone-600 text-sm">
            Select a background to see how glassmorphism looks against it.
            These are AI-generated aura images with the multi-color chord aesthetic.
          </p>

          <div className="flex flex-wrap gap-3">
            {(
              ["none", "aura1", "aura2", "aura3", "aura4", "aura5"] as BackgroundOption[]
            ).map((bg) => (
              <button
                key={bg}
                onClick={() => setActiveBackground(bg)}
                className={`px-4 py-2 rounded-xl text-sm transition-all ${
                  activeBackground === bg
                    ? "bg-emerald-900 text-white"
                    : "bg-white border border-stone-200 text-stone-700 hover:border-emerald-300"
                }`}
              >
                {bg === "none" ? "No Background" : `Aura ${bg.slice(-1)}`}
              </button>
            ))}
          </div>

          {/* Thumbnail previews */}
          <div className="grid grid-cols-5 gap-3">
            {(["aura1", "aura2", "aura3", "aura4", "aura5"] as const).map((bg) => (
              <button
                key={bg}
                onClick={() => setActiveBackground(bg)}
                className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                  activeBackground === bg
                    ? "border-emerald-500 ring-2 ring-emerald-200"
                    : "border-transparent hover:border-stone-300"
                }`}
              >
                <img
                  src={AURA_IMAGES[bg]}
                  alt={`Aura ${bg.slice(-1)} preview`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </section>

        {/* Section 4: Animations */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl text-stone-800 border-b border-stone-200 pb-2">
            4. Soft Press Animations
          </h2>

          {/* Scale control */}
          <div className="flex gap-4 p-4 bg-stone-100 rounded-xl">
            <div>
              <label className="text-xs text-stone-500 block mb-1">
                Press Scale
              </label>
              <select
                value={pressScale}
                onChange={(e) =>
                  setPressScale(Number(e.target.value) as 0.97 | 0.98 | 0.99)
                }
                className="px-3 py-1.5 rounded-lg border border-stone-200 text-sm"
              >
                <option value={0.97}>0.97 (more cushion)</option>
                <option value={0.98}>0.98 (balanced)</option>
                <option value={0.99}>0.99 (subtle)</option>
              </select>
            </div>
          </div>

          <p className="text-stone-600 text-sm">
            Click/tap each button to feel the soft press effect:
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Primary button */}
            <button
              className="bg-emerald-900 text-white px-6 py-4 rounded-2xl font-medium transition-transform duration-150 ease-out hover:bg-emerald-800"
              style={{
                transform: "scale(1)",
              }}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = `scale(${pressScale})`)
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              onTouchStart={(e) =>
                (e.currentTarget.style.transform = `scale(${pressScale})`)
              }
              onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Primary Button
            </button>

            {/* Secondary button */}
            <button
              className="bg-stone-100 text-stone-800 px-6 py-4 rounded-2xl font-medium transition-transform duration-150 ease-out hover:bg-stone-200"
              style={{
                transform: "scale(1)",
              }}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = `scale(${pressScale})`)
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              onTouchStart={(e) =>
                (e.currentTarget.style.transform = `scale(${pressScale})`)
              }
              onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Secondary Button
            </button>

            {/* Glass button */}
            <button
              className="backdrop-blur-[8px] bg-white/60 border border-white/30 text-stone-800 px-6 py-4 rounded-2xl font-medium transition-transform duration-150 ease-out hover:bg-white/70"
              style={{
                transform: "scale(1)",
              }}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = `scale(${pressScale})`)
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              onTouchStart={(e) =>
                (e.currentTarget.style.transform = `scale(${pressScale})`)
              }
              onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Glass Button
            </button>
          </div>

          {/* Card with soft press */}
          <div className="space-y-3">
            <p className="text-stone-600 text-sm">Card with soft press:</p>
            <button
              className="w-full text-left backdrop-blur-[8px] bg-white/60 border border-white/20 rounded-3xl p-5 shadow-lg transition-transform duration-150 ease-out"
              style={{
                transform: "scale(1)",
              }}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = `scale(${pressScale})`)
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
              onTouchStart={(e) =>
                (e.currentTarget.style.transform = `scale(${pressScale})`)
              }
              onTouchEnd={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <h3 className="font-serif-new text-xl text-stone-900 mb-2">
                {mockContact.name}
              </h3>
              <p className="text-sm text-stone-600">{mockContact.location}</p>
              <p className="text-xs text-emerald-700 mt-2">
                ✓ Thriving · Last contact {mockContact.lastContact}
              </p>
            </button>
          </div>
        </section>

        {/* Section 5: Combined Preview */}
        <section className="space-y-6">
          <h2 className="font-serif text-2xl text-stone-800 border-b border-stone-200 pb-2">
            5. Combined Preview
          </h2>

          <p className="text-stone-600 text-sm">
            Full preview with all design elements combined:
          </p>

          {/* Mock dashboard preview */}
          <div className="backdrop-blur-[8px] bg-white/50 border border-white/20 rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif-new text-2xl text-stone-900">
                Your Grove
              </h2>
              <button
                className="bg-emerald-900 text-white px-4 py-2 rounded-xl text-sm font-medium transition-transform duration-150 ease-out"
                style={{ transform: "scale(1)" }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = `scale(${pressScale})`)
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                + Add Contact
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Contact card 1 */}
              <button
                className="text-left backdrop-blur-[4px] bg-white/40 border border-white/20 rounded-2xl p-4 transition-transform duration-150 ease-out"
                style={{ transform: "scale(1)" }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = `scale(${pressScale})`)
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 font-medium">
                    SC
                  </div>
                  <div>
                    <h3 className="font-serif-new text-lg text-stone-900">
                      Sarah Chen
                    </h3>
                    <p className="text-xs text-stone-500">San Francisco</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-emerald-100/60 text-emerald-700 rounded-full text-xs">
                    Thriving
                  </span>
                  <span className="px-2 py-1 bg-white/50 text-stone-600 rounded-full text-xs">
                    3 days ago
                  </span>
                </div>
              </button>

              {/* Contact card 2 */}
              <button
                className="text-left backdrop-blur-[4px] bg-white/40 border border-white/20 rounded-2xl p-4 transition-transform duration-150 ease-out"
                style={{ transform: "scale(1)" }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = `scale(${pressScale})`)
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-700 font-medium">
                    MR
                  </div>
                  <div>
                    <h3 className="font-serif-new text-lg text-stone-900">
                      Marcus Rivera
                    </h3>
                    <p className="text-xs text-stone-500">Austin, TX</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-orange-100/60 text-orange-700 rounded-full text-xs">
                    Needs attention
                  </span>
                  <span className="px-2 py-1 bg-white/50 text-stone-600 rounded-full text-xs">
                    3 weeks ago
                  </span>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-stone-400 text-sm">
          Design Test Page · Phase 0 of Visual Design Implementation (#31)
        </footer>
      </div>
    </div>
  );
}
