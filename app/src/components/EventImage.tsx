import { useEffect, useState } from 'react';
import type { EventItem } from '../data/events';

type Props = {
  ev: EventItem;
  className?: string;
  style?: React.CSSProperties;
  /** Kept for call-site compatibility; posters now always fill their frame. */
  blurBackdrop?: boolean;
  alt?: string;
};

/**
 * Shows the official event artwork, falling back to the local venue photograph
 * if the remote CDN is unreachable.
 *
 * The poster fills its frame edge to edge (`object-fit: cover`). Posters are
 * shot in a range of aspect ratios, so they are anchored to the top of the
 * frame — on a portrait poster that keeps the face and title visible and
 * crops from the bottom, rather than slicing the head off centre.
 */
export default function EventImage({ ev, className, style, alt = '' }: Props) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [ev.id]);

  const src = !failed && ev.poster ? ev.poster : ev.image;

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
