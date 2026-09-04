import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Sheet, euro, useToast } from '../components/ui';
import { IconQr, IconCam } from '../components/Icons';
import { EVENTS } from '../data/events';

export default function CheckIn() {
  const [tab, setTab] = useState<'bookings' | 'staff'>('bookings');
  return (
    <div className="page">
      <h1 style={{ marginBottom: 4 }}>Check-in</h1>
      <p className="muted" style={{ marginBottom: 14 }}>Your tickets and the staff scanning dashboard.</p>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'bookings'} className={tab === 'bookings' ? 'active' : ''} onClick={() => setTab('bookings')}>My bookings</button>
        <button role="tab" aria-selected={tab === 'staff'} className={tab === 'staff' ? 'active' : ''} onClick={() => setTab('staff')}>Staff dashboard</button>
      </div>
      {tab === 'bookings' ? <Bookings /> : <Staff />}
    </div>
  );
}

function Bookings() {
  const nav = useNavigate();
  const tickets = useStore((s) => s.tickets);
  const [openId, setOpenId] = useState<string | null>(null);
  const { toast, toastNode } = useToast();
  const active = tickets.find((t) => t.id === openId);

  if (!tickets.length) {
    return (
      <div className="empty">
        <h3>No bookings yet</h3>
        <p style={{ marginBottom: 16 }}>Your tickets and QR codes will appear here.</p>
        <button className="btn primary" onClick={() => nav('/events')}>Browse events</button>
      </div>
    );
  }

  return (
    <>
      <div className="stack">
        {tickets.map((t) => {
          const past = dayjs(t.date).isBefore(dayjs('2026-10-01'), 'day');
          return (
            <button key={t.id} className="card card-pad between" style={{ width: '100%', textAlign: 'left' }} onClick={() => setOpenId(t.id)}>
              <div>
                <b className="font-display">{t.eventTitle}</b>
                <div className="small muted">{dayjs(t.date).format('ddd, D MMM')} · {t.time} · {t.venueLabel}</div>
                <div className="small muted">{t.tierName}{t.seat ? ` · Seat ${t.seat}` : ''} · {t.id}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${t.status === 'used' ? 'muted' : past ? 'muted' : 'ok'}`}>
                  {t.status === 'used' ? 'Checked in' : past ? 'Past' : 'Upcoming'}
                </span>
                <div style={{ color: 'var(--red)', marginTop: 8 }}><IconQr size={22} /></div>
              </div>
            </button>
          );
        })}
      </div>

      {active && (
        <Sheet title={active.eventTitle} onClose={() => setOpenId(null)}>
          <div className="qr-wrap" style={{ padding: 22 }}>
            <QRCodeSVG value={active.code} size={220} level="M" />
          </div>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <b className="font-display" style={{ fontSize: 18 }}>{active.id}</b>
            <div className="small muted">{dayjs(active.date).format('dddd, D MMMM YYYY')} · {active.time}</div>
            <div className="small muted">{active.venueLabel} · {active.tierName}{active.seat ? ` · Seat ${active.seat}` : ''} · {euro(active.price)}</div>
            <div style={{ marginTop: 10 }}>
              <span className={`badge ${active.status === 'used' ? 'muted' : 'ok'}`}>{active.status === 'used' ? 'Checked in' : 'Valid'}</span>
            </div>
          </div>
          <button className="btn outline block" style={{ marginTop: 16 }} onClick={() => toast('Ticket re-sent to your email')}>Resend ticket</button>
        </Sheet>
      )}
      {toastNode}
    </>
  );
}

function Staff() {
  const { tickets, scanLog, scan } = useStore();
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ result: string; title?: string } | null>(null);
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState('');

  const stats = useMemo(() => {
    const byEvent: Record<string, { in: number; total: number; cap: number }> = {};
    tickets.forEach((t) => {
      const cap = EVENTS.find((e) => e.id === t.eventId)?.capacity ?? 0;
      byEvent[t.eventTitle] ||= { in: 0, total: 0, cap };
      byEvent[t.eventTitle].total++;
      if (t.status === 'used') byEvent[t.eventTitle].in++;
    });
    return byEvent;
  }, [tickets]);

  if (!authed) {
    return (
      <div className="card card-pad">
        <h2 style={{ marginBottom: 6 }}>Staff login</h2>
        <p className="small muted" style={{ marginBottom: 12 }}>Demo PIN: 1895</p>
        <div className="field"><label htmlFor="pin">Staff PIN</label><input id="pin" className="input" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} /></div>
        <button className="btn primary block" onClick={() => setAuthed(pin === '1895')} >Sign in</button>
        {pin && pin !== '1895' && <p className="small" style={{ color: 'var(--red)', marginTop: 8 }}>Wrong PIN</p>}
      </div>
    );
  }

  const doScan = (value: string) => {
    if (!value.trim()) return;
    const r = scan(value);
    setResult({ result: r.result, title: r.ticket?.eventTitle });
    setCode('');
  };

  const valid = tickets.filter((t) => t.status === 'used').length;

  return (
    <div className="stack">
      <div className="card card-pad" style={{ textAlign: 'center' }}>
        <span style={{ color: 'var(--red)' }}><IconCam size={34} /></span>
        <h2 style={{ margin: '8px 0 4px' }}>Scan tickets</h2>
        <p className="small muted" style={{ marginBottom: 12 }}>Point the scanner at the guest QR, or enter the ticket ID.</p>
        <div className="row">
          <input className="input" placeholder="TKT-XXXXXXXX" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Ticket code" />
          <button className="btn primary" onClick={() => doScan(code)}>Check</button>
        </div>
        <button
          className="btn outline block"
          style={{ marginTop: 10 }}
          onClick={() => {
            const t = tickets.find((x) => x.status === 'valid') ?? tickets[0];
            doScan(t ? t.code : 'UNKNOWN');
          }}
        >Simulate camera scan</button>

        {result && (
          <div
            className="card card-pad"
            style={{
              marginTop: 14,
              borderColor: result.result === 'ok' ? '#1e7a45' : result.result === 'reused' ? 'var(--amber)' : 'var(--red)',
            }}
          >
            <b>{result.result === 'ok' ? '✓ Checked in' : result.result === 'reused' ? '! Already checked in' : '✕ Ticket not found'}</b>
            {result.title && <div className="small muted">{result.title}</div>}
          </div>
        )}
      </div>

      <div className="card card-pad">
        <h2 style={{ marginBottom: 10 }}>Capacity & attendance</h2>
        <div className="between" style={{ marginBottom: 10 }}>
          <span className="muted">Checked in today</span>
          <b className="font-display" style={{ fontSize: 20 }}>{valid} / {tickets.length}</b>
        </div>
        {Object.entries(stats).map(([title, s]) => (
          <div className="list-row" key={title}>
            <div><b>{title}</b><div className="small muted">Hall capacity {s.cap}</div></div>
            <span className="small">{s.in}/{s.total} in</span>
          </div>
        ))}
        {!tickets.length && <p className="small muted">No tickets sold in this demo yet.</p>}
      </div>

      <div className="card card-pad">
        <h2 style={{ marginBottom: 10 }}>Live scan log</h2>
        {!scanLog.length && <p className="small muted">Nothing scanned yet.</p>}
        {scanLog.map((l, i) => (
          <div className="list-row" key={i}>
            <div><b className="small">{l.eventTitle ?? 'Unknown ticket'}</b><div className="small muted">{l.code.slice(0, 28)}</div></div>
            <span className={`badge ${l.result === 'ok' ? 'ok' : l.result === 'reused' ? 'amber' : 'red'}`}>{l.result}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
