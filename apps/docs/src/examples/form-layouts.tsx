import { Button, Checkbox, Field, Form, Input, Select, Tab, TabList, TabPanel, Tabs } from 'onesmallui';

const layouts = ['vertical', 'horizontal', 'inline', 'grid'] as const;

export default function Example() {
  return (
    <Tabs defaultValue="horizontal">
      <TabList aria-label="Form layout">
        {layouts.map((l) => (
          <Tab key={l} value={l}>
            {l}
          </Tab>
        ))}
      </TabList>
      {layouts.map((l) => (
        <TabPanel key={l} value={l} className="os-pt-4">
          <Form layout={l} columns={2} aria-label={`${l} form`} onSubmit={(e) => e.preventDefault()}>
            <Field label="Email">
              <Input type="email" autoComplete="email" />
            </Field>
            <Field label="Role">
              <Select options={[{ value: 'pilot', label: 'Pilot' }, { value: 'eng', label: 'Engineer' }]} />
            </Field>
            <Checkbox label="Remember me" />
            <div>
              <Button type="submit">Sign in</Button>
            </div>
          </Form>
        </TabPanel>
      ))}
    </Tabs>
  );
}
