/**
 * AtmosphereBackground — a very subtle Chinese ink-wash inspired backdrop.
 *
 * Design notes:
 *   • Fixed to the viewport with pointer-events: none, so it never blocks
 *     interaction and never causes layout shifts or horizontal scroll.
 *   • Sits BEHIND all page content via `z-[-1]`. Body has the ivory base
 *     colour (#FDFBF7) applied in index.css, and each page wrapper is now
 *     transparent so this atmosphere paints between the two.
 *   • Two soft distant-mountain layers at the bottom of the viewport +
 *     a couple of extremely faint bamboo strokes on the right edge
 *     (desktop only). Everything sits at 4–8% opacity so the mountains
 *     read as "atmosphere" rather than illustration.
 *   • Colours are pulled from the existing site palette (jade #4A6B53,
 *     deep forest #233127). No new hues are introduced.
 *   • Mobile: mountain band is shorter and even more transparent so it
 *     never competes with the content on small screens.
 */
export const AtmosphereBackground = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden"
    data-testid="atmosphere-bg"
  >
    {/* Distant mountain silhouettes anchored to the bottom of the viewport */}
    <svg
      className="absolute bottom-0 left-0 w-full h-[38vh] sm:h-[52vh] opacity-[0.05] sm:opacity-[0.08]"
      viewBox="0 0 1440 400"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <filter id="atmosphere-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>

      {/* Far layer — softest wash */}
      <path
        d="M0,300 C160,240 260,260 400,270 C560,282 700,240 880,260 C1040,278 1200,240 1440,260 L1440,400 L0,400 Z"
        fill="#4A6B53"
        opacity="0.55"
        filter="url(#atmosphere-ink)"
      />

      {/* Mid layer */}
      <path
        d="M0,340 C200,290 340,320 520,310 C700,300 860,330 1040,315 C1220,300 1360,320 1440,310 L1440,400 L0,400 Z"
        fill="#4A6B53"
        opacity="0.75"
        filter="url(#atmosphere-ink)"
      />

      {/* Near layer — the darkest silhouette */}
      <path
        d="M0,370 C220,345 420,360 640,355 C880,349 1080,368 1280,360 C1360,357 1400,360 1440,358 L1440,400 L0,400 Z"
        fill="#233127"
        opacity="0.55"
      />
    </svg>

    {/* Bamboo hint on the right edge — desktop only, extremely faint */}
    <svg
      className="hidden sm:block absolute right-3 top-24 w-12 h-[68vh] opacity-[0.05]"
      viewBox="0 0 60 400"
      fill="none"
      stroke="#4A6B53"
      strokeLinecap="round"
    >
      {/* Two thin stalks */}
      <line x1="22" y1="0" x2="22" y2="400" strokeWidth="1.4" />
      <line x1="40" y1="20" x2="40" y2="400" strokeWidth="1" />
      {/* Node marks */}
      <line x1="18" y1="80" x2="26" y2="80" strokeWidth="1" />
      <line x1="18" y1="170" x2="26" y2="170" strokeWidth="1" />
      <line x1="18" y1="260" x2="26" y2="260" strokeWidth="1" />
      <line x1="36" y1="120" x2="44" y2="120" strokeWidth="1" />
      <line x1="36" y1="220" x2="44" y2="220" strokeWidth="1" />
      <line x1="36" y1="320" x2="44" y2="320" strokeWidth="1" />
      {/* A couple of small leaves */}
      <path d="M22,100 q10,-6 18,-2" strokeWidth="1" />
      <path d="M40,240 q-10,-4 -16,0" strokeWidth="1" />
    </svg>
  </div>
);

export default AtmosphereBackground;
