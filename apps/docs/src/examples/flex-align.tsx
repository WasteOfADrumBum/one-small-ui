// Direction, wrapping, grow/shrink, alignment and gaps (all with responsive md: variants).
export default function Example() {
  const item = 'os-p-3 os-rounded-md os-bg-surface-3 os-border';
  return (
    <div className="os-grid os-gap-6">
      <div className="os-flex os-flex-col sm:os-flex-row os-gap-3 os-items-center os-justify-between os-p-3 os-rounded-lg os-bg-surface-2">
        <div className={item}>flex-col → sm:flex-row</div>
        <div className={`${item} os-grow`}>.os-grow</div>
        <div className={`${item} os-shrink-0`}>.os-shrink-0</div>
      </div>
      <div className="os-flex os-flex-wrap os-content-between os-gap-x-6 os-gap-y-2 os-p-3 os-rounded-lg os-bg-surface-2" style={{ height: '9rem' }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={item}>
            Item {i + 1}
          </div>
        ))}
      </div>
      <div className="os-flex os-items-start os-gap-3 os-p-3 os-rounded-lg os-bg-surface-2" style={{ height: '7rem' }}>
        <div className={item}>items-start</div>
        <div className={`${item} os-self-center`}>.os-self-center</div>
        <div className={`${item} os-self-end`}>.os-self-end</div>
        <div className={`${item} os-self-stretch`}>.os-self-stretch</div>
      </div>
    </div>
  );
}
