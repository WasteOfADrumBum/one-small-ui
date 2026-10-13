import { useState } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureAxe } from 'jest-axe';
import { Field } from '../src/components/Field';
import { Form } from '../src/components/Form';
import {
  TimePicker,
  formatTime,
  getHourCycle,
  getTimeOptions,
  minutesToTime,
  parseTime,
  timeToMinutes,
} from '../src/components/TimePicker';

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
    'color-contrast-enhanced': { enabled: false },
    region: { enabled: false },
  },
});

const optionNames = () => within(screen.getByRole('listbox', { hidden: true })).getAllByRole('option', { hidden: true }).map((o) => o.textContent);
const activeText = (input: HTMLElement) => {
  const id = input.getAttribute('aria-activedescendant');
  return id ? document.getElementById(id)?.textContent : null;
};

describe('time helpers', () => {
  it.each([
    ['9', '09:00'],
    ['09', '09:00'],
    ['930', '09:30'],
    ['0930', '09:30'],
    ['2130', '21:30'],
    ['9:30', '09:30'],
    ['9.30', '09:30'],
    ['9h30', '09:30'],
    ['21:30', '21:30'],
    ['0:00', '00:00'],
    ['23:59', '23:59'],
    ['09:30:15', '09:30'],
    ['9p', '21:00'],
    ['9:30p', '21:30'],
    ['9:30pm', '21:30'],
    ['9:30 PM', '21:30'],
    ['9.30 pm', '21:30'],
    ['9.30 p.m.', '21:30'],
    ['930a', '09:30'],
    ['  7:05 AM ', '07:05'],
    ['12am', '00:00'],
    ['12:30 am', '00:30'],
    ['12pm', '12:00'],
    ['12:45 PM', '12:45'],
    ['1 pm', '13:00'],
  ])('parses %j as %s', (text, expected) => {
    expect(parseTime(text)).toBe(expected);
  });

  it.each(['', '   ', 'abc', '24:00', '24', '2400', '25:00', '9:60', '960', '13pm', '0am', '0 pm', '9:3', '12345', '9:30:75', '-1', '9::30', 'noon'])(
    'rejects %j',
    (text) => {
      expect(parseTime(text)).toBeNull();
    },
  );

  it('converts between HH:mm and minutes', () => {
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('09:30')).toBe(570);
    expect(timeToMinutes('23:59')).toBe(1439);
    expect(timeToMinutes('24:00')).toBeNaN();
    expect(timeToMinutes('9:30')).toBeNaN();
    expect(minutesToTime(570)).toBe('09:30');
    expect(minutesToTime(0)).toBe('00:00');
    expect(minutesToTime(1440)).toBe('00:00');
    expect(minutesToTime(-15)).toBe('23:45');
  });

  it('formats for 12 and 24 hour clocks', () => {
    expect(formatTime('21:30', { locale: 'en-US', hourCycle: 'h12' })).toBe('9:30 PM');
    expect(formatTime('00:05', { locale: 'en-US', hourCycle: 'h12' })).toBe('12:05 AM');
    expect(formatTime('12:00', { locale: 'en-US', hourCycle: 'h12' })).toBe('12:00 PM');
    expect(formatTime('09:30', { locale: 'en-US', hourCycle: 'h23' })).toBe('09:30');
    expect(formatTime('21:30', { locale: 'en-GB' })).toBe('21:30');
    expect(formatTime('21:30', { locale: 'en-US' })).toBe('9:30 PM');
    expect(formatTime('nope')).toBe('');
    // Display text always reads back.
    for (const v of ['00:00', '00:30', '11:59', '12:00', '12:15', '23:45'])
      expect(parseTime(formatTime(v, { locale: 'en-US', hourCycle: 'h12' }))).toBe(v);
  });

  it('reads the hour cycle from the locale', () => {
    expect(getHourCycle('en-US')).toBe('h12');
    expect(getHourCycle('en-GB')).toBe('h23');
    expect(getHourCycle('de-DE')).toBe('h23');
  });

  it('lists times by step between min and max', () => {
    expect(getTimeOptions()).toHaveLength(96);
    expect(getTimeOptions().slice(0, 3)).toEqual(['00:00', '00:15', '00:30']);
    expect(getTimeOptions().at(-1)).toBe('23:45');
    expect(getTimeOptions({ step: 30, min: '09:00', max: '11:00' })).toEqual(['09:00', '09:30', '10:00', '10:30', '11:00']);
    expect(getTimeOptions({ step: 45, min: '09:10', max: '11:00' })).toEqual(['09:10', '09:55', '10:40']);
    expect(getTimeOptions({ min: '12:00', max: '09:00' })).toEqual([]);
    expect(getTimeOptions({ step: 0, min: '00:00', max: '00:30' })).toEqual(['00:00', '00:15', '00:30']);
  });
});

