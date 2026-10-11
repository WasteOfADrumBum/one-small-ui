import { useRef } from 'react';
import { Toggler, useToggler } from 'onesmallui';

export default function Example() {
  const panel = useRef<HTMLDivElement>(null);
  const hook = useToggler();
  return (
    <div className="os-grid os-gap-4">
      <div className="os-flex os-flex-wrap os-gap-3">
        {/* Toggle classes on another element. */}
        <Toggler target={panel} toggleClass="os-shadow-glow os-rounded-lg">
          Glow
        </Toggler>
        {/* Toggle an attribute's value on several elements at once (a selector). */}
        <Toggler target=".demo-light" toggleAttribute="data-os-theme" onValue="dark" offValue="light">
          Dark lights
        </Toggler>
        {/* Disclosure: aria-expanded + aria-controls instead of aria-pressed. */}
        <Toggler target="#demo-details" toggleAttribute="hidden" onValue={null} offValue="" mode="expanded">
          Details
        </Toggler>
        {/* The hook drives your own button. */}
        <button type="button" className="os-btn" data-variant="soft" aria-pressed={hook.pressed} onClick={hook.toggle}>
          Hook: {hook.pressed ? 'on' : 'off'}
        </button>
      </div>
      <div ref={panel} id="demo-panel" className="os-p-4 os-bg-surface-2">
        Panel
      </div>
      <div className="os-flex os-gap-3">
        <div className="demo-light os-p-4 os-bg-surface-2" style={{ color: 'var(--os-text)' }}>Light A</div>
        <div className="demo-light os-p-4 os-bg-surface-2" style={{ color: 'var(--os-text)' }}>Light B</div>
      </div>
      <p id="demo-details" hidden>These details are toggled with the hidden attribute.</p>
    </div>
  );
}
