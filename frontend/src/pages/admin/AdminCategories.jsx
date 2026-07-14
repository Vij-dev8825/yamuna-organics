import { useEffect, useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { getProductImage, knownProductImages } from '../../utils/productImages';

export default function AdminCategories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [label, setLabel] = useState('');
  const [image, setImage] = useState(knownProductImages[0]);
  const [message, setMessage] = useState(null);

  function load() {
    api.admin.getCategories(token).then((d) => setCategories(d.categories)).catch(() => {});
  }
  useEffect(load, [token]);

  async function add(e) {
    e.preventDefault();
    setMessage(null);
    try {
      await api.admin.createCategory(token, { label, image });
      setLabel('');
      setMessage({ type: 'success', text: 'Category added.' });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  async function rename(c) {
    const next = window.prompt('Category label:', c.label);
    if (!next || next === c.label) return;
    try {
      await api.admin.updateCategory(token, c.id, { label: next });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  async function del(c) {
    if (!window.confirm(`Delete category "${c.label}"?`)) return;
    try {
      await api.admin.deleteCategory(token, c.id);
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  return (
    <>
      <div className="admin-head">
        <h1>Categories</h1>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <form className="admin-card form-inline" onSubmit={add}>
        <div className="field" style={{ flex: 1 }}>
          <label>New category label</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Mustard Oil" required />
        </div>
        <div className="field">
          <label>Tile image</label>
          <select value={image} onChange={(e) => setImage(e.target.value)}>
            {knownProductImages.map((img) => (
              <option key={img} value={img}>{img}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-gold btn-sm">+ Add category</button>
      </form>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr><th /><th>Label</th><th>Slug</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td><img className="thumb" src={getProductImage(c.image)} alt="" /></td>
                <td><b>{c.label}</b></td>
                <td><code>{c.id}</code></td>
                <td>
                  <button className="link-btn" onClick={() => rename(c)}>rename</button>{' '}
                  <button className="link-btn danger" onClick={() => del(c)}>delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
