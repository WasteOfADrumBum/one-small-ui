import { useEffect, useState } from 'react';
import { Accordion, AccordionItem, Switch } from 'onesmallui';

// data-os-motion="off" collapses every duration under that element.
// prefers-reduced-motion does the same automatically.
export default function Example() {
  const [motion, setMotion] = useState(true);
  useEffect(() => () => document.documentElement.removeAttribute('data-os-motion'), []);
  return (
    <div className="os-grid os-gap-4" data-os-motion={motion ? undefined : 'off'}>
      <Switch label="Animations" checked={motion} onChange={(e) => setMotion(e.target.checked)} />
      <Accordion defaultValue={['a']}>
        <AccordionItem value="a" title="Open and close me">
          With animations off, panels open instantly.
        </AccordionItem>
        <AccordionItem value="b" title="And me">
          Durations come from --os-duration-* tokens.
        </AccordionItem>
      </Accordion>
    </div>
  );
}
