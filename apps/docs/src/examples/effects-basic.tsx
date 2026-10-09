// Opacity, shadows, pointer events and text selection.
export default function Example() {
  return (
    <div className="os-grid os-gap-6">
      <div className="os-grid os-gap-2 os-grid-cols-3 sm:os-grid-cols-6">
        {['100', '75', '50', '25', '10', '0'].map((o) => (
          <figure key={o} className="os-m-0 os-text-center os-text-sm">
            <div className={`os-opacity-${o} os-ratio-1x1 os-rounded-md os-bg-primary`} aria-hidden="true" />
            <figcaption className="os-mt-1">.os-opacity-{o}</figcaption>
          </figure>
        ))}
      </div>
      <div className="os-grid os-gap-4 sm:os-grid-cols-4">
        {['sm', '', 'lg', 'glow'].map((s) => (
          <div key={s} className={`os-p-4 os-rounded-lg os-bg-surface os-shadow${s ? `-${s}` : ''}`}>
            .os-shadow{s ? `-${s}` : ''}
          </div>
        ))}
      </div>
      <div className="os-grid os-gap-2">
        <p className="os-select-all os-font-mono os-mb-0">.os-select-all: one click selects all of this</p>
        <p className="os-select-none os-mb-0">.os-select-none: this text cannot be selected</p>
        <p className="os-mb-0">
          <a href="#components/utilities-effects" className="os-pointer-events-none" tabIndex={-1} aria-disabled="true">
            .os-pointer-events-none link
          </a>{' '}
          ignores clicks; also remove it from the tab order and mark it aria-disabled.
        </p>
      </div>
    </div>
  );
}
