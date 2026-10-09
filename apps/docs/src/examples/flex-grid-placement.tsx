// Grid templates and placement: columns, rows, starts/ends, spans, justify and place items.
export default function Example() {
  const item = 'os-p-3 os-rounded-md os-bg-surface-3 os-border';
  return (
    <div className="os-grid os-gap-6">
      <div className="os-grid os-grid-cols-4 os-grid-rows-2 os-gap-2">
        <div className={`${item} os-col-span-2 os-row-span-2`}>.os-col-span-2 .os-row-span-2</div>
        <div className={`${item} os-col-start-4`}>.os-col-start-4</div>
        <div className={`${item} os-col-start-3 os-col-end-5`}>.os-col-start-3 .os-col-end-5</div>
      </div>
      <div className="os-grid os-grid-cols-3 os-justify-items-center os-gap-2 os-p-2 os-rounded-lg os-bg-surface-2">
        <div className={item}>justify-items-center</div>
        <div className={`${item} os-justify-self-end`}>.os-justify-self-end</div>
        <div className={`${item} os-justify-self-stretch`}>stretch</div>
      </div>
      <div className="os-grid os-place-items-center os-rounded-lg os-bg-surface-2" style={{ height: '6rem' }}>
        <div className={item}>.os-place-items-center</div>
      </div>
    </div>
  );
}
