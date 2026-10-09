export default function Example() {
  // CSS only: set data-strength="empty|weak|fair|good|strong" from your server or template.
  return (
    <div className="os-password-strength" data-strength="fair" style={{ maxWidth: '20rem' }}>
      <div className="os-password-strength__meter" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={4} aria-valuenow={2} aria-valuetext="Fair">
        <span className="os-password-strength__segment" />
        <span className="os-password-strength__segment" />
        <span className="os-password-strength__segment" />
        <span className="os-password-strength__segment" />
      </div>
      <p className="os-password-strength__label">
        Password strength: <strong>Fair</strong>
      </p>
    </div>
  );
}
