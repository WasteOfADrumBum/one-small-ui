import { Button, Timeline, TimelineItem } from '@onesmall/ui';

export default function Example() {
  return (
    <Timeline aria-label="Mission timeline" locale="en-US" timeZone="UTC">
      <TimelineItem title="Launch" status="success" time="2026-10-01T06:40:00Z" description="Clean ascent from Pad 39A." />
      <TimelineItem title="Orbit insertion" status="success" time="2026-10-01T07:12:00Z" />
      <TimelineItem
        title="Docking"
        status="warning"
        time="2026-10-01T10:05:00Z"
        description="Second approach after a sensor fault on port 3."
        actions={
          <Button size="sm" variant="soft">
            Open camera feed
          </Button>
        }
      />
      <TimelineItem title="Crew transfer" status="pending" time="2026-10-01T11:00:00Z" description="Scheduled." />
      <TimelineItem title="Return" time="2026-10-14" />
    </Timeline>
  );
}
