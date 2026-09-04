import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router-dom';
import { EVENTS } from '../data/events';
import { VENUES } from '../data/venues';
import { EventCard, FeaturedCard } from '../components/EventCard';
import { IconMap, IconQr, IconTicket, IconPin } from '../components/Icons';
import { useStore } from '../store';

export default function Home() {
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const tickets = useStore((s) => s.tickets);
  const upcoming = [...EVENTS].sort((a, b) => a.date.localeCompare(b.date));
  const featured = EVENTS.filter((e) => e.featured);
  const nextTicket = tickets.find((t) => t.status === 'valid');

  return (
    <div className="page">
      <div style={{ marginBottom: 16 }}>
        <div className="small muted" style={{ letterSpacing: 2, fontWeight: 600 }}>AUGUSTSTRASSE 20 · BERLIN MITTE</div>
        <h1>{user ? `Hi ${user.name.split(' ')[0]},` : 'Welcome to Colosseum'}</h1>
        <p className="muted">10,000 m² of event space, 4 venues and 10 cinema halls — book, check in and find your way.</p>
      </div>

      {nextTicket && (
        <button className="card card-pad section between" style={{ width: '100%', borderLeft: '4px solid var(--red)' }} onClick={() => nav('/checkin')}>
          <div style={{ textAlign: 'left' }}>
            <div className="small muted">Your next ticket</div>
            <b className="font-display">{nextTicket.eventTitle}</b>
            <div className="small muted">{dayjs(nextTicket.date).format('ddd, D MMM')} · {nextTicket.time} · {nextTicket.venueLabel}</div>
          </div>
          <IconQr size={28} />
        </button>
      )}

      <section className="section">
        <div className="section-head"><h2>Featured</h2><Link to="/events">See all</Link></div>
        <div className="carousel" style={{ gap: 12 }}>
          {featured.map((e) => (
            <div key={e.id} style={{ flex: 'none', width: '88%', maxWidth: 420, scrollSnapAlign: 'center' }}>
              <FeaturedCard ev={e} />
            </div>
          ))}
        </div>
      </section>

      <section className="section grid3">
        <QuickAction icon={<IconTicket />} label="Book tickets" onClick={() => nav('/events')} />
        <QuickAction icon={<IconMap />} label="Navigate" onClick={() => nav('/navigate')} />
        <QuickAction icon={<IconPin />} label="Venues" onClick={() => nav('/venues')} />
      </section>

      <section className="section">
        <div className="section-head"><h2>Upcoming</h2><Link to="/events">Calendar</Link></div>
        <div className="ev-list stack">
          {upcoming.slice(0, 5).map((e) => <EventCard key={e.id} ev={e} />)}
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Our spaces</h2><Link to="/venues">All venues</Link></div>
        <div className="carousel">
          {VENUES.map((v) => (
            <button key={v.id} style={{ flex: 'none', width: '70%', maxWidth: 260, scrollSnapAlign: 'center', textAlign: 'left' }} onClick={() => nav(`/venues/${v.id}`)}>
              <div className="hero-card">
                <img src={v.images[0]} alt="" style={{ height: 150 }} />
                <div className="overlay" />
                <div className="content">
                  <b className="font-display">{v.name}</b>
                  <div className="small" style={{ opacity: 0.85 }}>{v.tagline}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button className="card card-pad" onClick={onClick} style={{ display: 'grid', gap: 8, placeItems: 'center', textAlign: 'center' }}>
      <span style={{ color: 'var(--red)' }}>{icon}</span>
      <span className="small" style={{ fontWeight: 700, fontFamily: 'var(--font)' }}>{label}</span>
    </button>
  );
}
