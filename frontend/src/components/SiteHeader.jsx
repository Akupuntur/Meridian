import { Link } from "react-router-dom";
import { Sprout } from "lucide-react";

export const SiteHeader = () => {
  return (
    <header
      className="sticky top-0 z-40 bg-[#FDFBF7]/85 backdrop-blur-xl border-b border-[#E2E7DE]"
      data-testid="site-header"
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
        {/* Section 1 — brand: icon + Jīng Luò 经络 · Sistem Meridian */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group min-w-0"
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
          <span
            className="hidden md:inline font-body text-xs tracking-[0.14em] text-[#A3B19B] ml-1.5"
            data-testid="site-brand-subtitle"
          >
            · Sistem Meridian
          </span>
        </Link>

        {/* Section 2 — page purpose */}
        <span
          className="hidden sm:inline font-mono text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-[#A3B19B]"
          data-testid="site-page-label"
        >
          Pelafalan Akupunktur
        </span>

        {/* Section 3 — scope */}
        <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-[#A3B19B]">
          14 Meridian
        </span>
      </div>
    </header>
  );
};

export default SiteHeader;
