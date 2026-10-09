import { useState } from 'react';
import { SortableList } from 'onesmallui';

export default function Example() {
  const [planets, setPlanets] = useState(['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter']);
  return (
    <SortableList
      label="Planets in visiting order"
      orientation="horizontal"
      handle={false}
      items={planets}
      getKey={(p) => p}
      getItemLabel={(p) => p}
      onReorder={setPlanets}
      renderItem={(p) => <span className="os-font-semibold">{p}</span>}
    />
  );
}
