// Transitions use the motion tokens, so they collapse for prefers-reduced-motion,
// data-os-motion="off", or anything inside .os-motion-off.
export default function Example() {
  const card = 'os-p-4 os-rounded-lg os-bg-surface os-border os-hover-lift';
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-3">
      <div className={`${card} os-duration-slow`} tabIndex={0}>
        Hover or focus: .os-hover-lift .os-duration-slow
      </div>
      <div className="os-motion-off">
        <div className={card} tabIndex={0}>
          Inside .os-motion-off: moves instantly
        </div>
      </div>
      <div>
        <p className="motion-reduce:os-hidden os-p-4 os-rounded-lg os-bg-accent-soft os-mb-0">
          Shown when motion is allowed (.motion-reduce:os-hidden)
        </p>
        <p className="motion-safe:os-hidden os-p-4 os-rounded-lg os-bg-info-soft os-mb-0">
          Shown when reduced motion is requested (.motion-safe:os-hidden)
        </p>
      </div>
    </div>
  );
}
