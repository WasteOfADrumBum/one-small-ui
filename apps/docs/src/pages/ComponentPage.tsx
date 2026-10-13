import { Alert } from '@onesmall/ui';
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
      {doc.callout && (
        <Alert color={doc.callout.color ?? 'warning'} title={doc.callout.title} live="off" className="os-mb-6">
          {doc.callout.body}
        </Alert>
      )}
      {doc.importLine && <Code language="tsx" title="Import" code={doc.importLine} />}

      {doc.examples.length > 0 && (
        <>
          <h2 id="examples">Examples</h2>
          {doc.examples.map((ex) => (
            <Example key={ex.name} {...ex} />
          ))}
        </>
      )}

      {doc.snippets && (
        <>
          <h2 id="usage">Usage</h2>
          {doc.snippets.map((s) => (
            <section key={s.title} className="docs-snippet">
              <h3>{s.title}</h3>
              {s.description && <p>{s.description}</p>}
              <Code language={s.language} title={s.title} code={s.code} />
            </section>
          ))}
        </>
      )}

      {doc.reference && (
        <>
          <h2 id="reference">Reference</h2>
          {doc.reference.map((r) => (
            <div key={r.title} className="docs-props">
              <table>
                <caption>{r.title}</caption>
                <thead>
                  <tr>
                    {r.columns.map((c) => (
                      <th key={c} scope="col">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {r.rows.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, i) =>
                        i === 0 ? (
                          <th key={i} scope="row">
                            <code>{cell}</code>
                          </th>
                        ) : (
                          <td key={i}>{cell}</td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}

      {doc.props && (
        <>
          <h2 id="api">API</h2>
          {doc.props.map((p) => (
            <PropsTable key={p.title} {...p} />
          ))}
          <p className="os-text-muted os-text-sm">All components forward refs and accept the native props of their root element.</p>
        </>
      )}

      {(doc.a11y.length > 0 || doc.keyboard || doc.screenReader) && (
        <>
          <h2 id="accessibility">Accessibility</h2>
          {doc.a11y.length > 0 && (
            <ul>
              {doc.a11y.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          )}

          {doc.keyboard && (
            <>
              <h3 id="keyboard">Keyboard interaction</h3>
              <div className="docs-props">
                <table aria-labelledby="keyboard">
                  <thead>
                    <tr>
                      <th scope="col">Keys</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doc.keyboard.map((k) => (
                      <tr key={k.keys}>
                        <th scope="row">
                          <Keys keys={k.keys} />
                        </th>
                        <td>{k.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {doc.screenReader && (
            <>
              <h3 id="screen-reader">Screen reader notes</h3>
              <ul>
                {doc.screenReader.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {(doc.dos || doc.donts) && (
        <>
          <h2 id="do-dont">Do and don't</h2>
          <div className="docs-dos">
            {doc.dos && (
              <section className="docs-dos__col" data-kind="do" aria-labelledby="do-list">
                <h3 id="do-list">Do</h3>
                <ul>
                  {doc.dos.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </section>
            )}
            {doc.donts && (
              <section className="docs-dos__col" data-kind="dont" aria-labelledby="dont-list">
                <h3 id="dont-list">Don't</h3>
                <ul>
                  {doc.donts.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
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

/** "Shift + Tab" → <kbd>Shift</kbd> + <kbd>Tab</kbd>; "Enter / Space" → alternatives. "None" stays plain text. */
function Keys({ keys }: { keys: string }) {
  if (keys === 'None') return <>None</>;
  return (
    <>
      {keys.split(' / ').map((combo, i) => (
        <span key={combo}>
          {i > 0 && ' or '}
          {combo.split(' + ').map((key, j) => (
            <span key={key}>
              {j > 0 && ' + '}
              <kbd>{key}</kbd>
            </span>
          ))}
        </span>
      ))}
    </>
  );
}
