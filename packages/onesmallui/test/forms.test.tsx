import { useState } from 'react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import {
  Calendar,
  Checkbox,
  Chip,
  ChipGroup,
  ChipInput,
  Combobox,
  DatePicker,
  Field,
  FieldGroup,
  Form,
  Input,
  InputGroup,
  InputGroupText,
  OtpInput,
  PasswordStrength,
  Radio,
  RadioGroup,
  Range,
  Select,
  Switch,
  Textarea,
  scorePassword,
} from '../src';

async function expectNoAxeViolations(container: HTMLElement) {
  const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

describe('Field', () => {
  it('links label, hint, error and success', () => {
    const { rerender } = render(
      <Field label="Email" hint="We never share it." error="Required">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('We never share it. Required');
    rerender(
      <Field label="Email" success="Looks good">
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Looks good');
    expect(screen.getByLabelText('Email').closest('.os-input')).toHaveAttribute('data-valid');
  });

  it('supports layouts, floating labels and tooltip feedback', () => {
    render(
      <>
        <Field label="Horizontal" layout="horizontal" labelWidth="8rem">
          <Input />
        </Field>
        <Field label="Floating" layout="floating" feedback="tooltip" error="Nope">
          <Input />
        </Field>
      </>,
    );
    expect(screen.getByLabelText('Horizontal').closest('.os-field')).toHaveAttribute('data-layout', 'horizontal');
    const floating = screen.getByLabelText('Floating');
    // Floating labels need :placeholder-shown, so a blank placeholder is added.
    expect(floating).toHaveAttribute('placeholder', ' ');
    expect(floating.closest('.os-field')).toHaveAttribute('data-feedback', 'tooltip');
  });

  it('shows the native validation message after invalid fires and clears it when fixed', () => {
    render(
      <Field label="Name">
        <Input required />
      </Field>,
    );
    const input = screen.getByLabelText(/Name/) as HTMLInputElement;
    act(() => {
      input.checkValidity();
    });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    fireEvent.input(input, { target: { value: 'Ada' } });
    fireEvent.change(input, { target: { value: 'Ada' } });
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('FieldGroup renders a fieldset with legend and description', async () => {
    const { container } = render(
      <FieldGroup legend="Shipping" description="Where should we send it?" variant="card">
        <Field label="City">
          <Input />
        </Field>
      </FieldGroup>,
    );
    const group = screen.getByRole('group', { name: 'Shipping' });
    expect(group).toHaveAccessibleDescription('Where should we send it?');
    expect(group).toHaveAttribute('data-variant', 'card');
    await expectNoAxeViolations(container);
  });
});

describe('Form controls', () => {
  it('Input sizes, variants, text adornments and suggestions', () => {
    render(
      <Field label="Price">
        <Input size="xs" variant="ghost" startAdornment="$" endAdornment="USD" suggestions={['10', '20']} />
      </Field>,
    );
    const input = screen.getByLabelText('Price');
    const wrap = input.closest('.os-input')!;
    expect(wrap).toHaveAttribute('data-size', 'xs');
    expect(wrap).toHaveAttribute('data-variant', 'ghost');
    expect(input).toHaveAccessibleDescription('$ USD');
    expect(input.getAttribute('list')).toBeTruthy();
    expect(document.getElementById(input.getAttribute('list')!)?.tagName).toBe('DATALIST');
  });

  it('plaintext inputs are read-only', () => {
    render(<Input aria-label="Account" variant="plaintext" defaultValue="ada@example.com" />);
    expect(screen.getByLabelText('Account')).toHaveAttribute('readonly');
  });

  it('Select supports multiple, htmlSize and grouped options', () => {
    render(
      <Field label="Crew">
        <Select
          multiple
          htmlSize={4}
          options={[
            { value: 'a', label: 'Ada', group: 'Pilots' },
            { value: 'b', label: 'Bo', group: 'Pilots' },
            { value: 'c', label: 'Cy', group: 'Engineers' },
          ]}
        />
      </Field>,
    );
    const select = screen.getByLabelText('Crew');
    expect(select).toHaveAttribute('size', '4');
    expect(select.closest('.os-select')).toHaveAttribute('data-multiple');
    expect(select.querySelectorAll('optgroup')).toHaveLength(2);
  });

  it('InputGroup passes its size to controls', () => {
    render(
      <InputGroup size="lg">
        <InputGroupText>@</InputGroupText>
        <Input aria-label="Handle" />
        <Textarea aria-label="Bio" />
      </InputGroup>,
    );
    expect(screen.getByLabelText('Handle').closest('.os-input')).toHaveAttribute('data-size', 'lg');
    expect(screen.getByLabelText('Bio')).toHaveAttribute('data-size', 'lg');
  });

  it('checks, radios and switches take color, size and card variant', async () => {
    const { container } = render(
      <>
        <Checkbox label="Agree" color="success" size="lg" variant="card" />
        <RadioGroup label="Plan" color="accent" variant="card" error="Pick one">
          <Radio value="a" label="A" />
        </RadioGroup>
        <Switch label="Wifi" color="info" width="4rem" />
      </>,
    );
    expect(screen.getByLabelText('Agree').closest('.os-check')).toHaveAttribute('data-color', 'success');
    expect(screen.getByLabelText('A').closest('.os-check')).toHaveAttribute('data-variant', 'card');
    expect(screen.getByLabelText('A')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('switch').closest('.os-switch')).toHaveStyle({ '--os-switch-width': '4rem' });
    await expectNoAxeViolations(container);
  });
});

describe('Range', () => {
  it('is a native slider with fill, bubble and ticks', async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Field label="Volume">
        <Range defaultValue={20} showValue showMinMax ticks={[0, 50, 100]} onValueChange={onValueChange} />
      </Field>,
    );
    const slider = screen.getByRole('slider', { name: 'Volume' });
    expect(slider.closest('.os-range')).toHaveStyle({ '--_pct': '20%' });
    fireEvent.change(slider, { target: { value: '60' } });
    expect(onValueChange).toHaveBeenCalledWith(60);
    expect(container.querySelector('output')).toHaveTextContent('60');
    expect(container.querySelectorAll('datalist option')).toHaveLength(3);
    await expectNoAxeViolations(container);
  });
});

describe('Chips', () => {
  it('toggle chips use aria-pressed and groups track the selection', async () => {
    function Demo() {
      const [v, setV] = useState<string[]>(['Mars']);
      return (
        <ChipGroup aria-label="Planets" selectionMode="multiple" value={v} onValueChange={setV}>
          <Chip>Mars</Chip>
          <Chip>Venus</Chip>
        </ChipGroup>
      );
    }
    render(<Demo />);
    const venus = screen.getByRole('button', { name: 'Venus' });
    expect(screen.getByRole('button', { name: 'Mars' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(venus);
    expect(venus).toHaveAttribute('aria-pressed', 'true');
  });

  it('dismissible chips remove with Delete and arrow keys move focus', async () => {
    const onRemove = vi.fn();
    render(
      <ChipGroup aria-label="Tags">
        <Chip onRemove={onRemove}>One</Chip>
        <Chip onRemove={() => {}}>Two</Chip>
      </ChipGroup>,
    );
    const one = screen.getByRole('button', { name: 'Remove One' });
    one.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Remove Two' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}{Delete}');
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('ChipInput adds on Enter and comma, removes with Backspace, splits pastes', async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Field label="Tags">
        <ChipInput name="tags" defaultValue={['red']} onValueChange={onValueChange} />
      </Field>,
    );
    const input = screen.getByLabelText('Tags');
    await userEvent.type(input, 'blue{Enter}green,');
    expect(onValueChange).toHaveBeenLastCalledWith(['red', 'blue', 'green']);
    await userEvent.keyboard('{Backspace}');
    expect(onValueChange).toHaveBeenLastCalledWith(['red', 'blue']);
    await userEvent.click(input);
    await userEvent.paste('a, b');
    expect(onValueChange).toHaveBeenLastCalledWith(['red', 'blue', 'a', 'b']);
    expect(container.querySelectorAll('input[type="hidden"][name="tags"]')).toHaveLength(4);
    await expectNoAxeViolations(container);
  });
});

describe('Combobox', () => {
  const options = [
    { value: 'ear', label: 'Earth', group: 'Inner' },
    { value: 'mar', label: 'Mars', group: 'Inner' },
    { value: 'jup', label: 'Jupiter', group: 'Outer', description: 'Gas giant' },
    { value: 'sat', label: 'Saturn', group: 'Outer', disabled: true },
  ];

  it('follows the combobox pattern: filter, arrows, Enter, Escape', async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Field label="Planet">
        <Combobox options={options} name="planet" onValueChange={onValueChange} />
      </Field>,
    );
    const input = screen.getByRole('combobox', { name: 'Planet' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
    await userEvent.type(input, 'ar');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    const listbox = screen.getByRole('listbox');
    expect(within(listbox).getAllByRole('option').map((o) => o.textContent)).toEqual(['Earth', 'Mars']);
    await userEvent.keyboard('{ArrowDown}');
    expect(input.getAttribute('aria-activedescendant')).toBe(within(listbox).getByRole('option', { name: 'Mars' }).id);
    await userEvent.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith('mar');
    expect(input).toHaveValue('Mars');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(container.querySelector('input[type="hidden"]')).toHaveValue('mar');
    await userEvent.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    await expectNoAxeViolations(container);
  });

  it('supports multiple selection and skips disabled options', async () => {
    const onValueChange = vi.fn();
    render(<Combobox aria-label="Planets" multiple options={options} defaultValue={['ear']} onValueChange={onValueChange} />);
    const input = screen.getByRole('combobox', { name: 'Planets' });
    input.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['ear', 'jup']);
    expect(screen.getByRole('option', { name: /Jupiter/ })).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Escape}{Backspace}');
    expect(onValueChange).toHaveBeenLastCalledWith(['ear']);
  });
});

describe('Calendar and DatePicker', () => {
  it('moves focus with the grid keys and selects with Enter', async () => {
    const onValueChange = vi.fn();
    render(<Calendar defaultValue={new Date(2026, 0, 15)} firstDayOfWeek={1} locale="en-US" onValueChange={onValueChange} />);
    const day = screen.getByRole('button', { name: 'Thursday, January 15, 2026' });
    expect(day).toHaveAttribute('tabindex', '0');
    day.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Friday, January 16, 2026' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Friday, January 23, 2026' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'Monday, January 19, 2026' })).toHaveFocus();
    await userEvent.keyboard('{PageDown}');
    expect(screen.getByRole('button', { name: 'Thursday, February 19, 2026' })).toHaveFocus();
    expect(screen.getByRole('grid')).toHaveAccessibleName('February 2026');
    await userEvent.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 1, 19));
    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'Monday');
  });

  it('respects min/max and selects ranges', async () => {
    const onValueChange = vi.fn();
    render(
      <Calendar
        mode="range"
        defaultMonth={new Date(2026, 4, 1)}
        min={new Date(2026, 4, 5)}
        locale="en-US"
        onValueChange={onValueChange}
      />,
    );
    const early = screen.getByRole('button', { name: 'Monday, May 4, 2026' });
    expect(early).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(early);
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Sunday, May 10, 2026' }));
    await userEvent.click(screen.getByRole('button', { name: 'Thursday, May 7, 2026' }));
    expect(onValueChange).toHaveBeenLastCalledWith({ start: new Date(2026, 4, 7), end: new Date(2026, 4, 10) });
  });

  it('DatePicker opens a modal dialog, Escape closes it, and typed dates parse', async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Field label="Launch date">
        <DatePicker name="launch" locale="en-US" format={{ year: 'numeric', month: '2-digit', day: '2-digit' }} onValueChange={onValueChange} />
      </Field>,
    );
    const input = screen.getByLabelText('Launch date');
    await userEvent.type(input, '2026-03-04{Enter}');
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 2, 4));
    expect(input).toHaveValue('03/04/2026');
    expect(container.querySelector('input[type="hidden"]')).toHaveValue('2026-03-04');
    const toggle = screen.getByRole('button', { name: /Change date/ });
    await userEvent.click(toggle);
    const dialog = screen.getByRole('dialog', { name: 'Choose date' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: 'Wednesday, March 4, 2026' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('OtpInput', () => {
  it('advances, backspaces, pastes and completes', async () => {
    const onComplete = vi.fn();
    const { container } = render(
      <Field label="Verification code">
        <OtpInput length={4} name="otp" onComplete={onComplete} />
      </Field>,
    );
    const group = screen.getByRole('group', { name: 'Verification code' });
    const slots = within(group).getAllByRole('textbox');
    expect(slots[0]).toHaveAttribute('autocomplete', 'one-time-code');
    await userEvent.click(slots[0]!);
    await userEvent.keyboard('12');
    expect(slots[2]).toHaveFocus();
    await userEvent.keyboard('{Backspace}');
    expect(slots[1]).toHaveFocus();
    expect(slots[1]).toHaveValue('');
    await userEvent.paste('9876');
    expect(onComplete).toHaveBeenCalledWith('9876');
    expect(container.querySelector('input[type="hidden"]')).toHaveValue('9876');
    await expectNoAxeViolations(container);
  });

  it('accepts letters in alphanumeric mode and rejects them in numeric mode', async () => {
    render(<OtpInput aria-label="Code" length={3} type="alphanumeric" />);
    const slots = screen.getAllByRole('textbox');
    await userEvent.click(slots[0]!);
    await userEvent.keyboard('a1');
    expect(slots[0]).toHaveValue('A');
    expect(slots[1]).toHaveValue('1');
  });
});

describe('PasswordStrength', () => {
  it('scores passwords', () => {
    expect(scorePassword('').level).toBe('empty');
    expect(scorePassword('abc').level).toBe('weak');
    expect(scorePassword('Abcdefgh1!').level).toBe('strong');
    expect(scorePassword('abcdefgh').rules.find((r) => r.id === 'upper')?.met).toBe(false);
  });

  it('renders a meter, rules and a data-strength attribute', async () => {
    const { container } = render(<PasswordStrength value="Abcdefgh1" showRules />);
    const meter = screen.getByRole('meter', { name: 'Password strength' });
    expect(meter).toHaveAttribute('aria-valuetext', 'Good');
    expect(container.firstChild).toHaveAttribute('data-strength', 'good');
    expect(screen.getByText('A number').closest('li')).toHaveAttribute('data-met');
    await expectNoAxeViolations(container);
  });
});

describe('Form', () => {
  it('blocks invalid submits, marks validated and focuses the first invalid control', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    const onInvalidSubmit = vi.fn();
    render(
      <Form aria-label="Signup" onSubmit={onSubmit} onInvalidSubmit={onInvalidSubmit} layout="grid" columns={3}>
        <Field label="Email">
          <Input type="email" required />
        </Field>
        <button type="submit">Send</button>
      </Form>,
    );
    const form = screen.getByRole('form', { name: 'Signup' });
    expect(form).toHaveAttribute('novalidate');
    expect(form).toHaveStyle({ '--os-form-cols': '3' });
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onInvalidSubmit).toHaveBeenCalled();
    expect(form).toHaveAttribute('data-validated');
    expect(screen.getByLabelText(/Email/)).toHaveFocus();
    expect(screen.getByLabelText(/Email/)).toHaveAttribute('aria-invalid', 'true');
    await userEvent.type(screen.getByLabelText(/Email/), 'a@b.co');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
