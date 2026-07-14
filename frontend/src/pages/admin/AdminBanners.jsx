import { useEffect, useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function AdminBanners() {
  const { token } = useAuth();
  const [banners, setBanners] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [message, setMessage] = useState(null);
  const [uploading, setUploading] = useState(false);

  function load() {
    api.admin.getBanners(token).then((d) => setBanners(d.banners)).catch(() => {});
  }
  useEffect(load, [token]);

  async function uploadBanner(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', title);
      fd.append('subtitle', subtitle);
      await api.admin.uploadBanner(token, fd);
      setFile(null);
      setTitle('');
      setSubtitle('');
      e.target.reset?.();
      setMessage({ type: 'success', text: 'Banner uploaded. It is now live on the home page.' });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  }

  async function toggle(b) {
    await api.admin.updateBanner(token, b.id, { active: !b.active }).catch(() => {});
    load();
  }

  async function move(b, dir) {
    const sorted = [...banners].sort((a, x) => (a.sort || 0) - (x.sort || 0));
    const i = sorted.findIndex((x) => x.id === b.id);
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    await Promise.all([
      api.admin.updateBanner(token, sorted[i].id, { sort: j }),
      api.admin.updateBanner(token, sorted[j].id, { sort: i }),
    ]).catch(() => {});
    load();
  }

  async function del(b) {
    if (!window.confirm(`Delete banner "${b.title || b.url}"? The file will be removed too.`)) return;
    await api.admin.deleteBanner(token, b.id).catch(() => {});
    load();
  }

  return (
    <>
      <div className="admin-head">
        <h1>Home Banners</h1>
      </div>
      <p className="muted">
        Videos (mp4/webm) and images shown in the home-page hero, in order. Keep videos short
        (10–30s) and under 100 MB — they autoplay muted.
      </p>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <form className="admin-card" onSubmit={uploadBanner}>
        <h3>Upload new banner</h3>
        <div className="form-grid">
          <div className="field">
            <label>Video or image file</label>
            <input
              type="file"
              accept="video/mp4,video/webm,video/ogg,image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files[0] || null)}
              required
            />
          </div>
          <div className="field">
            <label>Headline (shown over the video)</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. From our fields to your bottle" />
          </div>
          <div className="field">
            <label>Sub-text</label>
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="optional supporting line" />
          </div>
        </div>
        <button className="btn btn-gold btn-sm" disabled={!file || uploading}>
          {uploading ? 'Uploading…' : 'Upload banner'}
        </button>
      </form>

      <div className="banner-grid">
        {[...banners].sort((a, b) => (a.sort || 0) - (b.sort || 0)).map((b) => (
          <div className={`banner-card ${b.active ? '' : 'inactive'}`} key={b.id}>
            {b.type === 'video' ? (
              <video src={b.url} muted loop playsInline onMouseOver={(e) => e.target.play()} onMouseOut={(e) => e.target.pause()} />
            ) : (
              <img src={b.url} alt="" />
            )}
            <div className="banner-meta">
              <b>{b.title || <span className="muted">untitled</span>}</b>
              <span className="muted">{b.subtitle}</span>
              <div className="banner-actions">
                <button className="link-btn" onClick={() => move(b, -1)}>↑</button>
                <button className="link-btn" onClick={() => move(b, 1)}>↓</button>
                <button className="link-btn" onClick={() => toggle(b)}>{b.active ? 'hide' : 'show'}</button>
                <button className="link-btn danger" onClick={() => del(b)}>delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
