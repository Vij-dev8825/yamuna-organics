import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { getProductImage } from '../utils/productImages';
import PageBanner from '../components/PageBanner';
import { useLang } from '../i18n';

export default function Categories() {
  const { t } = useLang();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.getCategories().then((d) => setCategories(d.categories));
  }, []);

  return (
    <div className="section" style={{ paddingTop: 0 }}>
      <PageBanner page="categories" title={t('catEyebrow')} subtitle={t('catPageSub')} />
      <div className="container">
        <div className="breadcrumb">{t('navHome')} / {t('navCategories')}</div>

        <div className="category-trio">
          {categories.map((cat) => (
            <Link key={cat.slug} to={`/shop?category=${cat.slug}`} className="category-tile">
              <img src={getProductImage(cat.image)} alt={cat.label} />
              <div className="overlay" />
              <div className="label">
                <span>{t('catTag')}</span>
                <h3>{cat.label}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
