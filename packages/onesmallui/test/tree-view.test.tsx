import { forwardRef, useCallback, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnnouncerProvider } from '../src/hooks/useAnnouncer';
import { TreeView, type TreeNode, type TreeViewProps } from '../src/components/TreeView';

async function expectNoAxeViolations(container: HTMLElement) {
  for (const theme of ['light', 'dark']) {
    document.documentElement.setAttribute('data-os-theme', theme);
    const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
    expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  }
  document.documentElement.removeAttribute('data-os-theme');
}

const items: TreeNode[] = [
  {
    id: 'docs',
    label: 'Documents',
    children: [
      { id: 'cv', label: 'CV.pdf' },
      {
        id: 'letters',
        label: 'Letters',
        children: [
          { id: 'bank', label: 'Bank' },
          { id: 'council', label: 'Council' },
        ],
      },
    ],
  },
  {
    id: 'pics',
    label: 'Pictures',
    children: [
      { id: 'beach', label: 'Beach' },
      { id: 'birthday', label: 'Birthday', disabled: true },
    ],
  },
  { id: 'music', label: 'Music' },
];

const item = (name: string) => screen.getByRole('treeitem', { name });
const tabbable = () => screen.getAllByRole('treeitem').filter((el) => el.tabIndex === 0);
const focused = () => document.activeElement?.getAttribute('data-key');

function setup(props: Partial<TreeViewProps> = {}) {
  const user = userEvent.setup();
  const utils = render(
    <AnnouncerProvider>
      <TreeView aria-label="Files" items={items} {...props} />
    </AnnouncerProvider>,
  );
  return { user, ...utils };
}

async function focusFirst(user: ReturnType<typeof userEvent.setup>) {
  await user.tab();
  expect(focused()).toBe('docs');
}

const announced = (politeness: 'polite' | 'assertive') =>
  document.querySelector(`[data-os-announcer="${politeness}"]`)?.textContent;

afterEach(() => vi.restoreAllMocks());

