import { forwardRef, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarProvider,
  SidebarSection,
  SidebarToggle,
  useSidebar,
  type SidebarProps,
} from '../src/components/Sidebar';
import { Tooltip } from '../src/components/Tooltip';
import { HomeIcon } from '../src/icons/HomeIcon';
import { SettingsIcon } from '../src/icons/SettingsIcon';
import { UserIcon } from '../src/icons/UserIcon';

/** Pretends the viewport is below every breakpoint (`narrow`) or above them. */
function viewport(narrow: boolean) {
  return vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: narrow && query.includes('max-width'),
        media: query,
        addEventListener() {},
        removeEventListener() {},
      }) as never,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

async function expectNoAxeViolations(container: HTMLElement) {
  for (const theme of ['light', 'dark']) {
    document.documentElement.setAttribute('data-os-theme', theme);
    const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
    expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  }
  document.documentElement.removeAttribute('data-os-theme');
}

type DemoProps = Partial<SidebarProps> & { children?: ReactNode };

function Demo({ children, ...props }: DemoProps) {
  return (
    <Sidebar aria-label="Main" {...(props as object)}>
      <SidebarHeader>
        <span className="os-sidebar__label">Starlight</span>
        <SidebarToggle />
      </SidebarHeader>
      <SidebarSection heading="Workspace">
        <SidebarItem href="/" icon={<HomeIcon />} active>
          Dashboard
        </SidebarItem>
        <SidebarItem href="/crew" icon={<UserIcon />} badge="3">
          Crew
        </SidebarItem>
        <SidebarGroup label="Settings" icon={<SettingsIcon />}>
          <SidebarItem href="/settings/profile">Profile</SidebarItem>
          <SidebarItem href="/settings/billing">Billing</SidebarItem>
        </SidebarGroup>
      </SidebarSection>
      {children}
      <SidebarFooter>
        <SidebarSection>
          <SidebarItem href="/help">Help</SidebarItem>
        </SidebarSection>
      </SidebarFooter>
    </Sidebar>
  );
}

const nav = () => screen.getByRole('navigation', { name: 'Main' });
const tooltipOf = (el: HTMLElement) => el.closest('.os-sidebar__tip')!.querySelector('.os-tooltip__content')!;

