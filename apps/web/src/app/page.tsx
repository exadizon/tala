"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-provider";
import { TalaWordmark, TalaStarIcon } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Bookmark,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  ExternalLink,
  Star,
  BookOpen,
} from "lucide-react";

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[var(--accent-soft)] selection:text-[var(--accent)]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--faint)] bg-[var(--bg)]/85 backdrop-blur-md transition-colors">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
          <TalaWordmark href="/" showTagline size="md" />

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />

            {!isLoading && user ? (
              <Link
                href="/library"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-95 shadow-sm transition-all"
              >
                <span>Enter Library</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] hover:opacity-95 shadow-2xs transition-all"
                >
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
          {/* Subtle background radial glow */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[var(--accent-soft)] rounded-full blur-3xl opacity-50 -z-10 pointer-events-none"
            aria-hidden="true"
          />

          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--faint)] bg-[var(--paper)] text-[var(--accent)] text-xs font-mono tracking-wider uppercase mb-6 shadow-2xs">
              <TalaStarIcon className="w-3.5 h-3.5" />
              <span>A sanctuary for what matters</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[var(--ink)] leading-[1.08] mb-6">
              A quiet place to gather <br />
              <span className="italic font-light text-[var(--accent)]">your captured world.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-[var(--muted)] leading-relaxed mb-10 font-sans">
              Tala is an intentional, distraction-free knowledge sanctuary. Clip articles,
              save inspirations, record notes, and organize your thoughts with quiet elegance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-16">
              <Link
                href={user ? "/library" : "/signup"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--accent)] text-[var(--accent-contrast)] font-medium text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>{user ? "Open Your Library" : "Start Gathering Free"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[var(--faint)] bg-[var(--paper)] text-[var(--ink)] font-medium text-sm hover:border-[var(--faint-strong)] hover:bg-[var(--paper-hover)] transition-all"
              >
                <span>Sign In to Existing Vault</span>
              </Link>
            </div>

            {/* Interactive / Visual App Preview Mockup */}
            <div className="relative mx-auto max-w-3xl rounded-xl border border-[var(--faint)] bg-[var(--panel)] p-2 sm:p-3 shadow-xl transition-all">
              <div className="rounded-lg border border-[var(--faint)] bg-[var(--paper)] p-4 sm:p-6 text-left space-y-4">
                {/* Mock Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--faint)]">
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                    <span>tala://library</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
                    <span className="px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] font-medium">
                      3 items captured today
                    </span>
                  </div>
                </div>

                {/* Mock Capture Input */}
                <div className="flex items-center gap-2 p-2 rounded-lg border border-[var(--faint)] bg-[var(--bg)]">
                  <Search className="w-4 h-4 text-[var(--muted)] ml-1" />
                  <input
                    type="text"
                    readOnly
                    value="https://paulgraham.com/howtodo.html"
                    className="flex-1 bg-transparent text-xs sm:text-sm text-[var(--ink)] font-mono outline-none cursor-default"
                  />
                  <span className="px-2.5 py-1 rounded bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-medium">
                    Captured
                  </span>
                </div>

                {/* Mock Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-lg border border-[var(--faint)] bg-[var(--bg)]/70 space-y-2 hover:border-[var(--accent)]/50 transition-colors">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
                      <span className="px-2 py-0.5 rounded-full bg-[var(--accent-sage-soft)] text-[var(--accent-sage)] font-medium">
                        paulgraham.com
                      </span>
                      <Star className="w-3.5 h-3.5 fill-[var(--accent)] text-[var(--accent)]" />
                    </div>
                    <h3 className="font-serif text-sm font-medium text-[var(--ink)] line-clamp-1">
                      How to Do Great Work
                    </h3>
                    <p className="text-xs text-[var(--muted)] line-clamp-2 italic font-serif">
                      &ldquo;If you wanted to collect all the advice on how to do great work in one rule...&rdquo;
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg border border-[var(--faint)] bg-[var(--bg)]/70 space-y-2 hover:border-[var(--accent)]/50 transition-colors">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
                      <span className="px-2 py-0.5 rounded-full bg-[var(--accent-blue-soft)] text-[var(--accent-blue)] font-medium">
                        danwang.co
                      </span>
                      <Star className="w-3.5 h-3.5 text-[var(--muted)]" />
                    </div>
                    <h3 className="font-serif text-sm font-medium text-[var(--ink)] line-clamp-1">
                      2025 Letter: Technology and Process
                    </h3>
                    <p className="text-xs text-[var(--muted)] line-clamp-2 italic font-serif">
                      &ldquo;Deep craft requires deliberate attention in a distracted world.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 sm:py-24 border-t border-[var(--faint)] bg-[var(--panel)]/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-14">
              <h2 className="font-serif text-2xl sm:text-4xl font-normal text-[var(--ink)] mb-3">
                Crafted for clarity and focus.
              </h2>
              <p className="text-sm sm:text-base text-[var(--muted)]">
                Everything you need to gather knowledge without algorithmic clutter.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-xl border border-[var(--faint)] bg-[var(--paper)] space-y-4 hover:border-[var(--faint-strong)] transition-all shadow-2xs">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                  <Bookmark className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[var(--ink)]">
                  Instant Web Capture
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed font-sans">
                  Clip URLs, articles, and references in milliseconds. Automatic domain extraction,
                  clean metadata, and instant categorization.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-xl border border-[var(--faint)] bg-[var(--paper)] space-y-4 hover:border-[var(--faint-strong)] transition-all shadow-2xs">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[var(--ink)]">
                  Collections & Notes
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed font-sans">
                  Group your findings into curated vaults. Add personal annotations,
                  highlights, and reflections alongside your captured links.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-xl border border-[var(--faint)] bg-[var(--paper)] space-y-4 hover:border-[var(--faint-strong)] transition-all shadow-2xs">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[var(--ink)]">
                  High-Contrast Warmth
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed font-sans">
                  Harmonious light and dark themes tuned for long reading sessions.
                  Warm parchment tones and deep forest obsidian without harsh glare.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--faint)] py-8 bg-[var(--bg)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)] font-mono">
          <div className="flex items-center gap-2">
            <TalaStarIcon className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Tala &bull; Quiet Knowledge Sanctuary</span>
          </div>
          <div>
            <span>Made with intentionality &amp; care</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
