import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EventItem } from './data/events';

export type CartLine = {
  eventId: string;
  tierId: string;
  tierName: string;
  unitPrice: number;
  qty: number;
  seats?: string[];
};

export type Ticket = {
  id: string;
  code: string;
  orderId: string;
  eventId: string;
  eventTitle: string;
  venueLabel: string;
  date: string;
  time: string;
  tierName: string;
  seat?: string;
  price: number;
  status: 'valid' | 'used';
  checkedInAt?: string;
  guestName: string;
};

export type Order = {
  id: string;
  createdAt: string;
  total: number;
  fees: number;
  promo?: string;
  ticketIds: string[];
  guest: { name: string; email: string; phone: string };
};

export type User = {
  name: string;
  email: string;
  phone: string;
  guest: boolean;
  provider?: 'email' | 'google' | 'apple';
};

export type Prefs = {
  emailNewEvents: boolean;
  remindDayBefore: boolean;
  remindTwoHours: boolean;
  darkMode: boolean;
  favoriteTypes: string[];
};

export type ScanLog = { code: string; at: string; result: 'ok' | 'reused' | 'invalid'; eventTitle?: string };

const PROMOS: Record<string, number> = { COLOSSEUM10: 0.1, BERLIN25: 0.25, STAFF: 0.5 };
const FEE_RATE = 0.045;

const rnd = (n: number) => Math.random().toString(36).slice(2, 2 + n).toUpperCase();

type State = {
  cart: CartLine[];
  tickets: Ticket[];
  orders: Order[];
  user: User | null;
  prefs: Prefs;
  wishlist: string[];
  scanLog: ScanLog[];
  promo: string | null;

  addToCart: (line: CartLine) => void;
  removeLine: (i: number) => void;
  setQty: (i: number, qty: number) => void;
  clearCart: () => void;
  applyPromo: (code: string) => boolean;
  totals: () => { subtotal: number; discount: number; fees: number; total: number };

  checkout: (guest: { name: string; email: string; phone: string }, events: EventItem[]) => Order;
  toggleWish: (id: string) => void;
  signIn: (u: User) => void;
  signOut: () => void;
  setPrefs: (p: Partial<Prefs>) => void;
  scan: (code: string) => { result: 'ok' | 'reused' | 'invalid'; ticket?: Ticket };
  resetDemo: () => void;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      cart: [],
      tickets: [],
      orders: [],
      user: null,
      prefs: {
        emailNewEvents: true,
        remindDayBefore: true,
        remindTwoHours: false,
        darkMode: true,
        favoriteTypes: [],
      },
      wishlist: [],
      scanLog: [],
      promo: null,

      addToCart: (line) =>
        set((s) => {
          const i = s.cart.findIndex((l) => l.eventId === line.eventId && l.tierId === line.tierId);
          if (i >= 0 && !line.seats?.length) {
            const cart = [...s.cart];
            cart[i] = { ...cart[i], qty: Math.min(10, cart[i].qty + line.qty) };
            return { cart };
          }
          return { cart: [...s.cart, line] };
        }),
      removeLine: (i) => set((s) => ({ cart: s.cart.filter((_, idx) => idx !== i) })),
      setQty: (i, qty) =>
        set((s) => ({
          cart: s.cart.map((l, idx) => (idx === i ? { ...l, qty: Math.max(1, Math.min(10, qty)) } : l)),
        })),
      clearCart: () => set({ cart: [], promo: null }),
      applyPromo: (code) => {
        const key = code.trim().toUpperCase();
        if (PROMOS[key]) {
          set({ promo: key });
          return true;
        }
        return false;
      },
      totals: () => {
        const { cart, promo } = get();
        const subtotal = cart.reduce((a, l) => a + l.unitPrice * l.qty, 0);
        const discount = promo ? subtotal * PROMOS[promo] : 0;
        const fees = Math.round((subtotal - discount) * FEE_RATE * 100) / 100;
        return { subtotal, discount, fees, total: Math.round((subtotal - discount + fees) * 100) / 100 };
      },

      checkout: (guest, events) => {
        const { cart } = get();
        const { total, fees } = get().totals();
        const orderId = 'COL-' + rnd(6);
        const tickets: Ticket[] = [];
        cart.forEach((line) => {
          const ev = events.find((e) => e.id === line.eventId);
          for (let i = 0; i < line.qty; i++) {
            const id = 'TKT-' + rnd(8);
            tickets.push({
              id,
              code: `COLOSSEUM|${orderId}|${id}`,
              orderId,
              eventId: line.eventId,
              eventTitle: ev?.title ?? line.eventId,
              venueLabel: ev?.venueLabel ?? '',
              date: ev?.date ?? '',
              time: ev?.time ?? '',
              tierName: line.tierName,
              seat: line.seats?.[i],
              price: line.unitPrice,
              status: 'valid',
              guestName: guest.name,
            });
          }
        });
        const order: Order = {
          id: orderId,
          createdAt: new Date().toISOString(),
          total,
          fees,
          promo: get().promo ?? undefined,
          ticketIds: tickets.map((t) => t.id),
          guest,
        };
        set((s) => ({
          orders: [order, ...s.orders],
          tickets: [...tickets, ...s.tickets],
          cart: [],
          promo: null,
          user: s.user ?? { ...guest, guest: true },
        }));
        return order;
      },

      toggleWish: (id) =>
        set((s) => ({
          wishlist: s.wishlist.includes(id) ? s.wishlist.filter((w) => w !== id) : [...s.wishlist, id],
        })),
      signIn: (u) => set({ user: u }),
      signOut: () => set({ user: null }),
      setPrefs: (p) => set((s) => ({ prefs: { ...s.prefs, ...p } })),

      scan: (raw) => {
        const code = raw.trim();
        const t = get().tickets.find((x) => x.code === code || x.id === code.toUpperCase());
        if (!t) {
          set((s) => ({ scanLog: [{ code, at: new Date().toISOString(), result: 'invalid' as const }, ...s.scanLog].slice(0, 50) }));
          return { result: 'invalid' as const };
        }
        if (t.status === 'used') {
          set((s) => ({
            scanLog: [{ code, at: new Date().toISOString(), result: 'reused' as const, eventTitle: t.eventTitle }, ...s.scanLog].slice(0, 50),
          }));
          return { result: 'reused' as const, ticket: t };
        }
        const at = new Date().toISOString();
        set((s) => ({
          tickets: s.tickets.map((x) => (x.id === t.id ? { ...x, status: 'used', checkedInAt: at } : x)),
          scanLog: [{ code, at, result: 'ok' as const, eventTitle: t.eventTitle }, ...s.scanLog].slice(0, 50),
        }));
        return { result: 'ok' as const, ticket: { ...t, status: 'used', checkedInAt: at } };
      },

      resetDemo: () => set({ cart: [], tickets: [], orders: [], scanLog: [], wishlist: [], promo: null, user: null }),
    }),
    { name: 'colosseum-app' },
  ),
);

export { PROMOS, FEE_RATE };
