import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBack } from './Icons';

export function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [msg, onDone]);
  return (
    <div className="toast" role="status">
      {msg}
    </div>
  );
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const node = msg ? <Toast msg={msg} onDone={() => setMsg(null)} /> : null;
  return { toast: setMsg, toastNode: node };
}

export function Sheet({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="sheet-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="between" style={{ marginBottom: 8 }}>
          <h2>{title}</h2>
          <button className="btn sm outline" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function BackButton() {
  const nav = useNavigate();
  return (
    <button className="back-btn" onClick={() => nav(-1)} aria-label="Go back">
      <IconBack size={20} />
    </button>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      className="switch"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    />
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${Math.min(100, value * 100)}%` }} />
    </div>
  );
}

export const euro = (n: number) => (n === 0 ? 'Free' : `€${n.toFixed(n % 1 ? 2 : 0)}`);
