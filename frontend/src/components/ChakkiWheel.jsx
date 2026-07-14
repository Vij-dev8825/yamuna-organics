export default function ChakkiWheel({ size = 46, spin = true, className = '' }) {
  return (
    <div className="chakki-wheel" style={{ width: size, height: size }}>
      <svg viewBox="0 0 80 80" className={spin ? 'wheel-spin' : ''}>
        <defs>
          <linearGradient id="wheelGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8b84b" />
            <stop offset="50%" stopColor="#fff6dd" />
            <stop offset="100%" stopColor="#b5811f" />
          </linearGradient>
        </defs>
        <g transform="translate(40,40)">
          <circle r="34" fill="none" stroke="url(#wheelGold)" strokeWidth="3.4" />
          <circle r="25" fill="none" stroke="url(#wheelGold)" strokeWidth="1.6" opacity="0.6" />
          <g stroke="url(#wheelGold)" strokeWidth="2.6" strokeLinecap="round">
            <line x1="0" y1="-25" x2="0" y2="25" />
            <line x1="-21.6" y1="-12.5" x2="21.6" y2="12.5" />
            <line x1="-21.6" y1="12.5" x2="21.6" y2="-12.5" />
          </g>
          <circle r="8" fill="url(#wheelGold)" />
        </g>
      </svg>
    </div>
  );
}
