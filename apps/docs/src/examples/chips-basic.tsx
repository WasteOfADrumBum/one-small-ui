import { useState } from 'react';
import { Avatar, Chip, ChipGroup, type ThemeColor } from 'onesmallui';

const colors: ThemeColor[] = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'inverse'];
const Star = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
  </svg>
);

export default function Example() {
  const [tags, setTags] = useState(['Mars', 'Europa', 'Titan']);
  return (
    <div className="os-grid os-gap-6">
      <ChipGroup aria-label="Colors">
        <Chip>Neutral</Chip>
        {colors.map((c) => (
          <Chip key={c} color={c}>
            {c}
          </Chip>
        ))}
      </ChipGroup>
      <ChipGroup aria-label="Variants and media">
        <Chip variant="solid" color="accent" icon={<Star />}>
          Featured
        </Chip>
        <Chip variant="outline" color="info">
          Outline
        </Chip>
        <Chip avatar={<Avatar name="Ada Lovelace" size="sm" />}>Ada Lovelace</Chip>
        <Chip size="sm">Small</Chip>
        <Chip size="lg">Large</Chip>
      </ChipGroup>
      <ChipGroup aria-label="Destinations (Delete removes the focused chip)">
        {tags.map((t) => (
          <Chip key={t} color="primary" onRemove={() => setTags(tags.filter((x) => x !== t))}>
            {t}
          </Chip>
        ))}
        {tags.length === 0 && <span className="os-text-sm">No destinations.</span>}
      </ChipGroup>
    </div>
  );
}
