import { Accordion, AccordionItem } from 'onesmallui';

const Plus = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d={open ? 'M5 12h14' : 'M12 5v14M5 12h14'} />
  </svg>
);

export default function Example() {
  return (
    <div className="os-grid os-gap-6 md:os-grid-cols-2">
      <Accordion type="multiple" defaultValue={['deck-1']}>
        <AccordionItem value="deck-1" title="Deck 1">
          <p>Command and navigation.</p>
          {/* Nested accordion: drop the heading level by one. */}
          <Accordion variant="spaced" size="sm" headingLevel={4}>
            <AccordionItem value="bridge" title="Bridge">
              Captain's chair, helm and tactical stations.
            </AccordionItem>
            <AccordionItem value="ready-room" title="Ready room">
              Briefings happen here.
            </AccordionItem>
          </Accordion>
        </AccordionItem>
        <AccordionItem value="deck-2" title="Deck 2">
          Crew quarters and the mess hall.
        </AccordionItem>
      </Accordion>

      {/* A render function gets the open state; a plain node is rotated for you. */}
      <Accordion indicator={(open) => <Plus open={open} />}>
        <AccordionItem value="a" title="Custom plus / minus indicator">
          Pass <code>indicator</code> on the accordion or on a single item.
        </AccordionItem>
        <AccordionItem value="b" title="Rotated arrow" indicator={<span>▾</span>}>
          A node indicator is rotated 180° when open.
        </AccordionItem>
      </Accordion>
    </div>
  );
}
