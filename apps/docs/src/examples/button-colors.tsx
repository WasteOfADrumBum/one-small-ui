import { Button } from 'onesmallui';

const colors = ['primary', 'accent', 'success', 'warning', 'danger', 'info', 'neutral'] as const;

export default function Example() {
  return (
    <div className="os-grid os-gap-3">
      {(['solid', 'soft', 'outline'] as const).map((variant) => (
        <div key={variant} className="os-flex os-flex-wrap os-gap-2">
          {colors.map((color) => (
            <Button key={color} variant={variant} color={color} size="sm">
              {color}
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}
