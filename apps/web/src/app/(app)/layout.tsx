"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-provider";
import { signOut } from "@/lib/auth-client";
import { TalaWordmark, TalaStarIcon } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  BookOpen,
  Folder,
  Star,
  LogOut,
  User as UserIcon,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const navigation = [
    { name: "Library", href: "/library", icon: BookOpen },
    { name: "Collections", href: "/collections", icon: Folder },
    { name: "Favorites", href: "/favorites", icon: Star },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--muted)]">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] animate-pulse">
            <TalaStarIcon className="w-8 h-8" glow />
          </div>
          <span className="font-mono text-xs tracking-wider uppercase">Loading sanctuary...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const userInitial = (user.name || user.email || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[var(--accent-soft)] selection:text-[var(--accent)]">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--faint)] bg-[var(--bg)]/90 backdrop-blur-md transition-colors">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <TalaWordmark href="/library" size="md" />

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center gap-1.5">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[var(--accent-soft)] text-[var(--accent)] font-semibold shadow-2xs"
                          : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-[var(--accent)]" : "opacity-70"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Tools & Profile */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <ThemeToggle />

              {/* User Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-[var(--faint)] bg-[var(--paper)] text-[var(--ink)] hover:border-[var(--faint-strong)] transition-all cursor-pointer shadow-2xs"
                  aria-label="User account menu"
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-mono text-xs font-semibold flex items-center justify-center border border-[var(--accent)]/30">
                    {userInitial}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium max-w-[120px] truncate">
                    {user.name || user.email.split("@")[0]}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--faint)] bg-[var(--paper)] p-1.5 shadow-lift z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3 py-2 border-b border-[var(--faint)] mb-1">
                      <p className="text-xs font-medium text-[var(--ink)] truncate">
                        {user.name || "Reader"}
                      </p>
                      <p className="text-[11px] text-[var(--muted)] font-mono truncate">
                        {user.email}
                      </p>
                    </div>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg border border-[var(--faint)] bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)]"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--faint)] bg-[var(--bg)] px-4 py-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                      : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--panel)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Sanctuary Content */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>

      {/* Discreet Sanctuary Footer */}
      <footer className="border-t border-[var(--faint)] py-6 mt-12 bg-[var(--bg)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <TalaStarIcon className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Tala Sanctuary</span>
          </div>
          <div>
            <span>Press <kbd className="px-1.5 py-0.5 rounded border border-[var(--faint)] bg-[var(--panel)] text-[10px]">Enter</kbd> to quick-capture</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