describe('TreeView: ARIA structure', () => {
  it('renders a tree of treeitems and groups with level, set size and position', () => {
    setup({ defaultExpandedKeys: ['docs', 'letters'] });
    const tree = screen.getByRole('tree', { name: 'Files' });
    expect(tree).not.toHaveAttribute('aria-multiselectable');
    const docs = item('Documents');
    expect(docs).toHaveAttribute('aria-level', '1');
    expect(docs).toHaveAttribute('aria-setsize', '3');
    expect(docs).toHaveAttribute('aria-posinset', '1');
    expect(docs).toHaveAttribute('aria-expanded', 'true');
    expect(item('Pictures')).toHaveAttribute('aria-expanded', 'false');
    // Leaves have no aria-expanded.
    expect(item('Music')).not.toHaveAttribute('aria-expanded');
    const letters = item('Letters');
    expect(letters).toHaveAttribute('aria-level', '2');
    expect(letters).toHaveAttribute('aria-posinset', '2');
    expect(letters).toHaveAttribute('aria-setsize', '2');
    expect(item('Council')).toHaveAttribute('aria-level', '3');
    // Groups nest inside their parent item; collapsed parents render no group.
    expect(within(docs).getAllByRole('group')[0]).toContainElement(letters);
    expect(within(item('Pictures')).queryByRole('group')).toBeNull();
    // Single selection: every item has aria-selected, none checked.
    expect(docs).toHaveAttribute('aria-selected', 'false');
    expect(docs).not.toHaveAttribute('aria-checked');
  });

  it('names each item by its own label, not its subtree', () => {
    setup({ defaultExpandedKeys: ['docs'] });
    expect(item('Documents')).toBeInTheDocument();
    expect(screen.queryByRole('treeitem', { name: /CV\.pdf.*Documents|Documents.*CV/ })).toBeNull();
  });

  it('keeps exactly one item in the tab order and moves it with focus', async () => {
    const { user } = setup({ defaultExpandedKeys: ['docs'] });
    expect(tabbable()).toHaveLength(1);
    expect(tabbable()[0]).toBe(item('Documents'));
    await focusFirst(user);
    await user.keyboard('{ArrowDown}');
    expect(focused()).toBe('cv');
    expect(tabbable()).toEqual([item('CV.pdf')]);
    // Tab leaves the tree; Shift+Tab comes back to the last focused item.
    await user.tab();
    expect(document.body).toHaveFocus();
    await user.tab({ shift: true });
    expect(focused()).toBe('cv');
  });

  it('starts the tab stop on the first selected visible item', () => {
    setup({ defaultExpandedKeys: ['pics'], defaultSelectedKeys: ['beach'] });
    expect(tabbable()).toEqual([item('Beach')]);
  });

  it('marks disabled items aria-disabled but keeps them focusable', async () => {
    const onSelectedKeysChange = vi.fn();
    const { user } = setup({ defaultExpandedKeys: ['pics'], onSelectedKeysChange });
    const birthday = item('Birthday');
    expect(birthday).toHaveAttribute('aria-disabled', 'true');
    await user.click(birthday);
    expect(birthday).toHaveFocus();
    await user.keyboard('{Enter}[Space]');
    expect(onSelectedKeysChange).not.toHaveBeenCalled();
    expect(birthday).toHaveAttribute('aria-selected', 'false');
  });

  it('renders icons and custom labels with node state', () => {
    const renderLabel = vi.fn((node: TreeNode, state: { level: number; expanded: boolean }) => (
      <span>{`${String(node.label)} L${state.level}${state.expanded ? ' open' : ''}`}</span>
    ));
    setup({
      items: [{ id: 'a', label: 'Alpha', icon: <svg data-testid="icon" />, children: [{ id: 'b', label: 'Beta' }] }],
      defaultExpandedKeys: ['a'],
      renderLabel,
    });
    expect(item('Alpha L1 open')).toBeInTheDocument();
    expect(item('Beta L2')).toBeInTheDocument();
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('TreeView: keyboard', () => {
  it('ArrowDown and ArrowUp move through visible items only', async () => {
    const { user } = setup({ defaultExpandedKeys: ['docs'] });
    await focusFirst(user);
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    // docs → cv → letters (collapsed, so its children are skipped) → pics
    expect(focused()).toBe('pics');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(focused()).toBe('music'); // stops at the end
    await user.keyboard('{ArrowUp}');
    expect(focused()).toBe('pics');
  });

  it('ArrowRight expands, then moves to the first child; does nothing on a leaf', async () => {
    const onExpandedKeysChange = vi.fn();
    const { user } = setup({ onExpandedKeysChange });
    await focusFirst(user);
    await user.keyboard('{ArrowRight}');
    expect(item('Documents')).toHaveAttribute('aria-expanded', 'true');
    expect(onExpandedKeysChange).toHaveBeenLastCalledWith(['docs']);
    expect(focused()).toBe('docs');
    await user.keyboard('{ArrowRight}');
    expect(focused()).toBe('cv');
    await user.keyboard('{ArrowRight}');
    expect(focused()).toBe('cv');
  });

  it('ArrowLeft collapses an open item, else moves to the parent', async () => {
    const { user } = setup({ defaultExpandedKeys: ['docs', 'letters'] });
    await user.click(item('Bank'));
    await user.keyboard('{ArrowLeft}');
    expect(focused()).toBe('letters');
    await user.keyboard('{ArrowLeft}');
    expect(item('Letters')).toHaveAttribute('aria-expanded', 'false');
    expect(focused()).toBe('letters');
    await user.keyboard('{ArrowLeft}');
    expect(focused()).toBe('docs');
    await user.keyboard('{ArrowLeft}');
    expect(item('Documents')).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard('{ArrowLeft}'); // top-level, collapsed: nothing
    expect(focused()).toBe('docs');
  });

  it('Home and End jump to the first and last visible items', async () => {
    const { user } = setup({ defaultExpandedKeys: ['pics'] });
    await focusFirst(user);
    await user.keyboard('{End}');
    expect(focused()).toBe('music');
    await user.keyboard('{Home}');
    expect(focused()).toBe('docs');
  });

  it('* expands every sibling of the focused item', async () => {
    const { user } = setup({ defaultExpandedKeys: ['docs'] });
    await user.click(item('CV.pdf'));
    await user.keyboard('*');
    expect(item('Letters')).toHaveAttribute('aria-expanded', 'true');
    expect(item('Pictures')).toHaveAttribute('aria-expanded', 'false');
    await user.click(item('Documents'));
    await user.keyboard('*');
    expect(item('Pictures')).toHaveAttribute('aria-expanded', 'true');
    expect(focused()).toBe('docs');
  });

  it('typeahead jumps to the next item starting with the typed text, with a 600ms buffer', async () => {
    let now = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
    const { user } = setup({ items: [...items, { id: 'maps', label: 'Maps' }] });
    await focusFirst(user);
    await user.keyboard('p');
    expect(focused()).toBe('pics');
    now += 700;
    await user.keyboard('m');
    expect(focused()).toBe('music');
    now += 100;
    await user.keyboard('m'); // repeated letter cycles
    expect(focused()).toBe('maps');
    now += 700;
    await user.keyboard('m');
    now += 100;
    await user.keyboard('u'); // "mu" within the buffer
    expect(focused()).toBe('music');
    now += 700;
    await user.keyboard('z'); // no match: focus stays
    expect(focused()).toBe('music');
  });

  it('typeahead uses textValue for rich labels', async () => {
    const { user } = setup({
      items: [
        { id: 'a', label: 'Alpha' },
        { id: 'b', label: <strong>★ Beta</strong>, textValue: 'Beta' },
      ],
    });
    await user.tab();
    await user.keyboard('b');
    expect(focused()).toBe('b');
  });

  it('swaps ArrowLeft and ArrowRight in RTL', async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <TreeView aria-label="Files" items={items} />
      </div>,
    );
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(item('Documents')).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{ArrowLeft}');
    expect(focused()).toBe('cv');
    await user.keyboard('{ArrowRight}');
    expect(focused()).toBe('docs');
    await user.keyboard('{ArrowRight}');
    expect(item('Documents')).toHaveAttribute('aria-expanded', 'false');
  });

  it('ignores keys from outside items and respects a consumer onKeyDown preventDefault', async () => {
    const user = userEvent.setup();
    render(<TreeView aria-label="Files" items={items} onKeyDown={(e) => e.key === 'End' && e.preventDefault()} />);
    await user.tab();
    await user.keyboard('{End}');
    expect(focused()).toBe('docs');
  });
});

describe('TreeView: single selection', () => {
  it('Enter, Space and click select one item', async () => {
    const onSelectedKeysChange = vi.fn();
    const { user } = setup({ defaultExpandedKeys: ['docs'], onSelectedKeysChange });
    await focusFirst(user);
    await user.keyboard('{Enter}');
    expect(item('Documents')).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowDown}[Space]');
    expect(item('CV.pdf')).toHaveAttribute('aria-selected', 'true');
    expect(item('Documents')).toHaveAttribute('aria-selected', 'false');
    await user.click(item('Music'));
    expect(onSelectedKeysChange).toHaveBeenLastCalledWith(['music']);
    expect(item('Music')).toHaveFocus();
    // Moving focus does not change the selection.
    await user.keyboard('{ArrowUp}');
    expect(item('Music')).toHaveAttribute('aria-selected', 'true');
  });

  it('the chevron toggles expansion without selecting', async () => {
    const onSelectedKeysChange = vi.fn();
    const { user, container } = setup({ onSelectedKeysChange });
    const toggle = container.querySelector('[data-key="docs"] [data-tree-toggle]')!;
    await user.click(toggle);
    expect(item('Documents')).toHaveAttribute('aria-expanded', 'true');
    expect(item('Documents')).toHaveFocus();
    await user.click(toggle);
    expect(item('Documents')).toHaveAttribute('aria-expanded', 'false');
    expect(onSelectedKeysChange).not.toHaveBeenCalled();
  });

  it('keeps a tabbable item when the focused item is hidden by collapsing an ancestor', async () => {
    const { user, container } = setup({ defaultExpandedKeys: ['docs', 'letters'] });
    await user.click(item('Bank'));
    await user.click(container.querySelector('[data-key="docs"] > div [data-tree-toggle]')!);
    expect(tabbable()).toEqual([item('Documents')]);
  });

  it('works controlled: selection and expansion follow the props', async () => {
    const onSelectedKeysChange = vi.fn();
    const onExpandedKeysChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <TreeView
        aria-label="Files"
        items={items}
        selectedKeys={['music']}
        onSelectedKeysChange={onSelectedKeysChange}
        expandedKeys={[]}
        onExpandedKeysChange={onExpandedKeysChange}
      />,
    );
    await user.click(item('Pictures'));
    expect(onSelectedKeysChange).toHaveBeenCalledWith(['pics']);
    expect(item('Pictures')).toHaveAttribute('aria-selected', 'false');
    expect(item('Music')).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowRight}');
    expect(onExpandedKeysChange).toHaveBeenCalledWith(['pics']);
    expect(item('Pictures')).toHaveAttribute('aria-expanded', 'false');
    rerender(
      <TreeView aria-label="Files" items={items} selectedKeys={['beach']} expandedKeys={['pics']} onExpandedKeysChange={onExpandedKeysChange} />,
    );
    expect(item('Pictures')).toHaveAttribute('aria-expanded', 'true');
    expect(item('Beach')).toHaveAttribute('aria-selected', 'true');
  });
});

