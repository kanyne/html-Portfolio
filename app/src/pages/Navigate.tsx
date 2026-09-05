import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EDGES, FLOORS, NODES, SHAPES, VIEWBOX, nodeById, planRoute, routeSteps, type FloorId, type PinKind } from '../data/map';
import { CONTACT } from '../data/venues';
import { HALLS, TOTAL_SEATS, TOTAL_HALL_AREA } from '../data/halls';
import TourViewer from '../components/TourViewer';
import { sceneForNode } from '../data/tour';
import { IconCar, IconElevator, IconExit, IconFood, IconInfo, IconPin, IconWc } from '../components/Icons';
import { Sheet } from '../components/ui';

const KIND_COLOR: Record<PinKind, string> = {
  venue: '#E31C1C',
  restroom: '#2D5F6F',
  gastronomy: '#F5A623',
  exit: '#8ad18a',
  parking: '#7aa7d1',
  info: '#ffffff',
  elevator: '#c58af5',
};

const KindIcon = ({ kind }: { kind: PinKind }) => {
  switch (kind) {
    case 'restroom': return <IconWc size={16} />;
    case 'gastronomy': return <IconFood size={16} />;
    case 'exit': return <IconExit size={16} />;
    case 'parking': return <IconCar size={16} />;
    case 'elevator': return <IconElevator size={16} />;
    case 'info': return <IconInfo size={16} />;
    default: return <IconPin size={16} />;
  }
};

