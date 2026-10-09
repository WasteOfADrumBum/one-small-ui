import { Example } from '../site/Example';

const groups: [string, string, string][] = [
  ['Display', 'os-block, os-flex, os-grid, os-inline-flex, os-hidden, os-contents', 'Yes'],
  ['Flexbox', 'os-flex-row, os-flex-col, os-flex-wrap, os-items-center, os-justify-between, os-flex-1, os-shrink-0', 'Direction, wrap, align, justify'],
  ['Grid', 'os-grid-cols-1 … 6, 12, os-col-span-1 … 12, os-col-span-full', 'Yes'],
  ['Spacing', 'os-p-4, os-px-6, os-py-2, os-pt-1, os-m-auto, os-mx-auto, os-mt-8, os-gap-3', 'p, px, py, m, mx, my, gap'],
  ['Sizing', 'os-w-full, os-h-screen, os-min-h-screen, os-max-w-prose, os-max-w-lg', 'Width'],
  ['Typography', 'os-text-xs … 5xl, os-font-bold, os-font-display, os-font-mono, os-text-upper, os-tracking-wider', 'Size and alignment'],
  ['Color', 'os-text-muted, os-text-primary, os-bg-surface-2, os-bg-primary-soft, os-gradient-text', '—'],
  ['Surfaces', 'os-rounded-lg, os-shadow-md, os-shadow-glow, os-glass, os-grid-bg', '—'],
  ['Motion', 'os-animate-fade-up, os-animate-scale-in, os-animate-spin, os-transition-all', '—'],
  ['Accessibility', 'os-sr-only, os-focusable-sr, os-skip-link', '—'],
];

export function Utilities() {
  return (
    <article className="docs-article">
      <h1>Utility classes</h1>
      <p className="docs-lead">
        Tailwind-style atoms with an <code>os-</code> prefix so they never collide with your own classes. Put{' '}
        <code>sm:</code>, <code>md:</code>, <code>lg:</code> or <code>xl:</code> in front of responsive ones; they apply
        from that breakpoint up.
      </p>
      <h2 id="example">Example</h2>
      <Example name="utilities-basic" title="Mixing utilities" />
      <h2 id="reference">Reference</h2>
      <div className="docs-props">
        <table>
          <caption>Utility groups</caption>
          <thead>
            <tr>
              <th scope="col">Group</th>
              <th scope="col">Examples</th>
              <th scope="col">Responsive</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(([g, ex, r]) => (
              <tr key={g}>
                <th scope="row">{g}</th>
                <td>
                  <code>{ex}</code>
                </td>
                <td>{r}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 id="breakpoints">Breakpoints</h2>
      <p>Mobile first. sm 480px, md 768px, lg 1024px, xl 1280px (2xl 1536px and 3xl 1920px for media queries and hooks).</p>
    </article>
  );
}
