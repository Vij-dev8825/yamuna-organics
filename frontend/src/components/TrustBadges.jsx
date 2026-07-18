const BADGES = [
  { icon: '⭐', label: 'Highly Rated' },
  { icon: '📦', label: 'Easy Order Tracking' },
  { icon: '💬', label: 'Fast Support' },
  { icon: '🚚', label: 'Free & Fast Delivery' },
];

export default function TrustBadges() {
  return (
    <div className="pdp-trust-badges">
      {BADGES.map((b) => (
        <div className="pdp-trust-badge" key={b.label}>
          <span className="pdp-trust-badge-icon" aria-hidden="true">
            {b.icon}
          </span>
          <span>{b.label}</span>
        </div>
      ))}
    </div>
  );
}
