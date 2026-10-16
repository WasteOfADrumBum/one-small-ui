import { useState } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AnnouncerProvider } from '../src/hooks/useAnnouncer';
import { Avatar } from '../src/components/Avatar';
import { Button } from '../src/components/Button';
import { Timeline, TimelineItem, type TimelineProps } from '../src/components/Timeline';
import { StarIcon } from '../src/icons/StarIcon';

async function expectNoAxeViolations(container: HTMLElement) {
  for (const theme of ['light', 'dark']) {
    document.documentElement.setAttribute('data-os-theme', theme);
    const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
    expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  }
  document.documentElement.removeAttribute('data-os-theme');
}

const announced = () => document.querySelector('[data-os-announcer="polite"]')?.textContent;
afterEach(() => document.querySelectorAll('body > [data-os-announcer]').forEach((el) => el.remove()));

const NOW = new Date('2026-10-16T12:00:00Z');
const minutesAgo = (n: number) => new Date(NOW.getTime() - n * 60_000);

function events(n: number) {
  return Array.from({ length: n }, (_, i) => (
    <TimelineItem key={i} title={`Event ${i + 1}`} time={minutesAgo(i * 10)} data-testid={`event-${i + 1}`} />
  ));
}

const opts = { locale: 'en-US', timeZone: 'UTC' } as const;

describe('Timeline: structure', () => {
  it('renders an ordered list of items with <time datetime>', () => {
    render(
      <Timeline aria-label="Mission" {...opts}>
        <TimelineItem title="Launch" time={new Date('2026-10-01T06:40:00Z')} description="Pad 39A" />
        <TimelineItem title="Orbit" time="2026-10-01T07:12:00Z" />
      </Timeline>,
    );
    const list = screen.getByRole('list', { name: 'Mission' });
    expect(list.tagName).toBe('OL');
    const [launch, orbit] = within(list).getAllByRole('listitem');
    expect(launch).toHaveTextContent('Launch');
    expect(launch).toHaveTextContent('Pad 39A');
    const time = launch!.querySelector('time')!;
    expect(time).toHaveAttribute('datetime', '2026-10-01T06:40:00.000Z');
    expect(time).toHaveTextContent('Oct 1, 2026, 6:40 AM');
    // A string keeps its own value in the attribute.
    expect(orbit!.querySelector('time')).toHaveAttribute('datetime', '2026-10-01T07:12:00Z');
  });

  it('shows a date-only string as that calendar day in any time zone', () => {
    render(
      <Timeline locale="en-US" timeZone="America/Los_Angeles">
        <TimelineItem title="Kick-off" time="2026-10-01" />
      </Timeline>,
    );
    const time = screen.getByText('Oct 1, 2026');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('datetime', '2026-10-01');
  });

  it('honours dateFormat, timeLabel, and falls back to the raw text for an unparseable time', () => {
    render(
      <Timeline locale="en-US" timeZone="UTC" dateFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}>
        <TimelineItem title="A" time="2026-10-01T06:40:00Z" />
        <TimelineItem title="B" time="2026-10-01T07:00:00Z" timeLabel="T+20 min" />
        <TimelineItem title="C" time="soon" />
      </Timeline>,
    );
    expect(screen.getByText('06:40').tagName).toBe('TIME');
    expect(screen.getByText('T+20 min')).toHaveAttribute('datetime', '2026-10-01T07:00:00Z');
    expect(screen.getByText('soon')).toHaveAttribute('datetime', 'soon');
  });

  it('renders the marker, description, extra content and actions', () => {
    render(
      <Timeline>
        <TimelineItem title="Docking" marker={<StarIcon data-testid="star" />} description="Port 3" actions={<Button size="sm">Open feed</Button>}>
          <p>Approaching at 0.1 m/s.</p>
        </TimelineItem>
      </Timeline>,
    );
    const item = screen.getByRole('listitem');
    expect(within(item).getByTestId('star').closest('.os-timeline__marker')).toHaveAttribute('aria-hidden', 'true');
    expect(within(item).getByText('Approaching at 0.1 m/s.').closest('.os-timeline__content')).toBeInTheDocument();
    expect(within(item).getByRole('button', { name: 'Open feed' }).closest('.os-timeline__actions')).toBeInTheDocument();
  });

  it('sets the layout and variant as data attributes, and forwards the ref and props', () => {
    const ref = { current: null as HTMLDivElement | null };
    const { container, rerender } = render(
      <Timeline ref={ref} className="mine" data-testid="tl">
        {events(2)}
      </Timeline>,
    );
    const root = screen.getByTestId('tl');
    expect(ref.current).toBe(root);
    expect(root).toHaveClass('os-timeline', 'mine');
    expect(root).toHaveAttribute('data-layout', 'vertical');
    expect(root).toHaveAttribute('data-variant', 'default');
    for (const layout of ['alternating', 'horizontal'] as const) {
      rerender(<Timeline layout={layout} data-testid="tl">{events(2)}</Timeline>);
      expect(screen.getByTestId('tl')).toHaveAttribute('data-layout', layout);
    }
    expect(container.querySelectorAll('li')).toHaveLength(2);
  });

  it('throws a helpful error outside a Timeline', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TimelineItem title="Alone" />)).toThrow('<TimelineItem> must be inside <Timeline>.');
    vi.mocked(console.error).mockRestore();
  });

  it('can be named by aria-labelledby instead', () => {
    render(
      <>
        <h2 id="h">History</h2>
        <Timeline aria-labelledby="h">{events(1)}</Timeline>
      </>,
    );
    expect(screen.getByRole('list', { name: 'History' })).not.toHaveAttribute('aria-label');
  });
});

