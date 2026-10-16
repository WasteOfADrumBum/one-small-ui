import { Timeline, TimelineItem } from '@onesmall/ui';

const releases = [
  { version: '0.1.0', date: '2026-06-02', notes: 'First public release: buttons, forms and overlays.' },
  { version: '0.2.0', date: '2026-07-21', notes: 'Accessibility hooks, icons and Transition.' },
  { version: '0.3.0', date: '2026-09-08', notes: 'TagInput, TimePicker and DataTable.' },
  { version: '0.4.0', date: '2026-10-13', notes: 'CommandPalette, Sidebar and TreeView.' },
];

// Both sides of the line when there is room (36rem), one side when narrow. Mirrors in RTL.
export default function Example() {
  return (
    <Timeline layout="alternating" aria-label="Release history" locale="en-US">
      {releases.map((r) => (
        <TimelineItem key={r.version} title={`Version ${r.version}`} time={r.date} description={r.notes} status="success" />
      ))}
    </Timeline>
  );
}
