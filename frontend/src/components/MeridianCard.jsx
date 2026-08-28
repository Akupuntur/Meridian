import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export const MeridianCard = ({ meridian }) => {
  const { code, hanzi, pinyin, indonesian, english, points } = meridian;
  return (
    <Link
      to={`/meridian/${code.toLowerCase()}`}
      data-testid={`meridian-card-${code}`}
      className="group relative flex flex-col rounded-3xl border border-[#E2E7DE] bg-white p-7 sm:p-8 shadow-[0_4px_24px_rgba(74,107,83,0.05)] hover:shadow-[0_14px_38px_rgba(74,107,83,0.12)] hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6B53]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDFBF7]"
    >
      {/* Meta row: code · English · point count */}
      <div className="flex items-start justify-between gap-3 mb-5 sm:mb-6">
        <span
          className="inline-flex items-baseline flex-wrap gap-x-1.5 gap-y-1 font-mono uppercase text-xs sm:text-[13px] leading-none"
          data-testid={`meridian-meta-${code}`}
        >
          <span
            className="font-semibold tracking-[0.16em] text-[#233127]"
            data-testid={`meridian-code-${code}`}
          >
            {code}
          </span>
          <span aria-hidden="true" className="text-[#A3B19B]">·</span>
          <span className="font-medium tracking-[0.14em] text-[#4A6B53]">
            {english}
          </span>
          <span aria-hidden="true" className="text-[#A3B19B]">·</span>
          <span className="font-medium tracking-[0.14em] text-[#4A6B53]">
            {points.length} titik
          </span>
        </span>
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-[#A3B19B] group-hover:text-[#4A6B53] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300"
          aria-hidden="true"
        />
      </div>

      {/* Primary — Indonesian meridian name */}
      <h3
        className="font-heading text-2xl sm:text-[1.75rem] font-medium text-[#233127] leading-[1.15] mb-4"
        data-testid={`meridian-indonesian-${code}`}
      >
        {indonesian}
      </h3>

      {/* Pinyin */}
      <p
        className="font-heading text-lg sm:text-xl italic text-[#4A6B53] leading-snug mb-3"
        data-testid={`meridian-pinyin-${code}`}
      >
        {pinyin}
      </p>

      {/* Hanzi — kept prominent so learners can study the characters */}
      <p
        className="font-hanzi text-2xl sm:text-[1.65rem] text-[#233127] leading-tight"
        lang="zh-Hans"
        data-testid={`meridian-hanzi-${code}`}
      >
        {hanzi}
      </p>
    </Link>
  );
};

export default MeridianCard;
