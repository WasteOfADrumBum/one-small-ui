import { useEffect, useState } from 'react';
import { Progress } from 'onesmallui';

const colors = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'inverse'] as const;

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
        <Progress label="Scanning (indeterminate)" color="accent" />
        <Progress label="Small" value={34} size="sm" showValue />
        <Progress label="Large" value={58} size="lg" showValue />
        <Progress label="Custom height (2px)" value={72} height={2} />
        <Progress label="Half width" value={45} style={{ inlineSize: '50%' }} />
      </div>
      <div className="os-grid os-gap-3">
        {colors.map((c, i) => (
          <Progress key={c} label={c} color={c} value={30 + i * 9} />
        ))}
      </div>
    </div>
  );
}
