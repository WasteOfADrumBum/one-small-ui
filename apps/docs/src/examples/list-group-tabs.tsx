import { Tab, TabList, TabPanel, Tabs } from 'onesmallui';

export default function Example() {
  // A list group that controls tab content: style a vertical TabList as a list group.
  return (
    <Tabs defaultValue="engines" orientation="vertical">
      <TabList aria-label="Ship systems" className="os-list-group">
        <Tab value="engines" className="os-list-group__item">
          Engines
        </Tab>
        <Tab value="shields" className="os-list-group__item">
          Shields
        </Tab>
        <Tab value="comms" className="os-list-group__item">
          Comms
        </Tab>
      </TabList>
      <TabPanel value="engines">Ion drives at 82% efficiency. Next service in 40 days.</TabPanel>
      <TabPanel value="shields">Deflectors holding at full strength.</TabPanel>
      <TabPanel value="comms">Relay latency is 4.2 seconds.</TabPanel>
    </Tabs>
  );
}
