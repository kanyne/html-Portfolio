import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PORTFOLIO, PORTFOLIO_CATEGORIES, type PortfolioItem } from '../data/portfolio';
import { HALLS, TOTAL_SEATS } from '../data/halls';
import { Sheet } from '../components/ui';
import { IconPin, IconUser } from '../components/Icons';

/** Photo that falls back to a neutral venue shot if the file is missing. */
function Shot({ item, className }: { item: PortfolioItem; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className={className} style={{ display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,.05)' }}>
        <span className="small muted">Photo coming soon</span>
      </div>
    );
  }
  return (
    <img
      className={className}
      src={item.photo}
      alt={item.caption}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

export default function Portfolio() {
  const nav = useNavigate();
  const [cat, setCat] = useState<string>('All');
  const [open, setOpen] = useState<PortfolioItem | null>(null);

  const items = useMemo(
    () => (cat === 'All' ? PORTFOLIO : PORTFOLIO.filter((p) => p.category === cat)),
    [cat],
  );

  return (
    <div className="page">
      <h1 style={{ marginBottom: 4 }}>Portfolio</h1>
      <p className="muted" style={{ marginBottom: 14 }}>
        Productions that have taken place in the house — what was built, in which space, and at what size.
      </p>

      <div className="stat-row section">
        <div className="stat"><b>10.000</b><span>m² total</span></div>
        <div className="stat"><b>{TOTAL_SEATS.toLocaleString('de-DE')}</b><span>seats</span></div>
        <div className="stat"><b>{HALLS.length}</b><span>halls</span></div>
        <div className="stat"><b>18 m</b><span>atrium height</span></div>
      </div>

      <div className="chips section">
        <button className={`chip ${cat === 'All' ? 'active' : ''}`} onClick={() => setCat('All')}>All</button>
        {PORTFOLIO_CATEGORIES.map((c) => (
          <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      <div className="pf-grid section">
        {items.map((p) => (
          <button key={p.id} className="card pf-card" onClick={() => setOpen(p)} aria-label={`${p.title}, ${p.guests}`}>
            <Shot item={p} className="pf-media" />
            <div className="body">
              <div className="row" style={{ gap: 6 }}>
                <span className="badge red">{p.category}</span>
                <span className="badge ghost">{p.year}</span>
              </div>
              <div className="title">{p.title}</div>
              <div className="meta">
                <span>{p.spaces.join(' · ')}</span>
                <span>{p.guests}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {items.length === 0 && <p className="muted">Nothing in this category yet.</p>}

      <div className="card card-pad section">
        <h2 style={{ marginBottom: 6 }}>Planning an event here?</h2>
        <p className="small muted">
          Every space above can be combined. The Wagenhalle and atrium work as one continuous floor for fairs and
          dinners, while the ten halls run independently for screenings, breakouts and tournaments.
        </p>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn outline" style={{ flex: 1 }} onClick={() => nav('/venues')}>Browse spaces</button>
          <button className="btn primary" style={{ flex: 1 }} onClick={() => nav('/navigate')}>Halls &amp; capacities</button>
        </div>
      </div>

      {open && (
        <Sheet title={open.title} onClose={() => setOpen(null)}>
          <Shot item={open} className="pf-hero" />
          <p className="small muted" style={{ marginTop: 8 }}>{open.caption}</p>

          <div className="kv section">
            <div><span className="muted small">Client</span><b>{open.client}</b></div>
            <div><span className="muted small">Format</span><b>{open.category}</b></div>
            <div><span className="muted small">Spaces</span><b>{open.spaces.join(', ')}</b></div>
            <div><span className="muted small">Size</span><b>{open.guests}</b></div>
          </div>

          <div className="row" style={{ marginTop: 12, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--red)' }}><IconUser size={16} /></span>
            <p className="small" style={{ margin: 0 }}>{open.layout}</p>
          </div>

          <h3 style={{ margin: '16px 0 6px' }}>Production notes</h3>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {open.highlights.map((h, i) => (
              <li key={i} className="small" style={{ marginBottom: 5 }}>{h}</li>
            ))}
          </ul>

          <button className="btn primary block" style={{ marginTop: 16 }} onClick={() => { setOpen(null); nav('/navigate'); }}>
            <IconPin size={16} /> See these spaces on the map
          </button>
        </Sheet>
      )}
    </div>
  );
}
