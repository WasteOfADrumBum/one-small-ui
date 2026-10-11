import { Spinner } from 'onesmallui';

const colors = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'inverse'] as const;
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export default function Example() {
  return (
    <div className="os-grid os-gap-6">
      {(['border', 'grow'] as const).map((variant) => (
        <div key={variant} className="os-grid os-gap-4">
          <div className="os-flex os-flex-wrap os-items-center os-gap-4">
            {sizes.map((size) => (
              <Spinner key={size} variant={variant} size={size} label={`Loading (${variant}, ${size})`} />
            ))}
          </div>
          <div className="os-flex os-flex-wrap os-items-center os-gap-4">
            {colors.map((c) => (
              <Spinner key={c} variant={variant} color={c} label={`Loading (${c})`} />
            ))}
            <span className="os-text-danger os-inline-flex os-items-center os-gap-2">
              <Spinner variant={variant} color="current" label={null} /> currentColor
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
