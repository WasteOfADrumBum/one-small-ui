import { HomeIcon, SettingsIcon, Sidebar, SidebarFooter, SidebarHeader, SidebarItem, SidebarSection, SidebarToggle, UserIcon } from '@onesmall/ui';

const here = '#components/sidebar';

// Collapsed to an icon rail: hover or focus an item to see its label. persistKey remembers the choice.
export default function Example() {
  return (
    <div className="os-rounded-lg os-border" style={{ display: 'flex', height: '24rem', overflow: 'hidden' }}>
      <Sidebar aria-label="Rail example" defaultCollapsed persistKey="docs-sidebar-rail" drawerBelow={false}>
        <SidebarHeader>
          <span className="os-sidebar__label">Starlight</span>
          <SidebarToggle />
        </SidebarHeader>
        <SidebarSection heading="Fleet">
          <SidebarItem href={here} icon={<HomeIcon />} active>
            Dashboard
          </SidebarItem>
          <SidebarItem href={here} icon={<UserIcon />} badge="3">
            Crew
          </SidebarItem>
          <SidebarItem href={here} disabled>
            Reports
          </SidebarItem>
        </SidebarSection>
        <SidebarFooter>
          <SidebarSection>
            <SidebarItem href={here} icon={<SettingsIcon />}>
              Settings
            </SidebarItem>
          </SidebarSection>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
