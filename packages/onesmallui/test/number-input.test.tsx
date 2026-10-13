import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { configureAxe } from 'jest-axe';
import { HOLD_DELAY, HOLD_INTERVAL, NumberInput, decimalsOf, parseNumber, roundTo } from '../src/components/NumberInput';
import { Field } from '../src/components/Field';
import { Form } from '../src/components/Form';
import { AnnouncerProvider } from '../src/hooks/useAnnouncer';

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
    'color-contrast-enhanced': { enabled: false },
    region: { enabled: false },
  },
});

const spin = () => screen.getByRole('spinbutton');

describe('NumberInput helpers', () => {
  it('rounds without floating-point drift', () => {
    expect(roundTo(0.1 + 0.2, 2)).toBe(0.3);
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(roundTo(-1.5, 0)).toBe(-2);
    expect(roundTo(-0.0001, 2)).toBe(0);
    expect(decimalsOf(0.25)).toBe(2);
    expect(decimalsOf(1e-7)).toBe(7);
    expect(decimalsOf(10)).toBe(0);
  });

  it('parses locale group and decimal separators', () => {
    expect(parseNumber('1,234.5', 'en-US')).toBe(1234.5);
    expect(parseNumber('1.234,5', 'de-DE')).toBe(1234.5);
    expect(parseNumber('1 234,5', 'fr-FR')).toBe(1234.5);
    expect(parseNumber('1 234.5', 'fr-FR')).toBe(1234.5);
    expect(parseNumber('$1,234.50', 'en-US')).toBe(1234.5);
    expect(parseNumber('−12', 'en-US')).toBe(-12);
    expect(parseNumber('١٢٣', 'ar-EG')).toBe(123);
    expect(parseNumber('', 'en-US')).toBeNull();
    expect(parseNumber('abc', 'en-US')).toBeNaN();
    expect(parseNumber('1.2.3', 'en-US')).toBeNaN();
  });
});

