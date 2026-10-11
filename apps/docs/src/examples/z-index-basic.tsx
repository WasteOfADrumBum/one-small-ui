// Low layers for local stacking, named layers from the $z-index map for app chrome.
export default function Example() {
  const box = 'os-absolute os-p-3 os-rounded-md os-border os-shadow';
  return (
    <div className="os-relative" style={{ height: '9rem' }}>
      <div className={`${box} os-z-0 os-bg-surface-3`} style={{ insetInlineStart: 0, top: 0, width: '12rem' }}>
        .os-z-0
      </div>
      <div className={`${box} os-z-1 os-bg-surface-2`} style={{ insetInlineStart: '2rem', top: '1.5rem', width: '12rem' }}>
        .os-z-1
      </div>
      <div className={`${box} os-z-2 os-bg-surface`} style={{ insetInlineStart: '4rem', top: '3rem', width: '12rem' }}>
        .os-z-2
      </div>
      <div className={`${box} os-z-3 os-text-bg-primary`} style={{ insetInlineStart: '6rem', top: '4.5rem', width: '12rem' }}>
        .os-z-3
      </div>
    </div>
  );
}
