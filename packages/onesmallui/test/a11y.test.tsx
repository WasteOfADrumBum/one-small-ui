// An axe (jest-axe) check for every component, in a realistic, labelled state.
// jsdom has no layout, so color contrast (checked on real pages by `npm run test:a11y`
// and on tokens by `npm run check:contrast`) and landmark rules are left to those checks.
import { createRef, type ReactElement } from 'react';
import { render } from '@testing-library/react';
import { configureAxe } from 'jest-axe';
import { CloseIcon, InfoIcon, SearchIcon } from '../src/icons';
import {
  Accordion,
  AnnouncerProvider,
  AccordionItem,
  Alert,
  AlertHeading,
  AlertLink,
  AspectRatio,
  Avatar,
  AvatarGroup,
  Badge,
  BadgeAnchor,
  Blockquote,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonGroup,
  ButtonToolbar,
  Calendar,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardImage,
  CardLink,
  CardText,
  CardTitle,
  Carousel,
  CarouselCaption,
  CarouselSlide,
  Checkbox,
  Chip,
  ChipGroup,
  ChipInput,
  CloseButton,
  CodeBlock,
  Collapse,
  CollapseTrigger,
  Collapsible,
  Combobox,
  CommandPalette,
  Container,
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  DatePicker,
  Dialog,
  Drawer,
  DropZone,
  Field,
  FieldGroup,
  FloatingLabel,
  Form,
  Grid,
  Image,
  Input,
  InputGroup,
  InputGroupText,
  Kbd,
  Lightbox,
  LightboxGallery,
  ListGroup,
  LiveRegion,
  ListGroupItem,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuDivider,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSub,
  MenuTrigger,
  Modal,
  Nav,
  NavItem,
  NavMenu,
  Navbar,
  NavbarText,
  OtpInput,
  Pagination,
  PasswordStrength,
  Placeholder,
  Popconfirm,
  Popover,
  Portal,
  Progress,
  ProgressStack,
  Radio,
  RadioGroup,
  Range,
  Rating,
  ScrollSpy,
  Select,
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
  SidebarToggle,
  Skeleton,
  SkipLink,
  SortableList,
  Spinner,
  Stack,
  Step,
  Stepper,
  Switch,
  Tab,
  Table,
  DataTable,
  TagInput,
  Timeline,
  TimelineItem,
  TimePicker,
  NumberInput,
  TabList,
  TabPanel,
  Tabs,
  Textarea,
  ThemeProvider,
  ThemeToggle,
  Toast,
  ToastProvider,
  ToastStack,
  ToggleButton,
  ToggleButtonGroup,
  Toggler,
  Tooltip,
  TooltipProvider,
  Transition,
  TreeView,
  Video,
  VisuallyHidden,
} from '../src';

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
    'color-contrast-enhanced': { enabled: false },
    region: { enabled: false },
  },
});

const options = [
  { value: 'mars', label: 'Mars' },
  { value: 'venus', label: 'Venus' },
  { value: 'titan', label: 'Titan', disabled: true },
];

