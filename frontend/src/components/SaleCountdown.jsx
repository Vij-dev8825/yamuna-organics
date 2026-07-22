import { useEffect, useState } from 'react';
import { api } from '../api';

function timeLeft(endDate) {
  const diff = Math.max(0, new Date(endDate).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    mins: Math.floor((diff / 60000) % 60),
    secs: Math.floor((diff / 1000) % 60),
    over: diff <= 0,
  };
}

/** Admin-configurable sale countdown banner — hidden entirely unless an
 * admin has switched it on with a title and end date (see AdminSaleBanner),
 * so there's never a fake/stale "sale" shown by default. */
export default function SaleCountdown() {
  const [sale, setSale] = useState(null);
  const [left, setLeft] = useState(null);

  useEffect(() => {
    api.getSaleBanner().then((d) => {
      if (d.active) setSale(d);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!sale) return undefined;
    setLeft(timeLeft(sale.endDate));
    const interval = setInterval(() => setLeft(timeLeft(sale.endDate)), 1000);
    return () => clearInterval(interval);
  }, [sale]);

  if (!sale || !left || left.over) return null;

  return (
    <div className="sale-countdown">
      <div className="sale-countdown-text">
        <b>{sale.title}</b>
        {sale.subtitle && <span> — {sale.subtitle}</span>}
      </div>
      <div className="sale-countdown-timer">
        {[
          ['days', left.days],
          ['hours', left.hours],
          ['mins', left.mins],
          ['secs', left.secs],
        ].map(([label, value]) => (
          <div className="sale-countdown-unit" key={label}>
            <span className="sale-countdown-value">{String(value).padStart(2, '0')}</span>
            <span className="sale-countdown-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
