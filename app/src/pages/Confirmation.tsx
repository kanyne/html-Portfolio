import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../store';
import { euro } from '../components/ui';
import { IconCheck } from '../components/Icons';

export default function Confirmation() {
  const { orderId = '' } = useParams();
  const nav = useNavigate();
  const order = useStore((s) => s.orders.find((o) => o.id === orderId));
  const tickets = useStore((s) => s.tickets.filter((t) => t.orderId === orderId));

  if (!order) return <div className="page empty"><h3>Order not found</h3></div>;

  return (
    <div className="page">
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <span style={{ color: 'var(--red)' }}><IconCheck size={48} /></span>
        <h1 style={{ marginTop: 8 }}>Booking confirmed</h1>
        <p className="muted">Order {order.id} · confirmation sent to {order.guest.email}</p>
      </div>

      <div className="stack section">
        {tickets.map((t) => (
          <div className="card card-pad" key={t.id}>
            <div className="between" style={{ alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <b className="font-display">{t.eventTitle}</b>
                <div className="small muted">{dayjs(t.date).format('ddd, D MMM YYYY')} · {t.time}</div>
                <div className="small muted">{t.venueLabel} · {t.tierName}{t.seat ? ` · Seat ${t.seat}` : ''}</div>
              </div>
              <span className="badge ok">Valid</span>
            </div>
            <div className="qr-wrap"><QRCodeSVG value={t.code} size={150} level="M" /></div>
            <div className="small muted" style={{ textAlign: 'center', marginTop: 8 }}>{t.id}</div>
          </div>
        ))}
      </div>

      <div className="card card-pad section between">
        <span className="muted">Total paid</span>
        <span className="price">{euro(order.total)}</span>
      </div>

      <div className="stack">
        <button className="btn primary block" onClick={() => nav('/checkin')}>View my bookings</button>
        <button className="btn outline block" onClick={() => nav('/events')}>Keep browsing</button>
      </div>
    </div>
  );
}
