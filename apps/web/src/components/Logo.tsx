"use client";

import Link from "next/link";

export function TalaStarIcon({ className = "w-5 h-5", glow = false }: { className?: string; glow?: boolean }) {
  return (
    <span className={`inline-flex items-center justify-center relative ${glow ? "drop-shadow-[0_0_8px_rgba(229,184,105,0.6)]" : ""}`}>
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        {/* 8-pointed radiant morning star */}
        <path d="M12 1.5L14.2 8.8L21.5 11L14.2 13.2L12 20.5L9.8 13.2L2.5 11L9.8 8.8L12 1.5Z" />
        {/* Subtle diagonal facets */}
        <circle cx="12" cy="11" r="1.5" fill="var(--bg, #f5f2eb)" />
      </svg>
    </span>
  );
}

export function TalaWordmark({
  href = "/library",
  showTagline = false,
  size = "md",
}: {
  href?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl sm:text-3xl",
  };

  const starSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const content = (
    <div className="flex items-center gap-2.5 select-none group">
      <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] transition-transform duration-200 group-hover:scale-105 group-hover:border-[var(--accent)]/40 shadow-xs">
        <TalaStarIcon className={starSizes[size]} glow />
      </div>
      <div className="flex flex-col">
        <span
          className={`font-serif italic font-normal tracking-tight text-[var(--ink)] leading-none transition-colors group-hover:text-[var(--accent)] ${sizeClasses[size]}`}
        >
          tala
        </span>
        {showTagline && (
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--muted)] mt-0.5">
            sanctuary
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
