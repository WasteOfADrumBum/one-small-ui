// Position plus edge offsets (0, 50, 100%) and translate-middle to center on a point.
// start/end follow the text direction.
export default function Example() {
  const dot = 'os-absolute os-rounded-full os-bg-primary';
  const size = { width: '1rem', height: '1rem' };
  return (
    <div className="os-grid os-gap-6 md:os-grid-cols-2">
      <div className="os-relative os-rounded-lg os-bg-surface-2 os-border" style={{ height: '10rem' }} aria-hidden="true">
        <div className={`${dot} os-top-0 os-start-0`} style={size} />
        <div className={`${dot} os-top-0 os-end-0`} style={size} />
        <div className={`${dot} os-top-50 os-start-50 os-translate-middle`} style={size} />
        <div className={`${dot} os-bottom-0 os-start-0`} style={size} />
        <div className={`${dot} os-bottom-0 os-end-0`} style={size} />
      </div>
      <div className="os-flex os-items-center os-justify-center">
        <button type="button" className="os-relative os-px-4 os-py-2 os-rounded-md os-text-bg-primary os-border-0" style={{ minHeight: 44 }}>
          Inbox
          <span className="os-absolute os-top-0 os-start-100 os-translate-middle os-px-2 os-rounded-pill os-text-bg-danger os-text-xs">
            99+<span className="os-visually-hidden"> unread messages</span>
          </span>
        </button>
      </div>
    </div>
  );
}
