import { ListGroup, ListGroupItem } from 'onesmallui';

const colors = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'inverse'] as const;

export default function Example() {
  return (
    <div className="os-grid os-gap-6">
      <div className="os-grid os-gap-6 md:os-grid-cols-3">
        <ListGroup flush aria-label="Flush list">
          <ListGroupItem>Flush: no outer border</ListGroupItem>
          <ListGroupItem>For use inside cards</ListGroupItem>
          <ListGroupItem>And sidebars</ListGroupItem>
        </ListGroup>

        <ListGroup numbered aria-label="Launch checklist">
          <ListGroupItem>Seal hatches</ListGroupItem>
          <ListGroupItem>Arm boosters</ListGroupItem>
          <ListGroupItem>Ignition</ListGroupItem>
        </ListGroup>

        <ListGroup aria-label="Theme colors" size="sm">
          {colors.map((c) => (
            <ListGroupItem key={c} color={c}>
              {c}
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>

      {/* Horizontal from the md breakpoint up; stacked below it. */}
      <ListGroup horizontal="md" aria-label="Flight phases">
        <ListGroupItem>Launch</ListGroupItem>
        <ListGroupItem active>Orbit</ListGroupItem>
        <ListGroupItem>Transfer</ListGroupItem>
        <ListGroupItem>Landing</ListGroupItem>
      </ListGroup>
    </div>
  );
}
