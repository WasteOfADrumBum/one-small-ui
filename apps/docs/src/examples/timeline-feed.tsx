import { Timeline, TimelineItem } from '@onesmall/ui';

const loaded = Date.now();
const minutesAgo = (n: number) => new Date(loaded - n * 60_000);

// Relative times with the full date in a tooltip (focus the time to see it).
export default function Example() {
  return (
    <Timeline variant="feed" aria-label="Recent activity" locale="en-US">
      <TimelineItem actor="Ada Lovelace" action="commented on Launch checklist" time={minutesAgo(4)} />
      <TimelineItem actor="Grace Hopper" action="resolved incident #212" status="success" time={minutesAgo(95)} />
      <TimelineItem
        actor="Katherine Johnson"
        action="flagged the trajectory review"
        status="warning"
        time={minutesAgo(60 * 26)}
        description="Re-entry angle differs from the plan by 0.4°."
      />
      <TimelineItem actor="Mae Jemison" action="joined the project" time={minutesAgo(60 * 24 * 9)} />
    </Timeline>
  );
}
