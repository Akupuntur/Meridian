import { Link } from "react-router-dom";
import { Sprout } from "lucide-react";

export const SiteHeader = () => {
  return (
    <header
      className="sticky top-0 z-40 bg-[#FDFBF7]/85 backdrop-blur-xl border-b border-[#E2E7DE]"
      data-testid="site-header"
    >
      {/*
        Responsive layout:
        · Mobile (below md): two rows. Row 1 = brand link (spans full width),
          Row 2 = subtitle on the left + "14 MERIDIAN" on the right.
        · Desktop (md+): single row identical to before — brand link on the
          left, subtitle inline next to it, "14 MERIDIAN" on the far right.
      */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-4 sm:py-5 grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 md:grid-cols-[auto_1fr_auto]">
        {/* Section 1 — brand */}
        <Link
          to="/"
          className="col-span-2 md:col-span-1 flex items-center gap-2.5 group min-w-0"
          data-testid="site-logo-link"
        >
          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#4A6B53]/10 text-[#4A6B53] group-hover:bg-[#4A6B53] group-hover:text-white transition-colors flex-shrink-0">
            <Sprout className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="flex items-baseline gap-1.5">
            <span className="font-heading text-lg sm:text-xl tracking-tight text-[#233127]">
              Jīng Luò
            </span>
            <span
              className="font-hanzi text-sm sm:text-base text-[#4A6B53]"
              lang="zh-Hans"
            >
              经络
            </span>
          </span>
        </Link>

        {/* Section 2 — subtitle */}
        <span
          className="justify-self-start font-body text-xs tracking-[0.14em] text-[#A3B19B] md:ml-1.5"
          data-testid="site-brand-subtitle"
        >
          <span className="hidden md:inline">· </span>Sistem Meridian
        </span>

        {/* Section 3 — scope */}
        <span className="justify-self-end font-mono text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-[#A3B19B]">
          14 Meridian
        </span>
      </div>
    </header>
  );
};

export default SiteHeader;
