"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { TalaStarIcon, TalaWordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signUp.email({
        name,
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Failed to create account. Please try again.");
      } else {
        router.push("/library");
      }
    } catch {
      setError("Unable to connect. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-between p-4 sm:p-6 transition-colors">
      {/* Top Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <TalaWordmark href="/" size="sm" />
        <ThemeToggle compact />
      </header>

      {/* Main Form Box */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="rounded-2xl border border-[var(--faint)] bg-[var(--paper)] p-6 sm:p-10 shadow-lift relative overflow-hidden transition-all">
          {/* Subtle top star accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-60" />

          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex p-2.5 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] mb-2 shadow-2xs">
              <TalaStarIcon className="w-6 h-6" glow />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[var(--ink)] tracking-tight">
              Create your sanctuary
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] font-sans">
              Begin gathering your thoughts, articles, and inspirations
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-300 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 font-sans animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]"
              >
                Your Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[var(--faint)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/50 focus:border-[var(--accent)] transition-all"
                placeholder="Maya Angelou"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[var(--faint)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/50 focus:border-[var(--accent)] transition-all"
                placeholder="reader@sanctuary.com"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[var(--faint)] bg-[var(--bg)] px-3.5 py-2.5 pr-10 text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/50 focus:border-[var(--accent)] transition-all font-sans"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[var(--accent-contrast)] shadow-sm hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating sanctuary...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-4 text-center border-t border-[var(--faint)] mt-6">
              <p className="text-xs text-[var(--muted)]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-[var(--accent)] hover:underline ml-1"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs font-mono text-[var(--muted)]">
        <span>Tala &bull; Knowledge collected with peace</span>
      </footer>
    </div>
  );
}
