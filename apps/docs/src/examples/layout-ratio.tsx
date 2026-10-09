// Aspect ratios: put .os-ratio-* on the element itself, or .os-ratio + .os-ratio-* on a wrapper
// to make any child (an iframe, an embed) fill it.
export default function Example() {
  const box = 'os-flex os-items-center os-justify-center os-rounded-md os-bg-primary-soft os-border os-text-sm';
  return (
    <div className="os-grid os-gap-4 sm:os-grid-cols-2 lg:os-grid-cols-4 os-items-start">
      <div className={`${box} os-ratio-1x1`}>1x1</div>
      <div className={`${box} os-ratio-4x3`}>4x3</div>
      <div className={`${box} os-ratio-16x9`}>16x9</div>
      <div className={`${box} os-ratio-21x9`}>21x9</div>
      <div className="os-ratio os-ratio-16x9 sm:os-col-span-2 os-rounded-md os-overflow-hidden os-border">
        <iframe title="Embedded example page" srcDoc="<!doctype html><html lang='en'><title>Embed</title><p style='font:16px system-ui;padding:1rem'>An embedded frame filling a 16x9 box.</p></html>" />
      </div>
    </div>
  );
}
