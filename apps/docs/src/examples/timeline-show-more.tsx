import { Timeline, TimelineItem } from '@onesmall/ui';

const checks = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  title: `Health check ${18 - i}`,
  failed: i === 4 || i === 11,
  time: new Date(Date.UTC(2026, 9, 16, 12 - i, 0)),
}));

// "Show more" reveals 5 more, moves focus to the first new event and announces "5 more events shown".
export default function Example() {
  return (
    <Timeline pageSize={5} aria-label="Health checks" locale="en-US" timeZone="UTC">
      {checks.map((c) => (
        <TimelineItem
          key={c.id}
          title={c.title}
          status={c.failed ? 'danger' : 'success'}
          time={c.time}
          description={c.failed ? 'Timed out after 30s.' : undefined}
        />
      ))}
    </Timeline>
  );
}
