import { Button, Popover } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-flex os-flex-wrap os-gap-3 os-py-8 os-justify-center">
      {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
        <Popover
          key={placement}
          placement={placement}
          title="Docking bay 7"
          content="Clear for landing. Flip happens automatically when there is no room on this side."
        >
          <Button variant="outline">Popover {placement}</Button>
        </Popover>
      ))}
      <Popover
        placement={{ base: 'bottom', md: 'right' }}
        title="Responsive"
        content="Below the md breakpoint this opens underneath; from md up, to the right."
      >
        <Button variant="soft">Responsive placement</Button>
      </Popover>
    </div>
  );
}
