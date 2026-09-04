import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { EVENTS, EVENT_TYPES } from '../data/events';
import { VENUES } from '../data/venues';
import { EventCard, FeaturedCard } from '../components/EventCard';
import { IconSearch } from '../components/Icons';
import { useSearchParams } from 'react-router-dom';

export default function Events() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [type, setType] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState(200);
  const [when, setWhen] = useState<'all' | 'month' | 'week'>('all');
  const venueFilter = params.get('venue') ?? 'all';

  const featured = EVENTS.filter((e) => e.featured);

  const list = useMemo(() => {
    const now = dayjs('2026-10-01');
    return EVENTS.filter((e) => {
      if (type !== 'All' && e.type !== type) return false;
      if (venueFilter !== 'all' && e.venueId !== venueFilter) return false;
      if (e.price > maxPrice) return false;
      if (q && !(`${e.title} ${e.venueLabel} ${e.type} ${e.short}`.toLowerCase().includes(q.toLowerCase()))) return false;
      if (when === 'week' && dayjs(e.date).diff(now, 'day') > 21) return false;
      if (when === 'month' && dayjs(e.date).diff(now, 'day') > 45) return false;
      return true;
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [q, type, maxPrice, when, venueFilter]);

  const venueName = VENUES.find((v) => v.id === venueFilter)?.name;

  return (
    <div className="page">
      <h1 style={{ marginBottom: 4 }}>What's on</h1>
      <p className="muted" style={{ marginBottom: 16 }}>Corporate events, cinema and everything in between at Colosseum Berlin.</p>

      {!q && type === 'All' && venueFilter === 'all' && (
        <section className="section">
          <div className="section-head"><h2>Featured</h2></div>
          <div className="carousel" style={{ gap: 12 }}>
            {featured.map((e) => (
              <div key={e.id} style={{ flex: 'none', width: '88%', maxWidth: 420, scrollSnapAlign: 'center' }}>
                <FeaturedCard ev={e} />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="search section">
        <IconSearch />
        <input
          className="input"
          placeholder="Search events, venues, keywords"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search events"
        />
      </div>

      <div className="chips section">
        {['All', ...EVENT_TYPES].map((t) => (
          <button key={t} className={`chip ${type === t ? 'active' : ''}`} onClick={() => setType(t)}>{t}</button>
        ))}
      </div>

      <div className="grid2 section" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="f-venue">Venue</label>
          <select
            id="f-venue"
            className="input"
            value={venueFilter}
            onChange={(e) => setParams(e.target.value === 'all' ? {} : { venue: e.target.value })}
          >
            <option value="all">All venues</option>
            {VENUES.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="f-date">Date</label>
          <select id="f-date" className="input" value={when} onChange={(e) => setWhen(e.target.value as 'all')}>
            <option value="all">Any date</option>
            <option value="week">Next 3 weeks</option>
            <option value="month">Next 6 weeks</option>
          </select>
        </div>
      </div>

      <div className="field section">
        <label htmlFor="f-price">Max price: {maxPrice >= 200 ? 'any' : `€${maxPrice}`}</label>
        <input id="f-price" type="range" min={0} max={200} step={5} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} />
      </div>

      <div className="section-head">
        <h2>{venueName ? `${venueName} · ${list.length} events` : `${list.length} events`}</h2>
        {venueFilter !== 'all' && <a href="#" onClick={(e) => { e.preventDefault(); setParams({}); }}>Clear</a>}
      </div>

      {list.length === 0 ? (
        <div className="empty"><h3>No events match</h3><p>Try widening your filters.</p></div>
      ) : (
        <div className="ev-list stack">
          {list.map((e) => <EventCard key={e.id} ev={e} />)}
        </div>
      )}
    </div>
  );
}
