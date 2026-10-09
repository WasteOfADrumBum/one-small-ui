import { Card, CardBody, CardText, CardTitle } from 'onesmallui';

const colors = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'inverse'] as const;

export default function Example() {
  return (
    <div className="os-grid os-gap-6">
      {(['surface', 'solid', 'outline', 'glass'] as const).map((variant) => (
        <div key={variant} className="os-grid os-gap-3 sm:os-grid-cols-2 lg:os-grid-cols-4">
          {colors.map((color) => (
            <Card key={color} color={color} variant={variant}>
              <CardBody>
                <CardTitle as="h4">{color}</CardTitle>
                <CardText>
                  <code>variant="{variant}"</code>
                </CardText>
              </CardBody>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}
