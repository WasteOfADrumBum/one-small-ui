import { Timeline, TimelineItem } from '@onesmall/ui';

// Scrolls sideways when it doesn't fit; then it is a focusable region, so arrow keys scroll it.
export default function Example() {
  return (
    <Timeline layout="horizontal" aria-label="Order progress" locale="en-US" timeZone="UTC">
      <TimelineItem title="Ordered" status="success" time="2026-10-12T09:14:00Z" />
      <TimelineItem title="Packed" status="success" time="2026-10-13T16:02:00Z" />
      <TimelineItem title="Shipped" status="info" time="2026-10-14T08:30:00Z" description="Tracking 1Z 999 AA1" />
      <TimelineItem title="Out for delivery" status="pending" time="2026-10-16" />
      <TimelineItem title="Delivered" time="2026-10-16" timeLabel="Expected today" />
    </Timeline>
  );
}