describe('Timeline: status', () => {
  it('shows an icon and a visually hidden prefix for every status, not color alone', () => {
    const statuses = ['success', 'warning', 'danger', 'info', 'pending'] as const;
    const { container } = render(
      <Timeline>
        <TimelineItem title="Plain" />
        {statuses.map((s) => (
          <TimelineItem key={s} title={s} status={s} />
        ))}
      </Timeline>,
    );
    const [plain, ...rest] = screen.getAllByRole('listitem');
    expect(plain).toHaveAttribute('data-status', 'default');
    expect(plain!.querySelector('.os-sr-only')).toBeNull();
    expect(plain!.querySelector('.os-timeline__marker svg')).toBeNull();
    const prefixes = rest.map((li) => li.querySelector('.os-sr-only')?.textContent);
    expect(prefixes).toEqual(['Success: ', 'Warning: ', 'Error: ', 'Info: ', 'Pending: ']);
    rest.forEach((li, i) => {
      expect(li).toHaveAttribute('data-status', statuses[i]);
      expect(li.querySelector('.os-timeline__marker svg')).toHaveAttribute('aria-hidden', 'true');
    });
    // The prefix is read with the title, before it.
    expect(container.querySelector('[data-status="success"] .os-timeline__title')).toHaveTextContent('Success: success');
  });

  it('translates status text with statusLabels', () => {
    render(
      <Timeline statusLabels={{ danger: 'Échec' }}>
        <TimelineItem title="Lancement" status="danger" />
        <TimelineItem title="Orbite" status="success" />
      </Timeline>,
    );
    expect(screen.getByText('Échec:', { exact: false })).toHaveClass('os-sr-only');
    expect(screen.getByText('Success:', { exact: false })).toHaveClass('os-sr-only');
  });
});

describe('Timeline: horizontal scrolling', () => {
  it('becomes a named, focusable scroll region only when it overflows', () => {
    const sizes = vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(900);
    const client = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(360);
    const { container, rerender } = render(<Timeline layout="horizontal" aria-label="Release">{events(4)}</Timeline>);
    const region = screen.getByRole('region', { name: 'Release' });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(within(region).getByRole('list', { name: 'Release' })).toBeInTheDocument();
    sizes.mockReturnValue(360);
    rerender(<Timeline layout="horizontal" aria-label="Release">{events(5)}</Timeline>);
    expect(screen.queryByRole('region')).toBeNull();
    expect(container.querySelector('.os-timeline__viewport')).not.toHaveAttribute('tabindex');
    sizes.mockRestore();
    client.mockRestore();
  });

  it('never makes vertical timelines a scroll region', () => {
    const sizes = vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(900);
    render(<Timeline>{events(3)}</Timeline>);
    expect(screen.queryByRole('region')).toBeNull();
    sizes.mockRestore();
  });
});