describe('TreeView: multiple selection', () => {
  it('sets aria-multiselectable; Space and click toggle', async () => {
    const onSelectedKeysChange = vi.fn();
    const { user } = setup({ selectionMode: 'multiple', onSelectedKeysChange });
    expect(screen.getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true');
    await focusFirst(user);
    await user.keyboard('[Space]');
    await user.click(item('Music'));
    expect(onSelectedKeysChange).toHaveBeenLastCalledWith(['docs', 'music']);
    await user.keyboard('[Space]');
    expect(item('Music')).toHaveAttribute('aria-selected', 'false');
    expect(item('Documents')).toHaveAttribute('aria-selected', 'true');
  });

  it('Shift + Arrow extends the selection from the anchor, skipping disabled items', async () => {
    const { user } = setup({ selectionMode: 'multiple', defaultExpandedKeys: ['pics'] });
    await user.click(item('Pictures'));
    await user.keyboard('{Shift>}{ArrowDown}{ArrowDown}{ArrowDown}{/Shift}');
    expect(focused()).toBe('music');
    const selected = screen.getAllByRole('treeitem', { selected: true }).map((el) => el.dataset.key);
    expect(selected).toEqual(['pics', 'beach', 'music']);
    // Shrinking the range back up deselects.
    await user.keyboard('{Shift>}{ArrowUp}{ArrowUp}{/Shift}');
    expect(screen.getAllByRole('treeitem', { selected: true }).map((el) => el.dataset.key)).toEqual(['pics', 'beach']);
    await waitFor(() => expect(announced('polite')).toBe('2 items selected'));
  });

  it('Shift + click selects a range; Ctrl + Shift + End selects to the end', async () => {
    const { user } = setup({ selectionMode: 'multiple' });
    await user.click(item('Documents'));
    await user.keyboard('{Shift>}');
    await user.click(item('Pictures'));
    await user.keyboard('{/Shift}');
    expect(screen.getAllByRole('treeitem', { selected: true })).toHaveLength(2);
    await user.keyboard('{Control>}{Shift>}{End}{/Shift}{/Control}');
    expect(screen.getAllByRole('treeitem', { selected: true })).toHaveLength(3);
    expect(focused()).toBe('music');
  });

  it('Ctrl/Cmd + A selects every visible enabled item', async () => {
    const onSelectedKeysChange = vi.fn();
    const { user } = setup({ selectionMode: 'multiple', defaultExpandedKeys: ['pics'], onSelectedKeysChange });
    await focusFirst(user);
    await user.keyboard('{Control>}a{/Control}');
    expect(onSelectedKeysChange).toHaveBeenLastCalledWith(['docs', 'pics', 'beach', 'music']);
    await user.keyboard('{Meta>}a{/Meta}');
    expect(onSelectedKeysChange).toHaveBeenCalledTimes(2);
    expect(item('Birthday')).toHaveAttribute('aria-selected', 'false');
    await waitFor(() => expect(announced('polite')).toBe('4 items selected'));
  });

  it('Shift + Space selects from the anchor to the focused item', async () => {
    const { user } = setup({ selectionMode: 'multiple' });
    await focusFirst(user);
    await user.keyboard('[Space]{ArrowDown}{ArrowDown}{Shift>}[Space]{/Shift}');
    expect(screen.getAllByRole('treeitem', { selected: true })).toHaveLength(3);
  });
});

describe('TreeView: selectionMode none and actions', () => {
  it('has no aria-selected; Enter, Space and click call onAction; parents toggle', async () => {
    const onAction = vi.fn();
    const { user } = setup({ selectionMode: 'none', onAction });
    expect(item('Music')).not.toHaveAttribute('aria-selected');
    await focusFirst(user);
    await user.keyboard('{Enter}');
    expect(item('Documents')).toHaveAttribute('aria-expanded', 'true');
    expect(onAction).toHaveBeenLastCalledWith(items[0]);
    await user.keyboard('[Space]');
    expect(item('Documents')).toHaveAttribute('aria-expanded', 'false');
    await user.click(item('Music'));
    expect(onAction).toHaveBeenLastCalledWith(items[2]);
    expect(onAction).toHaveBeenCalledTimes(3);
  });

  it('renders links for href nodes; Enter follows the link and calls onAction', async () => {
    const onAction = vi.fn();
    const linkClick = vi.fn((e: Event) => e.preventDefault());
    const { user } = setup({
      selectionMode: 'single',
      onAction,
      items: [
        { id: 'home', label: 'Home', href: '#home' },
        { id: 'off', label: 'Off', href: '#off', disabled: true },
      ],
    });
    const link = within(item('Home')).getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('href', '#home');
    expect(link).toHaveAttribute('tabindex', '-1');
    link.addEventListener('click', linkClick);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(linkClick).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(item('Home')).toHaveAttribute('aria-selected', 'true');
    expect(item('Home')).toHaveFocus();
    // A pointer click on the link keeps focus on the item.
    await user.click(link);
    expect(item('Home')).toHaveFocus();
    expect(onAction).toHaveBeenCalledTimes(2);
    // Disabled nodes render no link.
    expect(within(item('Off')).queryByRole('link')).toBeNull();
  });

  it('accepts as (tree-wide or per node) and render for router links', async () => {
    const RouterLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function RouterLink({ children, ...props }, ref) {
      return (
        <a ref={ref} data-router="" {...props}>
          {children}
        </a>
      );
    });
    const Other = ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a data-other="" {...props}>
        {children}
      </a>
    );
    setup({
      linkAs: RouterLink,
      items: [
        { id: 'a', label: 'A', href: '#a' },
        { id: 'b', label: 'B', href: '#b', as: Other },
        {
          id: 'c',
          label: 'C',
          href: '#c',
          render: ({ children, ...props }, node) => (
            <a {...props} data-render={node.id}>
              {children}
            </a>
          ),
        },
      ],
    });
    expect(within(item('A')).getByRole('link')).toHaveAttribute('data-router');
    expect(within(item('B')).getByRole('link')).toHaveAttribute('data-other');
    const c = within(item('C')).getByRole('link');
    expect(c).toHaveAttribute('data-render', 'c');
    expect(c).toHaveClass('os-tree__link');
  });
});

