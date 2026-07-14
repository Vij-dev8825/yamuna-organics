import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';
import ChakkiWheel from '../components/ChakkiWheel';

export default function Profile() {
  const { user, token, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('details');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (tab === 'orders') {
      api.getOrders(token).then((d) => setOrders(d.orders));
    }
  }, [tab, token]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await api.updateProfile(token, { name, email });
      updateUser(data.user);
      showToast('Profile updated.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  if (!user) {
    return (
      <div className="center" style={{ padding: '120px 0' }}>
        <ChakkiWheel size={56} />
      </div>
    );
  }

  return (
    <div className="container section">
      <div className="breadcrumb">Home / My Account</div>
      <div className="section-head">
        <div>
          <span className="eyebrow">My Account</span>
          <h2>Hi{user.name ? `, ${user.name}` : ''} 👋</h2>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>Log out</button>
      </div>

      <div className="flex gap-1" style={{ marginBottom: 26 }}>
        <button className={`btn btn-sm ${tab === 'details' ? 'btn-forest' : 'btn-ghost'}`} onClick={() => setTab('details')}>
          Account details
        </button>
        <button className={`btn btn-sm ${tab === 'orders' ? 'btn-forest' : 'btn-ghost'}`} onClick={() => setTab('orders')}>
          My orders
        </button>
      </div>

      {tab === 'details' ? (
        <form className="form-card" style={{ margin: 0 }} onSubmit={handleSave}>
          <div className="field">
            <label>Mobile number</label>
            <input value={user.phone} disabled />
          </div>
          <div className="field">
            <label>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="field">
            <label>Email (optional)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <button className="btn btn-gold btn-block" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      ) : orders.length ? (
        <div>
          {orders.map((o) => (
            <div key={o.id} className="product-card" style={{ padding: 20, marginBottom: 16 }}>
              <div className="flex-between">
                <div>
                  <h3 style={{ marginBottom: 4 }}>Order #{o.orderNumber}</h3>
                  <span className="muted" style={{ fontSize: '0.85rem' }}>
                    {new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item(s)
                  </span>
                </div>
                <span className="product-badge" style={{ position: 'static' }}>{o.status}</span>
              </div>
              <div style={{ marginTop: 12 }}>
                {o.items.map((it, i) => (
                  <div key={i} className="flex-between" style={{ fontSize: '0.9rem', padding: '4px 0' }}>
                    <span>{it.name} ({it.size}) × {it.quantity}</span>
                    <span>₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="summary-row total" style={{ marginTop: 8 }}>
                <span>Total</span><span>₹{o.total}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <ChakkiWheel size={60} spin={false} />
          <h3>No orders yet</h3>
          <p className="muted">Your placed orders will show up here.</p>
        </div>
      )}
    </div>
  );
}
