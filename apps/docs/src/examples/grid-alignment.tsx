// Rows are flex containers: align vertically with os-items-* / os-self-*, horizontally with os-justify-*.
export default function Example() {
  const c = 'os-p-3 os-rounded-md os-bg-surface-2 os-border';
  return (
    <div className="os-grid os-gap-4">
      <div className="os-row os-items-center os-bg-surface-3 os-rounded-lg" style={{ minHeight: '7rem' }}>
        <div className="os-col">
          <div className={c}>.os-items-center</div>
        </div>
        <div className="os-col os-self-start">
          <div className={c}>.os-self-start</div>
        </div>
        <div className="os-col os-self-end">
          <div className={c}>.os-self-end</div>
        </div>
      </div>
      <div className="os-row os-justify-between">
        <div className="os-col-4">
          <div className={c}>.os-justify-between</div>
        </div>
        <div className="os-col-4">
          <div className={c}>.os-col-4</div>
        </div>
      </div>
      <div className="os-row os-justify-center">
        <div className="os-col-4">
          <div className={c}>.os-justify-center</div>
        </div>
      </div>
    </div>
  );
}