describe('TreeView: checkboxes', () => {
  it('derives checked and mixed parents from leaf keys', () => {
    setup({ checkboxes: true, defaultExpandedKeys: ['docs', 'letters'], defaultCheckedKeys: ['bank'] });
    expect(screen.getByRole('tree')).not.toHaveAttribute('aria-multiselectable');
    expect(item('Bank')).toHaveAttribute('aria-checked', 'true');
    expect(item('Council')).toHaveAttribute('aria-checked', 'false');
    expect(item('Letters')).toHaveAttribute('aria-checked', 'mixed');
    expect(item('Documents')).toHaveAttribute('aria-checked', 'mixed');
    expect(item('Music')).toHaveAttribute('aria-checked', 'false');
    expect(item('Bank')).not.toHaveAttribute('aria-selected');
  });

  it('toggling a parent toggles its enabled descendants; Space and click toggle', async () => {
    const onCheckedKeysChange = vi.fn();
    const { user } = setup({ checkboxes: true, defaultExpandedKeys: ['docs', 'letters', 'pics'], onCheckedKeysChange });
    await focusFirst(user);
    await user.keyboard('[Space]');
    expect(onCheckedKeysChange).toHaveBeenLastCalledWith(['cv', 'bank', 'council']);
    expect(item('Documents')).toHaveAttribute('aria-checked', 'true');
    expect(item('Letters')).toHaveAttribute('aria-checked', 'true');
    await user.click(item('Bank'));
    expect(item('Letters')).toHaveAttribute('aria-checked', 'mixed');
    expect(item('Documents')).toHaveAttribute('aria-checked', 'mixed');
    // Mixed → all on.
    await user.click(item('Documents'));
    expect(item('Documents')).toHaveAttribute('aria-checked', 'true');
    await user.click(item('Documents'));
    expect(onCheckedKeysChange).toHaveBeenLastCalledWith([]);
    // A disabled leaf is skipped, so its parent can only reach mixed.
    await user.click(item('Pictures'));
    expect(onCheckedKeysChange).toHaveBeenLastCalledWith(['beach']);
    expect(item('Pictures')).toHaveAttribute('aria-checked', 'mixed');
    await user.click(item('Pictures'));
    expect(onCheckedKeysChange).toHaveBeenLastCalledWith([]);
  });

  it('following a link in a checkbox tree does not toggle the box', async () => {
    const onCheckedKeysChange = vi.fn();
    const onAction = vi.fn();
    const { user } = setup({
      checkboxes: true,
      onCheckedKeysChange,
      onAction,
      items: [{ id: 'home', label: 'Home', href: '#home' }],
    });
    await user.click(screen.getByRole('link', { name: 'Home' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onCheckedKeysChange).not.toHaveBeenCalled();
    await user.keyboard('[Space]');
    expect(onCheckedKeysChange).toHaveBeenLastCalledWith(['home']);
  });

  it('works controlled', async () => {
    function Controlled() {
      const [keys, setKeys] = useState<string[]>(['music']);
      return (
        <>
          <TreeView aria-label="Files" items={items} checkboxes checkedKeys={keys} onCheckedKeysChange={setKeys} />
          <output>{keys.join(',')}</output>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Controlled />);
    expect(item('Music')).toHaveAttribute('aria-checked', 'true');
    await user.click(item('Pictures'));
    expect(screen.getByRole('status')).toHaveTextContent('music,beach');
    expect(item('Pictures')).toHaveAttribute('aria-checked', 'mixed');
  });
});

describe('TreeView: lazy children', () => {
  const lazyItems: TreeNode[] = [
    { id: 'remote', label: 'Remote', hasChildren: true },
    { id: 'local', label: 'Local' },
  ];

  function deferred<T>() {
    let resolve!: (v: T) => void;
    let reject!: (e: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }

  it('loads on first expand with aria-busy and a loading row, then shows the children', async () => {
    const d = deferred<TreeNode[]>();
    const loadChildren = vi.fn(() => d.promise);
    const { user } = setup({ items: lazyItems, loadChildren });
    const remote = item('Remote');
    expect(remote).toHaveAttribute('aria-expanded', 'false');
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(loadChildren).toHaveBeenCalledTimes(1);
    expect(loadChildren).toHaveBeenCalledWith(lazyItems[0]);
    expect(remote).toHaveAttribute('aria-busy', 'true');
    expect(within(remote).getByRole('group')).toHaveAttribute('aria-busy', 'true');
    expect(within(remote).getByText('Loading')).toBeInTheDocument();
    await waitFor(() => expect(announced('polite')).toBe('Loading'));
    await act(async () => d.resolve([{ id: 'r1', label: 'Report' }, { id: 'r2', label: 'Roadmap' }]));
    expect(remote).not.toHaveAttribute('aria-busy');
    expect(item('Report')).toHaveAttribute('aria-level', '2');
    expect(item('Roadmap')).toHaveAttribute('aria-setsize', '2');
    await waitFor(() => expect(announced('polite')).toBe('Remote: 2 items'));
    // Collapse and expand again: no second load.
    await user.keyboard('{ArrowLeft}{ArrowRight}{ArrowRight}');
    expect(loadChildren).toHaveBeenCalledTimes(1);
    expect(focused()).toBe('r1');
  });

  it('shows an error row with Retry, announces assertively, and retries with the button or ArrowRight', async () => {
    let attempt = 0;
    const loadChildren = vi.fn(async () => {
      attempt += 1;
      if (attempt < 3) throw new Error('offline');
      return [{ id: 'r1', label: 'Report' }];
    });
    const { user } = setup({ items: lazyItems, loadChildren });
    await user.tab();
    await user.keyboard('{ArrowRight}');
    const retry = await screen.findByRole('button', { name: 'Retry' });
    expect(screen.getByText('Couldn’t load Remote')).toBeInTheDocument();
    await waitFor(() => expect(announced('assertive')).toBe('Couldn’t load Remote'));
    expect(item('Remote')).not.toHaveAttribute('aria-busy');
    await user.click(retry);
    expect(loadChildren).toHaveBeenCalledTimes(2);
    await screen.findByRole('button', { name: 'Retry' });
    item('Remote').focus();
    await user.keyboard('{ArrowRight}');
    expect(await screen.findByRole('treeitem', { name: 'Report' })).toBeInTheDocument();
    expect(loadChildren).toHaveBeenCalledTimes(3);
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });

  it('loads children of nodes expanded through props, and a node with no children becomes a leaf', async () => {
    const loadChildren = vi.fn(async () => [] as TreeNode[]);
    render(<TreeView aria-label="Files" items={lazyItems} loadChildren={loadChildren} defaultExpandedKeys={['remote']} />);
    await waitFor(() => expect(item('Remote')).not.toHaveAttribute('aria-expanded'));
    expect(loadChildren).toHaveBeenCalledTimes(1);
  });

  it('passes a check on an unloaded node down to the children it loads', async () => {
    const onCheckedKeysChange = vi.fn();
    const loadChildren = async () => [
      { id: 'r1', label: 'Report' },
      { id: 'r2', label: 'Roadmap', disabled: true },
    ];
    const { user } = setup({ items: lazyItems, loadChildren, checkboxes: true, defaultCheckedKeys: ['remote'], onCheckedKeysChange });
    expect(item('Remote')).toHaveAttribute('aria-checked', 'true');
    await user.tab();
    await user.keyboard('{ArrowRight}');
    await screen.findByRole('treeitem', { name: 'Report' });
    expect(onCheckedKeysChange).toHaveBeenLastCalledWith(['r1']);
    expect(item('Report')).toHaveAttribute('aria-checked', 'true');
    expect(item('Remote')).toHaveAttribute('aria-checked', 'mixed');
  });
});

describe('TreeView: large trees', () => {
  it('renders 1,500+ nodes, expands all and moves focus re-rendering only the affected rows', async () => {
    const big: TreeNode[] = Array.from({ length: 30 }, (_, i) => ({
      id: `f${i}`,
      label: `Folder ${i}`,
      children: Array.from({ length: 50 }, (_, j) => ({ id: `f${i}-${j}`, label: `File ${i}.${j}` })),
    }));
    const calls = { n: 0 };
    function Big() {
      const renderLabel = useCallback((node: TreeNode): ReactNode => {
        calls.n += 1;
        return node.label;
      }, []);
      return <TreeView aria-label="Big" items={big} renderLabel={renderLabel} />;
    }
    render(<Big />);
    const first = screen.getAllByRole('treeitem')[0]!;
    act(() => first.focus());
    act(() => {
      fireEvent.keyDown(first, { key: '*' });
    });
    const all = document.querySelectorAll('[role="treeitem"]');
    expect(all).toHaveLength(1530);
    expect(document.querySelectorAll('[role="treeitem"][tabindex="0"]')).toHaveLength(1);

    calls.n = 0;
    const moves = 40;
    const start = performance.now();
    for (let i = 0; i < moves; i++) {
      act(() => {
        fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
      });
    }
    const elapsed = performance.now() - start;
    expect(focused()).toBe(`f0-${moves - 1}`);
    // Each move re-renders the row losing the tab stop and the row gaining it.
    expect(calls.n).toBeLessThanOrEqual(moves * 2 + 2);
    expect(elapsed).toBeLessThan(3000);

    calls.n = 0;
    act(() => {
      fireEvent.keyDown(document.activeElement!, { key: 'End' });
    });
    expect(focused()).toBe('f29-49');
    expect(calls.n).toBeLessThanOrEqual(2);
  });
});

describe('TreeView: axe', () => {
  it('has no violations in single, multiple, checkbox, link and lazy error states (light and dark)', async () => {
    const loadChildren = () => Promise.reject(new Error('offline'));
    const { container } = render(
      <AnnouncerProvider>
        <TreeView aria-label="Single" items={items} defaultExpandedKeys={['docs', 'pics']} defaultSelectedKeys={['cv']} />
        <TreeView aria-label="Multiple" selectionMode="multiple" items={items} defaultExpandedKeys={['docs']} defaultSelectedKeys={['cv', 'docs']} />
        <TreeView aria-label="Checks" checkboxes items={items} defaultExpandedKeys={['docs', 'letters']} defaultCheckedKeys={['bank']} />
        <TreeView aria-label="Nav" selectionMode="none" items={[{ id: 'home', label: 'Home', href: '#home' }]} />
        <TreeView aria-label="Lazy" items={[{ id: 'remote', label: 'Remote', hasChildren: true }]} loadChildren={loadChildren} defaultExpandedKeys={['remote']} />
      </AnnouncerProvider>,
    );
    await screen.findByRole('button', { name: 'Retry' });
    await expectNoAxeViolations(container);
  });

  it('has no violations while loading', async () => {
    const { container } = render(
      <TreeView aria-label="Lazy" items={[{ id: 'remote', label: 'Remote', hasChildren: true }]} loadChildren={() => new Promise(() => {})} defaultExpandedKeys={['remote']} />,
    );
    await screen.findByText('Loading');
    await expectNoAxeViolations(container);
  });
});
