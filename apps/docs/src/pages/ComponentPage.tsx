import type { ComponentDoc } from '../site/componentDocs';
import { Code } from '../site/Code';
import { Example } from '../site/Example';
import { PropsTable } from '../site/PropsTable';

export function ComponentPage({ doc }: { doc: ComponentDoc }) {
  return (
    <article className="docs-article">
      <p className="docs-eyebrow">{doc.group}</p>
      <h1>{doc.name}</h1>
      <p className="docs-lead">{doc.summary}</p>
      <Code language="tsx" title="Import" code={doc.importLine} />

      <h2 id="examples">Examples</h2>
      {doc.examples.map((ex) => (
        <Example key={ex.name} {...ex} />
      ))}

      {doc.props && (
        <>
          <h2 id="api">API</h2>
          {doc.props.map((p) => (
            <PropsTable key={p.title} {...p} />
          ))}
          <p className="os-text-muted os-text-sm">All components forward refs and accept the native props of their root element.</p>
        </>
      )}

      {doc.a11y.length > 0 && (
        <>
          <h2 id="accessibility">Accessibility</h2>
          <ul>
            {doc.a11y.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </>
      )}

      {doc.classes && (
        <>
          <h2 id="classes">Classes & data attributes</h2>
          <Code language="css" title="Selectors" code={doc.classes} />
        </>
      )}
    </article>
  );
}
