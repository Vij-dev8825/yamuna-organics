import { useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { getProductImage } from '../../utils/productImages';

/** File-upload field for a product/category image — uploads immediately on
 * selection and reports the resulting URL back via onChange. */
export default function ImageUploadField({ value, onChange, label = 'Image' }) {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.admin.uploadImage(token, fd);
      onChange(res.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div className="image-upload-field">
        {value && <img src={getProductImage(value)} alt="" className="image-upload-preview" />}
        <label className={`btn btn-outline btn-sm image-upload-btn ${uploading ? 'disabled' : ''}`}>
          {uploading ? 'Uploading…' : value ? 'Change image' : 'Upload image'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            disabled={uploading}
            hidden
          />
        </label>
      </div>
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}
