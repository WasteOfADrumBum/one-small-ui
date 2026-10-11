import { useId, useState } from 'react';
import { Button, Card, Field, Input, InputGroup, useFloating } from 'onesmallui';

export default function Example() {
  const [unit, setUnit] = useState('km');
  const [currency, setCurrency] = useState('CR');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const { anchorRef, floatingRef } = useFloating<HTMLButtonElement, HTMLDivElement>({ open: menuOpen, placement: 'bottom-end' });

  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <Field label="Coupon code">
        <InputGroup>
          <Input />
          <Button variant="outline">Apply</Button>
        </InputGroup>
      </Field>

      <Field label="Search the archive">
        <InputGroup>
          <Button variant="outline" color="neutral">Filters</Button>
          <Input type="search" />
          <Button>Search</Button>
          <Button variant="outline" color="neutral">Clear</Button>
        </InputGroup>
      </Field>

      <Field label="Distance">
        <InputGroup>
          <Input type="number" defaultValue={42} />
          {['km', 'AU', 'ly'].map((u) => (
            <Button key={u} variant={unit === u ? 'solid' : 'outline'} aria-pressed={unit === u} onClick={() => setUnit(u)}>
              {u}
            </Button>
          ))}
        </InputGroup>
      </Field>

      <Field label="Price">
        <InputGroup>
          <Input type="number" inputMode="decimal" />
          <Button ref={anchorRef} variant="outline" color="neutral" popoverTarget={menuId}>
            Currency: {currency}
          </Button>
        </InputGroup>
      </Field>
      {/* A native popover keeps this short: Escape and outside clicks close it. */}
      <div
        id={menuId}
        ref={floatingRef}
        popover="auto"
        className="os-floating"
        onToggle={(e) => setMenuOpen(e.newState === 'open')}
      >
        <Card variant="elevated" className="os-p-2 os-grid" role="group" aria-label="Currency">
          {['CR', 'USD', 'EUR'].map((c) => (
            <Button
              key={c}
              variant="ghost"
              color="neutral"
              popoverTarget={menuId}
              popoverTargetAction="hide"
              onClick={() => setCurrency(c)}
            >
              {c}
            </Button>
          ))}
        </Card>
      </div>
    </div>
  );
}
