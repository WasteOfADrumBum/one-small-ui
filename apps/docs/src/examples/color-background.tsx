const colors = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'inverse'];

// Solid backgrounds pair with .os-text-bg-* (on-color text), soft ones with normal text.
// Gradients set their own on-color text.
export default function Example() {
  const tile = 'os-p-3 os-rounded-md os-text-sm os-font-medium';
  return (
    <div className="os-grid os-gap-6">
      <div className="os-grid os-gap-2 sm:os-grid-cols-2 lg:os-grid-cols-4">
        {colors.map((c) => (
          <div key={c} className={`${tile} os-text-bg-${c}`}>
            .os-text-bg-{c}
          </div>
        ))}
      </div>
      <div className="os-grid os-gap-2 sm:os-grid-cols-2 lg:os-grid-cols-4">
        {colors.map((c) => (
          <div key={c} className={`${tile} os-bg-${c}-soft`}>
            .os-bg-{c}-soft
          </div>
        ))}
      </div>
      <div className="os-grid os-gap-2 sm:os-grid-cols-2 lg:os-grid-cols-4">
        {['bg', 'surface', 'surface-2', 'surface-3'].map((s) => (
          <div key={s} className={`${tile} os-bg-${s} os-border`}>
            .os-bg-{s}
          </div>
        ))}
      </div>
      <div className="os-grid os-gap-2 sm:os-grid-cols-2 lg:os-grid-cols-4">
        <div className={`${tile} os-bg-gradient`}>.os-bg-gradient</div>
        {['primary', 'accent', 'success', 'danger'].map((c) => (
          <div key={c} className={`${tile} os-bg-gradient-${c}`}>
            .os-bg-gradient-{c}
          </div>
        ))}
      </div>
    </div>
  );
}
