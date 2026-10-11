// Sticky helpers inside a scrolling box. .os-fixed-top/.os-fixed-bottom pin to the viewport instead.
// md:os-sticky-top only sticks from md up.
export default function Example() {
  return (
    <div className="os-overflow-auto os-rounded-lg os-border" style={{ height: '14rem' }} tabIndex={0} role="region" aria-label="Sticky demo">
      <div className="os-sticky-top os-p-3 os-text-bg-primary">.os-sticky-top</div>
      {Array.from({ length: 10 }, (_, i) => (
        <p key={i} className="os-px-3">
          Scroll inside this box. Row {i + 1}.
        </p>
      ))}
      <div className="os-sticky-bottom os-p-3 os-bg-surface-3">.os-sticky-bottom</div>
    </div>
  );
}
