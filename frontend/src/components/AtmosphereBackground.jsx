/**
 * AtmosphereBackground — a subtle Chinese ink-wash (shan shui) inspired
 * backdrop: several receding mountain ranges rising from a mist layer at
 * the bottom of the viewport, with a small cluster of bamboo stalks and
 * ink-brush leaves in the corner.
 *
 * Composition
 *   • The mountain SVG is anchored to the bottom half of the viewport so
 *     the top half (where headings, search, and card content live) stays
 *     visually clear.
 *   • Four ridge layers recede into the distance: the farthest is the
 *     palest and most heavily blurred, the nearest is the darkest and
 *     sharpest — the classic shan shui depth cue.
 *   • Two ivory mist strips separate the ranges to imply cloud.
 *   • A bamboo cluster sits in the bottom-right corner. On mobile only
 *     the outermost single stalk peeks in from the edge.
 *   • Palette borrows only from existing brand ink (jade #4A6B53 and
 *     deep forest #233127). Ivory #FDFBF7 is used for the mist strips.
 *
 * Visibility budget
 *   • Mobile   ≈  8–10% total intensity
 *   • Desktop  ≈ 11–14% total intensity
 *   • Content always paints ABOVE (this layer is fixed, z-[-1],
 *     pointer-events: none) so readability is untouched.
 */
