// Family, size, weight, style, line height, alignment, decoration, transform and wrapping.
export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <div>
        <p className="os-font-mono os-mb-1">.os-font-mono</p>
        <p className="os-font-display os-mb-1">.os-font-display</p>
        <p className="os-text-2xl os-font-light os-mb-1">.os-text-2xl .os-font-light</p>
        <p className="os-font-black os-mb-1">.os-font-black</p>
        <p className="os-italic os-mb-1">.os-italic</p>
        <p className="os-text-capitalize os-mb-1">.os-text-capitalize makes every word start upper</p>
        <p className="os-text-upper os-tracking-wide os-mb-1">.os-text-upper .os-tracking-wide</p>
        <p className="os-underline os-underline-offset-3 os-mb-1">.os-underline .os-underline-offset-3</p>
        <p className="os-line-through os-mb-1">.os-line-through</p>
        <p className="os-align-baseline os-mb-0">
          Inline <span className="os-align-super os-text-xs">.os-align-super</span> and{' '}
          <span className="os-align-middle os-text-xs">.os-align-middle</span>
        </p>
      </div>
      <div>
        <p className="os-text-start">.os-text-start</p>
        <p className="os-text-center">.os-text-center</p>
        <p className="os-text-end">.os-text-end</p>
        <p className="os-text-center md:os-text-end">.os-text-center md:os-text-end</p>
        <p className="os-leading-loose">.os-leading-loose gives this paragraph generous line height so it breathes when it wraps.</p>
        <h3 className="os-text-balance os-text-xl">.os-text-balance evens out the lines of a heading that wraps</h3>
        <p className="os-text-nowrap os-truncate">.os-text-nowrap with .os-truncate never wraps and ends with an ellipsis when too long</p>
        <p className="os-text-break os-font-mono os-text-sm">.os-text-break: averyveryveryverylongunbrokenwordthatwouldotherwiseoverflow</p>
      </div>
    </div>
  );
}
