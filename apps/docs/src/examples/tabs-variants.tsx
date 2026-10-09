import { Button, Tab, TabList, TabPanel, Tabs } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-8">
      <Tabs defaultValue="a" variant="underline">
        <TabList aria-label="Underline tabs">
          <Tab value="a">Orbit</Tab>
          <Tab value="b">Descent</Tab>
          <Tab value="c">Landing</Tab>
        </TabList>
        <TabPanel value="a">Holding orbit at 400 km.</TabPanel>
        <TabPanel value="b">Descent burn in 12 minutes.</TabPanel>
        <TabPanel value="c">Landing zone is clear.</TabPanel>
      </Tabs>

      {/* List-group style, with manual activation: arrows move focus, Enter or Space selects. */}
      <Tabs defaultValue="a" variant="list" activation="manual">
        <TabList aria-label="Crew roster">
          <Tab value="a">Captain</Tab>
          <Tab value="b">Pilot</Tab>
          <Tab value="c">Engineer</Tab>
        </TabList>
        <TabPanel value="a">Captain Vega commands the ship.</TabPanel>
        <TabPanel value="b">Lt. Ortiz flies it.</TabPanel>
        <TabPanel value="c">Chief Ana keeps it running.</TabPanel>
      </Tabs>

      {/* Button triggers: render your own Button as each tab; no fade transition. */}
      <Tabs defaultValue="a" variant="button" fade={false}>
        <TabList aria-label="Units">
          <Tab value="a" asChild>
            <Button variant="outline" size="sm">
              Metric
            </Button>
          </Tab>
          <Tab value="b" asChild>
            <Button variant="outline" size="sm">
              Imperial
            </Button>
          </Tab>
        </TabList>
        <TabPanel value="a">Distance: 384,400 km.</TabPanel>
        <TabPanel value="b">Distance: 238,855 mi.</TabPanel>
      </Tabs>
    </div>
  );
}
