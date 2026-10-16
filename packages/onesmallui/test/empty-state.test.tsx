import { createRef, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../src/components/Button';
import { CommandPalette } from '../src/components/CommandPalette';
import { DataTable } from '../src/components/DataTable';
import { EmptyState, type EmptyStatePreset } from '../src/components/EmptyState';
import { TreeView } from '../src/components/TreeView';
import { AnnouncerProvider } from '../src/hooks/useAnnouncer';

async function expectNoAxeViolations(container: HTMLElement) {
  for (const theme of ['light', 'dark']) {
    document.documentElement.setAttribute('data-os-theme', theme);
    const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
    expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  }
  document.documentElement.removeAttribute('data-os-theme');
}

describe('EmptyState', () => {
  it('renders a heading, description and actions in order, at level 2 by default', () => {
    const { container } = render(
      <EmptyState
        title="No projects"
        description="Projects you create show up here."
        actions={<Button>New project</Button>}
        secondaryActions={<a href="#docs">Read the guide</a>}
      />,
    );
    const root = container.firstElementChild!;
    expect(root).toHaveClass('os-empty-state');
    expect(root).not.toHaveAttribute('data-size');
    expect(root).not.toHaveAttribute('role');
    expect(screen.getByRole('heading', { level: 2, name: 'No projects' })).toHaveClass('os-empty-state__title');
    expect(screen.getByText('Projects you create show up here.')).toHaveClass('os-empty-state__description');
    expect([...root.children].map((c) => c.className)).toEqual([
      'os-empty-state__title',
      'os-empty-state__description',
      'os-empty-state__actions',
    ]);
    expect(root.querySelector('.os-empty-state__primary')).toContainElement(screen.getByRole('button', { name: 'New project' }));
    expect(root.querySelector('.os-empty-state__secondary')).toContainElement(screen.getByRole('link', { name: 'Read the guide' }));
  });

  it.each([2, 3, 4, 5, 6] as const)('renders the heading at level %i', (level) => {
    render(<EmptyState title="Empty" headingLevel={level} />);
    expect(screen.getByRole('heading', { level, name: 'Empty' }).tagName).toBe(`H${level}`);
  });

  it.each<[EmptyStatePreset, string, string]>([
    ['no-data', 'No data yet', 'When there is something to show, it will appear here.'],
    ['no-results', 'No results found', 'Try different keywords, or clear the filters.'],
    ['error', 'Something went wrong', 'This could not be loaded. Check your connection and try again.'],
    ['first-use', 'Nothing here yet', 'Get started by creating your first one.'],
  ])('fills the %s preset with an icon and copy', (preset, title, description) => {
    const { container } = render(<EmptyState preset={preset} />);
    expect(container.firstElementChild).toHaveAttribute('data-preset', preset);
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
    const media = container.querySelector('.os-empty-state__media')!;
    expect(media).toHaveAttribute('aria-hidden', 'true');
    expect(media).toHaveAttribute('data-kind', 'icon');
    expect(media.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    // Presets alone add no buttons.
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('lets title, description and icon override the preset, and icon={false} hide it', () => {
    const { container, rerender } = render(
      <EmptyState preset="no-data" title="No invoices" description="Invoices appear after your first sale." icon={<svg data-testid="own" />} />,
    );
    expect(screen.getByRole('heading', { name: 'No invoices' })).toBeInTheDocument();
    expect(screen.getByText('Invoices appear after your first sale.')).toBeInTheDocument();
    expect(screen.getByTestId('own')).toBeInTheDocument();
    rerender(<EmptyState preset="no-data" icon={false} />);
    expect(container.querySelector('.os-empty-state__media')).toBeNull();
    expect(screen.getByRole('heading', { name: 'No data yet' })).toBeInTheDocument();
  });

  it('shows an illustration instead of the icon, hidden from assistive tech', () => {
    const { container } = render(<EmptyState preset="first-use" illustration={<img src="/empty.svg" alt="" />} />);
    const media = container.querySelector('.os-empty-state__media')!;
    expect(media).toHaveAttribute('data-kind', 'illustration');
    expect(media).toHaveAttribute('aria-hidden', 'true');
    expect(media.querySelector('img')).toBeInTheDocument();
    expect(media.querySelector('svg')).toBeNull();
  });

  it('adds Clear filters to no-results and works from the keyboard', async () => {
    const user = userEvent.setup();
    const onClearFilters = vi.fn();
    render(<EmptyState preset="no-results" onClearFilters={onClearFilters} />);
    const button = screen.getByRole('button', { name: 'Clear filters' });
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    await user.click(button);
    expect(onClearFilters).toHaveBeenCalledTimes(3);
  });

  it('adds Try again with a decorative refresh icon to the error preset', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<EmptyState preset="error" onRetry={onRetry} />);
    const button = screen.getByRole('button', { name: 'Try again' });
    expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    await user.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('only adds a preset button for its own preset', () => {
    render(
      <>
        <EmptyState preset="no-data" onClearFilters={() => {}} onRetry={() => {}} />
        <EmptyState preset="error" onClearFilters={() => {}} />
        <EmptyState onRetry={() => {}} title="Plain" />
      </>,
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('puts the preset button first and makes it an outline when there is a main action', () => {
    const { container } = render(
      <EmptyState preset="error" onRetry={() => {}} actions={<Button>Contact support</Button>} labels={{ retry: 'Reload' }} />,
    );
    const buttons = [...container.querySelectorAll('.os-empty-state__primary > button')];
    expect(buttons.map((b) => b.textContent)).toEqual(['Reload', 'Contact support']);
    expect(buttons[0]).toHaveAttribute('data-variant', 'outline');
  });

  it('keeps Tab order: preset button, main actions, then secondary actions', async () => {
    const user = userEvent.setup();
    render(
      <EmptyState
        preset="no-results"
        onClearFilters={() => {}}
        actions={<Button>New search</Button>}
        secondaryActions={<a href="#help">Search tips</a>}
        labels={{ clearFilters: 'Reset filters' }}
      />,
    );
    await user.tab();
    expect(screen.getByRole('button', { name: 'Reset filters' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'New search' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Search tips' })).toHaveFocus();
  });

  it('compact sets data-size and small preset buttons', () => {
    const { container } = render(<EmptyState preset="no-results" size="compact" onClearFilters={() => {}} />);
    expect(container.firstElementChild).toHaveAttribute('data-size', 'compact');
    expect(screen.getByRole('button', { name: 'Clear filters' })).toHaveAttribute('data-size', 'sm');
  });

  it('renders children after the description and omits empty parts', () => {
    const { container } = render(
      <EmptyState title="Inbox zero">
        <p>Extra</p>
      </EmptyState>,
    );
    const root = container.firstElementChild!;
    expect([...root.children].map((c) => c.tagName)).toEqual(['H2', 'P']);
    expect(root.querySelector('.os-empty-state__actions')).toBeNull();
    expect(root.querySelector('.os-empty-state__description')).toBeNull();
  });

  it('forwards ref, className and rest props to the root', () => {
    const ref = createRef<HTMLDivElement>();
    render(<EmptyState ref={ref} title="Empty" className="mine" data-testid="es" id="es" />);
    expect(ref.current).toBe(screen.getByTestId('es'));
    expect(ref.current).toHaveClass('os-empty-state', 'mine');
    expect(ref.current).toHaveAttribute('id', 'es');
  });

  it('has no axe violations in light and dark, for every preset and size', async () => {
    const { container } = render(
      <main>
        <h1>Projects</h1>
        <EmptyState preset="first-use" actions={<Button>Create project</Button>} secondaryActions={<a href="#docs">Docs</a>} />
        <EmptyState preset="no-data" size="compact" />
        <EmptyState preset="no-results" onClearFilters={() => {}} />
        <EmptyState preset="error" size="compact" onRetry={() => {}} />
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});

const columns = [{ key: 'name', header: 'Name' }];

describe('EmptyState in DataTable', () => {
  const table = (props: { emptyState?: ReactNode } = {}) =>
    render(
      <AnnouncerProvider>
        <DataTable caption="Crew" data={[]} columns={columns} {...props} />
      </AnnouncerProvider>,
    );

  it('renders the default text as the heading of a compact EmptyState in the empty cell', () => {
    table();
    const heading = screen.getByRole('heading', { level: 3, name: 'No results' });
    const cell = heading.closest('td')!;
    expect(cell).toHaveClass('os-data-table__empty');
    expect(heading.parentElement).toHaveClass('os-empty-state', 'os-data-table__empty-state');
    expect(heading.parentElement).toHaveAttribute('data-size', 'compact');
    expect(cell.querySelector('svg')).toBeNull();
  });

  it('turns a string into the heading and renders other nodes as they are', () => {
    const { unmount } = table({ emptyState: 'No crew yet' });
    expect(screen.getByRole('heading', { level: 3, name: 'No crew yet' })).toBeInTheDocument();
    unmount();
    const { container } = table({ emptyState: <p>Hire someone</p> });
    expect(screen.getByText('Hire someone').parentElement).toHaveClass('os-data-table__empty');
    expect(container.querySelector('.os-empty-state')).toBeNull();
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('keeps a full EmptyState passed as emptyState', async () => {
    const user = userEvent.setup();
    const onClearFilters = vi.fn();
    table({ emptyState: <EmptyState preset="no-results" size="compact" headingLevel={4} onClearFilters={onClearFilters} /> });
    expect(screen.getByRole('heading', { level: 4, name: 'No results found' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onClearFilters).toHaveBeenCalled();
  });
});

describe('EmptyState in CommandPalette', () => {
  const input = () => screen.getByRole('combobox');

  it('renders the default and string empty states as a compact EmptyState heading', async () => {
    const { unmount } = render(<CommandPalette defaultOpen hotkey={false} items={[{ id: 'a', label: 'Alpha' }]} />);
    await userEvent.type(input(), 'zzzz');
    const heading = screen.getByRole('heading', { level: 2, name: 'No results for “zzzz”' });
    expect(heading.closest('.os-command-palette__empty')).toBeInTheDocument();
    expect(heading.parentElement).toHaveClass('os-empty-state', 'os-command-palette__empty-state');
    unmount();
    render(<CommandPalette defaultOpen hotkey={false} items={[]} />);
    expect(screen.getByRole('heading', { name: 'Nothing here yet' })).toBeInTheDocument();
  });

  it('renders a node from emptyState as it is', () => {
    render(<CommandPalette defaultOpen hotkey={false} items={[]} emptyState={() => <span>Try “settings”</span>} />);
    expect(screen.getByText('Try “settings”').parentElement).toHaveClass('os-command-palette__empty');
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('shows the error preset with Retry, which loads again and keeps focus in the search', async () => {
    const user = userEvent.setup();
    const loadItems = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue([{ heading: 'People', items: [{ id: 'ada', label: 'Ada' }] }]);
    render(
      <AnnouncerProvider>
        <CommandPalette defaultOpen hotkey={false} items={[]} loadItems={loadItems} debounce={0} labels={{ retry: 'Load again' }} />
      </AnnouncerProvider>,
    );
    const heading = await screen.findByRole('heading', { level: 2, name: 'Results could not be loaded.' });
    const state = heading.parentElement!;
    expect(state).toHaveAttribute('data-preset', 'error');
    expect(state.querySelector('.os-empty-state__media svg')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Load again' }));
    expect(input()).toHaveFocus();
    expect(await screen.findByRole('option', { name: 'Ada' })).toBeInTheDocument();
    expect(loadItems).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('heading')).toBeNull();
  });

  it('labels Retry "Retry" by default', async () => {
    render(<CommandPalette defaultOpen hotkey={false} items={[]} loadItems={() => Promise.reject(new Error('x'))} debounce={0} />);
    expect(await screen.findByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});

describe('EmptyState in TreeView', () => {
  it('renders an empty tree exactly as before without emptyState', () => {
    const { container } = render(<TreeView aria-label="Files" items={[]} />);
    const tree = screen.getByRole('tree', { name: 'Files' });
    expect(tree).not.toHaveAttribute('hidden');
    expect(tree).toBeEmptyDOMElement();
    expect(container.children).toHaveLength(1);
  });

  it('hides the empty tree, keeps it as the ref target and shows a compact EmptyState', () => {
    const ref = createRef<HTMLUListElement>();
    const { container } = render(<TreeView ref={ref} aria-label="Files" items={[]} emptyState="No files" />);
    const tree = container.querySelector('ul')!;
    expect(ref.current).toBe(tree);
    expect(tree).toHaveAttribute('hidden');
    expect(tree).toHaveAttribute('role', 'tree');
    expect(screen.queryByRole('tree')).toBeNull();
    const heading = screen.getByRole('heading', { level: 3, name: 'No files' });
    expect(heading.parentElement).toHaveClass('os-empty-state', 'os-tree__empty-state');
    expect(heading.parentElement).toHaveAttribute('data-size', 'compact');
    expect(tree.nextElementSibling).toBe(heading.parentElement);
  });

  it('renders a node as it is, and nothing once there are items', () => {
    const { rerender } = render(<TreeView aria-label="Files" items={[]} emptyState={<p>Upload a file</p>} />);
    expect(screen.getByText('Upload a file')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).toBeNull();
    rerender(<TreeView aria-label="Files" items={[{ id: 'a', label: 'a.txt' }]} emptyState={<p>Upload a file</p>} />);
    expect(screen.queryByText('Upload a file')).toBeNull();
    expect(screen.getByRole('tree')).not.toHaveAttribute('hidden');
    expect(screen.getByRole('treeitem', { name: 'a.txt' })).toBeInTheDocument();
  });

  it('keeps a hidden prop on the tree', () => {
    const { container } = render(<TreeView aria-label="Files" items={[{ id: 'a', label: 'a.txt' }]} hidden />);
    expect(container.querySelector('ul')).toHaveAttribute('hidden');
  });

  it('has no axe violations in light and dark when empty', async () => {
    const { container } = render(
      <main>
        <h2>Files</h2>
        <TreeView aria-label="Files" items={[]} emptyState="No files" />
        <AnnouncerProvider>
          <DataTable caption="Crew" data={[]} columns={columns} />
        </AnnouncerProvider>
      </main>,
    );
    await expectNoAxeViolations(container);
  });
});
