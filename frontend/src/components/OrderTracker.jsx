const STEPS = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderTracker({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="order-tracker-cancelled">
        <span className="order-tracker-cancelled-icon">✕</span>
        <span>This order was cancelled.</span>
      </div>
    );
  }

  const idx = Math.max(STEPS.findIndex((s) => s.key === status), 0);

  return (
    <div className="order-tracker">
      {STEPS.map((s, i) => (
        <div
          key={s.key}
          className={`order-tracker-step ${i < idx ? 'done' : ''} ${i === idx ? 'active' : ''}`}
        >
          {i < STEPS.length - 1 && <span className="order-tracker-line" />}
          <span className="order-tracker-dot">{i < idx ? '✓' : i + 1}</span>
          <span className="order-tracker-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
