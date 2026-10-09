import { useState } from 'react';
import { Accordion, AccordionItem, Button } from 'onesmallui';

const sections = [
  { value: 'nav', title: 'Navigation', body: 'Star charts are synced every hour.' },
  { value: 'comms', title: 'Communications', body: 'Deep-space relay latency is 4.2 seconds.' },
  { value: 'life', title: 'Life support', body: 'Oxygen scrubbers run at full capacity.' },
];
const all = sections.map((s) => s.value);

export default function Example() {
  // Controlled `value` + type="multiple" gives you expand all / collapse all.
  const [open, setOpen] = useState<string[]>(['nav']);
  return (
    <div className="os-grid os-gap-3">
      <div className="os-flex os-flex-wrap os-gap-2">
        <Button size="sm" variant="soft" onClick={() => setOpen(all)}>
          Expand all
        </Button>
        <Button size="sm" variant="soft" onClick={() => setOpen([])}>
          Collapse all
        </Button>
      </div>
      <Accordion type="multiple" value={open} onValueChange={setOpen}>
        {sections.map((s) => (
          <AccordionItem key={s.value} value={s.value} title={s.title}>
            {s.body}
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
