import { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import {
  Accordion,
  AccordionItem,
  Button,
  Checkbox,
  DropZone,
  Field,
  Input,
  Modal,
  SortableList,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  ThemeProvider,
  ThemeToggle,
  ToastProvider,
  useToast,
  fileMatchesAccept,
} from '../src';

async function expectNoAxeViolations(container: HTMLElement) {
  const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

describe('Button', () => {
  it('renders data attributes and handles clicks', async () => {
    const onClick = vi.fn();
    render(
      <Button variant="outline" color="accent" size="lg" onClick={onClick}>
        Go
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn).toHaveClass('os-btn');
    expect(btn).toHaveAttribute('data-variant', 'outline');
    expect(btn).toHaveAttribute('data-color', 'accent');
    expect(btn).toHaveAttribute('type', 'button');
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('blocks clicks while loading', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders a link with href', () => {
    render(<Button href="/docs">Docs</Button>);
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
  });
});

describe('Field', () => {
  it('links label, hint and error to the control', async () => {
    const { container } = render(
      <Field label="Email" hint="We never share it" error="Required" required>
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText(/Email/);
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('We never share it Required');
    await expectNoAxeViolations(container);
  });
});

describe('Checkbox & Switch', () => {
  it('toggles and exposes the right roles', async () => {
    const { container } = render(
      <>
        <Checkbox label="Shields" />
        <Switch label="Autopilot" />
      </>,
    );
    const cb = screen.getByRole('checkbox', { name: 'Shields' });
    await userEvent.click(cb);
    expect(cb).toBeChecked();
    const sw = screen.getByRole('switch', { name: 'Autopilot' });
    await userEvent.click(sw);
    expect(sw).toBeChecked();
    await expectNoAxeViolations(container);
  });
});

describe('Tabs', () => {
  it('moves with arrow keys and shows the matching panel', async () => {
    render(
      <Tabs defaultValue="a">
        <TabList aria-label="Demo">
          <Tab value="a">A</Tab>
          <Tab value="b">B</Tab>
          <Tab value="c">C</Tab>
        </TabList>
        <TabPanel value="a">Panel A</TabPanel>
        <TabPanel value="b">Panel B</TabPanel>
        <TabPanel value="c">Panel C</TabPanel>
      </Tabs>,
    );
    const a = screen.getByRole('tab', { name: 'A' });
    a.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel B');
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'C' })).toHaveFocus();
  });
});

describe('Accordion', () => {
  it('expands one item at a time', async () => {
    render(
      <Accordion>
        <AccordionItem value="1" title="One">
          First
        </AccordionItem>
        <AccordionItem value="2" title="Two">
          Second
        </AccordionItem>
      </Accordion>,
    );
    const one = screen.getByRole('button', { name: 'One' });
    const two = screen.getByRole('button', { name: 'Two' });
    await userEvent.click(one);
    expect(one).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(two);
    expect(one).toHaveAttribute('aria-expanded', 'false');
    expect(two).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Modal', () => {
  it('is labelled and closes with Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Rename" description="Pick a name">
        Body
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Rename' });
    expect(dialog).toHaveAccessibleDescription('Pick a name');
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('Toast', () => {
  it('shows and dismisses a toast', async () => {
    function Trigger() {
      const { toast } = useToast();
      return <button onClick={() => toast({ title: 'Course plotted' })}>notify</button>;
    }
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await userEvent.click(screen.getByText('notify'));
    expect(screen.getByRole('status')).toHaveTextContent('Course plotted');
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    await act(() => new Promise((r) => setTimeout(r, 300)));
    expect(screen.queryByText('Course plotted')).not.toBeInTheDocument();
  });
});

describe('ThemeProvider', () => {
  it('sets the theme attribute and toggles it', async () => {
    render(
      <ThemeProvider defaultMode="light" storageKey={false}>
        <ThemeToggle />
      </ThemeProvider>,
    );
    expect(document.documentElement).toHaveAttribute('data-os-theme', 'light');
    await userEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(document.documentElement).toHaveAttribute('data-os-theme', 'dark');
  });
});

describe('DropZone', () => {
  it('accepts matching files and rejects others', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
    const onFilesAdded = vi.fn();
    const onFilesRejected = vi.fn();
    render(<DropZone accept="image/*" maxSize={1000} onFilesAdded={onFilesAdded} onFilesRejected={onFilesRejected} />);
    const input = document.querySelector('input[type=file]') as HTMLInputElement;
    const ok = new File(['x'], 'ok.png', { type: 'image/png' });
    const bad = new File(['x'], 'notes.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [ok, bad] } });
    expect(onFilesAdded).toHaveBeenCalledWith([ok]);
    expect(onFilesRejected.mock.calls[0][0][0].file).toBe(bad);
    expect(screen.getByRole('button', { name: 'Remove ok.png' })).toBeInTheDocument();
    expect(screen.getByText(/1 file added, 1 rejected/)).toBeInTheDocument();
  });

  it('matches accept strings', () => {
    const pdf = new File([''], 'a.PDF', { type: 'application/pdf' });
    expect(fileMatchesAccept(pdf, '.pdf')).toBe(true);
    expect(fileMatchesAccept(pdf, 'image/*')).toBe(false);
    expect(fileMatchesAccept(pdf, 'application/pdf,image/*')).toBe(true);
  });
});

describe('SortableList', () => {
  it('reorders with the keyboard and announces moves', async () => {
    function List() {
      const [items, setItems] = useState(['Alpha', 'Beta', 'Gamma']);
      return (
        <SortableList
          label="Planets"
          items={items}
          getKey={(i) => i}
          getItemLabel={(i) => i}
          onReorder={setItems}
          renderItem={(i) => <span data-testid="item">{i}</span>}
        />
      );
    }
    render(<List />);
    const handle = screen.getByRole('button', { name: 'Reorder Alpha' });
    handle.focus();
    await userEvent.keyboard(' ');
    expect(handle).toHaveAttribute('aria-pressed', 'true');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getAllByTestId('item').map((n) => n.textContent)).toEqual(['Beta', 'Gamma', 'Alpha']);
    expect(screen.getByText(/Alpha moved to position 3 of 3/)).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.getAllByTestId('item').map((n) => n.textContent)).toEqual(['Alpha', 'Beta', 'Gamma']);
  });
});
