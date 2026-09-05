import { useEffect } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Venues from './pages/Venues';
import VenueDetail from './pages/VenueDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import CheckIn from './pages/CheckIn';
import NavigatePage from './pages/Navigate';
import Profile from './pages/Profile';
import Portfolio from './pages/Portfolio';
import { useStore } from './store';
import { IconCart, IconCheck, IconHome, IconMap, IconPin, IconStar, IconUser } from './components/Icons';

export default function App() {
  const loc = useLocation();
  const nav = useNavigate();
  const cartCount = useStore((s) => s.cart.reduce((a, l) => a + l.qty, 0));
  const dark = useStore((s) => s.prefs.darkMode);

  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }, [dark]);

  return (
    <div className="shell">
      <header className="topbar">
        <a className="brand" href="/" onClick={(e) => { e.preventDefault(); nav('/'); }}>
          <span className="mark">C</span>
          <span>COLOSSEUM<small>BERLIN · EVENTS</small></span>
        </a>
        <button className="icon-btn" onClick={() => nav('/cart')} aria-label={`Cart, ${cartCount} items`}>
          <IconCart size={20} />
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/venues" element={<Venues />} />
          <Route path="/venues/:id" element={<VenueDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation/:orderId" element={<Confirmation />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/navigate" element={<NavigatePage />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <nav className="bottomnav" aria-label="Main navigation">
        <NavLink to="/" end><IconHome /> Events</NavLink>
        <NavLink to="/venues"><IconPin /> Venues</NavLink>
        <NavLink to="/checkin"><IconCheck /> Check-In</NavLink>
        <NavLink to="/portfolio"><IconStar /> Portfolio</NavLink>
        <NavLink to="/navigate"><IconMap /> Navigate</NavLink>
        <NavLink to="/profile"><IconUser /> Profile</NavLink>
      </nav>
    </div>
  );
}
