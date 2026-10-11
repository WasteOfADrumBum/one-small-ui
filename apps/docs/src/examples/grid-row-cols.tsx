// .os-row-cols-* sets how many columns every child takes, per breakpoint. Nest a .os-row in any column.
export default function Example() {
  const c = 'os-p-3 os-rounded-md os-bg-surface-2 os-border';
  return (
    <div className="os-grid os-gap-6">
      <div className="os-row os-row-cols-1 sm:os-row-cols-2 lg:os-row-cols-4 os-g-3">
        {['One', 'Two', 'Three', 'Four'].map((n) => (
          <div key={n}>
            <div className={c}>{n}</div>
          </div>
        ))}
      </div>
      <div className="os-row os-g-3">
        <div className="os-col-12 md:os-col-8">
          <div className={c}>
            Level 1: .os-col-12 md:os-col-8
            <div className="os-row os-g-2 os-mt-2">
              <div className="os-col-6">
                <div className="os-p-2 os-rounded-sm os-bg-surface os-border">Level 2: .os-col-6</div>
              </div>
              <div className="os-col-6">
                <div className="os-p-2 os-rounded-sm os-bg-surface os-border">Level 2: .os-col-6</div>
              </div>
            </div>
          </div>
        </div>
        <div className="os-col-12 md:os-col-4">
          <div className={c}>.os-col-12 md:os-col-4</div>
        </div>
      </div>
    </div>
  );
}