describe('Timeline: Show more', () => {
  function setup(props: Partial<TimelineProps> = {}, total = 12) {
    const user = userEvent.setup();
    const utils = render(
      <AnnouncerProvider>
        <Timeline pageSize={5} {...props}>
          {events(total)}
        </Timeline>
      </AnnouncerProvider>,
    );
    return { user, ...utils };
  }

  it('shows pageSize items, then reveals the next batch, focuses the first new item and announces it', async () => {
    const { user } = setup();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    await user.click(screen.getByRole('button', { name: 'Show more' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(10);
    expect(document.activeElement).toBe(screen.getByTestId('event-6'));
    expect(screen.getByTestId('event-6')).toHaveAttribute('tabindex', '-1');
    await waitFor(() => expect(announced()).toBe('5 more events shown'));

    // The last batch is smaller; the button goes away once everything is shown.
    await user.click(screen.getByRole('button', { name: 'Show more' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(12);
    expect(document.activeElement).toBe(screen.getByTestId('event-11'));
    await waitFor(() => expect(announced()).toBe('2 more events shown'));
    expect(screen.queryByRole('button', { name: 'Show more' })).toBeNull();
  });

  it('works from the keyboard with Enter and Space', async () => {
    const { user } = setup({}, 20);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Show more' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getAllByRole('listitem')).toHaveLength(10);
    expect(screen.getByTestId('event-6')).toHaveFocus();
    await user.tab();
    await user.keyboard(' ');
    expect(screen.getAllByRole('listitem')).toHaveLength(15);
    expect(screen.getByTestId('event-11')).toHaveFocus();
    await waitFor(() => expect(announced()).toBe('5 more events shown'));
  });

  it('says "1 more event shown" for a single item and takes custom labels', async () => {
    const { user } = setup({ showMoreLabel: 'Older activity', moreShownLabel: (n) => `${n} older shown` }, 6);
    await user.click(screen.getByRole('button', { name: 'Older activity' }));
    await waitFor(() => expect(announced()).toBe('1 older shown'));
  });

  it('uses the default label for one item', async () => {
    const { user } = setup({}, 6);
    await user.click(screen.getByRole('button', { name: 'Show more' }));
    await waitFor(() => expect(announced()).toBe('1 more event shown'));
  });

  it('starts from defaultVisibleCount (uncontrolled) and reports changes', async () => {
    const onChange = vi.fn();
    const { user } = setup({ defaultVisibleCount: 2, onVisibleCountChange: onChange });
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Show more' }));
    expect(onChange).toHaveBeenCalledWith(7);
    expect(screen.getAllByRole('listitem')).toHaveLength(7);
  });

  it('can be controlled, and an outside change does not move focus', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [count, setCount] = useState(3);
      return (
        <AnnouncerProvider>
          <button type="button" onClick={() => setCount(12)}>
            All
          </button>
          <Timeline pageSize={5} visibleCount={count} onVisibleCountChange={setCount}>
            {events(12)}
          </Timeline>
        </AnnouncerProvider>
      );
    }
    render(<Controlled />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    await user.click(screen.getByRole('button', { name: 'Show more' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(8);
    expect(screen.getByTestId('event-4')).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(12);
    expect(screen.getByRole('button', { name: 'All' })).toHaveFocus();
  });

  it('a fixed visibleCount without onVisibleCountChange stays put', async () => {
    const { user } = setup({ visibleCount: 5 });
    await user.click(screen.getByRole('button', { name: 'Show more' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });

  it('has no button when everything fits, and no tab stops on items without paging', () => {
    setup({}, 4);
    expect(screen.queryByRole('button')).toBeNull();
    render(<Timeline>{events(2)}</Timeline>);
    expect(screen.getAllByRole('listitem').at(-1)).not.toHaveAttribute('tabindex');
  });
});

describe('Timeline: feed', () => {
  function Feed(props: Partial<TimelineProps>) {
    return (
      <Timeline variant="feed" aria-label="Activity" {...opts} {...props}>
        <TimelineItem actor="Ada Lovelace" avatarSrc="/ada.png" action="commented on Launch plan" time={minutesAgo(5)} data-testid="ada" />
        <TimelineItem actor="Grace Hopper" action="closed the incident" status="success" time={new Date(NOW.getTime() - 86_400_000)} data-testid="grace" />
      </Timeline>
    );
  }

  it('shows avatar, actor, action and the relative time, measured from now', () => {
    render(<Feed now={NOW} />);
    const ada = screen.getByTestId('ada');
    expect(ada.querySelector('.os-timeline__marker .os-avatar')).toHaveAttribute('aria-label', 'Ada Lovelace');
    expect(ada.querySelector('.os-timeline__marker')).toHaveAttribute('aria-hidden', 'true');
    expect(within(ada).getByText('Ada Lovelace')).toHaveClass('os-timeline__actor');
    expect(ada.querySelector('.os-timeline__title')).toHaveTextContent('Ada Lovelace commented on Launch plan');
    expect(within(ada).getByText('5 minutes ago').tagName).toBe('TIME');
    expect(within(screen.getByTestId('grace')).getByText('yesterday')).toBeInTheDocument();
    // Status still has its hidden text and an icon badge on the avatar.
    expect(screen.getByTestId('grace').querySelector('.os-timeline__title')).toHaveTextContent('Success: Grace Hopper closed the incident');
    expect(screen.getByTestId('grace').querySelector('.os-timeline__badge svg')).toBeInTheDocument();
  });

  it('puts the full date in a tooltip on a focusable time that describes it', async () => {
    const user = userEvent.setup();
    render(<Feed now={NOW} />);
    const time = screen.getByText('5 minutes ago');
    expect(time).toHaveAttribute('tabindex', '0');
    await user.tab();
    expect(time).toHaveFocus();
    const tip = document.getElementById(time.getAttribute('aria-describedby')!)!;
    expect(tip).toHaveAttribute('role', 'tooltip');
    expect(tip).toHaveTextContent('Friday, October 16, 2026 at 11:55 AM');
    expect(time).toHaveAccessibleDescription('Friday, October 16, 2026 at 11:55 AM');
    await waitFor(() => expect(tip).toHaveAttribute('data-state', 'open'));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(tip).not.toHaveAttribute('data-state', 'open'));
  });

  it('picks the largest unit that fits, for past and future', () => {
    const at = (ms: number) => new Date(NOW.getTime() + ms);
    render(
      <Timeline variant="feed" now={NOW} locale="en-US">
        {[
          [-10_000, 'now'],
          [-3 * 3_600_000, '3 hours ago'],
          [2 * 86_400_000, 'in 2 days'],
          [-14 * 86_400_000, '2 weeks ago'],
          [-65 * 86_400_000, '2 months ago'],
          [-800 * 86_400_000, '2 years ago'],
        ].map(([ms, text]) => (
          <TimelineItem key={text} actor="Ada" action={String(text)} time={at(ms as number)} />
        ))}
      </Timeline>,
    );
    for (const text of ['now', '3 hours ago', 'in 2 days', '2 weeks ago', '2 months ago', '2 years ago']) {
      expect(screen.getAllByText(text).some((el) => el.tagName === 'TIME')).toBe(true);
    }
  });

  it('renders relative times right away on a client-only render, and keeps them current', () => {
    vi.useFakeTimers({ now: NOW, toFake: ['Date', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'] });
    render(<Feed />);
    expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText('6 minutes ago')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('hydrates server markup with absolute dates, then switches to relative text', async () => {
    vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
    const html = renderToString(<Feed />);
    expect(html).toContain('Friday, October 16, 2026 at 11:55 AM');
    expect(html).not.toContain('minutes ago');
    const host = document.createElement('div');
    host.innerHTML = html;
    document.body.append(host);
    const errors = vi.fn();
    const spy = vi.spyOn(console, 'error').mockImplementation(errors);
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(host, <Feed />, { onRecoverableError: errors });
    });
    expect(errors).not.toHaveBeenCalled();
    expect(host).toHaveTextContent('5 minutes ago');
    act(() => root.unmount());
    host.remove();
    spy.mockRestore();
    vi.useRealTimers();
  });

  it('with a now prop, the server renders the relative text too', () => {
    const html = renderToString(<Feed now={NOW} />);
    expect(html).toContain('5 minutes ago');
  });

  it('a custom marker replaces the avatar, and a feed item can use a title', () => {
    render(
      <Timeline variant="feed" now={NOW}>
        <TimelineItem actor="Bot" action="deployed" marker={<Avatar name="Robot" />} time={NOW} />
        <TimelineItem title="System restarted" time={NOW} />
      </Timeline>,
    );
    expect(document.querySelector('.os-avatar')).toHaveAttribute('aria-label', 'Robot');
    expect(screen.getByText('System restarted')).toBeInTheDocument();
  });
});

describe('Timeline: axe', () => {
  it('has no violations in every layout, with paging, in light and dark', async () => {
    for (const layout of ['vertical', 'alternating', 'horizontal'] as const) {
      const { container, unmount } = render(
        <AnnouncerProvider>
          <Timeline layout={layout} pageSize={2} aria-label={`${layout} timeline`} {...opts}>
            <TimelineItem title="Launch" status="success" time="2026-10-01T06:40:00Z" description="Pad 39A" actions={<Button size="sm">Details</Button>} />
            <TimelineItem title="Orbit" status="pending" time="2026-10-01" />
            <TimelineItem title="Docking" status="danger" time="2026-10-02" />
          </Timeline>
        </AnnouncerProvider>,
      );
      await expectNoAxeViolations(container);
      fireEvent.click(screen.getByRole('button', { name: 'Show more' }));
      await expectNoAxeViolations(container);
      unmount();
    }
  });

  it('has no violations as a feed', async () => {
    const { container } = render(
      <Timeline variant="feed" now={NOW} aria-label="Activity" {...opts}>
        <TimelineItem actor="Ada Lovelace" action="commented" time={minutesAgo(5)} status="info" />
        <TimelineItem actor="Grace Hopper" action="approved" time={minutesAgo(50)} />
      </Timeline>,
    );
    await expectNoAxeViolations(container);
  });
});
