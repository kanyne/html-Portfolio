import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { EVENTS, eventById } from '../data/events';
import { venueById } from '../data/venues';
import { useStore } from '../store';
import { BackButton, Progress, Sheet, euro, useToast } from '../components/ui';
import { IconClock, IconHeart, IconPin, IconShare } from '../components/Icons';
import { EventCard } from '../components/EventCard';
import SeatPicker from '../components/SeatPicker';

export default function EventDetail() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const ev = eventById(id);
  const venue = ev ? venueById(ev.venueId) : undefined;
  const addToCart = useStore((s) => s.addToCart);
  const wishlist = useStore((s) => s.wishlist);
  const toggleWish = useStore((s) => s.toggleWish);
  const { toast, toastNode } = useToast();

  const [open, setOpen] = useState(false);
  const [tierId, setTierId] = useState(ev?.tiers[0].id ?? 'standard');
  const [qty, setQty] = useState(1);
  const [seats, setSeats] = useState<string[]>([]);

  const related = useMemo(
    () => EVENTS.filter((e) => e.id !== id && (e.type === ev?.type || e.venueId === ev?.venueId)).slice(0, 3),
    [id, ev],
  );

  if (!ev) return <div className="page empty"><h3>Event not found</h3></div>;

  const tier = ev.tiers.find((t) => t.id === tierId)!;
  const left = ev.capacity - ev.sold;
  const wished = wishlist.includes(ev.id);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: ev.title, url }); return; } catch { /* cancelled */ }
    }
    try { await navigator.clipboard.writeText(url); toast('Link copied'); } catch { toast(url); }
  };

  const add = () => {
    if (ev.seatedSelection && seats.length !== qty) { toast(`Pick ${qty} seat${qty > 1 ? 's' : ''}`); return; }
    addToCart({ eventId: ev.id, tierId: tier.id, tierName: tier.name, unitPrice: tier.price, qty, seats: seats.length ? seats : undefined });
    setOpen(false);
    toast('Added to cart');
    nav('/cart');
  };

  return (
    <div>
      <div className="gradient-head">
        <img src={ev.image} alt="" />
        <div className="ov" />
        <BackButton />
        <div className="inner">
          <div className="row" style={{ gap: 6, marginBottom: 6 }}>
            <span className="badge red">{ev.type}</span>
            {ev.featured && <span className="badge amber">Featured</span>}
          </div>
          <h1 style={{ color: '#fff' }}>{ev.title}</h1>
          <div className="small" style={{ opacity: 0.9 }}>
            {ev.endDate
              ? `${dayjs(ev.date).format('D MMM')}, ${ev.time} – ${dayjs(ev.endDate).format('D MMM YYYY')}, ${ev.endTime}`
              : `${dayjs(ev.date).format('dddd, D MMMM YYYY')} · ${ev.time}–${ev.endTime}`}
          </div>
        </div>
      </div>

      <div className="page">
        <div className="row section" style={{ gap: 8 }}>
          <button className={`btn sm outline ${wished ? 'active' : ''}`} onClick={() => toggleWish(ev.id)} aria-pressed={wished}>
            <IconHeart size={16} filled={wished} /> {wished ? 'Saved' : 'Save'}
          </button>
          <button className="btn sm outline" onClick={share}><IconShare size={16} /> Share</button>
          <button className="btn sm outline" onClick={() => nav(`/navigate?to=${ev.venueId}`)}><IconPin size={16} /> Get directions</button>
        </div>

        <div className="grid2 section" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
          <div className="spec"><b>{ev.duration}</b><span>Duration</span></div>
          <div className="spec"><b>{ev.venueLabel}</b><span>Location</span></div>
        </div>

        <section className="section card card-pad">
          <div className="between" style={{ marginBottom: 8 }}>
            <b className="font-display">{left} of {ev.capacity} seats available</b>
            <span className="small muted">{Math.round((ev.sold / ev.capacity) * 100)}% sold</span>
          </div>
          <Progress value={ev.sold / ev.capacity} />
        </section>

        <section className="section">
          <h2 style={{ marginBottom: 8 }}>About</h2>
          <p className="muted">{ev.description}</p>
        </section>

        {ev.speakers && (
          <section className="section">
            <h2 style={{ marginBottom: 8 }}>Speakers</h2>
            <div className="card card-pad">
              {ev.speakers.map((s) => (
                <div key={s.name} className="list-row">
                  <div><b>{s.name}</b><div className="small muted">{s.role}</div></div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="section">
          <h2 style={{ marginBottom: 8 }}>Good to know</h2>
          <div className="card card-pad">
            {ev.rules.map((r) => (
              <div key={r} className="list-row"><div className="row"><IconClock size={16} /><span>{r}</span></div></div>
            ))}
          </div>
        </section>

        {venue && (
          <section className="section">
            <h2 style={{ marginBottom: 8 }}>Venue</h2>
            <button className="card card-pad between" style={{ width: '100%', textAlign: 'left' }} onClick={() => nav(`/venues/${venue.id}`)}>
              <div>
                <b className="font-display">{venue.name}</b>
                <div className="small muted">{venue.area} · capacity {venue.capacity} · {venue.floor}</div>
                <div className="small muted">{ev.address}</div>
              </div>
              <span className="badge teal">Details</span>
            </button>
          </section>
        )}

        <section className="section">
          <h2 style={{ marginBottom: 8 }}>Ticket types</h2>
          <div className="stack">
            {ev.tiers.map((t) => (
              <div key={t.id} className="card card-pad between">
                <div><b>{t.name}</b>{t.note && <div className="small muted">{t.note}</div>}</div>
                <span className="price">{euro(t.price)}</span>
              </div>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="section">
            <h2 style={{ marginBottom: 8 }}>Related events</h2>
            <div className="stack">{related.map((e) => <EventCard key={e.id} ev={e} />)}</div>
          </section>
        )}

        {ev.ticketUrl && (
          <p className="small muted" style={{ textAlign: 'center', marginBottom: 8 }}>
            Also on sale at{' '}
            <a href={ev.ticketUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--red)', fontWeight: 600 }}>
              the official box office
            </a>
            .
          </p>
        )}

        <div className="sticky-cta">
          <button className="btn primary block" onClick={() => setOpen(true)}>
            {ev.price === 0 ? 'Reserve free ticket' : `Book now · from ${euro(ev.price)}`}
          </button>
        </div>
      </div>

      {open && (
        <Sheet title="Select tickets" onClose={() => setOpen(false)}>
          <div className="stack">
            {ev.tiers.map((t) => (
              <button
                key={t.id}
                className="card card-pad between"
                style={{ borderColor: tierId === t.id ? 'var(--red)' : 'var(--line)', width: '100%', textAlign: 'left' }}
                onClick={() => setTierId(t.id)}
                aria-pressed={tierId === t.id}
              >
                <div><b>{t.name}</b>{t.note && <div className="small muted">{t.note}</div>}</div>
                <span className="price">{euro(t.price)}</span>
              </button>
            ))}
          </div>

          <div className="between" style={{ marginTop: 16 }}>
            <b>Quantity</b>
            <div className="stepper">
              <button onClick={() => { setQty(Math.max(1, qty - 1)); setSeats([]); }} aria-label="Decrease">−</button>
              <span aria-live="polite">{qty}</span>
              <button onClick={() => { setQty(Math.min(10, qty + 1)); setSeats([]); }} aria-label="Increase">+</button>
            </div>
          </div>

          {ev.seatedSelection && (
            <div style={{ marginTop: 16 }}>
              <b>Choose {qty} seat{qty > 1 ? 's' : ''}</b>
              <SeatPicker eventId={ev.id} max={qty} selected={seats} onChange={setSeats} />
            </div>
          )}

          <div className="divider" />
          <div className="between" style={{ marginBottom: 12 }}>
            <span className="muted">Subtotal</span>
            <span className="price" style={{ fontSize: 20 }}>{euro(tier.price * qty)}</span>
          </div>
          <button className="btn primary block" onClick={add}>Add to cart</button>
        </Sheet>
      )}
      {toastNode}
    </div>
  );
}
