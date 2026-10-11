import { Badge, Button, VisuallyHidden } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4">
      {/* size="inherit" scales with the parent's font size. */}
      <p className="os-text-3xl os-font-bold">
        Mission control <Badge size="inherit" color="accent">New</Badge>
      </p>
      <p className="os-text-xl os-font-semibold">
        Telemetry <Badge size="inherit" color="success" variant="solid">Live</Badge>
      </p>
      <div className="os-flex os-flex-wrap os-gap-3">
        <Button variant="soft">
          Messages{' '}
          <Badge size="inherit" color="primary" variant="solid">
            4
          </Badge>
        </Button>
        <Button>
          Alerts <Badge size="inherit">12</Badge>
          <VisuallyHidden> unread</VisuallyHidden>
        </Button>
      </div>
    </div>
  );
}
