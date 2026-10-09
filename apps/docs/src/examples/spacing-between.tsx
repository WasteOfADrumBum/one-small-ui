// Space between children without touching the children: margins go on all but the first.
export default function Example() {
  const item = 'os-p-3 os-rounded-md os-bg-surface-3';
  return (
    <div className="os-grid os-gap-6 md:os-grid-cols-2">
      <div className="os-space-y-4">
        <div className={item}>.os-space-y-4</div>
        <div className={item}>adds block-start margin</div>
        <div className={item}>to every later sibling</div>
      </div>
      <div className="os-flex os-space-x-2 os-items-start">
        <div className={item}>.os-space-x-2</div>
        <div className={item}>inline</div>
        <div className={item}>logical</div>
      </div>
    </div>
  );
}
