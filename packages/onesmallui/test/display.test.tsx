import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import {
  Accordion,
  AccordionItem,
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardGroup,
  CardOverlay,
  CloseButton,
  Collapse,
  CollapseTrigger,
  Collapsible,
  ListGroup,
  ListGroupItem,
  Pagination,
  Placeholder,
  Progress,
  ProgressStack,
  Skeleton,
  Spinner,
  Step,
  Stepper,
  getPaginationRange,
} from '../src';

async function expectNoAxeViolations(container: HTMLElement) {
  const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

describe('Accordion extensions', () => {
  it('sets variant and size data attributes', () => {
    const { container } = render(
      <Accordion variant="spaced" size="sm">
        <AccordionItem value="a" title="A">
          a
        </AccordionItem>
      </Accordion>,
    );
    const root = container.querySelector('.os-accordion')!;
    expect(root).toHaveAttribute('data-variant', 'spaced');
    expect(root).toHaveAttribute('data-size', 'sm');
  });

  it('supports controlled expand all / collapse all', () => {
    const { rerender } = render(
      <Accordion type="multiple" value={[]}>
        <AccordionItem value="a" title="A">
          a
        </AccordionItem>
        <AccordionItem value="b" title="B">
          b
        </AccordionItem>
      </Accordion>,
    );
    rerender(
      <Accordion type="multiple" value={['a', 'b']}>
        <AccordionItem value="a" title="A">
          a
        </AccordionItem>
        <AccordionItem value="b" title="B">
          b
        </AccordionItem>
      </Accordion>,
    );
    for (const btn of screen.getAllByRole('button')) expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders native details/summary with an exclusive name in single mode', async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Accordion native defaultValue={['a']} onValueChange={onValueChange}>
        <AccordionItem value="a" title="A">
          a
        </AccordionItem>
        <AccordionItem value="b" title="B">
          b
        </AccordionItem>
      </Accordion>,
    );
    const details = container.querySelectorAll('details');
    expect(details).toHaveLength(2);
    expect(details[0]!.getAttribute('name')).toBe(details[1]!.getAttribute('name'));
    expect(details[0]).toHaveAttribute('open');
    details[1]!.open = true;
    fireEvent(details[1]!, new Event('toggle'));
    expect(onValueChange).toHaveBeenLastCalledWith(['b']);
  });

  it('calls a render-function indicator with the open state', () => {
    render(
      <Accordion defaultValue={['a']} indicator={(open) => <span data-testid="ind">{open ? '-' : '+'}</span>}>
        <AccordionItem value="a" title="A">
          a
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByTestId('ind')).toHaveTextContent('-');
  });
});

