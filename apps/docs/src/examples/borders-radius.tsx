// Radius: all corners, one logical side, circle and pill. Dividers draw rules between children.
export default function Example() {
  const box = 'os-p-3 os-bg-primary-soft os-border os-text-sm';
  return (
    <div className="os-grid os-gap-6">
      <div className="os-grid os-gap-2 sm:os-grid-cols-4">
        {['none', 'sm', '', 'lg', 'xl', 'pill'].map((r) => (
          <div key={r} className={`${box} os-rounded${r ? `-${r}` : ''}`}>
            .os-rounded{r ? `-${r}` : ''}
          </div>
        ))}
        <div className={`${box} os-rounded-top-lg`}>.os-rounded-top-lg</div>
        <div className={`${box} os-rounded-end-lg`}>.os-rounded-end-lg</div>
        <div className={`${box} os-rounded-bottom-lg`}>.os-rounded-bottom-lg</div>
        <div className={`${box} os-rounded-start-lg`}>.os-rounded-start-lg</div>
        <div className={`${box} os-rounded-circle os-ratio-1x1 os-flex os-items-center os-justify-center`} style={{ width: '6rem' }}>
          circle
        </div>
      </div>
      <div className="os-grid os-gap-4 md:os-grid-cols-2">
        <ul className="os-list-unstyled os-divide-y os-border os-rounded-md" role="list">
          {['.os-divide-y', 'draws a rule', 'between rows'].map((t) => (
            <li key={t} className="os-p-3">
              {t}
            </li>
          ))}
        </ul>
        <div className="os-flex os-divide-x os-divide-strong os-border os-rounded-md">
          {['.os-divide-x', '.os-divide-strong', 'logical'].map((t) => (
            <div key={t} className="os-p-3 os-grow">
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
