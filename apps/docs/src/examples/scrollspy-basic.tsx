import { useRef, useState } from 'react';
import { Nav, NavItem, ScrollSpy, Switch } from 'onesmallui';

const sections = [
  { id: 'spy-launch', title: 'Launch' },
  { id: 'spy-orbit', title: 'Orbit' },
  { id: 'spy-transfer', title: 'Transfer' },
  { id: 'spy-landing', title: 'Landing' },
];

// A custom scroll container, a Nav, an activation line 25% from the top,
// and the debug overlay to see where that line is.
export default function Example() {
  const root = useRef<HTMLDivElement>(null);
  const [debug, setDebug] = useState(false);
  return (
    <div className="os-grid os-gap-4">
      <Switch label="Show activation line" checked={debug} onChange={(e) => setDebug(e.target.checked)} />
      <div className="os-flex os-gap-4">
        <ScrollSpy root={root} offset="25%" debug={debug}>
          <Nav aria-label="Mission phases" orientation="vertical" variant="underline">
            {sections.map((s) => (
              <NavItem key={s.id} href={`#${s.id}`}>
                {s.title}
              </NavItem>
            ))}
          </Nav>
        </ScrollSpy>
        <div
          ref={root}
          tabIndex={0}
          role="region"
          aria-label="Mission phases content"
          className="os-rounded-lg os-bg-surface-2 os-p-4"
          style={{ height: '16rem', overflow: 'auto', flex: 1 }}
        >
          {sections.map((s) => (
            <section key={s.id} id={s.id} style={{ minHeight: '14rem' }}>
              <h4>{s.title}</h4>
              <p>Phase details for {s.title.toLowerCase()}. Scroll to see the nav follow along.</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
