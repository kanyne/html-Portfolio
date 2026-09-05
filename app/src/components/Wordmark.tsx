import { useState } from 'react';

/**
 * The Colosseum neon logo, shown centred at the top of the app.
 *
 * This renders the supplied artwork file as-is — no recreation, no filters
 * applied to the mark itself. Drop the provided PNG in at:
 *
 *     app/public/img/brand/colosseum-logo.png
 *
 * The artwork has a black background, so `mix-blend-mode: screen` (set in CSS)
 * drops the black away and leaves only the light of the tubes, which is what
 * blends it into the header bar. That works whether the file is background-
 * removed or not.
 *
 * Until the file is present nothing is rendered, so the header simply looks
 * as it did before rather than showing a broken image.
 */
export const WORDMARK_SRC = '/img/brand/colosseum-logo.png';

export default function Wordmark({ className }: { className?: string }) {
  const [missing, setMissing] = useState(false);
  if (missing) return null;
  return (
    <img
      className={className}
      src={WORDMARK_SRC}
      alt="Colosseum"
      decoding="async"
      onError={() => setMissing(true)}
    />
  );
}
