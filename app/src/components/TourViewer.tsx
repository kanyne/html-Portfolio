import { useEffect, useRef, useState } from 'react';
import { TOUR_SCENES, sceneUrl, type TourScene } from '../data/tour';
import { IconPin } from './Icons';

/**
 * Embedded 360° tour. The player is a third-party site, so we can't rely on it
 * allowing itself to be framed: if it hasn't reported a load within a few
 * seconds we assume the embed was refused and offer the tour in a new tab
 * instead, rather than leaving a blank rectangle on the page.
 */
export default function TourViewer({ initial }: { initial?: string }) {
  const first = (initial && TOUR_SCENES.find((s) => s.id === initial)) || TOUR_SCENES[0];
  const [scene, setScene] = useState<TourScene>(first);
  const [loaded, setLoaded] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const frame = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (loaded) return;
    const t = setTimeout(() => { if (!loaded) setBlocked(true); }, 6000);
    return () => clearTimeout(t);
  }, [loaded]);

  useEffect(() => {
    const s = (initial && TOUR_SCENES.find((x) => x.id === initial)) || null;
    if (s) setScene(s);
  }, [initial]);

  const url = sceneUrl(scene);

  return (
    <div className="tour">
      <div className="tour-stage">
        {!blocked ? (
          <iframe
            ref={frame}
            key={scene.id}
            src={url}
            title={`360° tour — ${scene.label}`}
            loading="lazy"
            allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
            allowFullScreen
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <div className="tour-fallback">
            <span style={{ color: 'var(--red)' }}><IconPin /></span>
            <b className="font-display">Open the 360° tour</b>
            <p className="small muted">
              The tour player can’t be embedded here, but it opens fine in its own tab —
              starting at {scene.label}.
            </p>
            <a className="btn primary" href={url} target="_blank" rel="noreferrer">Launch virtual tour</a>
          </div>
        )}
        {!loaded && !blocked && <div className="tour-loading small muted">Loading 360° view…</div>}
      </div>

      <div className="chips" style={{ marginTop: 10 }}>
        {TOUR_SCENES.map((s) => (
          <button
            key={s.id}
            className={`chip ${s.id === scene.id ? 'active' : ''}`}
            onClick={() => { setScene(s); setLoaded(false); }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="small muted" style={{ marginTop: 8 }}>
        {scene.blurb}{' '}
        <a href={url} target="_blank" rel="noreferrer" className="link">Open full screen ↗</a>
      </p>
    </div>
  );
}