export default function Navigate() {
  const [params] = useSearchParams();
  const target = params.get('to');
  const [floor, setFloor] = useState<FloorId>((nodeById(target ?? '')?.floor ?? 'ground') as FloorId);
  const [from, setFrom] = useState('main-entrance');
  const [to, setTo] = useState(target && nodeById(target) ? target : 'wagenhalle');
  const [accessible, setAccessible] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [tourScene, setTourScene] = useState<string | undefined>(undefined);

  const path = useMemo(() => planRoute(from, to), [from, to]);
  const steps = useMemo(() => routeSteps(path), [path]);

  const floorNodes = NODES.filter((n) => n.floor === floor);
  const pathOnFloor = path.map((id) => nodeById(id)!).filter((n) => n && n.floor === floor);
  const polyline = pathOnFloor.map((n) => `${n.x},${n.y}`).join(' ');
  const sel = selected ? nodeById(selected) : null;

  return (
    <div className="page">
      <h1 style={{ marginBottom: 4 }}>Navigate</h1>
      <p className="muted" style={{ marginBottom: 14 }}>Floor plans, amenities and turn-by-turn directions inside the house.</p>

      <div className="chips section">
        {FLOORS.map((f) => (
          <button key={f.id} className={`chip ${floor === f.id ? 'active' : ''}`} onClick={() => setFloor(f.id)}>{f.label}</button>
        ))}
      </div>

      <svg viewBox={VIEWBOX} className="map-svg section" role="img" aria-label={`Floor plan: ${FLOORS.find((f) => f.id === floor)?.label}`}>
        {SHAPES[floor].map((s, i) => (
          <g key={i}>
            <path d={s.d} fill={s.fill} stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
          </g>
        ))}
        {SHAPES[floor].map((s, i) => {
          const m = /M(\d+) (\d+)/.exec(s.d);
          return m ? <text key={`t${i}`} x={+m[1] + 12} y={+m[2] + 22} fontSize="12" fill="rgba(255,255,255,0.6)">{s.label}</text> : null;
        })}

        {polyline && pathOnFloor.length > 1 && (
          <polyline points={polyline} fill="none" stroke="#E31C1C" strokeWidth="3.5" strokeDasharray="2 8" strokeLinecap="round">
            <animate attributeName="stroke-dashoffset" from="40" to="0" dur="1.6s" repeatCount="indefinite" />
          </polyline>
        )}

        {floorNodes.map((n) => (
          <g key={n.id} className="pin" onClick={() => setSelected(n.id)} role="button" tabIndex={0} aria-label={n.label}>
            <circle cx={n.x} cy={n.y} r={n.kind === 'venue' ? 11 : 8} fill={KIND_COLOR[n.kind]} opacity={0.92} />
            {path.includes(n.id) && <circle cx={n.x} cy={n.y} r={16} fill="none" stroke="#E31C1C" strokeWidth="2" />}
            <text x={n.x} y={n.y + 26} textAnchor="middle">{n.label}</text>
          </g>
        ))}
      </svg>

      <div className="card card-pad section" id="tour">
        <h2 style={{ marginBottom: 4 }}>360° virtual tour</h2>
        <p className="small muted" style={{ marginBottom: 10 }}>
          Walk through the building before you arrive — pick a space, drag to look around.
        </p>
        <TourViewer initial={tourScene} />
      </div>

      <div className="card card-pad section">
        <h2 style={{ marginBottom: 10 }}>Get directions</h2>
        <div className="grid2" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="field"><label htmlFor="from">From</label>
            <select id="from" className="input" value={from} onChange={(e) => setFrom(e.target.value)}>
              {NODES.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
          </div>
          <div className="field"><label htmlFor="to">To</label>
            <select id="to" className="input" value={to} onChange={(e) => setTo(e.target.value)}>
              {NODES.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
          </div>
        </div>
        <div className="switch-row" style={{ borderBottom: 0 }}>
          <span className="small">Accessible route (elevators only)</span>
          <button className="switch" role="switch" aria-checked={accessible} aria-label="Accessible route" onClick={() => setAccessible(!accessible)} />
        </div>
        <ol style={{ paddingLeft: 18, marginTop: 8 }}>
          {steps.map((s, i) => <li key={i} className="small" style={{ marginBottom: 4 }}>{s}</li>)}
        </ol>
        {accessible && <p className="small muted">This route uses the elevator at every level change and avoids stairs.</p>}
      </div>

      <div className="card card-pad section">
        <h2 style={{ marginBottom: 4 }}>Halls &amp; capacities</h2>
        <p className="small muted" style={{ marginBottom: 10 }}>
          Ten halls, {TOTAL_SEATS.toLocaleString('de-DE')} seats, {TOTAL_HALL_AREA.toLocaleString('de-DE')} m² of auditorium.
          Tap a hall to route there.
        </p>
        <table className="hall-table">
          <thead>
            <tr><th>Hall</th><th>Area</th><th>Seats</th><th aria-label="Relative size" /></tr>
          </thead>
          <tbody>
            {HALLS.map((h) => (
              <tr key={h.id} onClick={() => { const n = nodeById(h.id); if (n) { setFloor(n.floor); setTo(h.id); } }} tabIndex={0} role="button">
                <td><b>{h.name}</b></td>
                <td className="muted">{h.area} m²</td>
                <td>{h.seats}</td>
                <td><span className="bar" style={{ width: `${(h.seats / 454) * 100}%` }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card card-pad section">
        <h2 style={{ marginBottom: 10 }}>Legend</h2>
        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
          {(Object.keys(KIND_COLOR) as PinKind[]).map((k) => (
            <span className="badge" key={k}><span style={{ width: 10, height: 10, borderRadius: 5, background: KIND_COLOR[k], display: 'inline-block' }} /> {k}</span>
          ))}
        </div>
      </div>

      <div className="stack section">
        <InfoCard title="Parking" body="Underground garage beneath the house, entrance on Schönhauser Allee. 4 accessible bays, 3 minutes to the main entrance. €3/h, €18 day rate." icon={<IconCar />} />
        <InfoCard title="Restrooms" body="Ground floor next to the Garderobe, Galerie level by the east terrace, and WC Damen / WC Herren either side of the kino foyer. All have accessible cabins." icon={<IconWc />} />
        <InfoCard title="Gastronomy" body="Atrium bar (ground), terrace bar (Galerie) and cinema concessions. Card payment only." icon={<IconFood />} />
        <InfoCard title="Emergency" body="Follow the green signage to the nearest exit; assembly point is the forecourt on Schönhauser Allee. Staff in red lanyards are trained marshals." icon={<IconExit />} />
        <InfoCard title="Wi-Fi & accessibility" body="Free Wi-Fi: COLOSSEUM-GUEST (no password). Step-free access throughout, elevator to all levels, induction loops in all cinema halls." icon={<IconInfo />} />
      </div>

      <div className="card card-pad section">
        <h2 style={{ marginBottom: 6 }}>Getting here</h2>
        <p className="small muted">{CONTACT.address}</p>
        <p className="small muted" style={{ marginTop: 6 }}>{CONTACT.transit}</p>
        <a className="btn primary block" style={{ marginTop: 12 }} href={CONTACT.mapsUrl} target="_blank" rel="noreferrer">Open in Google Maps</a>
      </div>

      {sel && (
        <Sheet title={sel.label} onClose={() => setSelected(null)}>
          <div className="row" style={{ marginBottom: 10 }}>
            <span style={{ color: KIND_COLOR[sel.kind] }}><KindIcon kind={sel.kind} /></span>
            <span className="badge">{sel.kind}</span>
            {sel.accessible && <span className="badge teal">Accessible</span>}
          </div>
          <p className="muted">{sel.info ?? 'No extra information for this point.'}</p>
          {sceneForNode(sel.id) && (
            <button
              className="btn outline block"
              style={{ marginTop: 12 }}
              onClick={() => {
                setTourScene(sceneForNode(sel.id)!.id);
                setSelected(null);
                document.getElementById('tour')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              Look inside in 360°
            </button>
          )}
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn outline" style={{ flex: 1 }} onClick={() => { setFrom(sel.id); setSelected(null); }}>Route from here</button>
            <button className="btn primary" style={{ flex: 1 }} onClick={() => { setTo(sel.id); setSelected(null); }}>Directions here</button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

function InfoCard({ title, body, icon }: { title: string; body: string; icon: React.ReactNode }) {
  return (
    <div className="card card-pad">
      <div className="row" style={{ marginBottom: 6 }}>
        <span style={{ color: 'var(--red)' }}>{icon}</span>
        <b className="font-display">{title}</b>
      </div>
      <p className="small muted">{body}</p>
    </div>
  );
}

// keep edge data referenced for future weighted routing
export const _edges = EDGES;
