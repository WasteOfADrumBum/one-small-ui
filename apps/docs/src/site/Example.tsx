import { useState, type ReactNode } from 'react';
import { Button } from 'onesmallui';
import { getExample } from './examples';
import { Code } from './Code';

interface ExampleProps {
  name: string;
  title: string;
  description?: ReactNode;
}

/** A live preview with its source in a copy box underneath. */
export function Example({ name, title, description }: ExampleProps) {
  const { Component, code } = getExample(name);
  const [showCode, setShowCode] = useState(true);
  const id = `ex-${name}`;
  return (
    <section className="docs-example" aria-labelledby={id}>
      <div className="docs-example__head">
        <div>
          <h3 id={id} className="docs-example__title">
            {title}
          </h3>
          {description && <p className="docs-example__desc">{description}</p>}
        </div>
        <Button size="sm" variant="ghost" aria-expanded={showCode} onClick={() => setShowCode((s) => !s)}>
          {showCode ? 'Hide code' : 'Show code'}
        </Button>
      </div>
      <div className="docs-example__preview os-grid-bg">
        <Component />
      </div>
      {showCode && <Code code={code} title={`${name}.tsx`} className="docs-example__code" />}
    </section>
  );
}