describe('Sidebar: structure', () => {
  it('is a labelled <nav> landmark with header, sections and footer', () => {
    render(<Demo />);
    const root = nav();
    expect(root.tagName).toBe('NAV');
    expect(root).toHaveAttribute('data-mode', 'expanded');
    expect(root.querySelector('.os-sidebar__header')).toHaveTextContent('Starlight');
    expect(root.querySelector('.os-sidebar__footer')).toHaveTextContent('Help');
    // Header first, footer last, sections in the scrolling body between them.
    const parts = Array.from(root.children).map((c) => c.className);
    expect(parts).toEqual(['os-sidebar__header', 'os-sidebar__body', 'os-sidebar__footer']);
  });

  it('accepts aria-labelledby instead of aria-label', () => {
    render(
      <>
        <h2 id="app-nav">App</h2>
        <Sidebar aria-labelledby="app-nav">
          <SidebarSection>
            <SidebarItem href="/">Home</SidebarItem>
          </SidebarSection>
        </Sidebar>
      </>,
    );
    expect(screen.getByRole('navigation', { name: 'App' })).toBeInTheDocument();
  });

  it('section headings are real headings that name their list', () => {
    render(
      <Sidebar aria-label="Main">
        <SidebarSection heading="Workspace">
          <SidebarItem href="/">Home</SidebarItem>
        </SidebarSection>
        <SidebarSection heading="Admin" headingLevel={3}>
          <SidebarItem href="/admin">Admin</SidebarItem>
        </SidebarSection>
      </Sidebar>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Workspace' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Workspace' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Admin' })).toBeInTheDocument();
  });

  it('marks only the active item with aria-current="page"', () => {
    render(<Demo />);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Crew 3' })).not.toHaveAttribute('aria-current');
    expect(document.querySelectorAll('[aria-current]')).toHaveLength(1);
  });

  it('renders a button for items without href, and the badge is part of the name', async () => {
    const onClick = vi.fn();
    render(
      <Sidebar aria-label="Main">
        <SidebarSection>
          <SidebarItem onClick={onClick} badge="2 new">
            Messages
          </SidebarItem>
        </SidebarSection>
      </Sidebar>,
    );
    const btn = screen.getByRole('button', { name: 'Messages 2 new' });
    expect(btn).toHaveAttribute('type', 'button');
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('disabled items are not links, not focusable and ignore clicks', async () => {
    const onClick = vi.fn();
    render(
      <Sidebar aria-label="Main">
        <SidebarSection>
          <SidebarItem href="/reports" disabled onClick={onClick}>
            Reports
          </SidebarItem>
        </SidebarSection>
      </Sidebar>,
    );
    const el = document.querySelector<HTMLElement>('.os-sidebar__link')!;
    expect(el.tagName).toBe('A');
    expect(el).not.toHaveAttribute('href');
    expect(el).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByRole('link', { name: 'Reports' })).toBeNull();
    await userEvent.click(el);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('works with `as` (e.g. a router Link) and forwards the ref', () => {
    const Link = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }>(function Link(props, ref) {
      return (
        <a ref={ref} data-router="" {...props}>
          {props.children}
        </a>
      );
    });
    const ref = { current: null as HTMLElement | null };
    render(
      <Sidebar aria-label="Main">
        <SidebarSection>
          <SidebarItem as={Link} href="/docs" active ref={ref}>
            Docs
          </SidebarItem>
        </SidebarSection>
      </Sidebar>,
    );
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveClass('os-sidebar__link');
    expect(ref.current).toBe(link);
  });

  it('works with `render`, which receives every prop to spread', () => {
    const renderLink = vi.fn((props: Record<string, unknown>) => (
      <a {...props} data-custom="">
        {props.children as ReactNode}
      </a>
    ));
    render(
      <Sidebar aria-label="Main">
        <SidebarSection>
          <SidebarItem href="/docs" render={renderLink}>
            Docs
          </SidebarItem>
        </SidebarSection>
      </Sidebar>,
    );
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('data-custom');
    expect(link).toHaveAttribute('href', '/docs');
    expect(renderLink.mock.calls[0]![0]).toMatchObject({ href: '/docs', className: 'os-sidebar__link' });
  });

  it('uses plain Tab order: every item is in the tab sequence, no roving tabindex', async () => {
    render(<Demo />);
    const user = userEvent.setup();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Crew 3' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveFocus();
    // The closed group's links are inert, so browsers skip them (jsdom doesn't model inert focus).
    expect(document.querySelector('.os-sidebar__panel')).toHaveProperty('inert', true);
    await user.tab({ shift: true });
    expect(screen.getByRole('link', { name: 'Crew 3' })).toHaveFocus();
    expect(nav().querySelectorAll('[tabindex="-1"]')).toHaveLength(0);
  });

  it('has no axe violations, expanded, in light and dark', async () => {
    const { container } = render(<Demo />);
    await expectNoAxeViolations(container);
  });
});

describe('Sidebar: collapse and toggle', () => {
  it('the toggle has aria-expanded, aria-controls and a name that matches the action', async () => {
    render(<Demo />);
    const toggle = screen.getByRole('button', { name: 'Collapse sidebar' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAttribute('aria-controls', nav().id);
    await userEvent.click(toggle);
    expect(nav()).toHaveAttribute('data-mode', 'collapsed');
    expect(toggle).toHaveAccessibleName('Expand sidebar');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    expect(nav()).toHaveAttribute('data-mode', 'expanded');
  });

  it('toggles with Enter and Space', async () => {
    render(<Demo />);
    const user = userEvent.setup();
    screen.getByRole('button', { name: 'Collapse sidebar' }).focus();
    await user.keyboard('{Enter}');
    expect(nav()).toHaveAttribute('data-mode', 'collapsed');
    await user.keyboard(' ');
    expect(nav()).toHaveAttribute('data-mode', 'expanded');
  });

  it('labels are overridable', () => {
    render(
      <Sidebar aria-label="Main" defaultCollapsed>
        <SidebarHeader>
          <SidebarToggle labels={{ expand: 'Show menu' }} />
        </SidebarHeader>
      </Sidebar>,
    );
    expect(screen.getByRole('button', { name: 'Show menu' })).toBeInTheDocument();
  });

  it('uncontrolled: defaultCollapsed starts as a rail and reports changes', async () => {
    const onCollapsedChange = vi.fn();
    render(<Demo defaultCollapsed onCollapsedChange={onCollapsedChange} />);
    expect(nav()).toHaveAttribute('data-mode', 'collapsed');
    expect(nav()).toHaveAttribute('data-state', 'closed');
    await userEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }));
    expect(onCollapsedChange).toHaveBeenCalledWith(false);
    expect(nav()).toHaveAttribute('data-mode', 'expanded');
  });

  it('controlled: follows `collapsed` and only asks to change', async () => {
    const onCollapsedChange = vi.fn();
    const { rerender } = render(<Demo collapsed={false} onCollapsedChange={onCollapsedChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(nav()).toHaveAttribute('data-mode', 'expanded');
    rerender(<Demo collapsed onCollapsedChange={onCollapsedChange} />);
    expect(nav()).toHaveAttribute('data-mode', 'collapsed');
  });

  it('runs the expansion on the transition vocabulary', async () => {
    vi.useFakeTimers();
    try {
      render(<Demo />);
      expect(nav()).toHaveAttribute('data-state', 'open');
      fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
      expect(nav()).toHaveAttribute('data-state', 'closing');
      act(() => vi.advanceTimersByTime(250));
      expect(nav()).toHaveAttribute('data-state', 'closed');
      fireEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }));
      // `opening` shows as `open`: the CSS animates the width from the rail.
      expect(nav()).toHaveAttribute('data-state', 'open');
    } finally {
      vi.useRealTimers();
    }
  });

  it('a toggle outside the sidebar works inside a SidebarProvider', async () => {
    render(
      <SidebarProvider>
        <header>
          <SidebarToggle />
        </header>
        <Demo />
      </SidebarProvider>,
    );
    const [outside] = screen.getAllByRole('button', { name: 'Collapse sidebar' });
    expect(outside).toHaveAttribute('aria-controls', nav().id);
    await userEvent.click(outside!);
    expect(nav()).toHaveAttribute('data-mode', 'collapsed');
    // Both toggles stay in sync.
    expect(screen.getAllByRole('button', { name: 'Expand sidebar' })).toHaveLength(2);
  });

  it('useSidebar exposes the state and a toggle', async () => {
    function Status() {
      const { mode, toggle } = useSidebar();
      return (
        <button type="button" onClick={toggle}>
          Mode {mode}
        </button>
      );
    }
    render(
      <SidebarProvider id="app-sidebar">
        <Status />
        <Demo />
      </SidebarProvider>,
    );
    expect(nav()).toHaveAttribute('id', 'app-sidebar');
    await userEvent.click(screen.getByRole('button', { name: 'Mode expanded' }));
    expect(screen.getByRole('button', { name: 'Mode collapsed' })).toBeInTheDocument();
  });

  it('useSidebar and SidebarToggle throw outside a sidebar', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Bare() {
      useSidebar();
      return null;
    }
    expect(() => render(<Bare />)).toThrow(/inside <Sidebar> or <SidebarProvider>/);
    expect(() => render(<SidebarToggle />)).toThrow(/inside <Sidebar> or <SidebarProvider>/);
    spy.mockRestore();
  });
});

