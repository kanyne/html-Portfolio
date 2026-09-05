/* ============================================================
   Colosseum Berlin — Guest App (vanilla JS, no dependencies)
   ============================================================ */
(function () {
  'use strict';

  var D = window.COLO_DATA;
  var LS = {
    lang: 'colosseum.lang',
    booted: 'colosseum.booted',
    tickets: 'colosseum.tickets',
    notifs: 'colosseum.notifs',
    scanlog: 'colosseum.scanlog',
    notifOn: 'colosseum.notifOn'
  };

  /* ---------------- helpers ---------------- */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  var decode = function (s) { try { return decodeURIComponent(s); } catch (e) { return s; } };
  var T = function (key, vars) {
    var s = (D.I18N[state.lang] || D.I18N.en)[key] || D.I18N.en[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  };
  var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var monNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  var fmtDay = function (iso) { var d = new Date(iso + 'T12:00:00'); return dayNames[d.getDay()]; };
  var fmtMon = function (iso) { var d = new Date(iso + 'T12:00:00'); return monNames[d.getMonth()]; };
  var fmtDate = function (iso) { var d = new Date(iso + 'T12:00:00'); return d.getDate() + '. ' + monNames[d.getMonth()] + ' ' + d.getFullYear(); };
  var fmtMoney = function (n) { return n.toFixed(2).replace('.', ',') + ' €'; };
  var uid = function (p) { return (p || 'ID') + '-' + Math.random().toString(36).slice(2, 8).toUpperCase(); };

  var IC = {
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>',
    ticket: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z"/><path d="M13 6v2m0 4v2m0 4v2" stroke-dasharray="1.5 3"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2.2 2.2 0 0 0 4 0"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.3-3.9 4.3-6 8-6s6.7 2.1 8 6"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="m3 11 9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></svg>',
    scan: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="M4 8V5a1 1 0 0 1 1-1h3m8 0h3a1 1 0 0 1 1 1v3m0 8v3a1 1 0 0 1-1 1h-3m-8 0H5a1 1 0 0 1-1-1v-3"/><path d="M7 12h10"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2"><path d="m4.5 12.5 5 5L19.5 7"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke-width="2.2"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.9"><path d="M12 3 2.5 20h19L12 3z"/><path d="M12 10v5m0 3v.5"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="M12 3v4m0 10v4M3 12h4m10 0h4m-2.8-6.2-2.8 2.8M8.6 15.4l-2.8 2.8m0-12.4 2.8 2.8m6.8 6.8 2.8 2.8"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.9"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7"><path d="M4 7h16M9 7V5h6v2m-9 0 1 13h10l1-13"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7"><path d="M5 11 7 5h10l2 6"/><rect x="3" y="11" width="18" height="7" rx="2"/><path d="M6 18v2m12-2v2"/></svg>',
    door: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7"><path d="M12 3v18m-3-2h8l3-6H10a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l3 6v11"/></svg>',
    wc: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7"><path d="M7 4h6l2 7H7V4z"/><path d="M8 11 6 20h3l1-5 1 5h3l-2-9"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    dir: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.7"><path d="m3 11 18-8-8 18-2.5-7.5L3 11z"/></svg>'
  };

  /* ---------------- state ---------------- */
  var state = {
    lang: store.get(LS.lang, 'en'),
    booted: store.get(LS.booted, false),
    tickets: store.get(LS.tickets, []),
    notifs: store.get(LS.notifs, []),
    scanlog: store.get(LS.scanlog, []),
    notifOn: store.get(LS.notifOn, false),
    filter: 'all',
    search: '',
    evSel: null,
    spacing: null,
    ticketSel: null,
    checkout: null,
    mapFloor: 'ground',
    mapFrom: 'north',
    mapTo: 'cinemas',
    mapRoute: null,
    mapActive: null,
    cameraStream: null,
    cameraTimer: null
  };

  var app = $('#app');
  var root = $('#root');
  var boot = $('#boot');

  /* ---------------- toast ---------------- */
  var toastTimer;
  function toast(msg, icon) {
    var t = $('#toast');
    $('.ic', t).innerHTML = icon || IC.bell;
    $('span', t).textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 3200);
  }

  /* ---------------- router ---------------- */
  function onHash() { render(); }

  function nav(hash) { location.hash = hash; }

  function normalizeParam(id) { return decode(id); }

  function currentRoute() {
    var h = location.hash.replace(/^#\/?/, '');
    var parts = h.split('/').filter(Boolean);
    return { name: parts[0] || 'home', param: parts.length > 1 ? normalizeParam(parts[1]) : null, param2: parts.length > 2 ? normalizeParam(parts[2]) : null };
  }

  function setActiveNav(name) {
    $$('.bottomnav a').forEach(function (a) {
      var key = a.getAttribute('data-nav');
      a.classList.toggle('active', key === name || (name === 'space' && key === 'spaces') || (name === 'ticket' && key === 'tickets'));
    });
    updateBadges();
  }

  function escEvent(ev) {
    var seats = ev.seats - ev.sold;
    return {
      id: ev.id,
      cat: ev.cat,
      title: ev.title,
      venue: ev.venue,
      date: ev.date,
      day: fmtDay(ev.date),
      mon: fmtMon(ev.date),
      time: ev.time,
      dur: ev.dur,
      price: ev.price,
      img: ev.img,
      desc: ev.desc,
      tags: ev.tags || [],
      seats: ev.seats,
      seatsLeft: seats
    };
  }

  /* ================= VIEWS ================= */
  var view = {};

  /* ---------- Home ---------- */
  view.home = function () {
    var next = D.EVENTS.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).slice(0, 3);
    var upcoming = D.EVENTS.length;
    var seats = D.SPACES.reduce(function (a, s) { return a + (s.facts && s.facts[2] ? 0 : 0); }, 0);
    return '' +
      '<div class="hero">' +
      '  <img src="' + esc(D.IMG.atrium) + '" alt="Atrium">' +
      '  <div class="inner">' +
      '    <span class="kicker">' + T('homeKicker') + '</span>' +
      '    <h1 class="hero-title">' + T('homeTitle') + '</h1>' +
      '    <p>' + T('homeDesc') + '</p>' +
      '    <button class="btn primary" data-go="events">' + T('nextEventsCta') + ' ' + IC.arrow + '</button>' +
      '  </div>' +
      '</div>' +
      '<div class="stat-row">' +
      '  <div class="stat"><b>' + upcoming + '</b><span>' + T('statEvents') + '</span></div>' +
      '  <div class="stat"><b>' + D.SPACES.length + '</b><span>' + T('statSpaces') + '</span></div>' +
      '  <div class="stat"><b>2600</b><span>' + T('statSeats') + '</span></div>' +
      '</div>' +
      '<div class="section-head"><h2>' + T('nextEvents') + '</h2><button class="link" data-go="events">' + T('nextEventsCta') + '</button></div>' +
      '<div class="fade-list">' + next.map(function (ev) { return evCard(ev); }).join('') + '</div>' +
      '<div class="section-head"><h2>' + T('venue') + '</h2><button class="link" data-go="map">' + T('mapLink') + '</button></div>' +
      '<div class="quick-grid">' +
      quick('events', 'buy', T('buyTickets'), T('filterAll') + ' · ' + D.EVENTS.length + ' ' + T('statEvents')) +
      quick('checkin', 'scan', T('checkIn'), T('checkInDesc')) +
      quick('map', 'map', T('mapLink'), T('mapSub')) +
      quick('notifications', 'bell', T('notifications'), T('notificationsDesc')) +
      '</div>';
  };

  function quick(route, icon, title, sub) {
    return '<button class="quick" data-go="' + route + '"><span class="ic">' + IC[icon] + '</span><b>' + esc(title) + '</b><span>' + esc(sub) + '</span></button>';
  }

  function evCard(ev) {
    ev = escEvent(ev);
    var catLabel = { cinema: T('filterCinema'), premiere: 'Premiere', corporate: T('filterCorporate'), concert: T('filterConcert'), community: T('filterCommunity') }[ev.cat] || ev.cat;
    return '' +
      '<article class="card ev-card" data-event="' + ev.id + '">' +
      '  <div class="thumb"><img src="' + esc(ev.img) + '" alt=""><div class="datebox"><b>' + ev.date.slice(8) + '</b><span>' + ev.mon + ' · ' + ev.day.toUpperCase() + '</span></div></div>' +
      '  <div class="body">' +
      '    <div><span class="tag ' + ev.cat + '">' + catLabel + '</span></div>' +
      '    <h3>' + esc(ev.title) + '</h3>' +
      '    <div class="meta">' + IC.clock + ev.time + ' · ' + ev.dur + ' &nbsp;' + IC.pin + ev.venue + '</div>' +
      '    <div class="foot">' +
      '      <span class="price">' + T('from') + ' ' + fmtMoney(ev.price) + '</span>' +
      '      <span class="seats-left">' + (ev.seatsLeft <= 50 ? '⚡ ' : '') + ev.seatsLeft + ' ' + T('seatsLeft') + '</span>' +
      '    </div>' +
      '  </div>' +
      '</article>';
  }

  /* ---------- Events ---------- */
  view.events = function () {
    var cats = [['all', T('filterAll')], ['cinema', T('filterCinema')], ['corporate', T('filterCorporate')], ['concert', T('filterConcert')], ['community', T('filterCommunity')]];
    var chips = cats.map(function (c) {
      return '<button class="chip ' + (state.filter === c[0] ? 'on' : '') + '" data-filter="' + c[0] + '">' + c[1] + '</button>';
    }).join('');
    var evs = D.EVENTS.filter(function (e) {
      var okCat = state.filter === 'all' || e.cat === state.filter;
      var q = state.search.trim().toLowerCase();
      var okQ = !q || (e.title + ' ' + e.venue + ' ' + (e.tags || []).join(' ')).toLowerCase().includes(q);
      return okCat && okQ;
    }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });

    var html = '' +
      '<div class="section-head" style="margin-top:8px"><div><span class="kicker">' + T('navEvents').toUpperCase() + '</span><h2 style="font-size:26px">' + T('nextEventsCta') + '</h2></div></div>' +
      '<div class="pill-row">' + chips + '</div>' +
      '<div class="field" style="margin-bottom:12px"><input id="ev-search" type="search" placeholder="' + T('searchEvents') + '" value="' + esc(state.search) + '"></div>' +
      '<div class="fade-list">' + eventsListHtml(evs) + '</div>';
    return html;
  };

  function eventsListHtml(evs) {
    if (!evs.length) {
      return '<div class="empty">' + IC.ticket + '<b>' + T('noTickets') + '</b><span>' + T('noTicketsDesc') + '</span></div>';
    }
    var last = '', out = '';
    evs.forEach(function (e) {
      if (e.date !== last) { out += '<div class="day-div">' + fmtDate(e.date) + '</div>'; last = e.date; }
      out += evCard(e);
    });
    return out;
  }

  /* ---------- Event detail (sheet) ---------- */
  function evDetailSheet(id) {
    var ev = D.EVENTS.find(function (e) { return e.id == id; });
    if (!ev) { toast('Event not found', IC.warn); return; }
    state.evSel = escEvent(ev);
    var types = [
      { key: 'standard', label: T('standard'), price: ev.price },
      { key: 'premium', label: T('premium'), price: ev.price + 8 },
      { key: 'vip', label: T('vip'), price: ev.price + 22 }
    ];
    var html = '' +
      '<span class="grabber"></span>' +
      '<div class="detail-hero"><img src="' + esc(ev.img) + '" alt=""></div>' +
      '<div class="section-head" style="margin:18px 0 6px"><div><span class="tag ' + ev.cat + '">' + ev.cat + '</span><h2 style="font-size:24px;margin-top:8px">' + esc(ev.title) + '</h2></div></div>' +
      '<div class="meta" style="display:flex;gap:14px;font-size:13px;color:var(--text-2);flex-wrap:wrap">' +
      '<span>' + IC.cal + ' ' + esc(fmtDate(ev.date)) + '</span><span>' + IC.clock + ' ' + ev.time + ' · ' + ev.dur + '</span><span>' + IC.pin + ' ' + esc(ev.venue) + '</span>' +
      '</div>' +
      '<p style="font-size:13.5px;color:var(--text-2);line-height:1.65;margin:14px 0">' + esc(ev.desc) + '</p>' +
      '<div class="pill-row">' + ev.tags.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<div class="fact-grid">' +
      '<div class="fact-box"><b>' + esc(fmtMoney(ev.price)) + '</b><span>' + T('from') + '</span></div>' +
      '<div class="fact-box"><b>' + ev.seatsLeft + '</b><span>' + T('seatsLeft') + '</span></div>' +
      '<div class="fact-box"><b>' + ev.venue + '</b><span>' + T('venue') + '</span></div>' +
      '</div>' +
      '<h3 style="font-size:18px;margin:10px 0 10px">' + T('ticketTypes') + '</h3>';
    types.forEach(function (t, i) {
      html += '<div class="tier-row ' + (state.checkout && state.checkout.type === t.key ? 'on' : '') + '" data-tier="' + t.key + '">' +
        '<div class="t"><b>' + t.label + '</b><span>' + (t.key === 'vip' ? T('vip') : '') + '</span></div>' +
        '<div class="p">' + fmtMoney(t.price) + '</div></div>';
    });
    html += '' +
      '<h3 style="font-size:18px;margin:14px 0 10px">' + T('qty') + '</h3>' +
      '<div class="qty-stepper"><span class="muted" style="font-size:13px">' + T('qty') + '</span><div class="steppers"><button data-q="-1">−</button><b id="qty">1</b><button data-q="1">+</button></div></div>' +
      '<div class="summary-line" style="margin-top:16px"><span>' + T('ticketTypes') + '</span><b id="sum-type">' + types[0].label + '</b></div>' +
      '<div class="summary-line"><span>' + T('qty') + '</span><b id="sum-qty">1</b></div>' +
      '<div class="summary-line total"><span>' + T('pay').toUpperCase() + ' </span><span id="sum-total">' + fmtMoney(ev.price) + '</span></div>' +
      '<div style="display:flex;gap:10px;margin-top:18px">' +
      '<button class="btn ghost" data-remind="' + ev.id + '">' + T('addReminder') + ' ' + IC.bell + '</button>' +
      '<button class="btn primary" style="flex:1" data-buy>' + T('buy') + ' ' + IC.arrow + '</button>' +
      '</div>';
    openSheet(html, 'event-sheet');
    bindEventSheet(ev);
  }

  function bindEventSheet(ev) {
    var qty = 1, type = 'standard';
    var types = { standard: ev.price, premium: ev.price + 8, vip: ev.price + 22 };
    var labels = { standard: T('standard'), premium: T('premium'), vip: T('vip') };
    function update() {
      $('#qty').textContent = qty;
      $('#sum-qty').textContent = qty;
      $('#sum-total').textContent = fmtMoney(types[type] * qty);
      $('#sum-type').textContent = labels[type];
    }
    $$('.tier-row', sheetEl).forEach(function (r) {
      r.addEventListener('click', function () {
        $$('.tier-row', sheetEl).forEach(function (x) { x.classList.remove('on'); });
        r.classList.add('on');
        type = r.getAttribute('data-tier');
        update();
      });
    });
    $$('[data-q]', sheetEl).forEach(function (b) {
      b.addEventListener('click', function () {
        qty = Math.min(10, Math.max(1, qty + parseInt(b.getAttribute('data-q'), 10)));
        update();
      });
    });
    $('[data-buy]', sheetEl).addEventListener('click', function () {
      checkoutFor(ev, type, qty);
    });
    $('[data-remind]', sheetEl).addEventListener('click', function () {
      var evId = this.getAttribute('data-remind');
      pushNotif('notifTitle1', 'notifDesc1', { event: ev.title, time: ev.time }, 'reminder');
      closeSheet();
      nav('#/notifications');
    });
  }

  /* ---------- Checkout ---------- */
  function checkoutFor(ev, type, qty) {
    var prices = { standard: ev.price, premium: ev.price + 8, vip: ev.price + 22 };
    var labels = { standard: T('standard'), premium: T('premium'), vip: T('vip') };
    state.checkout = { event: ev, type: type, qty: qty, price: prices[type], label: labels[type] };
    var html = '' +
      '<span class="grabber"></span>' +
      '<span class="kicker">' + T('checkout') + '</span>' +
      '<h2 style="font-size:24px;margin:8px 0 4px">' + esc(ev.title) + '</h2>' +
      '<div class="meta" style="font-size:12.5px;color:var(--text-2)">' + fmtDate(ev.date) + ' · ' + ev.time + ' · ' + esc(ev.venue) + '</div>' +
      '<div class="summary-line" style="margin-top:14px"><span>' + labels[type] + ' × ' + qty + '</span><span>' + fmtMoney(typesTotal()) + '</span></div>' +
      '<div class="summary-line total"><span>Total</span><span>' + fmtMoney(typesTotal()) + '</span></div>' +
      '<div class="form" style="margin-top:16px">' +
      '<div class="field"><label>' + T('name') + '</label><input id="co-name" placeholder="Marie Weber" value="' + esc(state.checkout.holder || '') + '"></div>' +
      '<div class="field"><label>' + T('email') + '</label><input id="co-email" type="email" placeholder="mari@example.com" value="' + esc(state.checkout.mail || '') + '"></div>' +
      '<div class="field"><label>' + T('card') + '</label><input id="co-card" inputmode="numeric" placeholder="4242 4242 4242 4242" value="4242 4242 4242 4242"></div>' +
      '</div>' +
      '<button class="btn primary block" id="co-pay" style="margin-top:18px">' + T('pay') + ' · ' + fmtMoney(typesTotal()) + ' ' + IC.arrow + '</button>' +
      '<p class="muted" style="font-size:10.5px;margin-top:10px;text-align:center">Demo checkout — no real payment is processed.</p>';
    openSheet(html, 'checkout-sheet');
    function typesTotal() { return state.checkout.price * state.checkout.qty; }
    $('#co-pay').addEventListener('click', function (e) {
      var btn = e.currentTarget;
      var name = $('#co-name').value.trim();
      var email = $('#co-email').value.trim();
      if (!name || !email.indexOf('@') < 1) { toast(T('name') + ' / ' + T('email'), IC.warn); return; }
      btn.disabled = true;
      btn.innerHTML = T('paying');
      setTimeout(function () {
        createOrder(name, email);
        closeSheet();
        toast(T('paySuccess'), IC.check);
        nav('#/tickets');
      }, 900);
    });
  }

  function createOrder(name, email) {
    var ev = state.checkout.event;
    var orderId = 'ORD-' + new Date().getFullYear() + '-' + String(state.tickets.length + 1).padStart(4, '0');
    for (var i = 0; i < state.checkout.qty; i++) {
      state.tickets.push({
        id: 'TKT-' + String(state.tickets.length + 1).padStart(4, '0'),
        orderId: orderId,
        token: uid('TOK'),
        eventId: ev.id,
        eventTitle: ev.title,
        eventDate: ev.date,
        eventTime: ev.time,
        venue: ev.venue,
        type: state.checkout.type,
        typeLabel: state.checkout.label,
        price: state.checkout.price,
        holder: name,
        email: email,
        boughtAt: new Date().toISOString(),
        used: false,
        usedAt: null
      });
    }
    store.set(LS.tickets, state.tickets);
    // schedule demo reminder in 25 s
    var t = state.tickets[state.tickets.length - 1];
    setTimeout(function () {
      if (state.notifOn || true) {
        pushNotif('notifTitle1', 'notifDesc1', { event: t.eventTitle, time: t.eventTime }, 'reminder');
        if (state.notifOn && 'Notification' in window && Notification.permission === 'granted') {
          try { new Notification(T('notifTitle1').replace('{event}', t.eventTitle), { body: t.eventTime + ' · ' + t.venue, icon: 'assets/icons/icon.svg' }); } catch (e) {}
        }
      }
    }, 25000);
  }

  /* ---------- Tickets ---------- */
  view.tickets = function () {
    if (!state.tickets.length) {
      return '<div class="section-head" style="margin-top:8px"><span class="kicker">' + T('myTickets') + '</span></div>' +
        '<div class="empty">' + IC.ticket + '<b>' + T('noTickets') + '</b><span>' + T('noTicketsDesc') + '</span><button class="btn primary" style="margin-top:16px" data-go="events">' + T('browse') + '</button></div>';
    }
    var list = state.tickets.map(function (t) {
      var ev = D.EVENTS.find(function (e) { return e.id == t.eventId; });
      var img = ev ? ev.img : D.IMG.atrium;
      var right = '<div class="qr-wrap"><canvas></canvas><div class="qr-label">' + t.id + '</div></div>';
      return '<article class="ticket" data-ticket="' + t.id + '">' +
        '<div class="head"><span class="ev">' + esc(t.eventTitle) + '</span><span class="tag">' + esc(t.typeLabel || t.type) + '</span></div>' +
        '<div class="main"><div class="info">' +
        '<div class="row"><span>' + T('venue') + '</span><span>' + esc(t.venue) + '</span></div>' +
        '<div class="row"><span>' + T('eventDetails') + '</span><span>' + fmtDate(t.eventDate) + ' · ' + t.eventTime + '</span></div>' +
        '<div class="row"><span>' + T('token') + '</span><span class="mono">' + t.token.slice(0, 12) + '…</span></div>' +
        '<div class="status-line ' + (t.used ? 'used' : '') + '"><span class="dot"></span>' + (t.used ? T('used') : T('valid')) + '</div>' +
        '</div>' + right + '</div>' +
        '<div class="foot">' +
        '<button class="btn ghost small" data-qr="' + t.id + '">QR</button>' +
        '<button class="btn ghost small" data-remind="' + t.eventId + '">' + T('addReminder') + '</button>' +
        '<button class="btn primary small" data-go="' + t.eventId + '">' + T('eventDetails') + '</button>' +
        '</div></article>';
    }).join('');
    return '<div class="section-head" style="margin-top:8px"><span class="kicker">' + T('myTickets') + '</span><span class="chip">' + state.tickets.length + '</span></div>' +
      '<div class="fade-list">' + list + '</div>';
  };

  /* ---------- Check-in (staff) ---------- */
  view.checkin = function () {
    var okCount = state.scanlog.filter(function (s) { return s.ok; }).length;
    return '' +
      '<div class="section-head" style="margin-top:8px"><div><span class="kicker">' + T('checkInTitle') + '</span><h2 style="font-size:26px">' + T('checkInTitle') + '</h2></div><span class="chip">' + okCount + '</span></div>' +
      '<p class="muted" style="font-size:13px;line-height:1.6;margin-bottom:4px">' + T('checkInDesc') + '</p>' +
      '<div class="scan-frame">' +
      '<span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span>' +
      '<span class="scan-beam"></span>' +
      '<div class="ic-big">' + IC.scan + '</div>' +
      '<h3>' + T('scan') + '</h3>' +
      '<p>' + T('scanHint') + '</p>' +
      '<div style="display:flex;gap:9px;margin-top:18px;justify-content:center;flex-wrap:wrap">' +
      '<button class="btn primary small" id="cam-scan">' + IC.scan + ' ' + T('scan') + '</button>' +
      '<button class="btn ghost small" id="demo-scan">⚡ ' + T('simulate') + '</button>' +
      '</div>' +
      '</div>' +
      '<div class="field"><label>' + T('manualLabel') + '</label><input id="manual-code" placeholder="TKT-0000 · TOK-XXXXXX" autocapitalize="characters" autocomplete="off"></div>' +
      '<div id="scan-result"></div>' +
      '<div class="section-head"><h2>' + T('recent') + '</h2><button class="link" id="clear-log">' + T('clearLog') + '</button></div>' +
      '<div id="scan-log">' + scanLogHtml() + '</div>';
  };

  function scanLogHtml() {
    if (!state.scanlog.length) {
      return '<div class="empty" style="padding:26px">' + IC.scan + '<b>' + T('recent') + '</b><span>' + T('scanHistory') + '</span></div>';
    }
    return '<div class="card log-list">' + state.scanlog.slice(0, 12).map(function (s) {
      var mins = Math.max(0, Math.round((Date.now() - s.at) / 60000));
      return '<div class="log-item"><span class="st ' + (s.ok ? 'ok' : 'no') + '"></span>' +
        '<span style="flex:1"><b>' + esc(s.label) + '</b><br><span class="muted" style="font-size:11px">' + esc(s.code) + '</span></span>' +
        '<span class="muted" style="font-size:11px">' + mins + ' ' + T('lastMin') + '</span></div>';
    }).join('') + '</div>';
  }

  function scanResult(kind, t) {
    var box = $('#scan-result');
    if (kind === 'ok') {
      box.innerHTML = '<div class="result-card"><div class="ok-ic">' + IC.check + '</div><b>' + T('okTitle') + '</b>' +
        '<p style="font-size:13px;color:var(--text-2)">' + esc(t.eventTitle) + ' · ' + t.typeLabel + ' · ' + t.holder + '</p>' +
        '<p style="font-size:12px;margin-top:6px">' + T('okDesc') + '</p></div>';
    } else if (kind === 'used') {
      box.innerHTML = '<div class="result-card err"><div class="ok-ic">' + IC.warn + '</div><b>' + T('reusedTitle') + '</b>' +
        '<p style="font-size:13px;color:var(--text-2)">' + esc(t.eventTitle) + ' · ' + esc(t.holder) + '</p></div>';
    } else {
      box.innerHTML = '<div class="result-card err"><div class="ok-ic">' + IC.x + '</div><b>' + T('errTitle') + '</b>' +
        '<p style="font-size:13px;color:var(--text-2)">' + T('errDesc') + '</p></div>';
    }
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function handleScan(code) {
    code = (code || '').trim().toUpperCase();
    if (!code) return;
    var t = state.tickets.find(function (x) { return x.token === code || x.id === code; });
    var log = { code: code, label: '', ok: false, at: Date.now() };
    if (!t) {
      log.label = 'INVALID';
      scanResult('err');
      toast(T('errTitle'), IC.warn);
    } else if (t.used) {
      log.label = t.eventTitle + ' · ' + t.holder;
      scanResult('used', t);
      toast(T('reusedTitle'), IC.warn);
    } else {
      t.used = true; t.usedAt = new Date().toISOString();
      store.set(LS.tickets, state.tickets);
      log.ok = true; log.label = t.eventTitle + ' · ' + t.holder;
      scanResult('ok', t);
      toast(T('okTitle') + ' · ' + t.eventTitle, IC.check);
    }
    state.scanlog.unshift(log);
    state.scanlog = state.scanlog.slice(0, 60);
    store.set(LS.scanlog, state.scanlog);
    var logEl = $('#scan-log');
    if (logEl) logEl.innerHTML = scanLogHtml();
  }

  function demoScan() {
    var pool = [];
    if (state.tickets.length) pool = state.tickets.map(function (t) { return t.token; });
    // demo walk-in ticket exists for first-time demo
    if (!state.tickets.some(function (t) { return t.id === 'TKT-DEMO-0001'; })) {
      var ev = D.EVENTS[1];
      state.tickets.push({
        id: 'TKT-DEMO-0001', orderId: 'ORD-DEMO', token: 'TOK-DEMO4242', eventId: ev.id,
        eventTitle: ev.title, eventDate: ev.date, eventTime: ev.time, venue: ev.venue,
        type: 'standard', typeLabel: T('standard'), price: ev.price,
        holder: 'Demo Guest', email: 'demo@colosseum.de', boughtAt: new Date().toISOString(), used: false
      });
      store.set(LS.tickets, state.tickets);
    }
    pool.push('TOK-DEMO4242');
    if (Math.random() < 0.25) {
      handleScan('TOK-MISSING-' + Math.floor(Math.random() * 999));
    } else {
      handleScan(pool[Math.floor(Math.random() * pool.length)]);
    }
  }

  /* ---------- Camera QR scan (progressive) ---------- */
  function openCameraScan() {
    if (!('BarcodeDetector' in window)) {
      openSheet(
        '<span class="grabber"></span><div class="scan-modal">' +
        '<h2 style="font-size:22px;margin-bottom:6px">' + T('scan') + '</h2>' +
        '<p class="muted" style="font-size:12.5px;line-height:1.6;margin-bottom:12px">' + T('scanHint') + '</p>' +
        '<div class="field"><label>' + T('manualLabel') + '</label><input id="cam-code" placeholder="TKT-0000 · TOK-XXXXXX" autocapitalize="characters"></div>' +
        '<button class="btn primary block" id="cam-submit" style="margin-top:12px">' + T('scan') + '</button></div>', 'scan-modal');
      $('#cam-submit').addEventListener('click', function () { handleScan($('#cam-code').value); closeSheet(); });
      return;
    }
    openSheet(
      '<span class="grabber"></span><div class="scan-modal">' +
      '<h2 style="font-size:22px;margin-bottom:6px">' + T('scan') + '</h2>' +
      '<video id="cam-video" playsinline muted></video>' +
      '<p class="muted" style="font-size:12px;margin-top:10px">Hold a ticket QR in the frame.</p>' +
      '<div class="field"><label>' + T('manualLabel') + '</label><input id="cam-code" placeholder="TKT-0000 · TOK-XXXXXX" autocapitalize="characters"></div>' +
      '<button class="btn ghost block" id="cam-submit" style="margin-top:12px">' + T('scan') + '</button></div>', 'scan-modal');
    $('#cam-submit').addEventListener('click', function () { handleScan($('#cam-code').value); closeSheet(); });

    var video = $('#cam-video');
    var detector;
    try {
      detector = new window.BarcodeDetector({ formats: ['qr_code'] });
    } catch (e) {
      video.style.display = 'none';
      toast('Camera detection unavailable — enter the code manually.', IC.warn);
      return;
    }
    var stream;
    function loop() {
      if (!stream) return;
      detector.detect(video).then(function (codes) {
        if (codes && codes.length) {
          var raw = codes[0].rawValue;
          var m = /COLOSSEUM(?::|:)(?:TICKET:)?([A-Z0-9-]+)/i.exec(raw);
          handleScan(raw);
          closeSheet();
          return;
        }
        state.cameraTimer = setTimeout(loop, 250);
      }).catch(function () { state.cameraTimer = setTimeout(loop, 250); });
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(function (s) {
          stream = s; state.cameraStream = s;
          video.srcObject = s; video.play().catch(function () {});
          loop();
        })
        .catch(function () {
          video.style.display = 'none';
          toast('Camera unavailable — enter code manually.', IC.warn);
        });
    }
  }

  function stopCamera() {
    if (state.cameraStream) {
      state.cameraStream.getTracks().forEach(function (t) { t.stop(); });
      state.cameraStream = null;
    }
    if (state.cameraTimer) { clearTimeout(state.cameraTimer); state.cameraTimer = null; }
  }

  /* ---------- Notifications ---------- */
  function pushNotif(tKey, dKey, vars, kind) {
    state.notifs.unshift({
      id: uid('N'),
      title: T(tKey, Object.assign({ event: '', time: '', n: '' }, vars)),
      body: T(dKey, Object.assign({ event: '', time: '', n: '' }, vars)),
      at: Date.now(),
      kind: kind || 'info',
      read: false
    });
    state.notifs = state.notifs.slice(0, 30);
    store.set(LS.notifs, state.notifs);
    updateBadges();
  }

  view.notifications = function () {
    var items = state.notifs.map(function (n) {
      return '<div class="notif-item"><span class="ic">' + (n.kind === 'reminder' ? IC.clock : IC.spark) + '</span>' +
        '<div style="flex:1"><b>' + esc(n.title) + '</b><p>' + esc(n.body) + '</p><time>' + new Date(n.at).toLocaleString(state.lang === 'de' ? 'de-DE' : 'en-GB') + '</time></div></div>';
    }).join('');
    var on = state.notifOn;
    return '' +
      '<div class="section-head" style="margin-top:8px"><span class="kicker">' + T('notifications') + '</span><button class="chip" id="notif-toggle">🔔 ' + (on ? T('on') : T('off')) + '</button></div>' +
      '<div class="card" style="padding:16px;margin-bottom:16px;display:flex;gap:12px;align-items:center">' +
      '<span class="ic" style="width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:rgba(232,185,107,0.12)">' + IC.bell + '</span>' +
      '<div style="flex:1"><b style="font-size:13.5px">' + T('notificationsTitle') + '</b><p class="muted" style="font-size:12px;margin-top:3px">' + T('notificationsDesc') + '</p></div>' +
      '<button class="btn primary small" id="notif-enable">' + (on ? T('done') : T('enableNotifs')) + '</button></div>' +
      '<div id="notif-list">' + (items || '<div class="empty">' + IC.bell + '<b>' + T('noNotifs') + '</b><span>' + T('noNotifsDesc') + '</span></div>') + '</div>';
  };

  /* ---------- Spaces ---------- */
  view.spaces = function () {
    return '' +
      '<div class="section-head" style="margin-top:8px"><div><span class="kicker">' + T('venue') + '</span><h2 style="font-size:26px">' + T('spaces') + '</h2></div>' +
      '<button class="btn ghost small" data-go="map">' + T('viewMap') + '</button></div>' +
      '<p class="muted" style="font-size:13px;margin-bottom:16px;line-height:1.6">' + D.SPACES[0].desc.slice(0, 140) + '…</p>' +
      '<div class="space-list">' + D.SPACES.map(function (s) {
        return '<article class="card space-card" data-space="' + s.id + '">' +
          '<div class="img"><img src="' + esc(s.img) + '" alt=""><span class="num">' + s.num + '</span></div>' +
          '<div class="pad"><h3>' + esc(s.name) + '</h3><p class="muted" style="font-size:12px;line-height:1.55">' + esc(s.desc.slice(0, 110)) + '…</p>' +
          '<div class="facts">' + s.facts.slice(0, 3).map(function (f) { return '<span class="fact">' + esc(f[0]) + ' ' + esc(f[1]) + '</span>'; }).join('') + '</div>' +
          '</div></article>';
      }).join('') + '</div>';
  };

  function spaceSheet(id) {
    var s = D.SPACES.find(function (x) { return x.id === id; });
    if (!s) return;
    state.spacing = s;
    var html = '<span class="grabber"></span>' +
      '<div class="detail-hero" style="aspect-ratio:16/7"><img src="' + esc(s.img) + '" alt=""></div>' +
      '<div class="section-head" style="margin:16px 0 4px"><div><span class="kicker">' + s.short + '</span><h2 style="font-size:24px">' + esc(s.name) + '</h2></div>' +
      '<button class="btn ghost small" id="sp-map">' + IC.map + ' ' + T('viewMap') + '</button></div>' +
      '<p class="muted" style="font-size:13.5px;line-height:1.65">' + esc(s.desc) + '</p>' +
      '<h3 style="font-size:17px;margin:18px 0 10px">' + T('spaceFacts') + '</h3>' +
      '<div class="fact-grid">' + s.facts.map(function (f) { return '<div class="fact-box"><b>' + esc(f[0]) + '</b><span>' + esc(f[1]) + '</span></div>'; }).join('') + '</div>';
    if (s.cinemas) {
      html += '<div class="pill-row">' + s.cinemas.map(function (k) {
        return '<span class="chip">' + T('seats') + ' ' + k.no + ': ' + k.seats + ' · ' + k.area + ' m²</span>';
      }).join('') + '</div>';
    }
    html += '<h3 style="font-size:17px;margin:18px 0 10px">' + T('amenities') + '</h3><div class="facts">' +
      s.amenities.map(function (a) { return '<span class="fact">✓ ' + esc(a) + '</span>'; }).join('') + '</div>';
    if (s.formats) {
      html += '<h3 style="font-size:17px;margin:18px 0 10px">' + T('formats') + '</h3><div class="pill-row">' +
        s.formats.map(function (f) { return '<span class="chip">' + esc(f) + '</span>'; }).join('') + '</div>';
    }
    html += '<div style="display:flex;gap:10px;margin-top:22px">' +
      '<button class="btn ghost" data-maps>' + IC.pin + ' ' + T('openMap') + '</button>' +
      '<button class="btn primary" style="flex:1" id="sp-offer">' + T('requestOffer') + '</button></div>';
    openSheet(html, 'space-sheet');
    $('#sp-map').addEventListener('click', function () { closeSheet(); nav('#/map'); });
    $('#sp-offer').addEventListener('click', offerSheet);
    var mapBtn = $('[data-maps]', sheetEl);
    if (mapBtn) mapBtn.addEventListener('click', function () { window.open(D.VENUE.mapsUrl, '_blank'); });
  }

  function offerSheet() {
    openSheet('<span class="grabber"></span><span class="kicker">' + T('requestOffer') + '</span>' +
      '<h2 style="font-size:23px;margin:8px 0 12px">' + (state.spacing ? state.spacing.name : 'Wagenhalle') + '</h2>' +
      '<div class="form">' +
      '<div class="field"><label>' + T('name') + '</label><input id="of-name" placeholder="Chris Krause"></div>' +
      '<div class="field"><label>' + T('email') + '</label><input id="of-mail" type="email" placeholder="you@company.de"></div>' +
      '<div class="field"><label>Event type</label><input id="of-type" placeholder="Gala · 300 guests · Oktober"></div>' +
      '<div class="field"><label>' + T('venue') + '</label><select id="of-space">' + D.SPACES.map(function (s) { return '<option value="' + s.id + '" ' + (state.spacing && s.id === state.spacing.id ? 'selected' : '') + '>' + esc(s.name) + '</option>'; }).join('') + '</select></div>' +
      '</div>' +
      '<button class="btn primary block" id="of-send" style="margin-top:18px">' + T('requestOffer') + '</button>', 'offer-sheet');
    $('#of-send').addEventListener('click', function () {
      closeSheet();
      openSheet('<span class="grabber"></span><div class="empty">' + IC.check + '<b>' + T('thanks') + '</b><span>' + T('thanksDesc') + '</span></div>', 'thanks-sheet');
    });
  }

  /* ---------- Map & navigation ---------- */
  view.map = function () {
    var floors = D.MAP.floors.map(function (f) {
      return '<button class="chip ' + (state.mapFloor === f.id ? 'on' : '') + '" data-floor="' + f.id + '">' + f.label + '</button>';
    }).join('');
    var nodeOpts = nodeSelectOptions();
    return '' +
      '<div class="section-head" style="margin-top:8px"><div><span class="kicker">' + T('navEvents') + '</span><h2 style="font-size:26px">' + T('mapTitle') + '</h2></div></div>' +
      '<p class="muted" style="font-size:12.5px;line-height:1.6;margin-bottom:12px">' + T('mapSub') + '</p>' +
      '<div class="pill-row">' + floors + '</div>' +
      '<div class="map-shell" id="map-shell">' + mapSvg() + '<div id="map-info"></div></div>' +
      '<div class="route-ctrl">' +
      '<div class="field"><label>' + T('routeFrom') + '</label><select id="route-from">' + nodeOpts + '</select></div>' +
      '<div class="field"><label>' + T('routeTo') + '</label><select id="route-to">' + nodeOpts + '</select></div>' +
      '</div>' +
      '<div style="display:flex;gap:10px">' +
      '<button class="btn primary" style="flex:1" id="route-go">' + IC.dir + ' ' + T('planRoute') + '</button>' +
      '<button class="btn ghost" id="route-clear">' + T('clearRoute') + '</button>' +
      '</div>' +
      '<div class="map-legend">' +
      '<span class="li"><span class="sw" style="background:#8a6a33"></span>' + T('legendSpace') + '</span>' +
      '<span class="li"><span class="sw" style="background:#d95f4f"></span>' + T('legendAmenity') + '</span>' +
      '<span class="li"><span class="sw" style="background:#6fbf8f"></span>' + T('legendExit') + '</span>' +
      '<span class="li"><span class="sw" style="background:#5b8dd9"></span>' + T('legendParking') + '</span>' +
      '</div>';
  };

  function nodeSelectOptions() {
    var nodes = mapNodes();
    return nodes.map(function (n) { return '<option value="' + n.id + '" ' + (state.mapFrom === n.id ? 'data-f' : state.mapTo === n.id ? 'data-t' : '') + '>' + esc(n.label) + '</option>'; }).join('');
  }

  function mapNodes() {
    var r = D.MAP.routes, set = {}, out = [];
    Object.keys(r).forEach(function (k) { set[k] = { id: k, label: k, x: r[k].x, y: r[k].y }; });
    D.MAP.nodes.forEach(function (n) {
      set[n.id] = { id: n.id, label: n.label, x: n.x, y: n.y, kind: n.kind };
    });
    // friendlier labels
    var labels = { wagen: 'Wagenhalle', atrium: 'Atrium', saal1: 'Saal 1', cinemas: 'Kinosäle 2–10', saal10: 'Saal 10', galerie: 'Galerie (upper)', foyer: 'Foyer', bar: 'Moët Bar', north: 'North entrance', southeast: 'Side entrance', garderobe: 'Garderobe', wc: 'Restrooms', elevator: 'Lift', parking: 'Parking P2' };
    Object.keys(set).forEach(function (k) { set[k].label = labels[k] || set[k].label; });
    Object.keys(set).forEach(function (k) { out.push(set[k]); });
    return out;
  }

  function floorShapes(floor) {
    var s = '';
    if (floor === 'ground') {
      s += rect(60, 90, 170, 150, '#8a6a33', 'Wagenhalle', '0.86') +
        rect(240, 80, 180, 200, '#a3823f', 'ATRIUM', '0.94') +
        rect(470, 60, 150, 100, '#8a6a33', 'Saal 1', '0.86') +
        rect(470, 190, 150, 140, '#6d5330', 'Kinos 2–10', '0.8') +
        rect(210, 300, 220, 60, '#6d5330', 'Foyer', '0.72') +
        '<path d="M330 88 v-38" stroke="#5c4b2c" stroke-width="6" stroke-dasharray="2 7"/>' +
        '<path d="M230 165 h14 M420 165 h14 M470 150 v40 M620 190 v110 M210 330 h-40" stroke="#5c4b2c" stroke-width="5"/>';
    } else if (floor === 'upper') {
      s = rect(100, 240, 220, 130, '#8a6a33', 'GALERIE', '0.9') +
        '<rect x="70" y="230" width="30" height="150" rx="6" fill="rgba(232,185,107,0.06)" stroke="#8a6a33" stroke-dasharray="4 5" stroke-width="1.5"/>' +
        '<rect x="320" y="230" width="30" height="150" rx="6" fill="rgba(232,185,107,0.06)" stroke="#8a6a33" stroke-dasharray="4 5" stroke-width="1.5"/>' +
        '<text x="85" y="310" fill="#c9bca8" font-size="11" transform="rotate(-90 85 310)">TERRACE</text>' +
        '<text x="335" y="310" fill="#c9bca8" font-size="11" transform="rotate(90 335 310)">TERRACE</text>';
    } else {
      s = rect(470, 60, 150, 100, '#8a6a33', 'SAAL 1', '0.9');
      var ks = [2, 3, 4, 5, 6, 7, 8, 9, 10];
      ks.forEach(function (k, i) {
        var x = 478 + (i % 3) * 46, y = 196 + Math.floor(i / 3) * 44;
        s += '<rect x="' + x + '" y="' + y + '" width="40" height="38" rx="6" fill="rgba(232,185,107,0.07)" stroke="#8a6a33" stroke-width="1.4"/>' +
          '<text x="' + (x + 20) + '" y="' + (y + 24) + '" text-anchor="middle" fill="#e8b96b" font-size="12" font-family="Marcellus, serif">' + k + '</text>';
      });
    }
    return s;
  }

  function rect(x, y, w, h, stroke, label, opacity) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="12" fill="rgba(232,185,107,' + (opacity || '0.05') + ')" stroke="' + stroke + '" stroke-width="2"/>' +
      (label ? '<text x="' + (x + 12) + '" y="' + (y + 24) + '" fill="#e8b96b" font-size="13" font-family="Marcellus, serif" letter-spacing="2">' + label + '</text>' : '');
  }

  function mapSvg() {
    var floor = state.mapFloor;
    var nodes = mapNodes();
    var nodeIds = Object.keys(D.MAP.routes).filter(function (id) {
      // show pins appropriate to floor
      if (floor === 'ground') return ['north', 'parking', 'wagen', 'atrium', 'bar', 'garderobe', 'wc', 'elevator', 'foyer', 'southeast', 'saal1', 'cinemas'].indexOf(id) >= 0;
      if (floor === 'upper') return ['galerie', 'elevator'];
      return ['saal1', 'cinemas', 'southeast'];
    });
    var pins = nodeIds.map(function (id) {
      var n = nodes.find(function (x) { return x.id === id; });
      if (!n) return '';
      var kind = n.kind || (id === 'wagen' || id === 'atrium' || id === 'saal1' || id === 'cinemas' || id === 'galerie' || id === 'foyer' ? 'space' : 'amenity');
      var col = kind === 'exit' ? '#6fbf8f' : kind === 'parking' ? '#5b8dd9' : kind === 'space' ? '#e8b96b' : '#d95f4f';
      var active = state.mapActive === id;
      return '<g class="map-pin ' + (active ? 'active' : '') + '" data-node="' + id + '">' +
        '<circle cx="' + n.x + '" cy="' + n.y + '" r="' + (active ? 12 : 9) + '" fill="' + col + '" opacity="0.9"/>' +
        '<circle cx="' + n.x + '" cy="' + n.y + '" r="4" fill="#0b0908"/>' +
        '<text x="' + n.x + '" y="' + (n.y - 14) + '" text-anchor="middle" fill="' + col + '" font-size="10" font-weight="700">' + esc(n.label.toUpperCase().slice(0, 16)) + '</text>' +
        '</g>';
    }).join('');
    var route = '';
    if (state.mapRoute && state.mapRoute.length > 1) {
      var pts = state.mapRoute.map(function (id) { var n = nodes.find(function (x) { return x.id === id; }); return n.x + ',' + n.y; }).join(' ');
      route = '<polyline points="' + pts + '" fill="none" stroke="#e8b96b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 9" opacity="0.95"><animate attributeName="stroke-dashoffset" from="40" to="0" dur="1.6s" repeatCount="indefinite"/></polyline>';
    }
    return '<svg viewBox="' + D.MAP.viewBox + '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0v28" fill="none" stroke="rgba(232,185,107,0.05)" stroke-width="1"/></pattern></defs>' +
      '<rect width="640" height="440" fill="url(#grid)"/>' +
      '<rect x="40" y="34" width="580" height="330" rx="18" fill="rgba(255,255,255,0.015)" stroke="#8a6a33" stroke-width="1.2" stroke-dasharray="7 8"/>' +
      floorShapes(floor) + route + pins +
      '</svg>';
  }

  function planRoute(from, to) {
    var nodes = mapNodes();
    var edges = D.MAP.edges.map(function (e) { return [e[0], e[1]]; });
    var adj = {};
    edges.forEach(function (e) {
      (adj[e[0]] = adj[e[0]] || []).push(e[1]);
      (adj[e[1]] = adj[e[1]] || []).push(e[0]);
    });
    // Dijkstra
    var dist = {}, prev = {}, Q = {};
    nodes.forEach(function (n) { dist[n.id] = Infinity; Q[n.id] = true; });
    dist[from] = 0;
    while (Object.keys(Q).length) {
      var u = null, best = Infinity;
      Object.keys(Q).forEach(function (k) { if (dist[k] < best) { best = dist[k]; u = k; } });
      if (u == null) break;
      delete Q[u];
      if (u === to) break;
      (adj[u] || []).forEach(function (v) {
        if (Q[v] && dist[u] + 1 < dist[v]) { dist[v] = dist[u] + 1; prev[v] = u; }
      });
    }
    var path = [];
    if (dist[to] !== Infinity) {
      var cur = to;
      while (cur != null && cur !== from) { path.unshift(cur); cur = prev[cur]; }
      if (cur === from) path.unshift(from);
    }
    return path;
  }

  /* ---------- More / profile · settings ---------- */
  view.more = function () {
    return '' +
      '<div class="section-head" style="margin-top:8px"><span class="kicker">' + T('moreTitle') + '</span></div>' +
      '<div class="card" style="padding:18px;margin-bottom:14px;display:flex;gap:14px;align-items:center">' +
      '<div style="width:52px;height:52px;border-radius:16px;background:linear-gradient(145deg,#f0c87e,var(--gold-deep));display:grid;place-items:center;font-family:var(--font-display);font-size:21px;color:#241708">C</div>' +
      '<div><b style="font-size:15px">' + T('about') + '</b><br><span class="muted" style="font-size:11.5px">' + D.VENUE.address + '</span></div></div>' +
      '<div class="card" style="padding:16px 18px">' +
      '<p class="muted" style="font-size:13px;line-height:1.7">' + T('aboutDesc') + '</p>' +
      '<div class="facts" style="margin-top:12px"><span class="fact">' + ESC('10 halls') + '</span><span class="fact">' + ESC('2,600 seats') + '</span><span class="fact">' + ESC('10,000 m²') + '</span></div>' +
      '</div>' +
      '<div class="section-head"><h2>' + T('settings') + '</h2></div>' +
      '<div class="card">' +
      '<div class="log-item"><span style="flex:1"><b>' + T('langLabel') + '</b><br><span class="muted" style="font-size:11px">' + T('langEn') + ' / ' + T('langDe') + '</span></span>' +
      '<button class="chip" id="lang-switch">' + (state.lang === 'en' ? '🇩🇪 Deutsch' : '🇬🇧 English') + '</button></div>' +
      '<div class="log-item"><span style="flex:1"><b>' + T('notifLabel') + '</b><br><span class="muted" style="font-size:11px">' + (state.notifOn ? T('on') : T('off')) + '</span></span>' +
      '<button class="chip" id="notif-switch">' + (state.notifOn ? T('on') : T('off')) + '</button></div>' +
      '<div class="log-item"><span style="flex:1"><b>' + T('resetDemo') + '</b><br><span class="muted" style="font-size:11px">' + T('deleteAll') + '</span></span>' +
      '<button class="chip" id="reset-data">' + IC.trash + '</button></div>' +
      '</div>' +
      '<div class="section-head"><h2>' + T('contact') + '</h2></div>' +
      '<div class="card" style="padding:18px">' +
      '<p class="muted" style="font-size:13px;line-height:1.6;margin-bottom:12px">' + T('contactDesc') + '</p>' +
      '<div style="display:flex;flex-direction:column;gap:10px">' +
      '<a class="chip" href="mailto:' + D.VENUE.contact + '">✉️ ' + D.VENUE.contact + '</a>' +
      '<a class="chip" href="tel:' + D.VENUE.phone + '">📞 ' + D.VENUE.phone + '</a>' +
      '<a class="chip" href="' + D.VENUE.mapsUrl + '" target="_blank" rel="noopener">📍 ' + T('openMap') + '</a>' +
      '</div>' +
      '<button class="btn primary block" style="margin-top:16px" id="more-offer">' + T('requestOffer') + '</button>' +
      '</div>' +
      '<p class="muted" style="font-size:10.5px;text-align:center;margin-top:20px">' + T('footer') + '</p>';
  };

  function ESC(s) { return esc(s); }

  /* ================= sheet helpers ================= */
  var sheetEl = null;
  function openSheet(html, cls) {
    closeSheet();
    var mask = document.createElement('div');
    mask.className = 'sheet-mask';
    mask.innerHTML = '<div class="sheet ' + (cls || '') + '">' + html + '</div>';
    document.body.appendChild(mask);
    sheetEl = $('.sheet', mask);
    mask.addEventListener('click', function (e) { if (e.target === mask) closeSheet(); });
    document.addEventListener('keydown', escKey);
  }
  function escKey(e) { if (e.key === 'Escape') closeSheet(); }
  function closeSheet() {
    stopCamera();
    if (sheetEl) { var m = sheetEl.parentElement; if (m) m.remove(); sheetEl = null; }
    document.removeEventListener('keydown', escKey);
  }

  /* ================= render ================= */
  function render() {
    var r = currentRoute();
    var name = r.name;
    closeSheet();
    if (!state.booted) { boot.classList.remove('hidden'); app.classList.add('hidden'); bootRender(); return; }
    boot.classList.add('hidden');
    app.classList.remove('hidden');

    var html = '';
    if (name === 'events') html = view.events();
    else if (name === 'event') { evDetailSheet(r.param); html = view.events(); }
    else if (name === 'spaces') html = view.spaces();
    else if (name === 'space') { spaceSheet(r.param); html = view.spaces(); }
    else if (name === 'map') html = view.map();
    else if (name === 'tickets') html = view.tickets();
    else if (name === 'ticket') { html = view.tickets(); }
    else if (name === 'checkin') html = view.checkin();
    else if (name === 'notifications') html = view.notifications();
    else if (name === 'more') html = view.more();
    else html = view.home();
    root.innerHTML = html;
    setActiveNav(name);
    bindCommon();
    bindView(name);
    if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } else if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    fillQrCanvases();
  }

  function bindCommon() {
    $$('[data-go]', root).forEach(function (el) {
      el.addEventListener('click', function () {
        var go = el.getAttribute('data-go');
        if (/^\d+$/.test(go)) { nav('#/event/' + go); return; }
        nav('#/' + go);
      });
    });
    bindCards();
  }

  function openTicketQr(t) {
    openSheet('<span class="grabber"></span><div style="text-align:center">' +
      '<h2 style="font-size:20px">' + esc(t.eventTitle) + '</h2>' +
      '<p class="muted" style="font-size:12px;margin:6px 0 14px">' + fmtDate(t.eventDate) + ' · ' + t.eventTime + ' · ' + esc(t.venue) + '</p>' +
      '<div style="max-width:280px;margin:0 auto;background:#fff;border-radius:18px;padding:16px"><canvas id="big-qr"></canvas></div>' +
      '<p class="mono muted" style="font-size:11px;margin-top:12px">' + esc(t.id) + ' · ' + esc(t.token) + '</p>' +
      '</div>', 'qr-modal');
    window.QRCode.toCanvas($('#big-qr'), ticketPayload(t), { margin: 2 });
  }

  function fillQrCanvases() {
    $$('.qr-wrap canvas', root).forEach(function (cv, i) {
      var card = cv.closest('.ticket');
      var id = card && card.getAttribute('data-ticket');
      var t = state.tickets.find(function (x) { return x.id === id; });
      if (t) window.QRCode.toCanvas(cv, ticketPayload(t), { margin: 2 });
    });
  }

  function ticketPayload(t) {
    return 'COLOSSEUM:TICKET:' + t.id + ':' + t.token + ':' + t.eventId;
  }

  function bindView(name) {
    var r = currentRoute();
    if (name === 'events') {
      var search = $('#ev-search');
      if (search) search.addEventListener('input', function () {
        state.search = search.value;
        var evs = D.EVENTS.filter(function (e) {
          var okCat = state.filter === 'all' || e.cat === state.filter;
          var q = state.search.trim().toLowerCase();
          return okCat && (!q || (e.title + ' ' + e.venue + ' ' + (e.tags || []).join(' ')).toLowerCase().includes(q));
        }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
        var container = $('.fade-list', root);
        if (container) container.outerHTML = '<div class="fade-list">' + eventsListHtml(evs) + '</div>';
        bindCards();
      });
      $$('[data-filter]', root).forEach(function (b) {
        b.addEventListener('click', function () {
          state.filter = b.getAttribute('data-filter');
          $$('[data-filter]', root).forEach(function (x) { x.classList.toggle('on', x === b); });
          var evs = D.EVENTS.filter(function (e) { return state.filter === 'all' || e.cat === state.filter; });
          var container = $('.fade-list', root);
          if (container) container.outerHTML = '<div class="fade-list">' + eventsListHtml(evs) + '</div>';
          bindCards();
        });
      });
      bindCards();
    }
    if (name === 'spaces') {
      $$('[data-space]', root).forEach(function (c) {
        c.addEventListener('click', function () { spaceSheet(c.getAttribute('data-space')); });
      });
    }
    if (name === 'map') {
      $$('[data-floor]', root).forEach(function (b) {
        b.addEventListener('click', function () {
          state.mapFloor = b.getAttribute('data-floor');
          state.mapRoute = null; state.mapActive = null;
          render();
        });
      });
      $$('.map-pin', root).forEach(function (p) {
        p.addEventListener('click', function (e) {
          e.stopPropagation();
          var id = p.getAttribute('data-node');
          state.mapActive = id;
          showMapInfo(id);
          $$('.map-pin', root).forEach(function (x) { x.classList.toggle('active', x === p); });
        });
      });
      var from = $('#route-from'), to = $('#route-to');
      if (from && to) {
        // select defaults
        from.value = state.mapFrom;
        to.value = state.mapTo;
        $('#route-go').addEventListener('click', function () {
          state.mapFrom = from.value; state.mapTo = to.value;
          state.mapRoute = planRoute(state.mapFrom, state.mapTo);
          if (!state.mapRoute.length) { toast('No route found', IC.warn); return; }
          var shell = $('#map-shell');
          if (shell) shell.innerHTML = mapSvg() + '<div id="map-info"></div>';
          showMapInfo(state.mapTo, state.mapRoute);
          bindMapPins();
        });
        $('#route-clear').addEventListener('click', function () {
          state.mapRoute = null; state.mapActive = null;
          var shell = $('#map-shell');
          if (shell) { shell.innerHTML = mapSvg() + '<div id="map-info"></div>'; bindMapPins(); }
        });
      }
      bindMapPins();
    }
    if (name === 'tickets') {
      bindCards();
      $$('[data-qr]', root).forEach(function (b) {
        b.addEventListener('click', function () {
          var t = state.tickets.find(function (x) { return x.id === b.getAttribute('data-qr'); });
          if (t) openTicketQr(t);
        });
      });
    }
    if (name === 'ticket' && r.param) {
      var t = state.tickets.find(function (x) { return x.id === r.param; });
      if (t) openTicketQr(t);
    }
    if (name === 'checkin') {
      $('#cam-scan').addEventListener('click', openCameraScan);
      $('#demo-scan').addEventListener('click', demoScan);
      var manual = $('#manual-code');
      manual.addEventListener('keydown', function (e) { if (e.key === 'Enter') { handleScan(manual.value); manual.value = ''; } });
      $('#clear-log').addEventListener('click', function () {
        state.scanlog = []; store.set(LS.scanlog, state.scanlog);
        var el = $('#scan-log'); if (el) el.innerHTML = scanLogHtml();
      });
    }
    if (name === 'notifications') {
      $('#notif-toggle').addEventListener('click', function () {
        state.notifOn = !state.notifOn;
        store.set(LS.notifOn, state.notifOn);
        if (state.notifOn && 'Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().then(function (p) { render(); });
        } else render();
      });
      $('#notif-enable').addEventListener('click', function () {
        if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().then(function (p) { state.notifOn = p === 'granted'; store.set(LS.notifOn, state.notifOn); render(); });
        } else {
          state.notifOn = true; store.set(LS.notifOn, true);
          pushNotif('notifTitle2', 'notifDesc2', { event: D.EVENTS[0].title, n: 7 }, 'announce');
          render();
        }
      });
    }
    if (name === 'more') {
      $('#lang-switch').addEventListener('click', function () {
        state.lang = state.lang === 'en' ? 'de' : 'en';
        store.set(LS.lang, state.lang);
        document.documentElement.lang = state.lang;
        var sub = $('.brand .name small');
        if (sub) sub.textContent = state.lang === 'de' ? 'BERLIN · EVENTLOCATION' : 'BERLIN · EVENTLOCATION';
        render();
      });
      $('#notif-switch').addEventListener('click', function () {
        state.notifOn = !state.notifOn; store.set(LS.notifOn, state.notifOn);
        render(); toast(T('notifications') + ': ' + (state.notifOn ? T('on') : T('off')), IC.bell);
      });
      $('#reset-data').addEventListener('click', function () {
        [LS.tickets, LS.notifs, LS.scanlog].forEach(function (k) { store.del(k); });
        state.tickets = []; state.notifs = []; state.scanlog = [];
        render(); toast(T('resetDemo'), IC.check);
      });
      $('#more-offer').addEventListener('click', offerSheet);
    }
  }

  function bindCards() {
    if (!$) return;
    $$('[data-event]', root).forEach(function (c) {
      if (c.__bound) return; c.__bound = true;
      c.addEventListener('click', function () {
        evDetailSheet(c.getAttribute('data-event'));
      });
    });
  }

  function bindMapPins() {
    $$('.map-pin', root).forEach(function (p) {
      p.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = p.getAttribute('data-node');
        state.mapActive = id;
        $$('.map-pin', root).forEach(function (x) { x.classList.toggle('active', x === p); });
        showMapInfo(id);
      });
    });
  }

  function showMapInfo(id, path) {
    var nodes = mapNodes();
    var n = nodes.find(function (x) { return x.id === id; });
    var info = $('#map-info');
    if (!info) return;
    var details = {
      garderobe: 'Drop coats quickly; QR gates behind the counters.',
      wc: 'Restrooms on the ground floor & gallery level.',
      elevator: 'Accessible lift to the Galerie (800 m² + terraces).',
      bar: 'Moët Bar · concessions open 60 min before events.',
      parking: 'Parkhaus P2, 3 min walk. Bikes at the north entrance.',
      north: 'Main entrance · marquee, Schönhauser Allee.',
      southeast: 'Side / service entrance behind the cinema block.',
      wagen: '1,600 m² · 18 m · galas, launches, corporate.',
      atrium: '10,000 m² · event hub with balconies.',
      saal1: '525 seats · stage · own entrance.',
      cinemas: 'Halls 2–10 · 2,075 seats.',
      galerie: '800 m² · 2 terraces · 2nd floor.',
      foyer: 'Foyer & ticket counters.'
    };
    var desc = details[id] || 'Tap pins to explore the venue.';
    info.innerHTML = '<h4>' + esc(n.label) + '</h4><p>' + desc + '</p>' +
      '<div style="display:flex;gap:8px">' +
      '<a class="btn ghost small" target="_blank" rel="noopener" href="' + D.VENUE.mapsUrl + '">' + IC.pin + ' ' + T('openMap') + '</a>' +
      '</div>';
    if (path && path.length) {
      info.querySelector('p').textContent = details[id] || desc;
    }
  }

  /* ---------- onboarding ---------- */
  function bootRender() {
    $('#boot').innerHTML =
      '<div class="boot">' +
      '<div class="art"><img src="' + esc(D.IMG.atrium) + '" alt="Colosseum Atrium"></div>' +
      '<div class="content">' +
      '<span class="kicker">' + T('homeKicker') + '</span>' +
      '<h1 style="margin-top:10px">COLOSSEUM<br>BERLIN</h1>' +
      '<p>' + T('homeDesc') + '</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">' +
      '<span class="chip">🎟 ' + T('buyTickets') + '</span><span class="chip">📲 ' + T('checkIn') + '</span><span class="chip">🗺 ' + T('mapLink') + '</span>' +
      '</div>' +
      '<button class="btn primary block" id="boot-go">' + T('continue') + ' ' + IC.arrow + '</button>' +
      '</div></div>';
    $('#boot-go').addEventListener('click', function () {
      state.booted = true;
      store.set(LS.booted, true);
      render();
    });
  }

  /* ---------- badges ---------- */
  function updateBadges() {
    var n = state.notifs.filter(function (x) { return !x.read; }).length;
    var els = $$('[data-bell]');
    els.forEach(function (e) {
      var b = $('.badge-dot', e);
      if (b) b.style.display = n ? 'block' : 'none';
    });
  }

  /* ---------- service worker ---------- */
  function registerSW() {
    try {
      var sw = navigator.serviceWorker;
      if (sw && location.protocol.startsWith('https')) {
        sw.register('sw.js').catch(function () {});
      }
    } catch (e) {}
  }

  /* ---------- test hooks (only when explicitly enabled) ---------- */
  if (typeof window !== 'undefined' && window.__COLO_TEST__) {
    window.COLO_APP_TEST = {
      state: state,
      handleScan: handleScan,
      demoScan: demoScan,
      planRoute: planRoute,
      pushNotif: pushNotif,
      setCheckout: function (ev, type, qty) {
        var extra = { premium: 8, vip: 22 }[type] || 0;
        state.checkout = { event: ev, type: type, qty: qty, price: ev.price + extra, label: type };
      },
      createOrder: createOrder
    };
  }

  /* ---------- init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('hashchange', onHash);
    $$('.topbar [data-go]').forEach(function (b) {
      b.addEventListener('click', function () {
        var go = b.getAttribute('data-go');
        if (go) nav('#/' + go);
      });
    });
    render();
    registerSW();
    // seed a demo announcement notification on first run
    if (!store.get(LS.notifs, []).length) {
      setTimeout(function () {
        pushNotif('notifTitle2', 'notifDesc2', { event: D.EVENTS[0].title, n: D.EVENTS[0].seats - D.EVENTS[0].sold }, 'announce');
      }, 1800);
    }
  });
})();
