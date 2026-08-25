import { Link } from "react-router-dom";
import { Sprout } from "lucide-react";

export const SiteHeader = () => {
  return (
    <header
      className="sticky top-0 z-40 bg-[#FDFBF7]/85 backdrop-blur-xl border-b border-[#E2E7DE]"
      data-testid="site-header"
    >
      {/*
        Single-row layout on every viewport. Mobile just uses slightly smaller
        typography and tighter spacing so the three elements — brand, subtitle,
        and "14 MERIDIAN" — all fit on one line down to ~360px width.
        Desktop (sm+) restores the original larger sizes so it looks identical
        to the approved desktop design.
      */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand + subtitle */}
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-2.5 group min-w-0"
          data-testid="site-logo-link"
        >
          <span className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#4A6B53]/10 text-[#4A6B53] group-hover:bg-[#4A6B53] group-hover:text-white transition-colors flex-shrink-0">
            <Sprout className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
          </span>
          <span className="flex items-baseline gap-1 sm:gap-1.5">
            <span className="font-heading text-base sm:text-xl tracking-tight text-[#233127]">
              Jīng Luò
            </span>
            <span
              className="font-hanzi text-xs sm:text-base text-[#4A6B53]"
              lang="zh-Hans"
            >
              经络
            </span>
          </span>
          <span
            className="font-body text-[10px] sm:text-xs tracking-[0.12em] sm:tracking-[0.14em] text-[#A3B19B] ml-1 sm:ml-1.5 whitespace-nowrap"
            data-testid="site-brand-subtitle"
          >
            · Sistem Meridian
          </span>
        </Link>

        {/* Scope */}
        <span className="font-mono text-[9px] sm:text-[11px] tracking-[0.16em] sm:tracking-[0.22em] uppercase text-[#A3B19B] whitespace-nowrap shrink-0">
          14 Meridian
        </span>
      </div>
    </header>
  );
};

export default SiteHeader;
