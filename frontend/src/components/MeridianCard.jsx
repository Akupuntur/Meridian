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
        <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-[#A3B19B]">
          {code} · {points.length} titik
        </span>
        <ArrowUpRight
          className="h-4 w-4 text-[#A3B19B] group-hover:text-[#4A6B53] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300"
          aria-hidden="true"
        />
      </div>

      <div>
        <h3
          className="font-hanzi text-4xl sm:text-[2.6rem] font-normal text-[#233127] leading-tight mb-3"
          lang="zh-Hans"
        >
          {hanzi}
        </h3>
        <p className="font-heading text-xl sm:text-2xl italic text-[#4A6B53] mb-6 leading-snug">
          {pinyin}
        </p>
      </div>

      <div className="pt-5 border-t border-[#E2E7DE]/70">
        <p className="font-body text-sm text-[#233127]">{indonesian}</p>
        <p className="font-body text-xs text-[#697A6D] mt-0.5">
          {english}
        </p>
      </div>
    </Link>
  );
};

export default MeridianCard;
