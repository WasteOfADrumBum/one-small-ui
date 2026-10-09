import { Button, Tooltip } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-flex os-flex-wrap os-gap-3 os-py-8 os-justify-center">
      {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
        <Tooltip key={placement} content={`Tooltip on the ${placement}`} placement={placement}>
          <Button variant="outline">{placement}</Button>
        </Tooltip>
      ))}
    </div>
  );
}
