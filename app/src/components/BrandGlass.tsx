/**
 * Embossed glass "Colosseum" wordmark, centred at the top of the app.
 *
 * Treated as engraved glass rather than a lit neon sign: the artwork is almost
 * fully transparent and reads only through a bevel — a bright edge up-left, a
 * dark one down-right — so it sits in the surface of the header instead of
 * competing with page content.
 *
 * The script is set in a real cursive typeface (loaded with the app's other
 * Google Fonts) so it stays legible at any size; the looped ring echoes the
 * circular mark from the logo.
 */
export default function BrandGlass({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 560 150"
      role="img"
      aria-label="Colosseum"
      focusable="false"
    >
      <defs>
        <filter id="bgEmboss" x="-25%" y="-40%" width="150%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="b" />
          <feOffset in="b" dx="-1.1" dy="-1.1" result="hi" />
          <feOffset in="b" dx="1.3" dy="1.5" result="lo" />
          <feFlood floodColor="#ffffff" floodOpacity="0.62" result="hc" />
          <feComposite in="hc" in2="hi" operator="in" result="hl" />
          <feFlood floodColor="#000000" floodOpacity="0.58" result="lc" />
          <feComposite in="lc" in2="lo" operator="in" result="ll" />
          <feMerge>
            <feMergeNode in="ll" />
            <feMergeNode in="hl" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="bgSheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="0.48" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="0.52" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.13" />
        </linearGradient>
      </defs>

      <g filter="url(#bgEmboss)">
        {/* ring echoing the app icon, with a gap where the script passes through */}
        <circle
          cx="74"
          cy="75"
          r="52"
          fill="none"
          stroke="url(#bgSheen)"
          strokeWidth="6"
          strokeDasharray="250 76"
          strokeDashoffset="-38"
          strokeLinecap="round"
        />
        {/* textLength pins the width so the mark can never overflow the
            viewBox if the script face fails to load and a fallback is used */}
        <text
          x="286"
          y="104"
          textAnchor="middle"
          textLength="470"
          lengthAdjust="spacingAndGlyphs"
          fill="url(#bgSheen)"
          fontFamily="'Great Vibes', 'Segoe Script', 'Brush Script MT', cursive"
          fontSize="92"
        >
          Colosseum
        </text>
      </g>
    </svg>
  );
}
