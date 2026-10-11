// Margin and padding on the 0.25rem scale. s/e are logical (inline start/end), so they flip in RTL.
// Width and height: 25/50/75/100%, auto, and viewport units.
export default function Example() {
  return (
    <div className="os-grid os-gap-4">
      <div className="os-bg-surface-2 os-rounded-md">
        <div className="os-ms-8 os-me-2 os-py-2 os-ps-4 os-rounded-md os-bg-primary-soft">.os-ms-8 .os-me-2 .os-ps-4 .os-py-2</div>
      </div>
      <div className="os-bg-surface-2 os-rounded-md os-p-4">
        <div className="os-mt-n4 os-p-2 os-rounded-md os-bg-accent-soft">.os-mt-n4 pulls up with a negative margin</div>
      </div>
      <div className="os-grid os-gap-2">
        {['25', '50', '75', '100'].map((w) => (
          <div key={w} className={`os-w-${w} os-p-2 os-rounded-md os-bg-surface-3`}>
            .os-w-{w}
          </div>
        ))}
        <div className="os-w-100 md:os-w-50 os-mx-auto os-p-2 os-rounded-md os-bg-info-soft">.os-w-100 md:os-w-50 .os-mx-auto</div>
      </div>
      <div className="os-flex os-gap-2" style={{ height: '6rem' }}>
        {['25', '50', '75', '100'].map((h) => (
          <div key={h} className={`os-h-${h} os-p-2 os-rounded-md os-bg-surface-3`}>
            .os-h-{h}
          </div>
        ))}
      </div>
    </div>
  );
}
