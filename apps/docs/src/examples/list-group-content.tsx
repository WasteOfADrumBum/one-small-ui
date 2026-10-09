import { Badge, Checkbox, ListGroup, ListGroupItem, Radio } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-6 md:os-grid-cols-3">
      <ListGroup aria-label="Inbox">
        <ListGroupItem end={<Badge color="primary" variant="solid">14</Badge>}>Transmissions</ListGroupItem>
        <ListGroupItem end={<Badge color="danger" variant="solid">2</Badge>}>Alerts</ListGroupItem>
        <ListGroupItem href="#components/list-group" end={<Badge>1</Badge>}>
          <span className="os-font-semibold">Supply manifest</span>
          <br />
          <span className="os-text-sm os-text-muted">Custom content with a heading and detail line</span>
        </ListGroupItem>
      </ListGroup>

      <ListGroup aria-label="Systems to check">
        <ListGroupItem>
          <Checkbox label="Thrusters" defaultChecked />
        </ListGroupItem>
        <ListGroupItem>
          <Checkbox label="Life support" />
        </ListGroupItem>
        <ListGroupItem>
          <Checkbox label="Comms array" />
        </ListGroupItem>
      </ListGroup>

      <fieldset className="os-m-0 os-p-0" style={{ border: 0 }}>
        <legend className="os-text-sm os-font-semibold os-mb-2">Seat class</legend>
        <ListGroup>
          <ListGroupItem>
            <Radio name="seat" value="economy" label="Economy" defaultChecked />
          </ListGroupItem>
          <ListGroupItem>
            <Radio name="seat" value="business" label="Business" />
          </ListGroupItem>
          <ListGroupItem>
            <Radio name="seat" value="captain" label="Captain's table" />
          </ListGroupItem>
        </ListGroup>
      </fieldset>
    </div>
  );
}
