import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { CONTACT } from '../data/venues';
import { EVENT_TYPES, eventById } from '../data/events';
import { Switch, useToast } from '../components/ui';
import { IconMail, IconPhone, IconUser } from '../components/Icons';

export default function Profile() {
  const nav = useNavigate();
  const { user, signIn, signOut, prefs, setPrefs, wishlist, orders, resetDemo, toggleWish } = useStore();
  const { toast, toastNode } = useToast();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  useEffect(() => {
    document.documentElement.dataset.theme = prefs.darkMode ? 'dark' : 'light';
  }, [prefs.darkMode]);

  if (!user) {
    return (
      <div className="page">
        <h1 style={{ marginBottom: 4 }}>{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
        <p className="muted" style={{ marginBottom: 16 }}>Save your tickets, wishlist and preferences.</p>

        <div className="stack section">
          <button className="btn outline block" onClick={() => signIn({ name: 'Google User', email: 'guest@gmail.com', phone: '', guest: false, provider: 'google' })}>Continue with Google</button>
          <button className="btn outline block" onClick={() => signIn({ name: 'Apple User', email: 'guest@icloud.com', phone: '', guest: false, provider: 'apple' })}>Continue with Apple</button>
        </div>

        <div className="divider" />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^\S+@\S+\.\S+$/.test(form.email) || form.password.length < 6) { toast('Enter an email and 6+ char password'); return; }
            signIn({ name: form.name || form.email.split('@')[0], email: form.email, phone: form.phone, guest: false, provider: 'email' });
          }}
        >
          {mode === 'signup' && (
            <div className="field"><label htmlFor="pn">Full name</label><input id="pn" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" /></div>
          )}
          <div className="field"><label htmlFor="pe">Email</label><input id="pe" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></div>
          <div className="field"><label htmlFor="pw">Password</label><input id="pw" type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" /></div>
          <button className="btn primary block" type="submit">{mode === 'signin' ? 'Sign in' : 'Sign up'}</button>
        </form>

        <div className="stack" style={{ marginTop: 12 }}>
          <button className="btn outline block" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
            {mode === 'signin' ? 'Need an account? Sign up' : 'Already registered? Sign in'}
          </button>
          <button className="btn block" onClick={() => signIn({ name: 'Guest', email: 'guest@colosseum.demo', phone: '', guest: true })}>Continue as guest</button>
        </div>
        {toastNode}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="card card-pad section row" style={{ gap: 14 }}>
        <span style={{ width: 52, height: 52, borderRadius: 26, background: 'var(--red)', display: 'grid', placeItems: 'center', color: '#fff' }}>
          <IconUser size={26} />
        </span>
        <div>
          <h2>{user.name}</h2>
          <div className="small muted">{user.email}{user.guest ? ' · guest' : ''}</div>
        </div>
      </div>

      <section className="section card card-pad">
        <h2 style={{ marginBottom: 8 }}>Booking history</h2>
        {!orders.length && <p className="small muted">No orders yet.</p>}
        {orders.map((o) => (
          <button key={o.id} className="list-row" onClick={() => nav(`/confirmation/${o.id}`)}>
            <div><b>{o.id}</b><div className="small muted">{new Date(o.createdAt).toLocaleString()} · {o.ticketIds.length} ticket(s)</div></div>
            <span className="price">€{o.total.toFixed(2)}</span>
          </button>
        ))}
      </section>

      <section className="section card card-pad">
        <h2 style={{ marginBottom: 8 }}>Wishlist</h2>
        {!wishlist.length && <p className="small muted">Save events with the heart icon.</p>}
        {wishlist.map((id) => {
          const ev = eventById(id);
          return ev ? (
            <div className="list-row" key={id}>
              <button style={{ textAlign: 'left' }} onClick={() => nav(`/events/${id}`)}><b>{ev.title}</b><div className="small muted">{ev.date} · {ev.venueLabel}</div></button>
              <button className="btn sm outline" onClick={() => toggleWish(id)}>Remove</button>
            </div>
          ) : null;
        })}
      </section>

      <section className="section card card-pad">
        <h2 style={{ marginBottom: 4 }}>Preferences</h2>
        <div className="switch-row"><span>Email me about new events</span><Switch label="Email new events" checked={prefs.emailNewEvents} onChange={(v) => setPrefs({ emailNewEvents: v })} /></div>
        <div className="switch-row"><span>Reminder 1 day before</span><Switch label="Reminder day before" checked={prefs.remindDayBefore} onChange={(v) => setPrefs({ remindDayBefore: v })} /></div>
        <div className="switch-row"><span>Reminder 2 hours before</span><Switch label="Reminder two hours" checked={prefs.remindTwoHours} onChange={(v) => setPrefs({ remindTwoHours: v })} /></div>
        <div className="switch-row"><span>Dark mode</span><Switch label="Dark mode" checked={prefs.darkMode} onChange={(v) => setPrefs({ darkMode: v })} /></div>
      </section>

      <section className="section card card-pad">
        <h2 style={{ marginBottom: 8 }}>Favourite event types</h2>
        <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
          {EVENT_TYPES.map((t) => {
            const on = prefs.favoriteTypes.includes(t);
            return (
              <button
                key={t}
                className={`chip ${on ? 'active' : ''}`}
                aria-pressed={on}
                onClick={() => setPrefs({ favoriteTypes: on ? prefs.favoriteTypes.filter((x) => x !== t) : [...prefs.favoriteTypes, t] })}
              >{t}</button>
            );
          })}
        </div>
      </section>

      <section className="section card card-pad">
        <h2 style={{ marginBottom: 8 }}>Support</h2>
        <a className="list-row" href={`mailto:${CONTACT.email}`}><span className="row"><IconMail size={16} /> Contact the events team</span><span className="small muted">{CONTACT.email}</span></a>
        <a className="list-row" href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}><span className="row"><IconPhone size={16} /> Call us</span><span className="small muted">{CONTACT.phone}</span></a>
        <a className="list-row" href={CONTACT.website} target="_blank" rel="noreferrer"><span>FAQ & website</span><span className="small muted">colosseumberlin.com</span></a>
        <div className="list-row"><span>Terms of service</span><span className="small muted">v1.0</span></div>
        <div className="list-row"><span>Privacy policy</span><span className="small muted">GDPR</span></div>
      </section>

      <div className="stack section">
        <button className="btn outline block" onClick={() => { signOut(); toast('Signed out'); }}>Sign out</button>
        <button className="btn block" onClick={() => { resetDemo(); toast('Demo data reset'); }}>Reset demo data</button>
      </div>
      {toastNode}
    </div>
  );
}
