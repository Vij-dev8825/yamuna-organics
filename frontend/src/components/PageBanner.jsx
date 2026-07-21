import { useEffect, useState } from 'react';
import { api } from '../api';
import { getProductImage } from '../utils/productImages';

/** Full-bleed hero banner for a static page (shop/categories/combos/contact/
 * bulk-enquiry) — admin-uploaded background image with optional title/subtitle
 * overrides, falling back to the caller's default copy. Same pattern as the
 * blog page banner. */
export default function PageBanner({ page, title, subtitle }) {
  const [banner, setBanner] = useState({ bannerImage: '', bannerTitle: '', bannerSubtitle: '' });

  useEffect(() => {
    api.getPageBanner(page).then((d) => setBanner(d.settings)).catch(() => {});
  }, [page]);

  return (
    <div
      className={`page-banner ${banner.bannerImage ? 'has-image' : ''}`}
      style={banner.bannerImage ? { backgroundImage: `url(${getProductImage(banner.bannerImage)})` } : undefined}
    >
      <h1>{banner.bannerTitle || title}</h1>
      <p>{banner.bannerSubtitle || subtitle}</p>
    </div>
  );
}
