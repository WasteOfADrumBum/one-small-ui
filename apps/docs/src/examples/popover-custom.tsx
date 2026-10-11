import { Badge, Button, Popover } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-flex os-flex-wrap os-gap-3">
      <Popover
        appearance="dark"
        title="Night shift"
        content={
          <>
            <p>
              Commander <strong>Vega</strong> is on watch.
            </p>
            <Badge color="success">On duty</Badge>
          </>
        }
      >
        <Button variant="soft" color="inverse">
          Dark
        </Button>
      </Popover>
      <Popover appearance="translucent" title="Glass" content="A frosted panel over the page.">
        <Button variant="soft" color="accent">
          Translucent
        </Button>
      </Popover>
      {/* Custom styling: your own class or style, and no arrow. */}
      <Popover
        arrow={false}
        className="os-shadow-glow"
        style={{ maxWidth: '16rem' }}
        aria-label="Fuel status"
        content="Fuel at 61%. Next refuel at Ceres station."
      >
        <Button variant="outline">No arrow, custom class</Button>
      </Popover>
    </div>
  );
}
