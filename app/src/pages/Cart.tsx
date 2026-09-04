import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventById } from '../data/events';
import { useStore } from '../store';
import { euro, useToast } from '../components/ui';
import { IconTrash } from '../components/Icons';

export default function Cart() {
  const nav = useNavigate();
  const { cart, removeLine, setQty, applyPromo, promo } = useStore();
  const totals = useStore((s) => s.totals)();
  const [code, setCode] = useState('');
  const { toast, toastNode } = useToast();

  if (!cart.length) {
    return (
      <div className="page empty">
        <h3>Your cart is empty</h3>
        <p style={{ marginBottom: 16 }}>Browse the calendar and grab your seat.</p>
        <button className="btn primary" onClick={() => nav('/events')}>Browse events</button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 style={{ marginBottom: 16 }}>Cart</h1>
      <div className="stack section">
        {cart.map((l, i) => {
          const ev = eventById(l.eventId);
          return (
            <div className="card card-pad" key={`${l.eventId}-${l.tierId}-${i}`}>
              <div className="between" style={{ alignItems: 'flex-start' }}>
                <div>
                  <b className="font-display">{ev?.title}</b>
                  <div className="small muted">{l.tierName} · {ev?.venueLabel}</div>
                  {l.seats && <div className="small muted">Seats {l.seats.join(', ')}</div>}
                </div>
                <button className="btn sm outline" onClick={() => removeLine(i)} aria-label="Remove"><IconTrash size={16} /></button>
              </div>
              <div className="between" style={{ marginTop: 12 }}>
                <div className="stepper">
                  <button onClick={() => setQty(i, l.qty - 1)} aria-label="Decrease quantity">−</button>
                  <span>{l.qty}</span>
                  <button onClick={() => setQty(i, l.qty + 1)} aria-label="Increase quantity">+</button>
                </div>
                <span className="price">{euro(l.unitPrice * l.qty)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card card-pad section">
        <label className="small muted" htmlFor="promo" style={{ fontWeight: 600 }}>Promo code</label>
        <div className="row" style={{ marginTop: 6 }}>
          <input id="promo" className="input" placeholder="e.g. COLOSSEUM10" value={code} onChange={(e) => setCode(e.target.value)} />
          <button
            className="btn outline"
            onClick={() => {
              if (applyPromo(code)) toast('Promo applied');
              else toast('Invalid code');
            }}
          >Apply</button>
        </div>
        {promo && <div className="small" style={{ color: 'var(--amber)', marginTop: 8 }}>{promo} applied</div>}
      </div>

      <div className="card card-pad section">
        <div className="between"><span className="muted">Subtotal</span><span>{euro(totals.subtotal)}</span></div>
        {totals.discount > 0 && <div className="between" style={{ marginTop: 6 }}><span className="muted">Discount</span><span style={{ color: 'var(--amber)' }}>−{euro(totals.discount)}</span></div>}
        <div className="between" style={{ marginTop: 6 }}><span className="muted">Service fee (4.5%)</span><span>{euro(totals.fees)}</span></div>
        <div className="divider" />
        <div className="between"><b>Total</b><span className="price" style={{ fontSize: 20 }}>{euro(totals.total)}</span></div>
      </div>

      <button className="btn primary block" onClick={() => nav('/checkout')}>Proceed to checkout</button>
      {toastNode}
    </div>
  );
}
