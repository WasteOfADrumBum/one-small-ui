import { Button, Tooltip, TooltipProvider } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-6">
      {/* Interactive: stays open while the pointer or focus is inside, so the link is reachable with Tab. */}
      <div>
        <Tooltip
          interactive
          placement="right"
          content={
            <>
              Specs in the <a href="#components/popover">fleet manual</a>.
            </>
          }
        >
          <Button variant="outline">Interactive tooltip</Button>
        </Tooltip>
      </div>

      {/* Delegation: any element with data-os-tooltip inside the provider gets a tooltip. */}
      <TooltipProvider>
        <div className="os-flex os-flex-wrap os-gap-3">
          <Button variant="ghost" data-os-tooltip="Save the flight plan">
            Save
          </Button>
          <Button variant="ghost" data-os-tooltip="Share with the crew" data-os-tooltip-placement="bottom">
            Share
          </Button>
          <Button variant="ghost" data-os-tooltip="Print a paper copy" data-os-tooltip-placement="right">
            Print
          </Button>
        </div>
      </TooltipProvider>
    </div>
  );
}