export const AtmosphereBackground = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    data-testid="atmosphere-bg"
  >
    {/* ── Shan shui mountain range (bottom half of viewport) ───────────── */}
    <svg
      className="absolute bottom-0 left-0 w-full h-[62vh] sm:h-[68vh] opacity-[0.14] sm:opacity-[0.22]"
      viewBox="0 0 1440 720"
      preserveAspectRatio="xMidYMax slice"
      fill="none"
    >
      <defs>
        <filter id="atm-mist-far" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="atm-mist-mid" x="-6%" y="-6%" width="112%" height="112%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
        <filter id="atm-mist-near" x="-2%" y="-2%" width="104%" height="104%">
          <feGaussianBlur stdDeviation="0.9" />
        </filter>

        <linearGradient id="atm-mist-band" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDFBF7" stopOpacity="0" />
          <stop offset="50%" stopColor="#FDFBF7" stopOpacity="1" />
          <stop offset="100%" stopColor="#FDFBF7" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Farthest range — misty peaks */}
      <path
        d="M0,240 C120,180 220,200 340,180 C460,162 560,205 700,180 C840,155 960,200 1100,175 C1220,155 1340,190 1440,170 L1440,320 L0,320 Z"
        fill="#4A6B53"
        opacity="0.32"
        filter="url(#atm-mist-far)"
      />

      {/* Mist strip 1 */}
      <rect x="0" y="290" width="1440" height="60" fill="url(#atm-mist-band)" />

      {/* Mid range — the main ridge line */}
      <path
        d="M0,380 C140,300 280,360 420,330 C560,300 680,380 820,340 C960,300 1100,370 1240,335 C1340,315 1400,345 1440,340 L1440,500 L0,500 Z"
        fill="#4A6B53"
        opacity="0.55"
        filter="url(#atm-mist-mid)"
      />

      {/* Mist strip 2 */}
      <rect x="0" y="470" width="1440" height="46" fill="url(#atm-mist-band)" />

      {/* Near range — sharper foothills */}
      <path
        d="M0,540 C180,470 340,520 500,500 C660,480 800,530 960,505 C1120,478 1300,520 1440,500 L1440,640 L0,640 Z"
        fill="#4A6B53"
        opacity="0.72"
        filter="url(#atm-mist-near)"
      />

      {/* Foreground silhouette — darkest ink */}
      <path
        d="M0,640 C220,595 420,625 620,615 C840,605 1040,635 1240,620 C1340,614 1400,625 1440,620 L1440,720 L0,720 Z"
        fill="#233127"
        opacity="0.65"
      />
    </svg>

    {/* ── Bamboo cluster (bottom-right corner) ─────────────────────────── */}
    <svg
      className="absolute right-0 bottom-0 h-[58vh] sm:h-[76vh] w-[42vw] sm:w-[34vw] max-w-[520px] opacity-[0.14] sm:opacity-[0.20]"
      viewBox="0 0 320 720"
      preserveAspectRatio="xMaxYMax slice"
      fill="none"
    >
      <defs>
        <filter id="atm-brush" x="-4%" y="-4%" width="108%" height="108%">
          <feGaussianBlur stdDeviation="0.55" />
        </filter>
      </defs>

      <g stroke="#233127" strokeLinecap="round" filter="url(#atm-brush)">
        {/* Stalk 1 — tallest, closest to the right edge */}
        <line x1="262" y1="0" x2="252" y2="720" strokeWidth="4.8" opacity="0.95" />
        <line x1="252" y1="110" x2="272" y2="110" strokeWidth="1.6" opacity="0.85" />
        <line x1="253" y1="220" x2="271" y2="220" strokeWidth="1.6" opacity="0.85" />
        <line x1="254" y1="330" x2="270" y2="330" strokeWidth="1.6" opacity="0.85" />
        <line x1="255" y1="440" x2="269" y2="440" strokeWidth="1.6" opacity="0.85" />
        <line x1="256" y1="550" x2="268" y2="550" strokeWidth="1.6" opacity="0.85" />
        <line x1="257" y1="660" x2="267" y2="660" strokeWidth="1.6" opacity="0.85" />

        {/* Stalk 2 — mid, slightly leaning inward */}
        <path d="M198,40 C196,220 194,400 200,720" strokeWidth="3.4" opacity="0.85" fill="none" />
        <line x1="194" y1="170" x2="208" y2="170" strokeWidth="1.4" opacity="0.7" />
        <line x1="192" y1="290" x2="210" y2="290" strokeWidth="1.4" opacity="0.7" />
        <line x1="192" y1="410" x2="210" y2="410" strokeWidth="1.4" opacity="0.7" />
        <line x1="194" y1="530" x2="208" y2="530" strokeWidth="1.4" opacity="0.7" />
        <line x1="196" y1="640" x2="208" y2="640" strokeWidth="1.4" opacity="0.7" />

        {/* Stalk 3 — thinnest, farther left (mostly hidden on mobile) */}
        <path d="M132,130 C130,300 136,490 140,720" strokeWidth="2.6" opacity="0.65" fill="none" />
        <line x1="128" y1="260" x2="142" y2="260" strokeWidth="1.2" opacity="0.55" />
        <line x1="130" y1="390" x2="144" y2="390" strokeWidth="1.2" opacity="0.55" />
        <line x1="132" y1="520" x2="146" y2="520" strokeWidth="1.2" opacity="0.55" />
        <line x1="134" y1="640" x2="146" y2="640" strokeWidth="1.2" opacity="0.55" />
      </g>

      {/* Ink-brush leaves — long tapered strokes clustered on the stalks */}
      <g fill="#233127">
        {/* Upper leaves — stalk 1 */}
        <path d="M258,50 C238,60 204,64 172,50 C206,68 244,74 262,66 Z" opacity="0.9" />
        <path d="M258,66 C240,88 210,102 178,96 C210,102 242,98 262,86 Z" opacity="0.85" />
        <path d="M266,64 C288,80 306,106 312,138 C302,112 286,88 268,76 Z" opacity="0.9" />

        {/* Mid leaves — stalk 2 */}
        <path d="M204,230 C184,222 154,212 132,196 C164,224 194,240 210,240 Z" opacity="0.8" />
        <path d="M198,242 C180,264 152,282 122,282 C154,282 184,272 204,258 Z" opacity="0.75" />
        <path d="M212,238 C232,250 246,272 254,300 C246,276 232,256 216,246 Z" opacity="0.8" />

        {/* Lower cluster spanning stalks 2 & 3 */}
        <path d="M148,420 C124,418 92,428 62,450 C98,432 130,426 156,428 Z" opacity="0.75" />
        <path d="M154,428 C136,456 104,482 72,490 C106,478 138,458 158,438 Z" opacity="0.7" />
        <path d="M204,458 C182,466 150,470 120,462 C156,480 192,480 212,470 Z" opacity="0.75" />

        {/* Near-base leaves — stalk 3 */}
        <path d="M142,590 C118,586 86,596 56,618 C92,600 126,596 152,600 Z" opacity="0.65" />
        <path d="M144,608 C124,634 92,658 60,664 C98,656 130,636 152,616 Z" opacity="0.6" />
      </g>
    </svg>
  </div>
);

export default AtmosphereBackground;
