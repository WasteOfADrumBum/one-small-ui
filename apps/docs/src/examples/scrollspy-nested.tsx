import { ScrollSpy, useScrollSpy } from 'onesmallui';

// Nested lists: parent links get data-active="parent" while a child section is in view.
// This one spies on the page itself (no root).
export function NestedList() {
  return (
    <ScrollSpy offset={120}>
      <ul>
        <li>
          <a href="#examples">Examples</a>
          <ul>
            <li>
              <a href="#ex-scrollspy-basic">Basic</a>
            </li>
            <li>
              <a href="#ex-scrollspy-nested">Nested</a>
            </li>
          </ul>
        </li>
        <li>
          <a href="#api">API</a>
        </li>
        <li>
          <a href="#accessibility">Accessibility</a>
        </li>
      </ul>
    </ScrollSpy>
  );
}

// The hook alone: get the active id and render whatever you like.
function HookReadout() {
  const active = useScrollSpy(['examples', 'api', 'accessibility', 'classes'], { offset: 120 });
  return (
    <p className="os-text-sm" aria-live="polite">
      useScrollSpy says the page is at: <code>{active ?? 'top'}</code>
    </p>
  );
}

export default function Example() {
  return (
    <div className="os-grid os-gap-2">
      <NestedList />
      <HookReadout />
    </div>
  );
}