describe('Alert', () => {
  it('hides itself when dismissible and calls onDismiss', async () => {
    const onDismiss = vi.fn();
    render(
      <Alert title="Heads up" dismissible onDismiss={onDismiss}>
        Body
      </Alert>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
  });

  it('keeps the old onDismiss-only behaviour (parent removes it)', async () => {
    const onDismiss = vi.fn();
    render(<Alert onDismiss={onDismiss}>Stay</Alert>);
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(screen.getByText('Stay')).toBeInTheDocument();
  });

  it('can be controlled and hide its icon', () => {
    const { container, rerender } = render(
      <Alert open icon={false}>
        Shown
      </Alert>,
    );
    expect(container.querySelector('.os-alert__icon')).toBeNull();
    rerender(<Alert open={false}>Shown</Alert>);
    expect(screen.queryByText('Shown')).not.toBeInTheDocument();
  });
});

describe('Avatar and AvatarGroup', () => {
  it('limits visible avatars and adds a +N counter', async () => {
    const { container } = render(
      <AvatarGroup label="Crew" max={2} size="sm">
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Mae Jemison" />
        <Avatar name="Sally Ride" />
      </AvatarGroup>,
    );
    expect(screen.getByRole('group', { name: 'Crew' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '2 more' })).toHaveTextContent('+2');
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveAttribute('data-size', 'sm');
    await expectNoAxeViolations(container);
  });

  it('uses total for people not passed', () => {
    render(
      <AvatarGroup total={10}>
        <Avatar name="Ada Lovelace" color="accent" size="2xl" />
      </AvatarGroup>,
    );
    expect(screen.getByRole('img', { name: '9 more' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveAttribute('data-size', '2xl');
  });
});

describe('Badge', () => {
  it('renders placement and hides dot-only text visually', () => {
    const { container } = render(
      <Badge placement="top-end" dot color="danger">
        New messages
      </Badge>,
    );
    const badge = container.querySelector('.os-badge')!;
    expect(badge).toHaveAttribute('data-placement', 'top-end');
    expect(badge).toHaveAttribute('data-dot-only');
    expect(screen.getByText('New messages')).toHaveClass('os-sr-only');
  });
});

describe('Breadcrumb', () => {
  it('renders a labelled nav with an ordered list and aria-current', async () => {
    const { container } = render(
      <Breadcrumb separator="slash">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem current>Page</BreadcrumbItem>
      </Breadcrumb>,
    );
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveAttribute('data-separator', 'slash');
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByText('Page')).toHaveAttribute('aria-current', 'page');
    await expectNoAxeViolations(container);
  });
});

describe('Card extensions', () => {
  it('sets color, orientation and overlay theme', () => {
    const { container } = render(
      <CardGroup layout="grid" minWidth="10rem">
        <Card color="success" variant="solid" orientation="horizontal">
          <CardOverlay>Text</CardOverlay>
        </Card>
      </CardGroup>,
    );
    const card = container.querySelector('.os-card')!;
    expect(card).toHaveAttribute('data-color', 'success');
    expect(card).toHaveAttribute('data-orientation', 'horizontal');
    expect(container.querySelector('.os-card__overlay')).toHaveAttribute('data-os-theme', 'dark');
    expect(container.querySelector('.os-card-group')).toHaveStyle({ '--os-card-min': '10rem' });
  });
});

describe('CloseButton', () => {
  it('has a label, size and variant', () => {
    render(<CloseButton label="Remove photo" size="sm" variant="overlay" />);
    const btn = screen.getByRole('button', { name: 'Remove photo' });
    expect(btn).toHaveAttribute('data-size', 'sm');
    expect(btn).toHaveAttribute('data-os-theme', 'dark');
  });
});

describe('Collapse', () => {
  it('toggles panels through CollapseTrigger with aria-controls listing every panel', async () => {
    const { container } = render(
      <Collapsible>
        <CollapseTrigger>Toggle</CollapseTrigger>
        <Collapse id="p1">One</Collapse>
        <Collapse id="p2">Two</Collapse>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: 'Toggle' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls', 'p1 p2');
    expect(container.querySelector('#p1')).toHaveAttribute('data-state', 'closed');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(container.querySelector('#p2')).toHaveAttribute('data-state', 'open');
  });

  it('works controlled with open and orientation', () => {
    const { container } = render(
      <Collapse open orientation="horizontal">
        Panel
      </Collapse>,
    );
    const el = container.querySelector('.os-collapse')!;
    expect(el).toHaveAttribute('data-state', 'open');
    expect(el).toHaveAttribute('data-orientation', 'horizontal');
  });
});

describe('ListGroup', () => {
  it('renders links, buttons, active and disabled items', async () => {
    const onClick = vi.fn();
    const { container } = render(
      <ListGroup numbered aria-label="Items">
        <ListGroupItem href="/a" active current="page">
          A
        </ListGroupItem>
        <ListGroupItem onClick={onClick}>B</ListGroupItem>
        <ListGroupItem onClick={onClick} disabled>
          C
        </ListGroupItem>
        <ListGroupItem>D</ListGroupItem>
      </ListGroup>,
    );
    expect(container.querySelector('ol.os-list-group')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'A' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: 'B' }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'C' })).toBeDisabled();
    await expectNoAxeViolations(container);
  });
});

describe('Pagination', () => {
  it('computes ranges with ellipses', () => {
    expect(getPaginationRange(6, 20)).toEqual([1, 'ellipsis-start', 5, 6, 7, 'ellipsis-end', 20]);
    expect(getPaginationRange(1, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 20]);
    expect(getPaginationRange(20, 20)).toEqual([1, 'ellipsis-start', 16, 17, 18, 19, 20]);
    expect(getPaginationRange(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('navigates with buttons and marks the current page', async () => {
    const onPageChange = vi.fn();
    const { container } = render(<Pagination count={10} defaultPage={1} onPageChange={onPageChange} showFirstLast />);
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: 'Last page' }));
    expect(onPageChange).toHaveBeenLastCalledWith(10);
    await expectNoAxeViolations(container);
  });

  it('renders links in link mode', () => {
    render(<Pagination count={3} page={1} getHref={(p) => `?page=${p}`} />);
    expect(screen.getByRole('link', { name: 'Page 2' })).toHaveAttribute('href', '?page=2');
    expect(screen.getByRole('link', { name: 'Previous page' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('link', { name: 'Previous page' })).not.toHaveAttribute('href');
  });
});

describe('Placeholders', () => {
  it('renders hidden placeholders with animation and width', () => {
    const { container } = render(
      <>
        <Placeholder width={40} animation="pulse" color="primary" />
        <Skeleton animation="none" />
      </>,
    );
    const ph = container.querySelector('.os-placeholder')!;
    expect(ph).toHaveAttribute('aria-hidden', 'true');
    expect(ph).toHaveAttribute('data-animation', 'pulse');
    expect(ph).toHaveStyle({ width: '40%' });
    expect(container.querySelector('.os-skeleton')).toHaveAttribute('data-animation', 'none');
  });
});

describe('Progress', () => {
  it('supports striped, animated, inside labels and valuetext', () => {
    const { container } = render(
      <Progress label="Files" value={3} max={4} striped animated showValue="inside" formatValue={(v, m) => `${v} of ${m}`} />,
    );
    const bar = screen.getByRole('progressbar', { name: 'Files' });
    expect(bar).toHaveAttribute('aria-valuetext', '3 of 4');
    expect(container.querySelector('.os-progress__bar')).toHaveAttribute('data-animated');
    expect(container.querySelector('.os-progress__value')).toHaveTextContent('3 of 4');
  });

  it('renders a stack of labelled progressbars in a group', async () => {
    const { container } = render(
      <ProgressStack
        label="Storage"
        segments={[
          { label: 'Photos', value: 30, color: 'accent' },
          { label: 'Docs', value: 20 },
        ]}
      />,
    );
    expect(screen.getByRole('group', { name: 'Storage' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Photos' })).toHaveAttribute('aria-valuenow', '30');
    expect(screen.getByRole('progressbar', { name: 'Docs' })).toHaveStyle({ width: '20%' });
    await expectNoAxeViolations(container);
  });
});

describe('Spinner', () => {
  it('has variant and color attributes and a status role', () => {
    render(<Spinner variant="grow" color="current" size="xl" label="Loading data" />);
    const s = screen.getByRole('status');
    expect(s).toHaveAttribute('data-variant', 'grow');
    expect(s).toHaveAttribute('data-color', 'current');
    expect(s).toHaveTextContent('Loading data');
  });
});

describe('Stepper', () => {
  it('marks status and aria-current="step"', async () => {
    const { container } = render(
      <Stepper activeStep={1} aria-label="Checkout">
        <Step title="Cart" />
        <Step title="Shipping" />
        <Step title="Pay" />
      </Stepper>,
    );
    const items = container.querySelectorAll('ol > li');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveAttribute('data-status', 'complete');
    expect(items[0]).toHaveTextContent('Cart, completed');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[2]).toHaveAttribute('data-status', 'upcoming');
    await expectNoAxeViolations(container);
  });

  it('makes steps buttons with onStepClick', async () => {
    const onStepClick = vi.fn();
    render(
      <Stepper activeStep={1} onStepClick={onStepClick} orientation={{ base: 'vertical' }}>
        <Step title="One" />
        <Step title="Two" />
      </Stepper>,
    );
    await userEvent.click(screen.getByRole('button', { name: /One/ }));
    expect(onStepClick).toHaveBeenCalledWith(0);
    expect(screen.getByRole('button', { name: 'Two' })).toHaveAttribute('aria-current', 'step');
    await act(async () => {});
  });
});
