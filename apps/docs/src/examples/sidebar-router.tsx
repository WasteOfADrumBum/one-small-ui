import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { Sidebar, SidebarItem, SidebarSection } from '@onesmall/ui';

// Stand-in for your router's link (Next.js `Link`, React Router `NavLink`, ...).
const RouterLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function RouterLink(props, ref) {
  return <a ref={ref} {...props} />;
});

export default function Example() {
  return (
    <div className="os-rounded-lg os-border" style={{ display: 'flex', overflow: 'hidden' }}>
      <Sidebar aria-label="Router example" drawerBelow={false}>
        <SidebarSection heading="Docs">
          {/* `as`: the component gets href, aria-current, className and onClick. */}
          <SidebarItem as={RouterLink} href="#components/sidebar" active>
            Sidebar
          </SidebarItem>
          {/* `render`: full control; spread every prop onto your element. */}
          <SidebarItem href="#components/navbar" render={(props) => <RouterLink {...props} />}>
            Navbar
          </SidebarItem>
        </SidebarSection>
      </Sidebar>
    </div>
  );
}
