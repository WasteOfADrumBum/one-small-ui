import { SkipLink } from '@onesmall/ui';

// Put it first in the page. Tab into this preview to reveal it.
export default function Example() {
  return (
    <div className="os-relative os-grid os-gap-3 os-pt-6">
      <SkipLink href="#flight-plan">Skip to flight plan</SkipLink>
      <nav aria-label="Demo site">
        <ul className="os-flex os-flex-wrap os-gap-4 os-list-unstyled os-mb-0">
          <li><a href="/launches">Launches</a></li>
          <li><a href="/crew">Crew</a></li>
          <li><a href="/payloads">Payloads</a></li>
        </ul>
      </nav>
      <div id="flight-plan" className="os-p-4 os-rounded-lg os-bg-surface-2">
        <h4 className="os-mb-1">Flight plan</h4>
        <p className="os-mb-0">Activating the skip link moves focus here, past the navigation.</p>
      </div>
    </div>
  );
}