describe('Sidebar: collapsed rail', () => {
  it('keeps every accessible name while labels are visually hidden', () => {
    render(<Demo defaultCollapsed />);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Crew 3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Workspace' })).toBeInTheDocument();
  });

  it('shows the label in a tooltip on focus, without describing the link twice', async () => {
    render(<Demo defaultCollapsed />);
    const link = screen.getByRole('link', { name: 'Dashboard' });
    expect(link).not.toHaveAttribute('aria-describedby');
    act(() => link.focus());
    const tip = tooltipOf(link);
    await waitFor(() => expect(tip).toHaveAttribute('data-state', 'open'));
    expect(tip).toHaveTextContent('Dashboard');
    expect(tip).toHaveAttribute('aria-hidden', 'true');
    // Escape dismisses it (WCAG 1.4.13).
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(tip).not.toHaveAttribute('data-state', 'open'));
  });

  it('shows the tooltip on hover', async () => {
    render(<Demo defaultCollapsed />);
    const link = screen.getByRole('link', { name: 'Crew 3' });
    fireEvent.pointerEnter(link.closest('.os-sidebar__tip')!);
    await waitFor(() => expect(tooltipOf(link)).toHaveAttribute('data-state', 'open'), { timeout: 1000 });
    expect(tooltipOf(link)).toHaveTextContent('Crew');
  });

  it('shows no tooltips while expanded', async () => {
    render(<Demo />);
    const link = screen.getByRole('link', { name: 'Dashboard' });
    act(() => link.focus());
    await new Promise((r) => setTimeout(r, 20));
    expect(tooltipOf(link)).not.toHaveAttribute('data-state', 'open');
  });

  it('activating a group in the rail expands the sidebar and opens the group, keeping focus', async () => {
    render(<Demo defaultCollapsed />);
    const trigger = screen.getByRole('button', { name: 'Settings' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    expect(nav()).toHaveAttribute('data-mode', 'expanded');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveFocus();
    expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument();
  });

  it('items without an icon show a letter in the rail', () => {
    render(<Demo defaultCollapsed />);
    const help = screen.getByRole('link', { name: 'Help' });
    expect(help.querySelector('.os-sidebar__abbr')).toHaveTextContent('H');
    expect(help.querySelector('.os-sidebar__abbr')).toHaveAttribute('aria-hidden', 'true');
  });

  it('has no axe violations as a rail, in light and dark', async () => {
    const { container } = render(<Demo defaultCollapsed />);
    await expectNoAxeViolations(container);
  });
});

describe('SidebarGroup', () => {
  it('is a disclosure button with aria-expanded and aria-controls', async () => {
    render(<Demo />);
    const trigger = screen.getByRole('button', { name: 'Settings' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    const panel = document.getElementById(trigger.getAttribute('aria-controls')!)!;
    expect(panel).toHaveClass('os-collapse');
    expect(panel.inert).toBe(true);
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(panel.inert).toBe(false);
    expect(within(panel).getByRole('link', { name: 'Profile' })).toBeInTheDocument();
  });

  it('opens and closes with Enter and Space', async () => {
    render(<Demo />);
    const user = userEvent.setup();
    const trigger = screen.getByRole('button', { name: 'Settings' });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard(' ');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('is not an ARIA tree or menu', () => {
    render(<Demo />);
    expect(document.querySelector('[role="tree"], [role="treeitem"], [role="menu"], [role="menuitem"]')).toBeNull();
  });

  it('opens by default and is highlighted when it holds the current page', () => {
    render(
      <Sidebar aria-label="Main">
        <SidebarSection>
          <SidebarGroup label="Settings">
            <SidebarItem href="/settings/profile" active>
              Profile
            </SidebarItem>
          </SidebarGroup>
        </SidebarSection>
      </Sidebar>,
    );
    const trigger = screen.getByRole('button', { name: 'Settings' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('data-active');
  });

  it('controlled open', async () => {
    function Controlled() {
      const [open, setOpen] = useState(true);
      return (
        <Sidebar aria-label="Main">
          <SidebarSection>
            <SidebarGroup label="Settings" open={open} onOpenChange={setOpen}>
              <SidebarItem href="/p">Profile</SidebarItem>
            </SidebarGroup>
          </SidebarSection>
          <p>Group is {open ? 'open' : 'closed'}</p>
        </Sidebar>
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByText('Group is closed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Sidebar: persistence', () => {
  it('restores the remembered state after mount and saves changes', async () => {
    window.localStorage.setItem('nav', 'true');
    render(<Demo persistKey="nav" />);
    await waitFor(() => expect(nav()).toHaveAttribute('data-mode', 'collapsed'));
    await userEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }));
    expect(window.localStorage.getItem('nav')).toBe('false');
  });

  it('ignores unknown stored values', () => {
    window.localStorage.setItem('nav', 'maybe');
    render(<Demo persistKey="nav" />);
    expect(nav()).toHaveAttribute('data-mode', 'expanded');
  });

  it('does nothing without persistKey', async () => {
    render(<Demo />);
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(window.localStorage.length).toBe(0);
  });

  it('keeps working when storage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    render(<Demo persistKey="nav" />);
    await userEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(nav()).toHaveAttribute('data-mode', 'collapsed');
  });
});

describe('Sidebar: drawer below the breakpoint', () => {
  function Shell(props: DemoProps) {
    return (
      <SidebarProvider {...(props as object)}>
        <SidebarToggle />
        <Demo />
      </SidebarProvider>
    );
  }

  it('renders inside a closed Drawer, with a toggle that opens it', async () => {
    viewport(true);
    render(<Shell />);
    const dialog = document.querySelector('dialog')!;
    expect(dialog).toHaveClass('os-drawer', 'os-sidebar-drawer');
    expect(dialog).toHaveAttribute('data-placement', 'start');
    expect(dialog).not.toHaveAttribute('open');
    const toggle = screen.getByRole('button', { name: 'Open navigation' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', dialog.id);
    await userEvent.click(toggle);
    expect(dialog).toHaveAttribute('open');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    // The landmark lives inside the drawer, which is named after it.
    expect(within(dialog).getByRole('navigation', { name: 'Main' })).toHaveAttribute('data-mode', 'drawer');
    expect(dialog).toHaveAccessibleName('Main');
  });

  it('hides the toggle inside the drawer (the drawer has its own close button)', async () => {
    viewport(true);
    render(<Shell defaultMobileOpen />);
    const dialog = document.querySelector('dialog')!;
    expect(within(dialog).getByRole('button', { name: 'Close navigation' })).toBeInTheDocument();
    expect(dialog.querySelectorAll('.os-sidebar-toggle')).toHaveLength(0);
  });

  it('closes when a link is followed, and returns focus to the toggle', async () => {
    viewport(true);
    const onMobileOpenChange = vi.fn();
    render(<Shell onMobileOpenChange={onMobileOpenChange} />);
    const toggle = screen.getByRole('button', { name: 'Open navigation' });
    await userEvent.click(toggle);
    const dialog = document.querySelector('dialog')!;
    await userEvent.click(within(dialog).getByRole('link', { name: 'Crew 3' }));
    expect(onMobileOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    await waitFor(() => expect(toggle).toHaveFocus());
  });

  it('does not close for group triggers', async () => {
    viewport(true);
    render(<Shell defaultMobileOpen />);
    const dialog = document.querySelector('dialog')!;
    await userEvent.click(within(dialog).getByRole('button', { name: 'Settings' }));
    expect(dialog).toHaveAttribute('open');
  });

  it('Escape (the dialog cancel event) and the close button close it', async () => {
    viewport(true);
    render(<Shell />);
    const toggle = screen.getByRole('button', { name: 'Open navigation' });
    await userEvent.click(toggle);
    const dialog = document.querySelector('dialog')!;
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    await waitFor(() => expect(dialog).toHaveAttribute('open'));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close navigation' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows full labels in the drawer even when collapsed on wide screens', () => {
    viewport(true);
    render(<Shell defaultCollapsed defaultMobileOpen />);
    const inner = within(document.querySelector('dialog')!).getByRole('navigation');
    expect(inner).toHaveAttribute('data-mode', 'drawer');
    expect(inner).toHaveAttribute('data-state', 'open');
  });

  it('controlled mobileOpen', async () => {
    viewport(true);
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            External open
          </button>
          <Shell mobileOpen={open} onMobileOpenChange={setOpen} />
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: 'External open' }));
    expect(document.querySelector('dialog')).toHaveAttribute('open');
  });

  it('drawerBelow={false} never uses the drawer', () => {
    viewport(true);
    render(<Demo drawerBelow={false} />);
    expect(document.querySelector('dialog')).toBeNull();
    expect(nav()).toHaveAttribute('data-mode', 'expanded');
  });

  it('queries the configured breakpoint', () => {
    const spy = viewport(false);
    render(<Demo drawerBelow="md" />);
    expect(spy.mock.calls.some(([q]) => q === '(max-width: 767.98px)')).toBe(true);
    expect(nav()).toHaveAttribute('data-drawer-below', 'md');
  });

  it('has no axe violations with the drawer open, in light and dark', async () => {
    viewport(true);
    const { container } = render(<Shell defaultMobileOpen />);
    await expectNoAxeViolations(container);
  });
});

describe('Tooltip describe prop (used by the rail)', () => {
  it('describes the trigger by default, and is visual-only with describe={false}', () => {
    render(
      <>
        <Tooltip content="Saves the draft">
          <button type="button">Save</button>
        </Tooltip>
        <Tooltip content="Home" describe={false}>
          <button type="button" aria-label="Home">
            H
          </button>
        </Tooltip>
      </>,
    );
    const save = screen.getByRole('button', { name: 'Save' });
    expect(save).toHaveAccessibleDescription('Saves the draft');
    const home = screen.getByRole('button', { name: 'Home' });
    expect(home).not.toHaveAttribute('aria-describedby');
    expect(document.querySelectorAll('[role="tooltip"]')).toHaveLength(1);
  });
});