describe('NumberInput', () => {
  it('renders a text spinbutton with values and decimal keypad', () => {
    render(<NumberInput aria-label="Crew" defaultValue={4} min={1} max={12} />);
    const input = spin();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('inputmode', 'decimal');
    expect(input).toHaveAttribute('aria-valuenow', '4');
    expect(input).toHaveAttribute('aria-valuemin', '1');
    expect(input).toHaveAttribute('aria-valuemax', '12');
    expect(input).not.toHaveAttribute('aria-valuetext');
    expect(input).toHaveValue('4');
  });

  it('formats when blurred, shows the raw number while editing, and sets aria-valuetext', async () => {
    const user = userEvent.setup();
    render(
      <NumberInput aria-label="Price" locale="en-US" defaultValue={1234.5} formatOptions={{ style: 'currency', currency: 'USD' }} />,
    );
    const input = spin();
    expect(input).toHaveValue('$1,234.50');
    expect(input).toHaveAttribute('aria-valuetext', '$1,234.50');
    await user.click(input);
    expect(input).toHaveValue('1234.5');
    await user.tab();
    expect(input).toHaveValue('$1,234.50');
  });

  it('follows Intl percent semantics: 0.25 shows 25%, typing 30 means 0.3', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <NumberInput aria-label="Tip" locale="en-US" defaultValue={0.25} formatOptions={{ style: 'percent' }} onValueChange={onValueChange} />,
    );
    const input = spin();
    expect(input).toHaveValue('25%');
    expect(input).toHaveAttribute('aria-valuenow', '0.25');
    await user.click(input);
    expect(input).toHaveValue('25');
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith(0.26);
    await user.clear(input);
    await user.type(input, '30');
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(0.3);
    expect(input).toHaveValue('30%');
  });

  it('formats units and parses another locale', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <NumberInput
        aria-label="Distance"
        locale="de-DE"
        defaultValue={1500}
        formatOptions={{ style: 'unit', unit: 'kilometer' }}
        onValueChange={onValueChange}
      />,
    );
    const input = spin();
    expect(input).toHaveValue('1.500 km');
    await user.click(input);
    expect(input).toHaveValue('1500');
    await user.clear(input);
    await user.type(input, '2,5');
    expect(onValueChange).toHaveBeenLastCalledWith(2.5);
    await user.tab();
    expect(input).toHaveValue('2,5 km');
  });

  it('steps with arrows, Page keys and jumps with Home/End', async () => {
    const user = userEvent.setup();
    render(<NumberInput aria-label="Qty" defaultValue={5} min={0} max={100} step={2} />);
    const input = spin();
    await user.click(input);
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-valuenow', '6');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(input).toHaveAttribute('aria-valuenow', '2');
    await user.keyboard('{PageUp}');
    expect(input).toHaveAttribute('aria-valuenow', '22');
    await user.keyboard('{PageDown}');
    expect(input).toHaveAttribute('aria-valuenow', '2');
    await user.keyboard('{End}');
    expect(input).toHaveAttribute('aria-valuenow', '100');
    expect(input).toHaveValue('100');
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-valuenow', '100');
    await user.keyboard('{Home}');
    expect(input).toHaveAttribute('aria-valuenow', '0');
  });

  it('snaps off-grid values to the step and avoids floating-point noise', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<NumberInput aria-label="Dose" defaultValue={0.2} step={0.1} onValueChange={onValueChange} />);
    const input = spin();
    await user.click(input);
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith(0.3);
    await user.clear(input);
    await user.type(input, '1.23');
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith(1.3);
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(onValueChange).toHaveBeenLastCalledWith(1.1);
  });

  it('uses a custom largeStep and starts empty values at 0 or the nearest bound', async () => {
    const user = userEvent.setup();
    render(<NumberInput aria-label="Floor" min={3} largeStep={5} />);
    const input = spin();
    expect(input).not.toHaveAttribute('aria-valuenow');
    await user.click(input);
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveAttribute('aria-valuenow', '3');
    await user.keyboard('{PageUp}');
    expect(input).toHaveAttribute('aria-valuenow', '8');
  });

  it('clamps on blur, not while typing, and announces the adjustment', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <AnnouncerProvider>
        <NumberInput aria-label="Age" min={18} max={120} onValueChange={onValueChange} />
      </AnnouncerProvider>,
    );
    const input = spin();
    await user.click(input);
    await user.type(input, '150');
    expect(input).toHaveValue('150');
    expect(onValueChange).toHaveBeenLastCalledWith(150);
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(120);
    expect(input).toHaveValue('120');
    await act(() => new Promise((r) => setTimeout(r, 150)));
    expect(document.querySelector('[data-os-announcer="polite"]')).toHaveTextContent('Adjusted to the maximum, 120');
    await user.click(input);
    await user.clear(input);
    await user.type(input, '5');
    expect(input).toHaveValue('5');
    await user.keyboard('{Enter}');
    expect(input).toHaveValue('18');
  });

  it('rounds to precision on blur and restores the last value for invalid text', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<NumberInput aria-label="Weight" precision={2} defaultValue={1} onValueChange={onValueChange} />);
    const input = spin();
    await user.click(input);
    await user.clear(input);
    await user.type(input, '2.3456');
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(2.35);
    await user.click(input);
    await user.clear(input);
    await user.type(input, '-');
    await user.tab();
    expect(input).toHaveValue('');
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    await user.click(input);
    await user.type(input, 'x');
    await user.tab();
    expect(input).toHaveValue('');
  });

  it('works controlled', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [v, setV] = useState<number | null>(10);
      return (
        <>
          <NumberInput aria-label="Seats" value={v} onValueChange={setV} max={12} />
          <output>{String(v)}</output>
          <button type="button" onClick={() => setV(null)}>
            Clear
          </button>
        </>
      );
    }
    render(<Controlled />);
    const input = spin();
    await user.click(input);
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
    expect(screen.getByRole('status')).toHaveTextContent('12');
    expect(input).toHaveValue('12');
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(input).toHaveValue('');
    expect(screen.getByRole('status')).toHaveTextContent('null');
  });

  it('ignores a parent that keeps the value fixed', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<NumberInput aria-label="Fixed" value={3} onValueChange={onValueChange} />);
    await user.click(spin());
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenCalledWith(4);
    await user.tab();
    expect(spin()).toHaveValue('3');
  });

  it('has labelled stepper buttons outside the tab order', async () => {
    const user = userEvent.setup();
    render(<NumberInput aria-label="Guests" defaultValue={1} min={1} max={3} incrementLabel="Add guest" />);
    const inc = screen.getByRole('button', { name: 'Add guest' });
    const dec = screen.getByRole('button', { name: 'Decrease' });
    expect(inc).toHaveAttribute('tabindex', '-1');
    expect(dec).toHaveAttribute('tabindex', '-1');
    expect(inc).toHaveAttribute('aria-controls', spin().id);
    expect(dec).toBeDisabled();
    await user.click(inc);
    expect(spin()).toHaveAttribute('aria-valuenow', '2');
    // Assistive-technology activation (a click with no pointer press).
    fireEvent.click(inc);
    expect(spin()).toHaveAttribute('aria-valuenow', '3');
    expect(inc).toBeDisabled();
    await user.tab();
    expect(spin()).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });

  it('can hide the stepper', () => {
    render(<NumberInput aria-label="Code" hideStepper />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  describe('press and hold', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('repeats after a delay and stops on release, leave and at the bound', () => {
      render(<NumberInput aria-label="Volume" defaultValue={0} max={10} />);
      const inc = screen.getByRole('button', { name: 'Increase' });
      fireEvent.pointerDown(inc);
      expect(spin()).toHaveAttribute('aria-valuenow', '1');
      act(() => vi.advanceTimersByTime(HOLD_DELAY - 1));
      expect(spin()).toHaveAttribute('aria-valuenow', '1');
      act(() => vi.advanceTimersByTime(1 + HOLD_INTERVAL * 3));
      expect(spin()).toHaveAttribute('aria-valuenow', '4');
      fireEvent.pointerUp(inc);
      act(() => vi.advanceTimersByTime(HOLD_INTERVAL * 5));
      expect(spin()).toHaveAttribute('aria-valuenow', '4');

      fireEvent.pointerDown(inc);
      act(() => vi.advanceTimersByTime(HOLD_DELAY + HOLD_INTERVAL));
      expect(spin()).toHaveAttribute('aria-valuenow', '6');
      fireEvent.pointerLeave(inc);
      act(() => vi.advanceTimersByTime(HOLD_INTERVAL * 5));
      expect(spin()).toHaveAttribute('aria-valuenow', '6');

      fireEvent.pointerDown(inc);
      act(() => vi.advanceTimersByTime(HOLD_DELAY + HOLD_INTERVAL * 20));
      expect(spin()).toHaveAttribute('aria-valuenow', '10');
      expect(vi.getTimerCount()).toBe(0);
    });

    it('decrements and ignores secondary buttons', () => {
      render(<NumberInput aria-label="Temp" defaultValue={0} />);
      const dec = screen.getByRole('button', { name: 'Decrease' });
      // jsdom has no PointerEvent, so build one that carries the button.
      fireEvent(dec, new MouseEvent('pointerdown', { bubbles: true, cancelable: true, button: 2 }));
      expect(spin()).toHaveAttribute('aria-valuenow', '0');
      fireEvent.pointerDown(dec);
      act(() => vi.advanceTimersByTime(HOLD_DELAY + HOLD_INTERVAL * 2));
      fireEvent.pointerCancel(dec);
      expect(spin()).toHaveAttribute('aria-valuenow', '-3');
    });
  });

  describe('wheel', () => {
    it('does nothing unless allowWheel is set', () => {
      render(<NumberInput aria-label="Zoom" defaultValue={1} />);
      act(() => spin().focus());
      const e = new WheelEvent('wheel', { deltaY: -100, cancelable: true });
      spin().dispatchEvent(e);
      expect(e.defaultPrevented).toBe(false);
      expect(spin()).toHaveAttribute('aria-valuenow', '1');
    });

    it('steps only while focused and prevents page scroll', () => {
      render(<NumberInput aria-label="Zoom" defaultValue={1} allowWheel />);
      const blurred = new WheelEvent('wheel', { deltaY: -100, cancelable: true });
      spin().dispatchEvent(blurred);
      expect(blurred.defaultPrevented).toBe(false);
      expect(spin()).toHaveAttribute('aria-valuenow', '1');
      act(() => spin().focus());
      const up = new WheelEvent('wheel', { deltaY: -100, cancelable: true });
      act(() => {
        spin().dispatchEvent(up);
      });
      expect(up.defaultPrevented).toBe(true);
      expect(spin()).toHaveAttribute('aria-valuenow', '2');
      act(() => {
        spin().dispatchEvent(new WheelEvent('wheel', { deltaY: 100, cancelable: true }));
      });
      expect(spin()).toHaveAttribute('aria-valuenow', '1');
    });
  });

  it('respects disabled and readOnly', async () => {
    const user = userEvent.setup();
    render(
      <>
        <NumberInput aria-label="Locked" defaultValue={5} readOnly />
        <NumberInput aria-label="Off" defaultValue={5} disabled />
      </>,
    );
    const ro = screen.getByRole('spinbutton', { name: 'Locked' });
    await user.click(ro);
    await user.keyboard('{ArrowUp}{End}');
    expect(ro).toHaveAttribute('aria-valuenow', '5');
    expect(ro).toHaveAttribute('readonly');
    expect(screen.getByRole('spinbutton', { name: 'Off' })).toBeDisabled();
    screen.getAllByRole('button').forEach((b) => expect(b).toBeDisabled());
  });

  it('integrates with Field: label, description, error, required, disabled, readOnly', () => {
    const { rerender } = render(
      <Field label="Quantity" description="Up to 10 per order." error="Too many" required>
        <NumberInput defaultValue={11} max={10} />
      </Field>,
    );
    const input = screen.getByRole('spinbutton', { name: /Quantity/ });
    expect(input).toHaveAccessibleDescription('Up to 10 per order. Too many');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeRequired();
    expect(input.closest('.os-number-input')).toHaveAttribute('data-invalid');
    rerender(
      <Field label="Quantity" disabled>
        <NumberInput defaultValue={1} />
      </Field>,
    );
    expect(screen.getByRole('spinbutton', { name: 'Quantity' })).toBeDisabled();
    rerender(
      <Field label="Quantity" readOnly>
        <NumberInput defaultValue={1} />
      </Field>,
    );
    expect(screen.getByRole('spinbutton', { name: 'Quantity' })).toHaveAttribute('readonly');
  });

  it('links text adornments and takes the size', () => {
    render(<NumberInput aria-label="Budget" startAdornment="USD" endAdornment="per month" size="lg" />);
    expect(spin()).toHaveAccessibleDescription('USD per month');
    expect(spin().closest('.os-number-input')).toHaveAttribute('data-size', 'lg');
  });

  it('submits the raw number, not the formatted text', async () => {
    const user = userEvent.setup();
    let data: FormData | undefined;
    render(
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          data = new FormData(e.currentTarget);
        }}
      >
        <Field label="Price">
          <NumberInput name="price" locale="en-US" defaultValue={1234.5} formatOptions={{ style: 'currency', currency: 'USD' }} />
        </Field>
        <Field label="Empty">
          <NumberInput name="empty" />
        </Field>
        <NumberInput aria-label="Off" name="off" defaultValue={3} disabled />
        <button type="submit">Save</button>
      </Form>,
    );
    expect(screen.getByRole('spinbutton', { name: 'Price' })).toHaveValue('$1,234.50');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(data?.get('price')).toBe('1234.5');
    expect(data?.get('empty')).toBe('');
    expect(data?.has('off')).toBe(false);
    expect([...data!.keys()]).toEqual(['price', 'empty']);

    await user.click(screen.getByRole('spinbutton', { name: 'Price' }));
    await user.keyboard('{ArrowUp}{Enter}');
    expect(data?.get('price')).toBe('1235');
  });

  it('blocks submission when required and empty, and resets to the default', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <Form onSubmit={onSubmit}>
        <Field label="Count" required>
          <NumberInput name="count" />
        </Field>
        <Field label="Rate">
          <NumberInput name="rate" defaultValue={2} />
        </Field>
        <button type="submit">Send</button>
        <button type="reset">Reset</button>
      </Form>,
    );
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('spinbutton', { name: /Count/ })).toHaveFocus();
    const rate = screen.getByRole('spinbutton', { name: 'Rate' });
    await user.click(rate);
    await user.keyboard('{ArrowUp}');
    await user.tab();
    expect(rate).toHaveValue('3');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(rate).toHaveValue('2');
  });

  it('forwards its ref to the input and passes extra props through', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<NumberInput ref={ref} aria-label="Ref" placeholder="0" data-testid="n" className="extra" />);
    expect(ref.current).toBe(spin());
    expect(spin()).toHaveAttribute('placeholder', '0');
    expect(screen.getByTestId('n')).toBe(spin());
    expect(spin().closest('.os-number-input')).toHaveClass('extra', 'os-input');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Form>
        <Field label="Price" description="Before tax." required>
          <NumberInput name="price" locale="en-US" defaultValue={19.99} min={0} formatOptions={{ style: 'currency', currency: 'USD' }} />
        </Field>
        <Field label="Discount" error="Too high">
          <NumberInput defaultValue={0.5} formatOptions={{ style: 'percent' }} max={0.3} />
        </Field>
        <Field label="Weight">
          <NumberInput endAdornment="kg" disabled />
        </Field>
        <NumberInput aria-label="Unbounded" />
      </Form>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
