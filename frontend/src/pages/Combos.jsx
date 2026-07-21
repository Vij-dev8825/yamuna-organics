import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import ChakkiWheel from '../components/ChakkiWheel';
import PageBanner from '../components/PageBanner';
import { api } from '../api';

export default function Combos() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getProducts({ combo: true })
      .then((d) => setProducts(d.products))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section" style={{ paddingTop: 0 }}>
      <PageBanner
        page="combos"
        title="Combo Offers"
        subtitle="Hand-picked bundles of our oils, soaps and powders at a better price together."
      />
      <div className="container">
        <div className="breadcrumb">Home / Combo Offers</div>

        {loading ? (
          <div className="center" style={{ padding: '80px 0' }}>
            <ChakkiWheel size={50} />
          </div>
        ) : products.length ? (
          <div className="grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ChakkiWheel size={56} spin={false} />
            <h3>No combos right now</h3>
            <p className="muted">Check back soon — we're putting together some great bundles.</p>
          </div>
        )}
      </div>
    </div>
  );
}