const cases: Record<string, () => ReactElement> = {
  Accordion: () => (
    <Accordion type="single" defaultValue={['a']}>
      <AccordionItem value="a" title="Open item">
        Visible content.
      </AccordionItem>
      <AccordionItem value="b" title="Closed item">
        Hidden content.
      </AccordionItem>
    </Accordion>
  ),
  Alert: () => (
    <Alert color="warning" title="Low fuel" onDismiss={() => {}}>
      <AlertHeading>Refuel soon</AlertHeading>
      Reserves at 12%. <AlertLink href="#refuel">Find a station</AlertLink>
    </Alert>
  ),
  Avatar: () => (
    <AvatarGroup label="Crew" max={2}>
      <Avatar name="Ada Lovelace" status="online" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Mae Jemison" />
    </AvatarGroup>
  ),
  Badge: () => (
    <>
      <Badge color="success" dot>
        Online
      </Badge>
      <BadgeAnchor>
        <Avatar name="Sally Ride" />
        <Badge placement="top-end" color="danger" variant="solid">
          3 new messages
        </Badge>
      </BadgeAnchor>
    </>
  ),
  Blockquote: () => (
    <Blockquote source="Ada Lovelace" sourceTitle="Notes">
      <p>The engine weaves algebraic patterns.</p>
    </Blockquote>
  ),
  Breadcrumb: () => (
    <Breadcrumb>
      <BreadcrumbItem href="#home">Home</BreadcrumbItem>
      <BreadcrumbItem current>Fleet</BreadcrumbItem>
    </Breadcrumb>
  ),
  Button: () => (
    <>
      <Button>Launch</Button>
      <Button loading>Saving</Button>
      <Button href="#docs" variant="outline">
        Docs
      </Button>
    </>
  ),
  ButtonGroup: () => (
    <ButtonToolbar aria-label="Formatting">
      <ButtonGroup aria-label="History">
        <Button>Undo</Button>
        <Button>Redo</Button>
      </ButtonGroup>
      <ToggleButtonGroup aria-label="Alignment" type="single" defaultValue={['left']}>
        <ToggleButton value="left">Left</ToggleButton>
        <ToggleButton value="right">Right</ToggleButton>
      </ToggleButtonGroup>
      <ToggleButton name="bold">Bold</ToggleButton>
    </ButtonToolbar>
  ),
  Calendar: () => <Calendar aria-label="Launch day" defaultMonth={new Date(2026, 9, 1)} defaultValue={new Date(2026, 9, 9)} />,
  Card: () => (
    <Card as="article">
      <CardImage src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Earth from orbit" />
      <CardHeader>
        <CardTitle>Orbital relay</CardTitle>
      </CardHeader>
      <CardBody>
        <CardText>Relays telemetry.</CardText>
        <CardLink href="#relay">Details</CardLink>
      </CardBody>
      <CardFooter>
        <Button size="sm">Connect</Button>
      </CardFooter>
    </Card>
  ),
  Carousel: () => (
    <Carousel aria-label="Exoplanets">
      {['Kepler-22b', 'Proxima b'].map((name) => (
        <CarouselSlide key={name}>
          <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt={name} />
          <CarouselCaption>{name}</CarouselCaption>
        </CarouselSlide>
      ))}
    </Carousel>
  ),
  Checkbox: () => (
    <>
      <Checkbox label="Accept" description="Required to continue." required />
      <Checkbox label="Partly" indeterminate />
    </>
  ),
  Chip: () => (
    <>
      <ChipGroup aria-label="Destinations" selectionMode="multiple" defaultValue={['mars']}>
        <Chip value="mars">Mars</Chip>
        <Chip value="europa">Europa</Chip>
      </ChipGroup>
      <ChipGroup aria-label="Tags">
        <Chip onRemove={() => {}}>Removable</Chip>
      </ChipGroup>
      <Field label="Crew emails">
        <ChipInput defaultValue={['ada@station.io']} placeholder="Add email" />
      </Field>
    </>
  ),
  CloseButton: () => <CloseButton label="Close panel" />,
  CodeBlock: () => <CodeBlock title="launch.ts" language="ts" code={'export const go = () => true;'} />,
  Collapse: () => (
    <Collapsible defaultOpen>
      <CollapseTrigger>Mission details</CollapseTrigger>
      <Collapse>Launch at 06:40.</Collapse>
    </Collapsible>
  ),
  Combobox: () => (
    <Field label="Planet">
      <Combobox options={options} defaultValue="mars" />
    </Field>
  ),
  ContextMenu: () => (
    <ContextMenu defaultOpen>
      <ContextMenuTrigger>
        <button type="button">Cargo manifest</button>
      </ContextMenuTrigger>
      <ContextMenuContent aria-label="Manifest actions">
        <MenuItem shortcut="Ctrl+C">Copy</MenuItem>
        <MenuItem disabled>Jettison</MenuItem>
        <MenuDivider />
        <MenuCheckboxItem checked onCheckedChange={() => {}}>
          Pinned
        </MenuCheckboxItem>
        <MenuRadioGroup label="Sort by" value="mass" onValueChange={() => {}}>
          <MenuRadioItem value="mass">Mass</MenuRadioItem>
          <MenuRadioItem value="name">Name</MenuRadioItem>
        </MenuRadioGroup>
        <MenuSub label="Share">
          <MenuItem>Copy link</MenuItem>
        </MenuSub>
      </ContextMenuContent>
    </ContextMenu>
  ),
  DatePicker: () => (
    <>
      <Field label="Launch date">
        <DatePicker defaultValue={new Date(2026, 9, 9)} />
      </Field>
      <Field label="Return date">
        <DatePicker trigger="button" />
      </Field>
    </>
  ),
  Dialog: () => (
    <Dialog open onClose={() => {}} title="Rename vessel" description="Shown on manifests." footer={<Button>Save</Button>}>
      <Field label="Name">
        <Input defaultValue="Starlight" />
      </Field>
    </Dialog>
  ),
  Drawer: () => (
    <Drawer open onClose={() => {}} title="Filters">
      <Checkbox label="Only active" />
    </Drawer>
  ),
  DropZone: () => <DropZone accept="image/*" maxFiles={3} />,
  Field: () => (
    <FieldGroup legend="Contact" description="How we reach you.">
      <Field label="Email" hint="Never shared." error="Enter an email" required>
        <Input type="email" />
      </Field>
      <FloatingLabel label="Phone">
        <Input type="tel" />
      </FloatingLabel>
    </FieldGroup>
  ),
  Form: () => (
    <Form aria-label="Register">
      <Field label="Callsign" required>
        <Input />
      </Field>
      <Button type="submit">Register</Button>
    </Form>
  ),
  Input: () => (
    <Field label="Budget">
      <Input type="number" startAdornment="CR" defaultValue={1200} />
    </Field>
  ),
  InputGroup: () => (
    <Field label="Handle">
      <InputGroup>
        <InputGroupText>@</InputGroupText>
        <Input />
        <Button>Check</Button>
      </InputGroup>
    </Field>
  ),
  Layout: () => (
    <Container>
      <Stack gap={4}>
        <Grid columns={{ base: 1, md: 2 }}>
          <p>One</p>
          <p>Two</p>
        </Grid>
      </Stack>
    </Container>
  ),
  Lightbox: () => (
    <AnnouncerProvider>
      <Lightbox
        defaultOpen
        thumbnails
        defaultIndex={1}
        images={[
          { src: '/harbor.jpg', alt: 'Harbor at dawn', caption: 'Fishing boats leave at first light.' },
          { src: '/dunes.jpg', alt: 'Wind-carved dunes', download: true },
          { src: '/glacier.jpg', alt: 'Glacier tongue' },
        ]}
      />
    </AnnouncerProvider>
  ),
  LightboxGallery: () => (
    <LightboxGallery
      aria-label="Travel photos"
      images={[
        { src: '/harbor.jpg', alt: 'Harbor at dawn' },
        { src: '/dunes.jpg', alt: 'Wind-carved dunes' },
      ]}
    />
  ),
  ListGroup: () => (
    <ListGroup aria-label="Decks">
      <ListGroupItem active onClick={() => {}}>
        Bridge
      </ListGroupItem>
      <ListGroupItem onClick={() => {}}>Engineering</ListGroupItem>
      <ListGroupItem disabled onClick={() => {}}>
        Cargo
      </ListGroupItem>
    </ListGroup>
  ),
  Media: () => (
    <>
      <Image src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="A spiral galaxy" ratio={4 / 3} caption="Galaxy" />
      <Video
        label="Launch footage"
        sources={[{ src: 'launch.mp4', type: 'video/mp4' }]}
        tracks={[{ src: 'launch.vtt', srcLang: 'en', label: 'English', kind: 'captions', default: true }]}
      />
      <AspectRatio ratio={1}>
        <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="Saturn" />
      </AspectRatio>
    </>
  ),
  Menu: () => (
    <Menu defaultOpen>
      <MenuTrigger>
        <Button>Ship actions</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem shortcut="⌘R">Rename</MenuItem>
        <MenuItem disabled>Hyperjump</MenuItem>
        <MenuDivider />
        <MenuCheckboxItem checked onCheckedChange={() => {}}>
          Show grid
        </MenuCheckboxItem>
        <MenuRadioGroup label="Sort by" value="name" onValueChange={() => {}}>
          <MenuRadioItem value="name">Name</MenuRadioItem>
          <MenuRadioItem value="fuel">Fuel</MenuRadioItem>
        </MenuRadioGroup>
        <MenuSub label="More">
          <MenuItem>Archive</MenuItem>
        </MenuSub>
      </MenuContent>
    </Menu>
  ),
  Modal: () => (
    <Modal open onClose={() => {}} title="Legacy modal">
      Still works.
    </Modal>
  ),
  Nav: () => (
    <Nav aria-label="Sections" variant="tabs">
      <NavItem href="#a" active>
        Overview
      </NavItem>
      <NavItem href="#b">Fleet</NavItem>
      <NavMenu label="Systems">
        <MenuItem href="#c">Life support</MenuItem>
      </NavMenu>
    </Nav>
  ),
  Navbar: () => (
    <Navbar brand="Starlight" brandHref="#home" aria-label="Main">
      <Nav as="div">
        <NavItem href="#home" active>
          Home
        </NavItem>
      </Nav>
      <NavbarText>Signed in as Vega</NavbarText>
    </Navbar>
  ),
  OtpInput: () => (
    <Field label="Verification code">
      <OtpInput length={6} groupSize={3} />
    </Field>
  ),
  Pagination: () => <Pagination count={20} defaultPage={6} showFirstLast aria-label="Log pages" />,
  PasswordStrength: () => <PasswordStrength value="Orbit-2026!" showRules />,
  Popconfirm: () => (
    <Popconfirm defaultOpen variant="danger" title="Delete this draft?" message="You can restore it from the trash for 30 days." confirmLabel="Delete">
      <Button color="danger">Delete draft</Button>
    </Popconfirm>
  ),
  Popover: () => (
    <Popover defaultOpen title="Docking bay 7" content="Clear for landing.">
      <Button>Bay status</Button>
    </Popover>
  ),
  Progress: () => (
    <>
      <Progress label="Charging" value={40} showValue />
      <Progress label="Scanning" />
      <ProgressStack
        label="Cargo"
        legend
        segments={[
          { label: 'Food', value: 30, color: 'success' },
          { label: 'Fuel', value: 20, color: 'warning' },
        ]}
      />
    </>
  ),
  Radio: () => (
    <RadioGroup label="Plan" defaultValue="a" error="Pick a plan">
      <Radio value="a" label="Basic" />
      <Radio value="b" label="Pro" description="More cargo." />
    </RadioGroup>
  ),
  Range: () => (
    <Field label="Thrust">
      <Range defaultValue={40} showValue showMinMax ticks={[0, 50, 100]} />
    </Field>
  ),
  Rating: () => (
    <AnnouncerProvider>
      <Field label="Service" hint="1 is poor, 5 is excellent." required>
        <Rating name="service" precision={0.5} defaultValue={3.5} allowClear />
      </Field>
      <Rating label="Quality" defaultValue={2} />
      <Rating readOnly value={4.5} precision={0.5} />
    </AnnouncerProvider>
  ),
  ScrollSpy: () => (
    <>
      <ScrollSpy>
        <Nav aria-label="Phases" orientation="vertical">
          <NavItem href="#spy-a">Launch</NavItem>
          <NavItem href="#spy-b">Orbit</NavItem>
        </Nav>
      </ScrollSpy>
      <section id="spy-a" aria-label="Launch">
        Launch
      </section>
      <section id="spy-b" aria-label="Orbit">
        Orbit
      </section>
    </>
  ),
  Select: () => (
    <Field label="Planet">
      <Select placeholder="Choose" options={options} />
    </Field>
  ),
  Sidebar: () => (
    <Sidebar aria-label="App" defaultCollapsed>
      <SidebarHeader>
        <SidebarToggle />
      </SidebarHeader>
      <SidebarSection heading="Workspace">
        <SidebarItem href="/" icon={<InfoIcon />} active badge="2">
          Overview
        </SidebarItem>
        <SidebarGroup label="Search" icon={<SearchIcon />}>
          <SidebarItem href="/search/saved">Saved</SidebarItem>
        </SidebarGroup>
      </SidebarSection>
      <SidebarFooter>
        <SidebarSection>
          <SidebarItem href="/help" disabled>
            Help
          </SidebarItem>
        </SidebarSection>
      </SidebarFooter>
    </Sidebar>
  ),
  Skeleton: () => (
    <div role="group" aria-busy="true" aria-label="Loading profile">
      <Skeleton shape="circle" />
      <Skeleton lines={2} />
      <Placeholder width={60} />
    </div>
  ),
  SortableList: () => (
    <SortableList
      label="Tasks"
      items={[
        { id: 'a', title: 'Calibrate' },
        { id: 'b', title: 'Refuel' },
      ]}
      getKey={(t) => t.id}
      getItemLabel={(t) => t.title}
      onReorder={() => {}}
      renderItem={(t) => t.title}
    />
  ),
  Spinner: () => <Spinner label="Loading" />,
  Stepper: () => (
    <Stepper activeStep={1} aria-label="Checkout" onStepClick={() => {}}>
      <Step title="Cart" />
      <Step title="Shipping" />
      <Step title="Payment" status="error" description="Card declined" />
    </Stepper>
  ),
  Switch: () => <Switch label="Shields" description="Raise deflectors." defaultChecked />,
  Table: () => (
    <Table caption="Crew" responsive>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Role</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Ada</th>
          <td>Analyst</td>
        </tr>
      </tbody>
    </Table>
  ),
  Tabs: () => (
    <Tabs defaultValue="a">
      <TabList aria-label="Systems">
        <Tab value="a">Overview</Tab>
        <Tab value="b">Engines</Tab>
        <Tab value="c" disabled>
          Cargo
        </Tab>
      </TabList>
      <TabPanel value="a">All nominal.</TabPanel>
      <TabPanel value="b">82%.</TabPanel>
    </Tabs>
  ),
  DataTable: () => (
    <AnnouncerProvider>
      <DataTable
        caption="Crew"
        data={[
          { id: 'ada', name: 'Ada', role: 'Analyst' },
          { id: 'grace', name: 'Grace', role: 'Captain' },
        ]}
        columns={[
          { key: 'name', header: 'Name', sortable: true },
          { key: 'role', header: 'Role', sortable: true, hideable: true, filterable: true },
        ]}
        selectable
        searchable
        pagination
        pageSizeOptions={[5, 10]}
        name="crew"
        defaultSelectedIds={['ada']}
        defaultSort={[{ key: 'name', direction: 'ascending' }]}
        stickyHeader
        maxHeight="20rem"
      />
    </AnnouncerProvider>
  ),
  NumberInput: () => (
    <Field label="Ticket price" description="Before tax." required>
      <NumberInput name="price" locale="en-US" defaultValue={19.99} min={0} formatOptions={{ style: 'currency', currency: 'USD' }} />
    </Field>
  ),
  TagInput: () => (
    <>
      <Field label="Skills" description="Press Enter or comma to add.">
        <TagInput name="skills" defaultValue={['Design']} suggestions={['Design', 'Research']} />
      </Field>
      <TagInput aria-label="Labels" readOnly defaultValue={['Urgent']} />
    </>
  ),
  Timeline: () => (
    <AnnouncerProvider>
      <Timeline aria-label="Mission" pageSize={2} locale="en-US" timeZone="UTC">
        <TimelineItem title="Launch" status="success" time="2026-10-01T06:40:00Z" description="Pad 39A" actions={<Button size="sm">Details</Button>} />
        <TimelineItem title="Orbit" status="pending" time="2026-10-01" />
        <TimelineItem title="Docking" time="2026-10-02" />
      </Timeline>
      <Timeline variant="feed" aria-label="Activity" now={new Date('2026-10-16T12:00:00Z')} locale="en-US" timeZone="UTC">
        <TimelineItem actor="Ada Lovelace" action="commented" status="info" time="2026-10-16T11:55:00Z" />
      </Timeline>
    </AnnouncerProvider>
  ),
  TimePicker: () => (
    <Field label="Start time" hint="Every 15 minutes.">
      <TimePicker locale="en-US" defaultValue="09:30" name="start" isTimeDisabled={(v) => v === '12:00'} />
    </Field>
  ),
  Textarea: () => (
    <Field label="Notes">
      <Textarea autoResize />
    </Field>
  ),
  Theme: () => (
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  ),
  Toast: () => (
    <ToastProvider>
      <ToastStack placement="inline" label="Inline notifications">
        <Toast title="Saved" description="Your changes are live." onDismiss={() => {}} />
        <Toast color="danger" title="Failed" action={{ label: 'Retry', onClick: () => {} }} onDismiss={() => {}} />
      </ToastStack>
    </ToastProvider>
  ),
  Toggler: () => {
    const target = createRef<HTMLDivElement>();
    return (
      <>
        <Toggler target={target} toggleClass="os-shadow-glow">
          Glow
        </Toggler>
        <div ref={target} id="toggler-panel">
          Panel
        </div>
      </>
    );
  },
  Tooltip: () => (
    <TooltipProvider>
      <Tooltip content="Launch now" defaultOpen>
        <Button>Go</Button>
      </Tooltip>
    </TooltipProvider>
  ),
  Announcer: () => (
    <AnnouncerProvider>
      <p>Content</p>
      <LiveRegion>3 results</LiveRegion>
    </AnnouncerProvider>
  ),
  Icons: () => (
    <>
      <Button>
        <SearchIcon /> Search
      </Button>
      <InfoIcon label="Information" />
      <button type="button" aria-label="Close">
        <CloseIcon />
      </button>
    </>
  ),
  Portal: () => (
    <Portal>
      <p>Rendered in body</p>
    </Portal>
  ),
  CommandPalette: () => (
    <CommandPalette
      defaultOpen
      defaultQuery="se"
      groups={[
        {
          heading: 'Actions',
          items: [
            { id: 'settings', label: 'Open settings', shortcut: 'Mod+,', description: 'Preferences and themes' },
            { id: 'search', label: 'Search docs', href: '#search' },
            { id: 'locked', label: 'Reset everything', disabled: true },
          ],
        },
      ]}
    />
  ),
  TreeView: () => (
    <AnnouncerProvider>
      <TreeView
        aria-label="Files"
        selectionMode="multiple"
        items={[
          {
            id: 'docs',
            label: 'Documents',
            icon: <InfoIcon />,
            children: [
              { id: 'cv', label: 'CV.pdf' },
              { id: 'old', label: 'Old.pdf', disabled: true },
            ],
          },
          { id: 'home', label: 'Home', href: '#home' },
        ]}
        defaultExpandedKeys={['docs']}
        defaultSelectedKeys={['cv']}
      />
      <TreeView
        aria-label="Sync"
        checkboxes
        items={[{ id: 'a', label: 'Album', children: [{ id: 'a1', label: 'Track 1' }, { id: 'a2', label: 'Track 2' }] }]}
        defaultExpandedKeys={['a']}
        defaultCheckedKeys={['a1']}
      />
    </AnnouncerProvider>
  ),
  Kbd: () => (
    <p>
      Open search with <Kbd combo="Mod+K" />, close with <Kbd>Esc</Kbd>.
    </p>
  ),
  SkipLink: () => (
    <>
      <SkipLink href="#content" />
      <main id="content">Main</main>
    </>
  ),
  Transition: () => (
    <Transition show enter="slide-up">
      <div role="note">Saved</div>
    </Transition>
  ),
  VisuallyHidden: () => (
    <>
      <SkipLink />
      <main id="main">
        <Button>
          <VisuallyHidden>Open settings</VisuallyHidden>⚙
        </Button>
      </main>
    </>
  ),
};

describe('axe: every component', () => {
  it.each(Object.keys(cases))('%s has no detectable accessibility violations', async (name) => {
    const { container } = render(cases[name]!());
    expect(await axe(container)).toHaveNoViolations();
  });
});
