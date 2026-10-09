// Gutters: os-g-* sets both directions, os-gx-* horizontal, os-gy-* vertical. md:os-g-* is responsive.
export default function Example() {
  const c = 'os-p-3 os-rounded-md os-bg-surface-2 os-border';
  const items = ['A', 'B', 'C', 'D'];
  return (
    <div className="os-grid os-gap-6">
      <div className="os-row os-g-0">
        {items.map((n) => (
          <div key={n} className="os-col-6">
            <div className={c}>.os-g-0 {n}</div>
          </div>
        ))}
      </div>
      <div className="os-row os-gx-8 os-gy-2">
        {items.map((n) => (
          <div key={n} className="os-col-6">
            <div className={c}>.os-gx-8 .os-gy-2 {n}</div>
          </div>
        ))}
      </div>
      <div className="os-row os-g-2 md:os-g-6">
        {items.map((n) => (
          <div key={n} className="os-col-6">
            <div className={c}>.os-g-2 md:os-g-6 {n}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
