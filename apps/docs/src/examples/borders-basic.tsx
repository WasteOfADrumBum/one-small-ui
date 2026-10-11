// Border presence (all or one logical side), removal, width, style and color.
export default function Example() {
  const box = 'os-p-3 os-rounded-md os-bg-surface os-text-sm';
  const colors = ['primary', 'accent', 'success', 'warning', 'danger', 'info', 'primary-subtle', 'strong'];
  return (
    <div className="os-grid os-gap-6">
      <div className="os-grid os-gap-2 sm:os-grid-cols-3 lg:os-grid-cols-6">
        <div className={`${box} os-border`}>.os-border</div>
        <div className={`${box} os-border-top`}>.os-border-top</div>
        <div className={`${box} os-border-end`}>.os-border-end</div>
        <div className={`${box} os-border-bottom`}>.os-border-bottom</div>
        <div className={`${box} os-border-start`}>.os-border-start</div>
        <div className={`${box} os-border os-border-top-0`}>.os-border-top-0</div>
      </div>
      <div className="os-grid os-gap-2 sm:os-grid-cols-4">
        {['1', '2', '3', '4'].map((w) => (
          <div key={w} className={`${box} os-border os-border-${w}`}>
            .os-border-{w}
          </div>
        ))}
        <div className={`${box} os-border os-border-2 os-border-dashed`}>.os-border-dashed</div>
        <div className={`${box} os-border os-border-2 os-border-dotted`}>.os-border-dotted</div>
      </div>
      <div className="os-grid os-gap-2 sm:os-grid-cols-4">
        {colors.map((c) => (
          <div key={c} className={`${box} os-border os-border-2 os-border-${c}`}>
            .os-border-{c}
          </div>
        ))}
      </div>
    </div>
  );
}
