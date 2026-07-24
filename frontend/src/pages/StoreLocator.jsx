import PageBanner from '../components/PageBanner';
import { STORE_LOCATIONS, mapEmbedSrc, directionsUrl } from '../data/storeLocations';

export default function StoreLocator() {
  return (
    <div className="section" style={{ paddingTop: 0 }}>
      <PageBanner
        page="store-locator"
        title="Visit Us"
        subtitle="Come see where your oils are pressed, straight from the source."
      />
      <div className="container">
        <div className="breadcrumb">Home / Visit Us</div>

        <div className="store-locations">
          {STORE_LOCATIONS.map((loc) => (
            <div className="store-card" key={loc.id}>
              <div className="store-card-map">
                <iframe
                  title={loc.name}
                  src={mapEmbedSrc(loc.address)}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="store-card-body">
                <h3>{loc.name}</h3>
                <p className="muted">{loc.address}</p>
                {loc.hours && <p className="muted">🕒 {loc.hours}</p>}
                <a href={`tel:${loc.phone}`} className="footer-service-row" style={{ padding: 0 }}>
                  <span aria-hidden="true">📞</span> {loc.phoneDisplay || loc.phone}
                </a>
                <a
                  href={directionsUrl(loc.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-forest btn-sm"
                  style={{ marginTop: 16 }}
                >
                  Get Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
