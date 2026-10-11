import { useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Button,
  Carousel,
  CarouselSlide,
  Dialog,
  Drawer,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuSub,
  MenuTrigger,
  Modal,
  Nav,
  NavItem,
  Navbar,
  Popover,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Toast,
  Toggler,
  Tooltip,
  TooltipProvider,
} from '../src';

describe('Dialog', () => {
  it('opens, closes on the backdrop unless static, and returns focus', async () => {
    function Demo({ backdrop }: { backdrop?: true | 'static' }) {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>open</button>
          <Dialog open={open} onClose={() => setOpen(false)} title="Hi" backdrop={backdrop} animation="none">
            Body
          </Dialog>
        </>
      );
    }
    const { unmount } = render(<Demo />);
    const trigger = screen.getByText('open');
    await userEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Hi' });
    expect(dialog).toHaveAttribute('open');
    await userEvent.click(dialog); // backdrop
    expect(dialog).not.toHaveAttribute('open');
    expect(trigger).toHaveFocus();
    unmount();

    render(<Demo backdrop="static" />);
    await userEvent.click(screen.getByText('open'));
    const d2 = screen.getByRole('dialog');
    await userEvent.click(d2);
    expect(d2).toHaveAttribute('open');
    expect(d2).toHaveAttribute('data-shake');
  });

  it('keeps Modal working as a wrapper', () => {
    render(
      <Modal open onClose={() => {}} placement="left" title="Nav">
        x
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: 'Nav' })).toHaveClass('os-drawer');
  });
});

describe('Drawer', () => {
  it('renders placement and sheet data attributes', () => {
    render(
      <Drawer open onClose={() => {}} title="Panel" placement="start" sheet>
        x
      </Drawer>,
    );
    const d = screen.getByRole('dialog', { name: 'Panel' });
    expect(d).toHaveAttribute('data-placement', 'start');
    expect(d).toHaveAttribute('data-sheet');
  });
});

describe('Menu', () => {
  it('follows the menu button pattern', async () => {
    const onSelect = vi.fn();
    render(
      <Menu>
        <MenuTrigger>
          <Button>Actions</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuItem onSelect={onSelect}>Edit</MenuItem>
          <MenuItem disabled>Delete</MenuItem>
          <MenuCheckboxItem>Grid</MenuCheckboxItem>
          <MenuSub label="More">
            <MenuItem>Deep</MenuItem>
          </MenuSub>
        </MenuContent>
      </Menu>,
    );
    const trigger = screen.getByRole('button', { name: 'Actions' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}'); // skips disabled
    expect(screen.getByRole('menuitemcheckbox', { name: 'Grid' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    const more = screen.getByRole('menuitem', { name: 'More' });
    expect(more).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('menuitem', { name: 'Deep' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(more).toHaveFocus();
    await userEvent.keyboard('e'); // typeahead
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

describe('Popover and Tooltip', () => {
  it('popover opens on click and closes with Escape', async () => {
    render(
      <Popover title="Info" content="Body">
        <button>More</button>
      </Popover>,
    );
    const btn = screen.getByText('More');
    await userEvent.click(btn);
    expect(screen.getByRole('dialog', { name: 'Info' })).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('tooltip describes its trigger; provider delegates', async () => {
    render(
      <>
        <Tooltip content="Saves">
          <button>Save</button>
        </Tooltip>
        <TooltipProvider>
          <button data-os-tooltip="Shares">Share</button>
        </TooltipProvider>
      </>,
    );
    expect(screen.getByText('Save')).toHaveAccessibleDescription('Saves');
    act(() => screen.getByText('Share').focus());
    await act(() => new Promise((r) => setTimeout(r, 10)));
    expect(screen.getByText('Share')).toHaveAccessibleDescription('Shares');
  });
});

describe('Navigation', () => {
  it('Nav marks the current link', () => {
    render(
      <Nav aria-label="Main" variant="pills">
        <NavItem href="/a" active>
          A
        </NavItem>
        <NavItem disabled>B</NavItem>
      </Nav>,
    );
    expect(screen.getByRole('link', { name: 'A' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('B').closest('a')).toHaveAttribute('aria-disabled', 'true');
  });

  it('Navbar collapses into a drawer with a toggle', async () => {
    render(
      <Navbar brand="Ship" expand="never" aria-label="Site">
        <Nav as="div">
          <NavItem href="/x">X</NavItem>
        </Nav>
      </Navbar>,
    );
    const toggle = screen.getByRole('button', { name: 'Open navigation' });
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog', { name: 'Menu' })).toHaveAttribute('open');
  });

  it('Tabs support manual activation and asChild', async () => {
    render(
      <Tabs defaultValue="a" activation="manual" variant="button">
        <TabList aria-label="T">
          <Tab value="a" asChild>
            <Button>A</Button>
          </Tab>
          <Tab value="b">B</Tab>
        </TabList>
        <TabPanel value="a">PA</TabPanel>
        <TabPanel value="b">PB</TabPanel>
      </Tabs>,
    );
    const a = screen.getByRole('tab', { name: 'A' });
    a.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'B' })).toHaveFocus();
    expect(a).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Enter}');
    expect(screen.getByText('PB')).toBeInTheDocument();
  });
});

describe('Carousel, Toast, Toggler', () => {
  it('carousel follows the APG roles', () => {
    render(
      <Carousel aria-label="Pics" transition="fade">
        <CarouselSlide>One</CarouselSlide>
        <CarouselSlide>Two</CarouselSlide>
      </Carousel>,
    );
    expect(screen.getByRole('region', { name: 'Pics' })).toHaveAttribute('aria-roledescription', 'carousel');
    expect(screen.getByRole('group', { name: '1 of 2' })).toHaveAttribute('aria-roledescription', 'slide');
  });

  it('standalone toast renders and dismisses', async () => {
    const onDismiss = vi.fn();
    render(<Toast title="Saved" variant="solid" color="success" onDismiss={onDismiss} />);
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('toggler toggles classes and attributes on targets', async () => {
    render(
      <>
        <Toggler target=".t" toggleClass="on" toggleAttribute="data-x" onValue="1" offValue="0">
          T
        </Toggler>
        <div className="t" data-testid="t1" />
        <div className="t" data-testid="t2" />
      </>,
    );
    const btn = screen.getByRole('button', { name: 'T' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('t2')).toHaveClass('on');
    expect(screen.getByTestId('t1')).toHaveAttribute('data-x', '1');
  });
});