describe('TimePicker', () => {
  it('opens with Down, moves through the times and selects with Enter', async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Field label="Start time">
        <TimePicker locale="en-US" name="start" defaultValue="09:00" onValueChange={onValueChange} />
      </Field>,
    );
    const input = screen.getByRole('combobox', { name: 'Start time' });
    expect(input).toHaveValue('9:00 AM');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    input.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    const listbox = screen.getByRole('listbox', { name: 'Start time' });
    expect(input).toHaveAttribute('aria-controls', listbox.id);
    // Opens on the selected time.
    expect(activeText(input)).toBe('9:00 AM');
    expect(within(listbox).getByRole('option', { name: '9:00 AM' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(activeText(input)).toBe('9:30 AM');
    await userEvent.keyboard('{ArrowUp}');
    expect(activeText(input)).toBe('9:15 AM');
    await userEvent.keyboard('{PageDown}');
    expect(activeText(input)).toBe('10:15 AM');
    await userEvent.keyboard('{PageUp}{PageUp}');
    expect(activeText(input)).toBe('8:15 AM');
    await userEvent.keyboard('{End}');
    expect(activeText(input)).toBe('11:45 PM');
    await userEvent.keyboard('{Home}');
    expect(activeText(input)).toBe('12:00 AM');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith('00:15');
    expect(input).toHaveValue('12:15 AM');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(container.querySelector('input[type="hidden"][name="start"]')).toHaveValue('00:15');
  });

  it('opens with Alt+Down, closes with Alt+Up and Escape', async () => {
    render(<TimePicker aria-label="Alarm" locale="en-GB" defaultValue="07:00" />);
    const input = screen.getByRole('combobox', { name: 'Alarm' });
    input.focus();
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(activeText(input)).toBe('07:00');
    await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveFocus();
    expect(input).toHaveValue('07:00');
  });

  it('scrolls the selected or nearest time into view on open', async () => {
    const scroll = vi.fn();
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = scroll;
    try {
      render(<TimePicker aria-label="Meeting" locale="en-GB" defaultValue="10:07" />);
      const input = screen.getByRole('combobox');
      input.focus();
      await userEvent.keyboard('{ArrowDown}');
      // 10:07 isn't a step; the nearest listed time is 10:00.
      expect(activeText(input)).toBe('10:00');
      expect(scroll).toHaveBeenCalledWith({ block: 'center' });
      expect(scroll.mock.contexts.at(-1)).toHaveTextContent('10:00');
      await userEvent.keyboard('{ArrowDown}');
      expect(scroll).toHaveBeenLastCalledWith({ block: 'nearest' });
    } finally {
      Element.prototype.scrollIntoView = original;
    }
  });

  it('opens on the time nearest to now when empty', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 13, 14, 52));
    try {
      render(<TimePicker aria-label="Call" locale="en-GB" />);
      const input = screen.getByRole('combobox');
      input.focus();
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(activeText(input)).toBe('14:45');
    } finally {
      vi.useRealTimers();
    }
  });

  it('opens and closes from the clock button, which stays out of the tab order', async () => {
    render(<TimePicker aria-label="Pickup" locale="en-US" defaultValue="13:00" />);
    const button = screen.getByRole('button', { name: 'Change time, 1:00 PM' });
    expect(button).toHaveAttribute('tabindex', '-1');
    await userEvent.click(button);
    const input = screen.getByRole('combobox');
    expect(input).toHaveFocus();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(screen.getByRole('option', { name: '2:30 PM' }));
    expect(input).toHaveValue('2:30 PM');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('parses typed text and normalizes it on blur', async () => {
    const onValueChange = vi.fn();
    render(
      <>
        <TimePicker aria-label="Time" locale="en-US" onValueChange={onValueChange} />
        <button type="button">Next</button>
      </>,
    );
    const input = screen.getByRole('combobox');
    await userEvent.type(input, '930p');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    // The list follows what's typed.
    expect(activeText(input)).toBe('9:30 PM');
    await userEvent.tab();
    expect(onValueChange).toHaveBeenLastCalledWith('21:30');
    expect(input).toHaveValue('9:30 PM');
    expect(input).not.toHaveAttribute('aria-invalid');

    await userEvent.clear(input);
    await userEvent.type(input, '0715');
    await userEvent.tab();
    expect(onValueChange).toHaveBeenLastCalledWith('07:15');
    expect(input).toHaveValue('7:15 AM');

    // Off-step times typed in are kept.
    await userEvent.clear(input);
    await userEvent.type(input, '9.37 pm{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith('21:37');
    expect(input).toHaveValue('9:37 PM');

    await userEvent.clear(input);
    await userEvent.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(input).toHaveValue('');
  });

  it('marks unparseable text invalid and announces it', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const onValueChange = vi.fn();
      render(
        <>
          <Field label="Departure">
            <TimePicker locale="en-US" defaultValue="08:00" onValueChange={onValueChange} />
          </Field>
          <button type="button">Next</button>
        </>,
      );
      const input = screen.getByRole('combobox', { name: 'Departure' });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      await user.clear(input);
      await user.type(input, 'soon');
      await user.tab();
      expect(input).toHaveValue('soon');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(onValueChange).toHaveBeenLastCalledWith(null);
      expect((input as HTMLInputElement).validationMessage).toBe('Enter a time like 9:30 AM.');
      // Field shows the message and links it.
      expect(document.querySelector('.os-field__error')).toHaveTextContent('Enter a time like 9:30 AM.');
      expect(input).toHaveAccessibleDescription('Enter a time like 9:30 AM.');
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(document.querySelector('[data-os-announcer="polite"]')).toHaveTextContent('Enter a time like 9:30 AM.');

      await user.clear(input);
      await user.type(input, '10a');
      await user.tab();
      expect(input).toHaveValue('10:00 AM');
      expect(input).not.toHaveAttribute('aria-invalid');
      expect((input as HTMLInputElement).validationMessage).toBe('');
      expect(document.querySelector('.os-field__error')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('Escape on a closed list reverts typed text', async () => {
    render(<TimePicker aria-label="Time" locale="en-GB" defaultValue="10:00" />);
    const input = screen.getByRole('combobox');
    await userEvent.clear(input);
    await userEvent.type(input, 'xyz');
    await userEvent.keyboard('{Escape}{Escape}');
    expect(input).toHaveValue('10:00');
  });

  it('respects min, max, step and disabled times', async () => {
    const onValueChange = vi.fn();
    const isTimeDisabled = (v: string) => v === '12:00' || v === '12:30';
    render(
      <>
        <TimePicker
          aria-label="Slot"
          locale="en-GB"
          min="09:00"
          max="17:00"
          step={30}
          isTimeDisabled={isTimeDisabled}
          onValueChange={onValueChange}
        />
        <button type="button">Next</button>
      </>,
    );
    const input = screen.getByRole('combobox');
    input.focus();
    await userEvent.keyboard('{ArrowDown}{Home}');
    expect(optionNames()).toHaveLength(17);
    expect(optionNames()[0]).toBe('09:00');
    expect(optionNames().at(-1)).toBe('17:00');
    expect(screen.getByRole('option', { name: '12:00' })).toHaveAttribute('aria-disabled', 'true');
    // 11:30 → skips 12:00 and 12:30 → 13:00.
    await userEvent.keyboard('{PageDown}{PageDown}{ArrowDown}');
    expect(activeText(input)).toBe('11:30');
    await userEvent.keyboard('{ArrowDown}');
    expect(activeText(input)).toBe('13:00');
    // Clicking a disabled time does nothing.
    await userEvent.click(screen.getByRole('option', { name: '12:00' }));
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');

    await userEvent.type(input, '8:00');
    await userEvent.tab();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect((input as HTMLInputElement).validationMessage).toBe('Choose a time between 09:00 and 17:00.');

    await userEvent.clear(input);
    await userEvent.type(input, '12');
    await userEvent.tab();
    expect((input as HTMLInputElement).validationMessage).toBe('12:00 is not available.');

    await userEvent.clear(input);
    await userEvent.type(input, '1715');
    await userEvent.tab();
    expect((input as HTMLInputElement).validationMessage).toBe('Choose a time between 09:00 and 17:00.');

    await userEvent.clear(input);
    await userEvent.type(input, '16:45');
    await userEvent.tab();
    expect(onValueChange).toHaveBeenLastCalledWith('16:45');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('uses the locale hour cycle unless overridden', () => {
    const { rerender } = render(<TimePicker aria-label="T" locale="en-US" value="21:30" />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('9:30 PM');
    rerender(<TimePicker aria-label="T" locale="en-GB" value="21:30" />);
    expect(input).toHaveValue('21:30');
    rerender(<TimePicker aria-label="T" locale="en-US" hourCycle="h23" value="21:30" />);
    expect(input).toHaveValue('21:30');
    rerender(<TimePicker aria-label="T" locale="en-GB" hourCycle="h12" value="09:05" />);
    expect(input).toHaveValue('9:05 am');
    // Typing accepts 24-hour input either way.
    expect(optionNames()[0]).toBe('12:00 am');
  });

  it('works controlled and uncontrolled', async () => {
    function Controlled() {
      const [value, setValue] = useState<string | null>('10:00');
      return (
        <>
          <TimePicker aria-label="Controlled" locale="en-GB" value={value} onValueChange={setValue} />
          <output data-testid="out">{value ?? 'none'}</output>
          <button type="button" onClick={() => setValue('18:15')}>
            Evening
          </button>
        </>
      );
    }
    render(<Controlled />);
    const input = screen.getByRole('combobox', { name: 'Controlled' });
    input.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(screen.getByTestId('out')).toHaveTextContent('10:15');
    expect(input).toHaveValue('10:15');
    await userEvent.click(screen.getByRole('button', { name: 'Evening' }));
    expect(input).toHaveValue('18:15');

    // A controlled value that the parent doesn't update stays put.
    const onValueChange = vi.fn();
    render(<TimePicker aria-label="Fixed" locale="en-GB" value="08:00" onValueChange={onValueChange} />);
    const fixed = screen.getByRole('combobox', { name: 'Fixed' });
    fixed.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('08:15');
    expect(fixed).toHaveValue('08:00');
  });

  it('supports a controlled open state', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<TimePicker aria-label="T" locale="en-GB" open={false} onOpenChange={onOpenChange} />);
    const input = screen.getByRole('combobox');
    input.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(input).toHaveAttribute('aria-expanded', 'false');
    rerender(<TimePicker aria-label="T" locale="en-GB" open onOpenChange={onOpenChange} />);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeVisible();
  });

  it('submits HH:mm with FormData', async () => {
    let data: FormData | null = null;
    render(
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          data = new FormData(e.currentTarget);
        }}
      >
        <Field label="Arrival">
          <TimePicker name="arrival" locale="en-US" />
        </Field>
        <button type="submit">Send</button>
      </Form>,
    );
    const input = screen.getByRole('combobox', { name: 'Arrival' });
    await userEvent.type(input, '9:45 pm');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(data!.get('arrival')).toBe('21:45');
    expect(data!.getAll('arrival')).toHaveLength(1);
  });

  it('blocks native submission while the text is invalid, and when required and empty', async () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Field label="Pickup" required>
          <TimePicker name="pickup" locale="en-US" />
        </Field>
        <button type="submit">Send</button>
      </form>,
    );
    const input = screen.getByRole('combobox', { name: /Pickup/ });
    expect(input).toBeRequired();
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.type(input, 'later');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.clear(input);
    await userEvent.type(input, '11');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('takes label, description, error, disabled and readOnly from Field', async () => {
    const { rerender } = render(
      <Field label="Check-in" description="Between 3 and 9 PM." error="Pick a later time">
        <TimePicker locale="en-US" defaultValue="14:00" name="in" />
      </Field>,
    );
    const input = screen.getByRole('combobox', { name: 'Check-in' });
    expect(input).toHaveAccessibleDescription('Between 3 and 9 PM. Pick a later time');
    expect(input).toHaveAttribute('aria-invalid', 'true');

    rerender(
      <Field label="Check-in" disabled>
        <TimePicker locale="en-US" defaultValue="14:00" name="in" />
      </Field>,
    );
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { hidden: true })).toBeDisabled();
    expect(document.querySelector('input[type="hidden"][name="in"]')).toBeDisabled();

    rerender(
      <Field label="Check-in" readOnly>
        <TimePicker locale="en-US" defaultValue="14:00" name="in" />
      </Field>,
    );
    expect(input).toHaveAttribute('readonly');
    input.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('sets size and invalid', () => {
    const { container } = render(<TimePicker aria-label="T" size="lg" invalid />);
    expect(container.querySelector('.os-input')).toHaveAttribute('data-size', 'lg');
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies the popup appearance', () => {
    const { container } = render(<TimePicker aria-label="T" appearance="dark" />);
    expect(container.querySelector('.os-timepicker__popup')).toHaveAttribute('data-os-theme', 'dark');
  });

  it('has no axe violations, closed and open', async () => {
    const { container } = render(
      <>
        <Field label="Start" description="Every 15 minutes.">
          <TimePicker locale="en-US" defaultValue="09:00" name="start" isTimeDisabled={(v) => v === '09:15'} />
        </Field>
        <TimePicker aria-label="End" locale="en-GB" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
    const input = screen.getByRole('combobox', { name: 'Start' });
    input.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(await axe(container)).toHaveNoViolations();
  });
});
