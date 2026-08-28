import { AudioButton } from "./AudioButton";

export const PointCard = ({ meridianCode, point }) => {
  const fullCode = `${meridianCode}${point.num}`;

  return (
    <article
      data-testid={`point-card-${fullCode}`}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[#E2E7DE] bg-white px-5 sm:px-7 py-5 sm:py-6 shadow-[0_2px_10px_rgba(74,107,83,0.04)] hover:border-[#A3B19B]/60 transition-colors"
    >
      <div className="flex items-start gap-5 sm:gap-6 min-w-0">
        <span
          className="inline-flex items-center rounded-md border border-[#4A6B53]/25 px-2 py-1 font-mono text-xs sm:text-sm font-semibold text-[#4A6B53] shrink-0"
          data-testid={`point-code-${fullCode}`}
        >
          {fullCode}
        </span>
        <div className="min-w-0">
          {/* Pinyin — primary readable name (clean sans-serif, medium) */}
          <p
            className="font-body text-xl sm:text-2xl font-medium tracking-tight text-[#4A6B53] leading-snug"
            data-testid={`point-pinyin-${fullCode}`}
          >
            {point.pinyin}
          </p>
          {/* Hanzi — kept large and dark for character learners */}
          <h4
            className="font-hanzi text-2xl sm:text-[1.75rem] text-[#233127] leading-tight mt-1.5"
            lang="zh-Hans"
            data-testid={`point-hanzi-${fullCode}`}
          >
            {point.hanzi}
          </h4>
        </div>
      </div>

      <div className="sm:ml-4 sm:shrink-0">
        <AudioButton
          text={point.hanzi}
          audioUrl={point.audioUrl}
          meridianCode={meridianCode}
          pointNum={point.num}
          label={`Putar pelafalan ${point.pinyin}`}
          testId={`audio-button-${fullCode}`}
        />
      </div>
    </article>
  );
};

export default PointCard;
