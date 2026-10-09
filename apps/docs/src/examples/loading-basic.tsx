import { useEffect, useState } from 'react';
import { Progress, Skeleton, Spinner } from 'onesmallui';

export default function Example() {
  const [value, setValue] = useState(20);
  useEffect(() => {
    const t = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 10)), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="os-grid os-gap-6 md:os-grid-cols-2">
      <div className="os-grid os-gap-4">
        <Progress label="Charging hyperdrive" value={value} showValue />
        <Progress label="Scanning" color="accent" />
        <Progress label="Fuel" value={34} color="warning" size="sm" showValue />
        <div className="os-flex os-items-center os-gap-4">
          <Spinner size="sm" />
          <Spinner />
          <Spinner size="lg" label="Loading star charts" />
        </div>
      </div>
      <div className="os-flex os-gap-4" role="group" aria-busy="true" aria-label="Loading profile">
        <Skeleton shape="circle" />
        <div className="os-flex-1 os-grid os-gap-3">
          <Skeleton width="40%" />
          <Skeleton lines={3} />
          <Skeleton shape="rect" height="5rem" />
        </div>
      </div>
    </div>
  );
}
