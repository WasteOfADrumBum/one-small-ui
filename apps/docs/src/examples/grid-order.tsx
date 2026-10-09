// Offsets push a column toward the end; order changes visual order only.
// Keep DOM order meaningful: screen readers and Tab follow the source, not the order classes.
export default function Example() {
  const c = 'os-p-3 os-rounded-md os-bg-surface-2 os-border';
  return (
    <div className="os-grid os-gap-4">
      <div className="os-row">
        <div className="os-col-4">
          <div className={c}>.os-col-4</div>
        </div>
        <div className="os-col-4 os-offset-4">
          <div className={c}>.os-col-4 .os-offset-4</div>
        </div>
      </div>
      <div className="os-row">
        <div className="os-col-6 md:os-offset-3">
          <div className={c}>.os-col-6 md:os-offset-3</div>
        </div>
      </div>
      <div className="os-row">
        <div className="os-col md:os-order-last">
          <div className={c}>First in DOM, last from md</div>
        </div>
        <div className="os-col">
          <div className={c}>Second in DOM</div>
        </div>
        <div className="os-col os-order-first">
          <div className={c}>Third in DOM, .os-order-first</div>
        </div>
      </div>
    </div>
  );
}
