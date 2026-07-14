import { Link } from 'react-router-dom';
import ChakkiWheel from './ChakkiWheel';
import { useLang } from '../i18n';

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="flex gap-1" style={{ alignItems: 'center', marginBottom: 14 }}>
              <ChakkiWheel size={34} spin={false} />
              <h3 style={{ color: '#fffdf8', margin: 0 }}>Yamuna Organic</h3>
            </div>
            <p style={{ maxWidth: 280, fontSize: '0.9rem' }}>{t('footerTagline')}</p>
            <div className="social-row">
              <a href="#" aria-label="Instagram">IG</a>
              <a href="#" aria-label="Facebook">FB</a>
              <a href="#" aria-label="WhatsApp">WA</a>
            </div>
          </div>

          <div>
            <h4>{t('footerShop')}</h4>
            <ul>
              <li><Link to="/shop">{t('footerAll')}</Link></li>
              <li><Link to="/categories">{t('footerCategories')}</Link></li>
              <li><Link to="/bulk-enquiry">{t('footerBulk')}</Link></li>
              <li><Link to="/wishlist">{t('footerWishlist')}</Link></li>
            </ul>
          </div>

          <div>
            <h4>{t('footerSupport')}</h4>
            <ul>
              <li><Link to="/contact">{t('footerContact')}</Link></li>
              <li><Link to="/profile">{t('footerAccount')}</Link></li>
              <li><Link to="/refund-policy">{t('footerRefunds')}</Link></li>
              <li><Link to="/policy">{t('footerPrivacy')}</Link></li>
            </ul>
          </div>

          <div>
            <h4>{t('footerReach')}</h4>
            <ul>
              <li>Yamuna Organic Mill,<br />Village Road, Mathura, UP</li>
              <li><a href="tel:+919000000000">+91 90000 00000</a></li>
              <li><a href="mailto:hello@yamunaorganics.com">hello@yamunaorganics.com</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Yamuna Organic. {t('footerRights')}</span>
          <span>{t('footerMotto')}</span>
        </div>
      </div>
    </footer>
  );
}
