import { Nav, NavItem } from 'onesmallui';

const here = '#components/nav-overflow';
const sections = ['Overview', 'Telemetry', 'Navigation', 'Propulsion', 'Life support', 'Communications'];

const Dots = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

export default function Example() {
  return (
    <div className="os-grid os-gap-6">
      {/* Keep at least 3 items visible, even on narrow screens. */}
      <Nav overflow minVisible={3} variant="pills" aria-label="Minimum visible items" style={{ maxWidth: '28rem' }}>
        {sections.map((s, i) => (
          <NavItem key={s} href={here} active={i === 0}>
            {s}
          </NavItem>
        ))}
      </Nav>
      {/* Custom toggle: an icon with an accessible label. */}
      <Nav
        overflow
        variant="underline"
        overflowLabel={null}
        overflowIcon={<Dots />}
        overflowAriaLabel="More sections"
        aria-label="Custom toggle"
        style={{ maxWidth: '24rem' }}
      >
        {sections.map((s, i) => (
          <NavItem key={s} href={here} active={i === 1}>
            {s}
          </NavItem>
        ))}
      </Nav>
      {/* Collapse everything into one menu. */}
      <Nav collapse overflowLabel="All sections" variant="pills" aria-label="Collapsed">
        {sections.map((s, i) => (
          <NavItem key={s} href={here} active={i === 2}>
            {s}
          </NavItem>
        ))}
      </Nav>
    </div>
  );
}
