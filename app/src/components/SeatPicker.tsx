import { useMemo } from 'react';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const COLS = 12;

// deterministic pseudo-random "taken" seats per event
function takenSet(eventId: string) {
  let h = 0;
  for (const c of eventId) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const taken = new Set<string>();
  ROWS.forEach((r, ri) => {
    for (let c = 1; c <= COLS; c++) {
      h = (h * 1103515245 + 12345) >>> 0;
      if ((h >> (ri % 5)) % 5 === 0) taken.add(`${r}${c}`);
    }
  });
  return taken;
}

export default function SeatPicker({
  eventId,
  max,
  selected,
  onChange,
}: {
  eventId: string;
  max: number;
  selected: string[];
  onChange: (s: string[]) => void;
}) {
  const taken = useMemo(() => takenSet(eventId), [eventId]);

  const toggle = (id: string) => {
    if (taken.has(id)) return;
    if (selected.includes(id)) onChange(selected.filter((s) => s !== id));
    else if (selected.length < max) onChange([...selected, id]);
    else onChange([...selected.slice(1), id]);
  };

  return (
    <div style={{ marginTop: 10 }}>
      <div className="screen" />
      <div className="small muted" style={{ textAlign: 'center', marginBottom: 8 }}>Screen / stage</div>
      <div className="seatmap">
        {ROWS.map((r) => (
          <div className="seatrow" key={r}>
            {Array.from({ length: COLS }, (_, i) => {
              const id = `${r}${i + 1}`;
              const isTaken = taken.has(id);
              const sel = selected.includes(id);
              return (
                <button
                  key={id}
                  className={`seat ${isTaken ? 'taken' : sel ? 'sel' : 'free'}`}
                  onClick={() => toggle(id)}
                  disabled={isTaken}
                  aria-label={`Seat ${id}${isTaken ? ' unavailable' : sel ? ' selected' : ''}`}
                  aria-pressed={sel}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="small muted" style={{ marginTop: 10, textAlign: 'center' }}>
        {selected.length ? `Selected: ${selected.join(', ')}` : 'Tap seats to select'}
      </div>
    </div>
  );
}
