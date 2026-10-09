// Utility classes: Tailwind-style atoms with an `os-` prefix.
// Prefix any responsive class with sm:, md:, lg: or xl:.
export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-3">
      <div className="os-p-6 os-rounded-lg os-bg-primary-soft os-text-primary os-font-semibold">.os-bg-primary-soft</div>
      <div className="os-p-6 os-rounded-lg os-glass os-shadow-glow">.os-glass .os-shadow-glow</div>
      <div className="os-p-6 os-rounded-lg os-bg-surface-3 os-flex os-flex-col md:os-flex-row os-gap-2 os-items-center">
        <span className="os-text-xs os-text-upper os-tracking-wider os-text-muted">flex</span>
        <span className="os-text-2xl os-font-display os-gradient-text">1SmUI</span>
      </div>
    </div>
  );
}
