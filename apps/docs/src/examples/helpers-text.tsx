// Multi-line clamps, single-line truncation and visually hidden text.
export default function Example() {
  const long =
    'OneSmallUI keeps long text tidy: clamp a description to a fixed number of lines and the rest is hidden behind an ellipsis, while the full text stays in the DOM for screen readers and search.';
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-3">
      <p className="os-line-clamp-2">
        <strong>.os-line-clamp-2</strong> {long}
      </p>
      <p className="os-line-clamp-3">
        <strong>.os-line-clamp-3</strong> {long}
      </p>
      <div>
        <p className="os-truncate">
          <strong>.os-truncate</strong> {long}
        </p>
        <p>
          <button type="button" className="os-p-2 os-rounded-md os-border os-bg-surface" style={{ minHeight: 44 }}>
            <span aria-hidden="true">★</span>
            <span className="os-visually-hidden">Add to favorites</span>
          </button>{' '}
          <a href="#main" className="os-visually-hidden-focusable">
            Visible only on focus
          </a>
        </p>
      </div>
    </div>
  );
}
