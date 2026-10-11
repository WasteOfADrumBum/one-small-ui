// .os-scheme-dark / .os-scheme-light re-scope every token for a subtree, whatever the page theme.
// Components inside follow automatically.
import { Button } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      {(['light', 'dark'] as const).map((s) => (
        <section key={s} className={`os-scheme-${s} os-p-6 os-rounded-lg os-border`} aria-label={`${s} scheme`}>
          <p className="os-font-semibold">.os-scheme-{s}</p>
          <p className="os-text-muted">Muted text and buttons pick up the {s} tokens.</p>
          <div className="os-flex os-gap-2 os-flex-wrap">
            <Button size="sm">Primary</Button>
            <Button size="sm" variant="outline">
              Outline
            </Button>
          </div>
        </section>
      ))}
    </div>
  );
}
