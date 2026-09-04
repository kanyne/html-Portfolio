import { JSDOM } from 'jsdom';
const dom = new JSDOM('', { url: 'http://localhost/' });
global.window = dom.window; global.document = dom.window.document;
global.localStorage = dom.window.localStorage;

import { execSync } from 'node:child_process';
import path from 'node:path';
const root = new URL('..', import.meta.url).pathname;
const outdir = path.join(root, 'node_modules', '.cache', 'logic');
execSync(`npx esbuild src/store.ts src/data/map.ts --bundle --format=esm --outdir=${outdir} --log-level=error`, { cwd: root, stdio: 'inherit' });

const { useStore } = await import(path.join(outdir, 'store.js'));
const { planRoute, routeSteps } = await import(path.join(outdir, 'data/map.js'));


const s = () => useStore.getState();
let fail = 0;
const t = (name, cond, extra = '') => { console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${extra ? ' :: ' + extra : ''}`); if (!cond) fail++; };

// fake event catalogue matching the shape checkout expects
const evs = [{ id: 'dune-two', title: 'Dune: Part Two', venueLabel: 'Saal 1', date: '2026-10-10', time: '19:30' }];

s().addToCart({ eventId: 'dune-two', tierId: 'standard', tierName: 'Standard', unitPrice: 12, qty: 2, seats: ['C5', 'C6'] });
t('cart has 1 line, qty 2', s().cart.length === 1 && s().cart[0].qty === 2);

s().addToCart({ eventId: 'dune-two', tierId: 'premium', tierName: 'Premium row', unitPrice: 15, qty: 1 });
t('second tier is a separate line', s().cart.length === 2);

let tot = s().totals();
t('subtotal 2*12 + 15 = 39', tot.subtotal === 39, `got ${tot.subtotal}`);
t('fee is 4.5%', Math.abs(tot.fees - 1.76) < 0.02, `got ${tot.fees}`);

t('bad promo rejected', s().applyPromo('NOPE') === false);
t('COLOSSEUM10 accepted', s().applyPromo('colosseum10') === true);
tot = s().totals();
t('10% discount = 3.90', Math.abs(tot.discount - 3.9) < 0.001, `got ${tot.discount}`);
t('total = subtotal - disc + fee', Math.abs(tot.total - (39 - 3.9 + tot.fees)) < 0.01, `got ${tot.total}`);

const order = s().checkout({ name: 'Ada L', email: 'ada@x.de', phone: '+49' }, evs);
t('order id format COL-XXXXXX', /^COL-[A-Z0-9]{6}$/.test(order.id), order.id);
t('3 tickets issued', s().tickets.length === 3, String(s().tickets.length));
t('cart cleared', s().cart.length === 0 && s().promo === null);
t('seats assigned to first two', s().tickets.filter(x => x.seat).length === 2);
t('ticket codes unique', new Set(s().tickets.map(x => x.code)).size === 3);
t('user auto-created from guest', s().user?.email === 'ada@x.de');
t('order in history', s().orders.length === 1);

const tk = s().tickets[0];
t('unknown code invalid', s().scan('TKT-BOGUS12').result === 'invalid');
const r1 = s().scan(tk.code);
t('valid QR checks in', r1.result === 'ok');
t('ticket marked used', s().tickets.find(x => x.id === tk.id).status === 'used');
t('checkedInAt stamped', !!s().tickets.find(x => x.id === tk.id).checkedInAt);
t('re-scan flagged reused', s().scan(tk.code).result === 'reused');
t('scan by plain ticket ID works', s().scan(s().tickets[1].id).result === 'ok');
t('scan log has 4 entries', s().scanLog.length === 4, String(s().scanLog.length));

s().toggleWish('spectaris'); s().toggleWish('dune-two'); s().toggleWish('spectaris');
t('wishlist toggles', JSON.stringify(s().wishlist) === '["dune-two"]', JSON.stringify(s().wishlist));

s().setPrefs({ darkMode: false });
t('prefs merge, others intact', s().prefs.darkMode === false && s().prefs.emailNewEvents === true);

t('persisted to localStorage', !!localStorage.getItem('colosseum-app'));
s().resetDemo();
t('reset clears tickets/orders/user', s().tickets.length === 0 && s().orders.length === 0 && !s().user);
t('reset keeps prefs', s().prefs.darkMode === false);

// routing
const p1 = planRoute('parking', 'galerie');
t('parking->galerie routes via elevator', p1.includes('elevator-g') && p1.includes('elevator-u'), p1.join('>'));
const p2 = planRoute('main-entrance', 'kinosaele');
t('entrance->cinema halls reachable', p2.length > 2 && p2.at(-1) === 'kinosaele', p2.join('>'));
t('same node returns single step', planRoute('wc-ground', 'wc-ground').length === 1);
t('steps narrate start & arrive', routeSteps(p2)[0].startsWith('Start at') && routeSteps(p2).at(-1).startsWith('Arrive at'));
t('every node reachable from entrance', ['wagenhalle','galerie','saal1','kinosaele','parking','wc-upper','concessions','exit-cinema']
  .every(n => planRoute('main-entrance', n).length > 0));

console.log(fail ? `\n${fail} check(s) failed` : '\nAll logic checks passed');
process.exit(fail ? 1 : 0);
