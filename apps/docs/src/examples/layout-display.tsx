// Display (responsive and print:), float, overflow, visibility and object-fit.
export default function Example() {
  return (
    <div className="os-grid os-gap-6">
      <div className="os-flex os-gap-2 os-flex-wrap">
        <span className="os-p-2 os-rounded-md os-bg-surface-3">Always</span>
        <span className="os-hidden md:os-inline-block os-p-2 os-rounded-md os-bg-primary-soft">md and up</span>
        <span className="md:os-hidden os-p-2 os-rounded-md os-bg-accent-soft">Below md</span>
        <span className="print:os-hidden os-p-2 os-rounded-md os-bg-surface-3">Hidden when printed</span>
        <span className="os-invisible os-p-2">Invisible but keeps its space</span>
        <span className="os-p-2 os-rounded-md os-bg-surface-3">After the invisible one</span>
      </div>
      <div className="os-clearfix os-p-3 os-rounded-md os-bg-surface-2">
        <span className="os-float-end os-p-2 os-ms-3 os-rounded-md os-bg-success-soft">.os-float-end</span>
        <span className="sm:os-float-start os-p-2 os-me-3 os-rounded-md os-bg-info-soft">sm:os-float-start</span>
        Floats use logical sides, so they flip in right-to-left text. The parent uses .os-clearfix.
      </div>
      <div className="os-grid os-gap-4 sm:os-grid-cols-2">
        <div className="os-overflow-auto os-p-3 os-rounded-md os-border" style={{ maxHeight: '6rem' }} tabIndex={0} role="region" aria-label="Scrollable text">
          <p>.os-overflow-auto scrolls when content is taller than the box. Scrollable regions get tabIndex 0 and a label so keyboard users can reach them.</p>
          <p className="os-mb-0">More text to make it scroll. More text to make it scroll.</p>
        </div>
        <img
          className="os-object-cover os-object-top os-w-100 os-rounded-md"
          style={{ height: '6rem' }}
          src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=60"
          alt="A spiral galaxy cropped with object-fit: cover"
        />
      </div>
    </div>
  );
}
