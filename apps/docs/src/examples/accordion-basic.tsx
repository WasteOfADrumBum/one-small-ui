import { Accordion, AccordionItem } from 'onesmallui';

export default function Example() {
  return (
    <Accordion type="single" defaultValue={['what']}>
      <AccordionItem value="what" title="What is OneSmallUI?">
        A React component library with SCSS tokens, light and dark themes, and WCAG AAA contrast.
      </AccordionItem>
      <AccordionItem value="classes" title="Can I use it without React?">
        Yes. Every component is styled by classes and data attributes, so plain HTML works too.
      </AccordionItem>
      <AccordionItem value="motion" title="Does it respect reduced motion?">
        All animations shrink to near zero when the operating system asks for reduced motion.
      </AccordionItem>
    </Accordion>
  );
}
