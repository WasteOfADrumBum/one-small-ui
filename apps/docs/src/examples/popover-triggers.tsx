import { Button, Popover } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-flex os-flex-wrap os-gap-3">
      <Popover title="Click" content="Click outside or press Escape to close.">
        <Button variant="outline">Click (default)</Button>
      </Popover>
      {/* Dismiss on next click: opens on focus, closes as soon as focus or a click goes elsewhere. */}
      <Popover trigger="focus" title="Dismissible" content="Closes on your next click anywhere.">
        <Button variant="outline">Dismiss on next click</Button>
      </Popover>
      <Popover trigger="hover" title="Hover" content="Also opens on keyboard focus, and stays while you hover it.">
        <Button variant="outline">Hover or focus</Button>
      </Popover>
      {/* Disabled controls get no events: wrap them in a focusable span. */}
      <Popover trigger="hover" content="Launch is disabled until the hatch is sealed." aria-label="Why launch is disabled">
        <span tabIndex={0} className="os-inline-flex">
          <Button disabled style={{ pointerEvents: 'none' }}>
            Launch
          </Button>
        </span>
      </Popover>
    </div>
  );
}
