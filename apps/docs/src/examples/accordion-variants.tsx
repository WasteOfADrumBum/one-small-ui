import { Accordion, AccordionItem } from 'onesmallui';

// Region landmarks are named by their trigger, so keep titles unique on the page.
const items = {
  default: ['Launch window', 'Fuel reserves', 'Crew rotation'],
  flush: ['Docking ports', 'Airlocks', 'Cargo bays'],
  spaced: ['Comms array', 'Solar panels', 'Radiators'],
};

export default function Example() {
  return (
    <div className="os-grid os-gap-6 md:os-grid-cols-3">
      {(['default', 'flush', 'spaced'] as const).map((variant) => (
        <div key={variant} className="os-grid os-gap-2">
          <p className="os-text-sm os-font-semibold">
            <code>variant="{variant}"</code>, <code>size="sm"</code>
          </p>
          <Accordion variant={variant} size="sm" defaultValue={[items[variant][0]!]}>
            {items[variant].map((title) => (
              <AccordionItem key={title} value={title} title={title}>
                Status and maintenance notes for {title.toLowerCase()}.
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
