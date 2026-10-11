import { Accordion, AccordionItem } from 'onesmallui';

export default function Example() {
  // Native <details>/<summary>: works before JavaScript loads, and type="single"
  // uses the exclusive `name` attribute so the browser closes the others.
  return (
    <Accordion native type="single" defaultValue={['orbit']}>
      <AccordionItem value="orbit" title="What is a low orbit?">
        Anything below about 2,000 km above the surface.
      </AccordionItem>
      <AccordionItem value="geo" title="And a geostationary orbit?">
        35,786 km up, where a satellite keeps pace with the planet's rotation.
      </AccordionItem>
      <AccordionItem value="locked" title="Classified orbits" disabled>
        Not available.
      </AccordionItem>
    </Accordion>
  );
}
