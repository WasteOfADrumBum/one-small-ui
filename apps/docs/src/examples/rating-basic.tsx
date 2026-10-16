import { useState } from 'react';
import { HeartIcon, Rating } from '@onesmall/ui';

export default function Example() {
  const [value, setValue] = useState<number | null>(3.5);
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <div>
        <Rating label="Half steps, choose again to clear" precision={0.5} allowClear value={value} onValueChange={setValue} />
        <p>{value == null ? 'No rating yet.' : `You chose ${value} of 5.`}</p>
      </div>
      <Rating label="Ten-point scale" max={10} size="sm" defaultValue={7} color="primary" />
      <Rating label="Would you recommend us?" icon={HeartIcon} color="danger" size="lg" defaultValue={4} />
      <Rating label="Disabled" disabled defaultValue={2} />
      <p className="os-flex os-items-center os-gap-2">
        <Rating readOnly value={4.5} precision={0.5} size="sm" />
        <span>4.5 · 1,284 reviews</span>
      </p>
    </div>
  );
}
