import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import ChakkiWheel from '../components/ChakkiWheel';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function Notifications() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    api
      .getNotifications(token)
      .then((d) => {
        setNotifications(d.notifications);
        if (d.unread > 0) api.markAllNotificationsRead(token).catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="container" style={{ maxWidth: 720, padding: '48px 24px 80px' }}>
      <span className="eyebrow">Updates</span>
      <h1 style={{ fontSize: '2rem' }}>Notifications</h1>

      {loading ? (
        <div className="empty-state">
          <ChakkiWheel size={60} />
          <p className="muted">Loading…</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <ChakkiWheel size={60} spin={false} />
          <h3>No notifications yet</h3>
          <p className="muted">Order updates, price drops and offers will appear here.</p>
        </div>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => (
            <li key={n.id} className={n.read ? '' : 'unread'}>
              <div className="notification-title">{n.title}</div>
              <p>{n.message}</p>
              <span className="notification-time">{timeAgo(n.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
