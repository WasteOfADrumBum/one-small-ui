import { Button, Collapse, useDisclosure } from 'onesmallui';

export default function Example() {
  // Drive a Collapse from code: `open` plus any button wired with aria-expanded / aria-controls.
  const filters = useDisclosure();
  return (
    <div className="os-grid os-gap-3">
      <div className="os-flex os-flex-wrap os-gap-2">
        <Button aria-expanded={filters.isOpen} aria-controls="flight-filters" onClick={filters.toggle}>
          {filters.isOpen ? 'Hide filters' : 'Show filters'}
        </Button>
        <Button variant="ghost" onClick={filters.open}>
          Open from code
        </Button>
      </div>
      <Collapse id="flight-filters" open={filters.isOpen}>
        <div className="os-p-4 os-rounded-lg os-bg-surface-2">Filters: destination, departure window, seat class.</div>
      </Collapse>
    </div>
  );
}
