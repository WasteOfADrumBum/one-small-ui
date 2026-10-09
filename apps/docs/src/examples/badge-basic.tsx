import { Badge } from 'onesmallui';

const colors = ['neutral', 'primary', 'accent', 'success', 'warning', 'danger', 'info'] as const;

export default function Example() {
  return (
    <div className="os-grid os-gap-3">
      {(['soft', 'solid', 'outline'] as const).map((variant) => (
        <div key={variant} className="os-flex os-flex-wrap os-gap-2">
          {colors.map((c) => (
            <Badge key={c} color={c} variant={variant}>
              {c}
            </Badge>
          ))}
        </div>
      ))}
      <div className="os-flex os-flex-wrap os-gap-2">
        <Badge color="success" dot pulse>
          Systems nominal
        </Badge>
        <Badge color="warning" dot>
          Low fuel
        </Badge>
        <Badge color="danger" dot size="sm">
          Offline
        </Badge>
      </div>
    </div>
  );
}
