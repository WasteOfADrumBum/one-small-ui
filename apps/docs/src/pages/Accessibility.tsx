const items: [string, string][] = [
  ['1.4.6 Contrast (Enhanced)', 'All text tokens reach 7:1 on every surface in both themes. A build check enforces it.'],
  ['1.4.11 Non-text Contrast', 'Control borders, focus rings and switch tracks reach at least 3:1.'],
  ['1.4.8 Visual Presentation', 'Paragraphs cap at 75 characters; line height 1.6; text resizes with the browser.'],
  ['1.4.10 Reflow', 'Everything works at 320px wide with no horizontal scrolling.'],
  ['1.4.13 Content on Hover or Focus', 'Tooltips are hoverable, persistent and dismiss with Escape.'],
  ['2.1.1 / 2.1.3 Keyboard (No Exception)', 'Every component, including drag and drop, works fully by keyboard.'],
  ['2.2.3 No Timing', 'Toasts stay until dismissed unless you opt into a duration, and timers pause on hover and focus.'],
  ['2.3.3 Animation from Interactions', 'prefers-reduced-motion turns off all non-essential animation.'],
  ['2.4.1 Bypass Blocks', 'SkipLink component and .os-skip-link class.'],
  ['2.4.13 Focus Appearance', '3px outline, 2px offset, plus a glow, on every focusable element.'],
  ['2.5.5 Target Size (Enhanced)', 'All controls are at least 44×44px, small buttons included.'],
  ['2.5.7 Dragging Movements', 'Sortable lists and drop zones always have a non-drag alternative.'],
  ['3.3.x Input Assistance', 'Field links labels, hints and errors; errors are announced and marked aria-invalid.'],
  ['4.1.2 / 4.1.3 Name, Role, Value & Status', 'Native elements first; ARIA only where needed; live regions for status changes.'],
];

export function Accessibility() {
  return (
    <article className="docs-article">
      <h1>Accessibility</h1>
      <p className="docs-lead">
        OneSmallUI targets WCAG 2.2 Level AAA. Components handle the mechanics; you still provide good labels, alt text
        and captions.
      </p>
      <ul className="docs-checklist">
        {items.map(([criterion, how]) => (
          <li key={criterion}>
            <strong>{criterion}</strong>
            <span>{how}</span>
          </li>
        ))}
      </ul>
      <h2 id="your-part">Your part</h2>
      <ul>
        <li>Write meaningful labels, link text and alt text.</li>
        <li>Provide captions and transcripts for media.</li>
        <li>Keep headings in order and use landmarks (header, nav, main, footer).</li>
        <li>Test with a keyboard and a screen reader (VoiceOver, NVDA, TalkBack).</li>
      </ul>
    </article>
  );
}
