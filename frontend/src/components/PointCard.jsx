import { AudioButton } from "./AudioButton";

export const PointCard = ({ meridianCode, point }) => {
  const fullCode = `${meridianCode}${point.num}`;
  const spacedCode = `${meridianCode} ${point.num}`;

  return (
    <article
      data-testid={`point-card-${fullCode}`}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[#E2E7DE] bg-white px-5 sm:px-7 py-5 sm:py-6 shadow-[0_2px_10px_rgba(74,107,83,0.04)] hover:border-[#A3B19B]/60 transition-colors"
    >
      <div className="flex items-start gap-5 sm:gap-6 min-w-0">
        <span
          className="font-mono text-[11px] tracking-[0.2em] uppercase text-[#A3B19B] pt-1.5 shrink-0"
          data-testid={`point-code-${fullCode}`}
        >
          {fullCode}
        </span>
        <div className="min-w-0">
          <h4
            className="font-hanzi text-3xl sm:text-[2rem] text-[#233127] leading-tight"
            lang="zh-Hans"
            data-testid={`point-hanzi-${fullCode}`}
          >
            {point.hanzi}
          </h4>
          <p
            className="font-heading text-lg sm:text-xl italic text-[#4A6B53] mt-1"
            data-testid={`point-pinyin-${fullCode}`}
          >
            {point.pinyin}
          </p>
          <p className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#A3B19B] mt-2">
            {spacedCode}
          </p>
        </div>
      </div>

      <div className="sm:ml-4 sm:shrink-0">
        <AudioButton
          text={point.hanzi}
          audioUrl={point.audioUrl}
          label={`Putar pelafalan ${point.pinyin}`}
          testId={`audio-button-${fullCode}`}
        />
      </div>
    </article>
  );
};

export default PointCard;
