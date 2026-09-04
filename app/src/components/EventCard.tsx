import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import type { EventItem } from '../data/events';
import { euro } from './ui';

export function EventCard({ ev }: { ev: EventItem }) {
  const nav = useNavigate();
  const left = ev.capacity - ev.sold;
  return (
    <button className="card ev-card" onClick={() => nav(`/events/${ev.id}`)} aria-label={`${ev.title}, ${dayjs(ev.date).format('D MMM')}`}>
      <img src={ev.image} alt="" loading="lazy" />
      <div className="body">
        <div className="row" style={{ gap: 6 }}>
          <span className="badge red">{ev.type}</span>
          {left < ev.capacity * 0.12 && <span className="badge amber">Limited</span>}
        </div>
        <div className="title">{ev.title}</div>
        <div className="meta">
          <span>{dayjs(ev.date).format('ddd, D MMM')} · {ev.time}</span>
          <span>{ev.venueLabel}</span>
        </div>
        <div className="foot">
          <span className="price">{ev.price === 0 ? 'Free' : <>{euro(ev.price)} <span className="cur">from</span></>}</span>
          <span className="small muted">{left} seats left</span>
        </div>
      </div>
    </button>
  );
}

export function FeaturedCard({ ev }: { ev: EventItem }) {
  const nav = useNavigate();
  return (
    <button className="hero-card featured" style={{ width: '100%', textAlign: 'left' }} onClick={() => nav(`/events/${ev.id}`)}>
      <img src={ev.image} alt="" />
      <div className="overlay" />
      <div className="content">
        <div className="row" style={{ gap: 6, marginBottom: 6 }}>
          <span className="badge amber">Featured</span>
          <span className="badge ghost">{ev.type}</span>
        </div>
        <h2 style={{ color: '#fff' }}>{ev.title}</h2>
        <div className="small" style={{ opacity: 0.85 }}>
          {dayjs(ev.date).format('ddd, D MMM')} · {ev.time} · {ev.venueLabel}
        </div>
      </div>
    </button>
  );
}
