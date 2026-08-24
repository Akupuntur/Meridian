import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export const MeridianCard = ({ meridian }) => {
  const { code, hanzi, pinyin, indonesian, english, points } = meridian;
  return (
    <Link
      to={`/meridian/${code.toLowerCase()}`}
      data-testid={`meridian-card-${code}`}
      className="group relative flex flex-col justify-between rounded-3xl border border-[#E2E7DE] bg-white p-7 sm:p-8 shadow-[0_4px_24px_rgba(74,107,83,0.05)] hover:shadow-[0_14px_38px_rgba(74,107,83,0.12)] hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A6B53]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FDFBF7]"
    >
      <div className="flex items-start justify-between mb-6">
        <span className="inline-flex items-baseline gap-1.5 font-mono uppercase text-xs sm:text-[13px] leading-none">
          <span
            className="font-semibold tracking-[0.16em] text-[#233127]"
            data-testid={`meridian-code-${code}`}
          >
            {code}
          </span>
          <span
            aria-hidden="true"
            className="text-[#A3B19B] tracking-[0.14em]"
          >
            ·
          </span>
          <span className="font-medium tracking-[0.14em] text-[#4A6B53]">
            {points.length} titik
          </span>
        </span>
        <ArrowUpRight
          className="h-4 w-4 text-[#A3B19B] group-hover:text-[#4A6B53] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300"
          aria-hidden="true"
        />
      </div>

      <div>
        <h3
          className="font-hanzi text-3xl sm:text-[2.15rem] font-normal text-[#233127] leading-tight mb-3"
          lang="zh-Hans"
        >
          {hanzi}
        </h3>
        <p className="font-heading text-xl sm:text-2xl italic text-[#4A6B53] mb-6 leading-snug">
          {pinyin}
        </p>
      </div>

      <div className="pt-5 border-t border-[#E2E7DE]/70">
        <p className="font-body text-base sm:text-lg font-medium text-[#233127] leading-snug">
          {indonesian}
        </p>
        <p className="font-body text-xs sm:text-sm text-[#697A6D] mt-1">
          {english}
        </p>
      </div>
    </Link>
  );
};

export default MeridianCard;
