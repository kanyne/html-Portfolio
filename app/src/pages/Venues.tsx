import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VENUES } from '../data/venues';
import { IconGrid, IconList, IconMap } from '../components/Icons';

export default function Venues() {
  const nav = useNavigate();
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <div className="page">
      <div className="between" style={{ marginBottom: 4 }}>
        <h1>Venue spaces</h1>
        <div className="row" style={{ gap: 6 }}>
          <button className={`btn sm ${view === 'grid' ? 'primary' : 'outline'}`} onClick={() => setView('grid')} aria-label="Grid view"><IconGrid size={16} /></button>
          <button className={`btn sm ${view === 'list' ? 'primary' : 'outline'}`} onClick={() => setView('list')} aria-label="List view"><IconList size={16} /></button>
        </div>
      </div>
      <p className="muted" style={{ marginBottom: 16 }}>Four main spaces and ten cinema halls across 10,000 m².</p>

      <button className="card card-pad between section" style={{ width: '100%', textAlign: 'left' }} onClick={() => nav('/navigate')}>
        <div><b className="font-display">Overhead venue map</b><div className="small muted">All spaces, colour-coded, with amenities</div></div>
        <IconMap />
      </button>

      {view === 'grid' ? (
        <div className="grid2">
          {VENUES.map((v) => (
            <button key={v.id} className="hero-card" style={{ textAlign: 'left' }} onClick={() => nav(`/venues/${v.id}`)}>
              <img src={v.images[0]} alt="" style={{ height: 170 }} loading="lazy" />
              <div className="overlay" />
              <div className="content">
                <span className="badge ghost">{v.area}</span>
                <h3 style={{ color: '#fff', marginTop: 6 }}>{v.name}</h3>
                <div className="small" style={{ opacity: 0.85 }}>{v.tagline}</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="stack">
          {VENUES.map((v) => (
            <button key={v.id} className="card ev-card" onClick={() => nav(`/venues/${v.id}`)}>
              <img src={v.images[0]} alt="" loading="lazy" />
              <div className="body">
                <div className="title">{v.name}</div>
                <div className="meta"><span>{v.area}</span><span>Capacity {v.capacity}</span><span>{v.floor}</span></div>
                <div className="small muted">{v.tagline}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
