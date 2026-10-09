import { Example } from '../site/Example';

const groups: [string, string, string, string][] = [
  ['utilities-color', 'Color', 'os-text-primary, os-bg-success-soft, os-text-bg-danger, os-bg-gradient, os-scheme-dark', '—'],
  ['utilities-layout', 'Layout', 'os-ratio-16x9, os-flex, os-hidden, os-float-end, os-overflow-auto, os-absolute, os-top-50, os-translate-middle, os-invisible', 'Display, float'],
  ['utilities-flex-grid', 'Flex and grid', 'os-flex-col, os-items-center, os-self-end, os-justify-between, os-gap-4, os-grid-cols-3, os-col-span-2, os-order-last', 'Direction, wrap, align, justify, gap, cols, span, order'],
  ['utilities-spacing', 'Size and spacing', 'os-p-4, os-px-6, os-ms-auto, os-mt-n2, os-space-y-4, os-w-50, os-h-100, os-max-w-prose', 'p, px, py, m, mx, my, width'],
  ['utilities-text', 'Text', 'os-text-xl, os-font-semibold, os-italic, os-leading-relaxed, os-text-center, os-link-accent, os-text-balance, os-align-middle', 'Size, alignment'],
  ['utilities-borders', 'Borders', 'os-border, os-border-top, os-border-2, os-border-primary, os-rounded-lg, os-rounded-start, os-divide-y', '—'],
  ['utilities-effects', 'Interaction and effects', 'os-opacity-50, os-shadow-lg, os-pointer-events-none, os-select-all, os-transition, os-motion-off', '—'],
  ['helpers', 'Helpers', 'os-focus-ring, os-hover-lift, os-icon-link, os-sticky-top, os-hstack, os-vr, os-line-clamp-2, os-visually-hidden', 'Sticky'],
  ['grid', 'Grid system', 'os-row, os-col, os-col-6, os-row-cols-3, os-offset-2, os-g-4', 'Everything'],
  ['z-index', 'Z-index', 'os-z-1, os-z-modal', '—'],
];

export function Utilities() {
  return (
    <article className="docs-article">
      <h1>Utility classes</h1>
      <p className="docs-lead">
        Tailwind-style atoms with an <code>os-</code> prefix so they never collide with your own classes. Put{' '}
        <code>sm:</code>, <code>md:</code>, <code>lg:</code>, <code>xl:</code> or <code>2xl:</code> in front of
        responsive ones; they apply from that breakpoint up. Inside an <code>.os-cq</code> container,{' '}
        <code>cq-sm:</code> … <code>cq-xl:</code> respond to the container instead, and <code>print:</code> display
        classes apply when printing.
      </p>
      <h2 id="example">Example</h2>
      <Example name="utilities-basic" title="Mixing utilities" />
      <h2 id="reference">Utility groups</h2>
      <p>Each group has its own page with live examples and the full class list.</p>
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
            {groups.map(([slug, name, ex, r]) => (
              <tr key={slug}>
                <th scope="row">
                  <a href={`#components/${slug}`}>{name}</a>
                </th>
                <td>
                  <code>{ex}</code>
                </td>
                <td>{r}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 id="layers">Layers and overrides</h2>
      <p>
        Utilities live in the <code>os.utilities</code> cascade layer, above components, so a utility always wins over
        a component style, and your own unlayered CSS always wins over both. Need a class that does not exist? Generate
        it with the <a href="#components/utility-api">Utility API</a>.
      </p>
      <h2 id="breakpoints">Breakpoints</h2>
      <p>
        Mobile first. sm 576px, md 768px, lg 1024px, xl 1280px, 2xl 1536px (3xl 1920px for media queries and hooks).
        See <a href="#components/containers">Containers &amp; breakpoints</a>.
      </p>
    </article>
  );
}
