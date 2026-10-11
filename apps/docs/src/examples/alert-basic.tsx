import { Alert } from 'onesmallui';

const colors = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'inverse'] as const;

export default function Example() {
  return (
    <div className="os-grid os-gap-3 md:os-grid-cols-2">
      {colors.map((color) => (
        <Alert key={color} color={color} title={`A ${color} alert`}>
          Use the color that matches the meaning of the message.
        </Alert>
      ))}
    </div>
  );
}
