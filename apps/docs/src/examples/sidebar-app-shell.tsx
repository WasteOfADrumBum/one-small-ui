import {
  Container,
  HomeIcon,
  Navbar,
  SettingsIcon,
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarProvider,
  SidebarSection,
  SidebarToggle,
  SkipLink,
  Stack,
  UserIcon,
} from '@onesmall/ui';

const here = '#components/sidebar';

// A whole app shell. The navbar's toggle collapses the sidebar to a rail; below 1024px it opens a drawer.
// In your app, the content area is <main id="main"> and the shell fills the viewport.
export default function Example() {
  return (
    <SidebarProvider>
      <div className="os-relative os-rounded-lg os-border" style={{ display: 'flex', height: '28rem', overflow: 'hidden' }}>
        <SkipLink targetId="shell-content" />
        <Sidebar aria-label="App">
          <SidebarHeader>
            <span className="os-sidebar__label">Starlight</span>
          </SidebarHeader>
          <SidebarSection heading="Fleet">
            <SidebarItem href={here} icon={<HomeIcon />} active>
              Dashboard
            </SidebarItem>
            <SidebarItem href={here} icon={<UserIcon />} badge="3">
              Crew
            </SidebarItem>
            <SidebarGroup label="Settings" icon={<SettingsIcon />}>
              <SidebarItem href={here}>Profile</SidebarItem>
              <SidebarItem href={here}>Billing</SidebarItem>
            </SidebarGroup>
          </SidebarSection>
          <SidebarFooter>
            <span className="os-sidebar__label os-text-sm os-text-muted">Signed in as Vega</span>
          </SidebarFooter>
        </Sidebar>
        <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
          <Navbar brand="Dashboard" brandHref={null} expand="always" aria-label="Page" actions={<SidebarToggle />} />
          <div id="shell-content" role="region" aria-label="Dashboard" className="os-p-4" style={{ overflow: 'auto' }}>
            <Container size="full">
              <h3>Fleet status</h3>
              <p>Tab into this preview: the skip link appears first and jumps past both navigation bars.</p>
            </Container>
          </div>
        </Stack>
      </div>
    </SidebarProvider>
  );
}
