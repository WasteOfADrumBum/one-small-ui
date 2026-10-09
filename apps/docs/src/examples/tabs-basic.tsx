import { Tab, TabList, TabPanel, Tabs } from 'onesmallui';

export default function Example() {
  return (
    <div className="os-grid os-gap-8">
      <Tabs defaultValue="overview">
        <TabList aria-label="Ship systems">
          <Tab value="overview">Overview</Tab>
          <Tab value="engines">Engines</Tab>
          <Tab value="crew">Crew</Tab>
          <Tab value="cargo" disabled>
            Cargo
          </Tab>
        </TabList>
        <TabPanel value="overview">All systems are within normal range.</TabPanel>
        <TabPanel value="engines">Ion drives at 82% efficiency.</TabPanel>
        <TabPanel value="crew">Six crew members aboard.</TabPanel>
      </Tabs>

      <Tabs defaultValue="day" variant="pill">
        <TabList aria-label="Time range">
          <Tab value="day">Day</Tab>
          <Tab value="week">Week</Tab>
          <Tab value="month">Month</Tab>
        </TabList>
        <TabPanel value="day">Today: 3 jumps.</TabPanel>
        <TabPanel value="week">This week: 17 jumps.</TabPanel>
        <TabPanel value="month">This month: 64 jumps.</TabPanel>
      </Tabs>
    </div>
  );
}
