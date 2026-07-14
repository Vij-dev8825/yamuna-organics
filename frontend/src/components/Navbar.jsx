import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useLang, LANGS } from '../i18n';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const { totalCount } = useCart();
  const { productIds } = useWishlist();
  const { isLoggedIn, user, token } = useAuth();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  const links = [
    { to: '/', label: t('navHome') },
    { to: '/shop', label: t('navShop') },
    { to: '/categories', label: t('navCategories') },
    { to: '/bulk-enquiry', label: t('navBulk') },
    { to: '/contact', label: t('navContact') },
  ];

  // Poll unread notification count
  useEffect(() => {
    if (!token) {
      setUnread(0);
      return undefined;
    }
    let cancelled = false;
    const load = () =>
      api
        .getNotifications(token)
        .then((d) => !cancelled && setUnread(d.unread))
        .catch(() => {});
    load();
    const id = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token]);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" aria-label="Yamuna Organic home">
          <img src={logo} alt="Yamuna Organic" height={52} />
        </NavLink>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setOpen(false)} className="admin-link">
              {t('navAdmin')}
            </NavLink>
          )}
        </nav>

        <div className="nav-icons">
          <select
            className="lang-select"
            aria-label="Language"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          {isLoggedIn && (
            <button className="icon-btn" aria-label="Notifications" onClick={() => navigate('/notifications')}>
              🔔
              {unread > 0 && <span className="badge-count">{unread}</span>}
            </button>
          )}
          <button className="icon-btn" aria-label="Wishlist" onClick={() => navigate('/wishlist')}>
            ♡
            {productIds.length > 0 && <span className="badge-count">{productIds.length}</span>}
          </button>
          <button className="icon-btn" aria-label="Cart" onClick={() => navigate('/cart')}>
            🛍
            {totalCount > 0 && <span className="badge-count">{totalCount}</span>}
          </button>
          <button className="icon-btn" aria-label="Account" onClick={() => navigate(isLoggedIn ? '/profile' : '/login')}>
            {isLoggedIn ? (user?.name ? user.name[0].toUpperCase() : '👤') : '👤'}
          </button>
          <button className="mobile-toggle" aria-label="Toggle menu" onClick={() => setOpen((o) => !o)}>
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
