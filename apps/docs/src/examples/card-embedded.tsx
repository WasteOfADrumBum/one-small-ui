import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardText,
  CardTitle,
  ListGroup,
  ListGroupItem,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-4 md:os-grid-cols-2">
      <Card as="article">
        <CardBody>
          <CardTitle>Crew roster</CardTitle>
          <CardText>A flush list group sits edge to edge inside the card.</CardText>
        </CardBody>
        <ListGroup flush>
          <ListGroupItem end={<Badge color="success">On duty</Badge>}>Commander Vega</ListGroupItem>
          <ListGroupItem end={<Badge>Resting</Badge>}>Engineer Ito</ListGroupItem>
          <ListGroupItem end={<Badge color="success">On duty</Badge>}>Pilot Rao</ListGroupItem>
        </ListGroup>
      </Card>

      <Card as="section" aria-label="Ship systems">
        <Tabs defaultValue="engines">
          <CardHeader>
            <TabList aria-label="Ship systems">
              <Tab value="engines">Engines</Tab>
              <Tab value="shields">Shields</Tab>
              <Tab value="comms">Comms</Tab>
            </TabList>
          </CardHeader>
          <CardBody>
            <TabPanel value="engines">Ion drives at 82% efficiency.</TabPanel>
            <TabPanel value="shields">Deflectors holding at full strength.</TabPanel>
            <TabPanel value="comms">Relay latency is 4.2 seconds.</TabPanel>
          </CardBody>
        </Tabs>
      </Card>
    </div>
  );
}
