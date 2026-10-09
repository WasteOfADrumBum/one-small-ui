import { useEffect, useRef } from 'react';
import { init } from 'onesmallui/dom';

// Plain HTML using the same os- classes, wired by data-os-* attributes.
// In a non-React page this is just markup plus one script tag.
const html = `
<div class="os-cluster os-gap-2">
  <button class="os-btn" data-variant="solid" data-color="primary" data-size="md"
          data-os-toggle="collapse" data-os-target="#dom-more">Show details</button>
  <button class="os-btn" data-variant="outline" data-color="neutral" data-size="md"
          data-os-tooltip="Tooltips need only one attribute">Hover or focus me</button>
</div>
<div class="os-collapse" id="dom-more" data-state="closed">
  <div class="os-collapse__inner"><p class="os-mt-3">Opened by data-os-toggle="collapse".</p></div>
</div>
<div class="os-alert os-mt-3" data-color="info" data-dismissible role="status">
  <div class="os-alert__content"><div class="os-alert__body">Dismiss me with the close button.</div></div>
  <button class="os-btn" data-variant="ghost" data-color="neutral" data-size="sm"
          data-os-dismiss="alert">Close</button>
</div>`;

export default function Example() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    init(ref.current!);
    const log = (e: Event) => console.log(e.type, e.target);
    document.addEventListener('os:shown', log);
    return () => document.removeEventListener('os:shown', log);
  }, []);
  return <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}
