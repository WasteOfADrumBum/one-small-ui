// .os-cssgrid is a 12-track CSS grid; children span with .os-g-col-* and start with .os-g-start-*.
// Change the track count or gap inline with --os-columns / --os-gap.
import type { CSSProperties } from 'react';

export default function Example() {
  const c = 'os-p-3 os-rounded-md os-bg-surface-2 os-border';
  return (
    <div className="os-grid os-gap-6">
      <div className="os-cssgrid">
        <div className="os-g-col-12 md:os-g-col-4">
          <div className={c}>.os-g-col-12 md:os-g-col-4</div>
        </div>
        <div className="os-g-col-6 md:os-g-col-4">
          <div className={c}>.os-g-col-6 md:os-g-col-4</div>
        </div>
        <div className="os-g-col-6 md:os-g-col-4">
          <div className={c}>.os-g-col-6 md:os-g-col-4</div>
        </div>
        <div className="os-g-col-4 os-g-start-5">
          <div className={c}>.os-g-col-4 .os-g-start-5</div>
        </div>
      </div>
      <div className="os-cssgrid" style={{ '--os-columns': 3, '--os-gap': '0.5rem' } as CSSProperties}>
        {['1', '2', '3', '4', '5'].map((n) => (
          <div key={n} className={c}>
            --os-columns: 3 · {n}
          </div>
        ))}
      </div>
    </div>
  );
}
