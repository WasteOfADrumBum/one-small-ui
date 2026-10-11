const colors = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'inverse'];

// Link colors, underline colors, underline offset and underline opacity combine freely.
export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <ul className="os-list-unstyled os-space-y-1" role="list">
        {colors.map((c) => (
          <li key={c}>
            <a href="#components/utilities-text" className={`os-link-${c}`}>
              .os-link-{c}
            </a>
          </li>
        ))}
      </ul>
      <ul className="os-list-unstyled os-space-y-1" role="list">
        <li>
          <a href="#components/utilities-text" className="os-link-underline-danger">
            .os-link-underline-danger
          </a>
        </li>
        <li>
          <a href="#components/utilities-text" className="os-underline-offset-1">
            .os-underline-offset-1
          </a>
        </li>
        <li>
          <a href="#components/utilities-text" className="os-underline-offset-3">
            .os-underline-offset-3
          </a>
        </li>
        {['10', '25', '50', '75', '100'].map((o) => (
          <li key={o}>
            <a href="#components/utilities-text" className={`os-link-underline-opacity-${o} os-underline-offset-2`}>
              .os-link-underline-opacity-{o}
            </a>
          </li>
        ))}
        <li>
          <a href="#components/utilities-text" className="os-link-accent os-link-underline-opacity-25">
            .os-link-accent .os-link-underline-opacity-25
          </a>
        </li>
      </ul>
    </div>
  );
}
