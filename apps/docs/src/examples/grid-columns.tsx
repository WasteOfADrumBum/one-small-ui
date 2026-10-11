// .os-row + .os-col: equal widths, fixed spans out of 12, and auto-width columns.
export default function Example() {
  const c = 'os-p-3 os-rounded-md os-bg-surface-2 os-border';
  return (
    <div className="os-grid os-gap-4">
      <div className="os-row">
        <div className="os-col">
          <div className={c}>.os-col</div>
        </div>
        <div className="os-col">
          <div className={c}>.os-col</div>
        </div>
        <div className="os-col">
          <div className={c}>.os-col</div>
        </div>
      </div>
      <div className="os-row os-gy-3">
        <div className="os-col-12 md:os-col-8">
          <div className={c}>.os-col-12 md:os-col-8</div>
        </div>
        <div className="os-col-6 md:os-col-4">
          <div className={c}>.os-col-6 md:os-col-4</div>
        </div>
        <div className="os-col-6 md:os-col-4">
          <div className={c}>.os-col-6 md:os-col-4</div>
        </div>
      </div>
      <div className="os-row">
        <div className="os-col-auto">
          <div className={c}>.os-col-auto (fits content)</div>
        </div>
        <div className="os-col">
          <div className={c}>.os-col fills the rest</div>
        </div>
      </div>
    </div>
  );
}
