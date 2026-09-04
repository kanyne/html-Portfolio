import { useNavigate, useParams } from 'react-router-dom';
import { CONTACT, venueById } from '../data/venues';
import { EVENTS } from '../data/events';
import { BackButton } from '../components/ui';
import { EventCard } from '../components/EventCard';
import { IconMail, IconPin } from '../components/Icons';

export default function VenueDetail() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const v = venueById(id);
  if (!v) return <div className="page empty"><h3>Venue not found</h3></div>;

  const upcoming = EVENTS.filter((e) => e.venueId === v.id).slice(0, 3);

  return (
    <div>
      <div className="gradient-head">
        <img src={v.images[0]} alt="" />
        <div className="ov" />
        <BackButton />
        <div className="inner">
          <span className="badge red">{v.floor}</span>
          <h1 style={{ color: '#fff', marginTop: 6 }}>{v.name}</h1>
          <div className="small" style={{ opacity: 0.9 }}>{v.area} · up to {v.capacity} guests</div>
        </div>
      </div>

      <div className="page">
        <p className="muted section">{v.description}</p>

        <section className="section grid2" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
          {v.specs.map((s) => (
            <div className="spec" key={s.label}><b>{s.value}</b><span>{s.label}</span></div>
          ))}
        </section>

        <section className="section">
          <h2 style={{ marginBottom: 8 }}>Gallery</h2>
          <div className="carousel">
            {[...v.images, ...v.images].slice(0, 6).map((src, i) => <img key={i} src={src} alt={`${v.name} photo ${i + 1}`} loading="lazy" />)}
          </div>
        </section>

        {v.halls && (
          <section className="section">
            <h2 style={{ marginBottom: 8 }}>Halls & capacities</h2>
            <div className="card card-pad">
              {v.halls.map((h) => (
                <div className="list-row" key={h.name}>
                  <b>{h.name}</b>
                  <span className="small muted">{h.area} m² · {h.seats} seats</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="section">
          <h2 style={{ marginBottom: 8 }}>Layout</h2>
          <div className="card card-pad">
            <svg viewBox="0 0 320 160" className="map-svg" style={{ background: 'transparent', border: 0 }} role="img" aria-label={`Simplified layout of ${v.name}`}>
              <rect x="20" y="20" width="280" height="120" rx="8" fill={`${v.color}22`} stroke={v.color} strokeWidth="2" />
              <rect x="34" y="34" width="70" height="92" rx="6" fill="rgba(255,255,255,0.06)" />
              <text x="69" y="84" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.7)">Stage / screen</text>
              <text x="215" y="84" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.85)">{v.name} · {v.area}</text>
              <text x="215" y="102" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.55)">Capacity {v.capacity}</text>
            </svg>
          </div>
        </section>

        <section className="section">
          <h2 style={{ marginBottom: 8 }}>Supported formats</h2>
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {v.formats.map((f) => <span className="badge" key={f}>{f}</span>)}
          </div>
        </section>

        <section className="section">
          <h2 style={{ marginBottom: 8 }}>Amenities</h2>
          <div className="card card-pad">
            {v.amenities.map((a) => <div className="list-row" key={a}><span>{a}</span></div>)}
          </div>
        </section>

        <section className="section">
          <h2 style={{ marginBottom: 8 }}>Accessibility</h2>
          <div className="card card-pad">
            {v.accessibility.map((a) => <div className="list-row" key={a}><span>{a}</span></div>)}
          </div>
        </section>

        <section className="section grid2" style={{ gridTemplateColumns: '1fr' }}>
          <div className="card card-pad"><b className="font-display">Gastronomy</b><p className="muted small">{v.gastronomy}</p></div>
          <div className="card card-pad"><b className="font-display">Flexible & combinable</b><p className="muted small">{v.combinable}</p></div>
        </section>

        {upcoming.length > 0 && (
          <section className="section">
            <h2 style={{ marginBottom: 8 }}>Upcoming here</h2>
            <div className="stack">{upcoming.map((e) => <EventCard key={e.id} ev={e} />)}</div>
          </section>
        )}

        <div className="stack section">
          <button className="btn primary block" onClick={() => nav(`/events?venue=${v.id}`)}>Check availability</button>
          <button className="btn outline block" onClick={() => nav(`/navigate?to=${v.id}`)}><IconPin size={16} /> Find it on the map</button>
          <a className="btn teal block" href={`mailto:${CONTACT.email}?subject=Enquiry: ${v.name}`}><IconMail size={16} /> Get more info</a>
        </div>
      </div>
    </div>
  );
}
