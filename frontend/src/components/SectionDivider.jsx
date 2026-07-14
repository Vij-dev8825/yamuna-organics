import ChakkiWheel from './ChakkiWheel';

export default function SectionDivider() {
  return (
    <div className="section-divider" aria-hidden="true">
      <span className="line" />
      <ChakkiWheel size={34} />
      <span className="line" />
    </div>
  );
}
