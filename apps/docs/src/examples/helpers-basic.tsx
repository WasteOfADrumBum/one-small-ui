import { Button } from 'onesmallui';

const Arrow = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

// Focus ring, hover lift, icon links, stacks and the vertical rule.
export default function Example() {
  return (
    <div className="os-vstack os-gap-6">
      <div className="os-hstack os-gap-3 os-flex-wrap">
        <a href="#components/helpers" className="os-focus-ring os-p-2 os-rounded-md">
          .os-focus-ring (Tab to me)
        </a>
        <a href="#components/helpers" className="os-focus-ring os-p-2 os-rounded-md" data-color="danger">
          data-color=&quot;danger&quot;
        </a>
        <a href="#components/helpers" className="os-icon-link os-icon-link-hover">
          Icon link <Arrow />
        </a>
      </div>
      <div className="os-hstack os-gap-3 os-p-3 os-rounded-lg os-border">
        <span>.os-hstack</span>
        <div className="os-vr" aria-hidden="true" />
        <span>with a .os-vr</span>
        <Button size="sm" variant="outline" className="os-ms-auto">
          Pushed to the end
        </Button>
      </div>
      <div className="os-vstack os-gap-2 os-p-3 os-rounded-lg os-border">
        <span>.os-vstack</span>
        <span>stacks children in a column</span>
      </div>
      <div className="os-grid os-gap-4 sm:os-grid-cols-3">
        {['One', 'Two', 'Three'].map((n) => (
          <div key={n} className="os-relative os-p-4 os-rounded-lg os-bg-surface os-border os-hover-lift">
            <a href="#components/helpers" className="os-stretched-link">
              Card {n}
            </a>
            <p className="os-text-sm os-text-muted os-mb-0">.os-hover-lift and .os-stretched-link: the whole card is the link.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
