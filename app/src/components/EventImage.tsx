import { useEffect, useState } from 'react';
import type { EventItem } from '../data/events';

type Props = {
  ev: EventItem;
  className?: string;
  style?: React.CSSProperties;
  /** Render the venue photo behind a contained poster (used on hero headers). */
  blurBackdrop?: boolean;
  alt?: string;
};

/**
 * Shows the official event artwork when it loads, and silently falls back to the
 * local venue photograph if the remote CDN is unreachable or blocked.
 *
 * Posters come in wildly different aspect ratios (tall tour posters, wide film
 * stills, small logos), so `blurBackdrop` renders them contained on top of a
 * blurred fill instead of cropping heads and titles out of the frame.
 */
export default function EventImage({ ev, className, style, blurBackdrop, alt = '' }: Props) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [ev.id]);

  const src = !failed && ev.poster ? ev.poster : ev.image;
  const usingPoster = src === ev.poster;

  if (!blurBackdrop || !usingPoster) {
    return (
      <img
        className={className}
        style={style}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className={className} style={{ ...style, position: 'relative', overflow: 'hidden', background: '#0d0d0d' }}>
      <img
        src={ev.image}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(24px) brightness(0.45)',
          transform: 'scale(1.15)',
        }}
      />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}
