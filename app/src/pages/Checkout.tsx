import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EVENTS } from '../data/events';
import { useStore } from '../store';
import { euro } from '../components/ui';

export default function Checkout() {
  const nav = useNavigate();
  const { cart, checkout, user } = useStore();
  const totals = useStore((s) => s.totals)();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    card: '',
    exp: '',
    cvc: '',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!cart.length) {
    nav('/cart', { replace: true });
    return null;
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) { setErr('Please enter your name and a valid email.'); return; }
    if (totals.total > 0 && form.card.replace(/\s/g, '').length < 12) { setErr('Enter a card number (demo — any 12+ digits).'); return; }
    setErr(null);
    setBusy(true);
    setTimeout(() => {
      const order = checkout({ name: form.name, email: form.email, phone: form.phone }, EVENTS);
      setBusy(false);
      nav(`/confirmation/${order.id}`, { replace: true });
    }, 900);
  };

  return (
    <form className="page" onSubmit={pay}>
      <h1 style={{ marginBottom: 16 }}>Checkout</h1>

      <section className="section card card-pad">
        <h2 style={{ marginBottom: 10 }}>Guest details</h2>
        <div className="field"><label htmlFor="n">Full name</label><input id="n" className="input" value={form.name} onChange={set('name')} autoComplete="name" required /></div>
        <div className="field"><label htmlFor="e">Email</label><input id="e" type="email" className="input" value={form.email} onChange={set('email')} autoComplete="email" required /></div>
        <div className="field" style={{ marginBottom: 0 }}><label htmlFor="p">Phone</label><input id="p" className="input" value={form.phone} onChange={set('phone')} autoComplete="tel" /></div>
      </section>

      {totals.total > 0 && (
        <section className="section card card-pad">
          <h2 style={{ marginBottom: 10 }}>Payment</h2>
          <p className="small muted" style={{ marginBottom: 10 }}>Demo checkout — Stripe test mode. No real charge is made.</p>
          <div className="field"><label htmlFor="c">Card number</label><input id="c" className="input" inputMode="numeric" placeholder="4242 4242 4242 4242" value={form.card} onChange={set('card')} /></div>
          <div className="row">
            <div className="field" style={{ flex: 1 }}><label htmlFor="x">Expiry</label><input id="x" className="input" placeholder="12/28" value={form.exp} onChange={set('exp')} /></div>
            <div className="field" style={{ flex: 1 }}><label htmlFor="v">CVC</label><input id="v" className="input" placeholder="123" value={form.cvc} onChange={set('cvc')} /></div>
          </div>
        </section>
      )}

      <section className="section card card-pad">
        <div className="between"><span className="muted">Subtotal</span><span>{euro(totals.subtotal)}</span></div>
        {totals.discount > 0 && <div className="between" style={{ marginTop: 6 }}><span className="muted">Discount</span><span style={{ color: 'var(--amber)' }}>−{euro(totals.discount)}</span></div>}
        <div className="between" style={{ marginTop: 6 }}><span className="muted">Service fee</span><span>{euro(totals.fees)}</span></div>
        <div className="divider" />
        <div className="between"><b>Total</b><span className="price" style={{ fontSize: 20 }}>{euro(totals.total)}</span></div>
      </section>

      {err && <p role="alert" style={{ color: 'var(--red)', marginBottom: 12 }}>{err}</p>}

      <button className="btn primary block" type="submit" disabled={busy}>
        {busy ? 'Processing…' : totals.total > 0 ? `Pay ${euro(totals.total)}` : 'Confirm reservation'}
      </button>
    </form>
  );
}
