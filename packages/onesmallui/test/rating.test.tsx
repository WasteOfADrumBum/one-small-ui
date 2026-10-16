import { useState } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';
import { Rating } from '../src/components/Rating';
import { Field } from '../src/components/Field';
import { Form } from '../src/components/Form';
import { AnnouncerProvider } from '../src/hooks/useAnnouncer';
import { HeartIcon } from '../src/icons/HeartIcon';

const wait = (ms: number) => act(() => new Promise((r) => setTimeout(r, ms)));
const region = (politeness: 'polite' | 'assertive') =>
  Array.from(document.querySelectorAll<HTMLElement>(`[data-os-announcer="${politeness}"]`)).pop() ?? null;

async function expectNoAxeViolations(container: HTMLElement) {
  const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

const fills = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('.os-rating__glyph')).map((g) => g.dataset.fill);
const radio = (name: string) => screen.getByRole('radio', { name }) as HTMLInputElement;

describe('Rating: structure and names', () => {
  it('renders a labelled radiogroup with one named radio per whole step', () => {
    const { container } = render(<Rating label="Quality" />);
    const group = screen.getByRole('radiogroup', { name: 'Quality' });
    expect(group.tagName).toBe('FIELDSET');
    expect(container.querySelector('legend')).toHaveTextContent('Quality');
    expect(within(group).getAllByRole('radio').map((r) => r.getAttribute('aria-label'))).toEqual([
      '1 star',
      '2 stars',
      '3 stars',
      '4 stars',
      '5 stars',
    ]);
    expect(fills(container)).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
    // Icons are decorative; the radios carry the names.
    container.querySelectorAll('.os-rating__glyph').forEach((g) => expect(g).toHaveAttribute('aria-hidden', 'true'));
  });

  it('adds half steps with precision 0.5 and honours max', () => {
    render(<Rating label="Quality" max={3} precision={0.5} />);
    expect(screen.getAllByRole('radio').map((r) => (r as HTMLInputElement).value)).toEqual(['0.5', '1', '1.5', '2', '2.5', '3']);
    expect(radio('2.5 stars')).toHaveAttribute('data-half');
    expect(radio('0.5 stars')).toBeInTheDocument();
  });

  it('uses getLabel for option names and a custom icon', () => {
    const { container } = render(
      <Rating label="Love it?" max={2} icon={HeartIcon} getLabel={(v, max) => `${v} of ${max} hearts`} size="lg" color="danger" />,
    );
    expect(radio('2 of 2 hearts')).toBeInTheDocument();
    const root = container.querySelector('.os-rating')!;
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-color', 'danger');
    // HeartIcon draws one path; both the outline and the fill use it.
    expect(container.querySelectorAll('.os-rating__glyph')[0]!.querySelectorAll('svg')).toHaveLength(2);
  });

  it('forwards the ref, className and rest props to the fieldset', () => {
    let el: HTMLElement | null = null;
    render(<Rating ref={(e) => void (el = e)} label="Q" className="mine" data-test="r" />);
    expect(el).toBeInstanceOf(HTMLFieldSetElement);
    expect(el).toHaveClass('os-rating', 'mine');
    expect(el).toHaveAttribute('data-test', 'r');
  });
});

describe('Rating: choosing', () => {
  it('is uncontrolled with defaultValue and reports changes', async () => {
    const onValueChange = vi.fn();
    const { container } = render(<Rating label="Quality" defaultValue={2} onValueChange={onValueChange} />);
    expect(radio('2 stars')).toBeChecked();
    expect(fills(container)).toEqual(['full', 'full', 'empty', 'empty', 'empty']);
    await userEvent.click(radio('4 stars'));
    expect(onValueChange).toHaveBeenLastCalledWith(4);
    expect(radio('4 stars')).toBeChecked();
    expect(fills(container)).toEqual(['full', 'full', 'full', 'full', 'empty']);
  });

  it('is controlled', async () => {
    function Controlled() {
      const [v, setV] = useState<number | null>(1.5);
      return (
        <>
          <Rating label="Quality" precision={0.5} value={v} onValueChange={setV} />
          <output>{String(v)}</output>
        </>
      );
    }
    const { container } = render(<Controlled />);
    expect(fills(container)).toEqual(['full', 'half', 'empty', 'empty', 'empty']);
    await userEvent.click(radio('3.5 stars'));
    expect(container.querySelector('output')).toHaveTextContent('3.5');
    expect(fills(container)).toEqual(['full', 'full', 'full', 'half', 'empty']);
  });

  it('stays put when controlled and the parent ignores the change', async () => {
    const onValueChange = vi.fn();
    render(<Rating label="Quality" value={2} onValueChange={onValueChange} />);
    await userEvent.click(radio('5 stars'));
    expect(onValueChange).toHaveBeenCalledWith(5);
    expect(radio('2 stars')).toBeChecked();
    expect(radio('5 stars')).not.toBeChecked();
  });

  it('does nothing on a second click without allowClear', async () => {
    const onValueChange = vi.fn();
    render(<Rating label="Quality" defaultValue={3} onValueChange={onValueChange} />);
    await userEvent.click(radio('3 stars'));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(radio('3 stars')).toBeChecked();
  });
});

describe('Rating: keyboard', () => {
  it('Tab enters on the checked radio and arrow keys change the value', async () => {
    const onValueChange = vi.fn();
    render(
      <>
        <button type="button">Before</button>
        <Rating label="Quality" defaultValue={3} onValueChange={onValueChange} />
      </>,
    );
    await userEvent.click(screen.getByText('Before'));
    await userEvent.tab();
    expect(radio('3 stars')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenLastCalledWith(4);
    expect(radio('4 stars')).toHaveFocus();
    // Native radio order: Down / Right go to the next option, Up / Left to the previous one.
    await userEvent.keyboard('{ArrowDown}');
    expect(onValueChange).toHaveBeenLastCalledWith(5);
    await userEvent.keyboard('{ArrowLeft}{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith(3);
    expect(radio('3 stars')).toBeChecked();
  });

  it('Space checks the focused radio when none is checked', async () => {
    const onValueChange = vi.fn();
    render(<Rating label="Quality" onValueChange={onValueChange} />);
    await userEvent.tab();
    expect(radio('1 star')).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(onValueChange).toHaveBeenLastCalledWith(1);
  });

  it('steps through half values with arrows', async () => {
    const onValueChange = vi.fn();
    render(<Rating label="Quality" precision={0.5} defaultValue={2} onValueChange={onValueChange} />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenLastCalledWith(2.5);
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(onValueChange).toHaveBeenLastCalledWith(1.5);
  });
});

describe('Rating: allowClear', () => {
  it('clears on clicking the current value again and announces it', async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <AnnouncerProvider>
        <Rating label="Quality" defaultValue={3} allowClear onValueChange={onValueChange} />
      </AnnouncerProvider>,
    );
    await userEvent.click(radio('3 stars'));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(screen.getAllByRole('radio').some((r) => (r as HTMLInputElement).checked)).toBe(false);
    // The pointer is still over the third star, but the clear shows straight away.
    expect(fills(container)).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
    await wait(150);
    expect(region('polite')).toHaveTextContent('Rating cleared');
  });

  it('clears with Space on the checked radio, with a custom message', async () => {
    const onValueChange = vi.fn();
    render(
      <AnnouncerProvider>
        <Rating label="Quality" defaultValue={2} allowClear clearedMessage="Note effacée" onValueChange={onValueChange} />
      </AnnouncerProvider>,
    );
    await userEvent.tab();
    expect(radio('2 stars')).toHaveFocus();
    await userEvent.keyboard(' ');
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    await wait(150);
    expect(region('polite')).toHaveTextContent('Note effacée');
    // Choosing again after a clear sets it.
    await userEvent.keyboard(' ');
    expect(onValueChange).toHaveBeenLastCalledWith(2);
  });

  it('a fresh choice never clears', async () => {
    const onValueChange = vi.fn();
    render(<Rating label="Quality" defaultValue={2} allowClear onValueChange={onValueChange} />);
    await userEvent.click(radio('4 stars'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith(4);
  });
});

describe('Rating: preview', () => {
  it('previews on hover without changing the value, and restores on leave', () => {
    const onValueChange = vi.fn();
    const { container } = render(<Rating label="Quality" precision={0.5} defaultValue={1} onValueChange={onValueChange} />);
    const root = container.querySelector('.os-rating')!;
    fireEvent.pointerEnter(radio('3.5 stars'));
    expect(fills(container)).toEqual(['full', 'full', 'full', 'half', 'empty']);
    expect(root).toHaveAttribute('data-preview');
    expect(container.querySelectorAll('[data-hovered]')).toHaveLength(1);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(radio('1 star')).toBeChecked();
    fireEvent.pointerLeave(container.querySelector('.os-rating__items')!);
    expect(fills(container)).toEqual(['full', 'empty', 'empty', 'empty', 'empty']);
    expect(root).not.toHaveAttribute('data-preview');
  });

  it('previews the focused option without committing it', async () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <>
        <Rating label="Quality" onValueChange={onValueChange} />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    expect(fills(container)).toEqual(['full', 'empty', 'empty', 'empty', 'empty']);
    expect(container.querySelector('.os-rating')).toHaveAttribute('data-preview');
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.tab();
    expect(screen.getByText('After')).toHaveFocus();
    expect(fills(container)).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
  });

  it('does not preview when disabled', () => {
    const { container } = render(<Rating label="Quality" disabled />);
    fireEvent.pointerEnter(radio('4 stars'));
    expect(fills(container).every((f) => f === 'empty')).toBe(true);
  });
});

describe('Rating: read-only', () => {
  it('renders one image named with the value, and no inputs', () => {
    const { container } = render(<Rating readOnly value={4.5} precision={0.5} />);
    const img = screen.getByRole('img', { name: '4.5 out of 5 stars' });
    expect(img.tagName).toBe('SPAN');
    expect(container.querySelectorAll('input')).toHaveLength(0);
    expect(screen.queryByRole('radiogroup')).toBeNull();
    expect(fills(container)).toEqual(['full', 'full', 'full', 'full', 'half']);
  });

  it('rounds the drawing to the precision but keeps the exact value in the name', () => {
    const { container, rerender } = render(<Rating readOnly value={3.7} />);
    expect(screen.getByRole('img', { name: '3.7 out of 5 stars' })).toBeInTheDocument();
    expect(fills(container)).toEqual(['full', 'full', 'full', 'full', 'empty']);
    rerender(<Rating readOnly value={3.3} precision={0.5} />);
    expect(fills(container)).toEqual(['full', 'full', 'full', 'half', 'empty']);
    rerender(<Rating readOnly value={null} />);
    expect(screen.getByRole('img', { name: 'No rating' })).toBeInTheDocument();
    rerender(<Rating readOnly value={9} max={3} getValueText={(v, m) => `Rated ${v}/${m}`} />);
    expect(screen.getByRole('img', { name: 'Rated 9/3' })).toBeInTheDocument();
    expect(fills(container)).toEqual(['full', 'full', 'full']);
  });

  it('inside a read-only Field, is named by the Field label and the value, and submits a hidden input', () => {
    const { container } = render(
      <form>
        <Field label="Average" readOnly hint="From 120 reviews">
          <Rating name="avg" defaultValue={4} />
        </Field>
      </form>,
    );
    const img = screen.getByRole('img', { name: 'Average 4 out of 5 stars' });
    expect(img).toHaveAccessibleDescription('From 120 reviews');
    expect(Object.fromEntries(new FormData(container.querySelector('form')!))).toEqual({ avg: '4' });
  });
});

describe('Rating: Field, Form and submission', () => {
  it('takes the Field label, hint, error, required and disabled', () => {
    const { rerender } = render(
      <Field label="Service" hint="How was it?" error="Pick a rating" required>
        <Rating name="service" />
      </Field>,
    );
    const group = screen.getByRole('radiogroup', { name: 'Service (required)' });
    expect(group).toHaveAccessibleDescription('How was it? Pick a rating');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('aria-required', 'true');
    expect(group.querySelector('legend')).toBeNull();
    screen.getAllByRole('radio').forEach((r) => expect(r).toBeRequired());
    rerender(
      <Field label="Service" disabled>
        <Rating name="service" />
      </Field>,
    );
    expect(screen.getByRole('radiogroup')).toBeDisabled();
    screen.getAllByRole('radio').forEach((r) => expect(r).toBeDisabled());
  });

  it('submits the checked value natively; disabled submits nothing', async () => {
    const { container, rerender } = render(
      <form>
        <Rating label="Quality" name="q" precision={0.5} defaultValue={3.5} />
      </form>,
    );
    const form = container.querySelector('form')!;
    expect(Object.fromEntries(new FormData(form))).toEqual({ q: '3.5' });
    rerender(
      <form>
        <Rating label="Quality" name="q" precision={0.5} defaultValue={3.5} disabled />
      </form>,
    );
    expect(Object.fromEntries(new FormData(form))).toEqual({});
  });

  it('blocks a Form submit while required and empty, with the browser message in the Field', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <Form onSubmit={onSubmit}>
        <Field label="Service" required>
          <Rating name="service" />
        </Field>
        <button type="submit">Send</button>
      </Form>,
    );
    await userEvent.click(screen.getByText('Send'));
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.click(radio('5 stars'));
    await userEvent.click(screen.getByText('Send'));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('marks itself invalid with the invalid prop, and shows the required mark in its own legend', () => {
    render(<Rating label="Quality" required invalid />);
    const group = screen.getByRole('radiogroup', { name: 'Quality (required)' });
    expect(group).toHaveAttribute('data-invalid');
    expect(group).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('Rating: axe', () => {
  it('has no violations interactive, half-step, in a Field and read-only', async () => {
    const { container } = render(
      <AnnouncerProvider>
        <Rating label="Quality" defaultValue={3} allowClear />
        <Rating label="Half" precision={0.5} defaultValue={2.5} />
        <Field label="Service" hint="Required" required error="Pick one">
          <Rating name="service" />
        </Field>
        <Rating readOnly value={4.5} precision={0.5} />
        <Field label="Average" readOnly>
          <Rating defaultValue={4} />
        </Field>
        <Rating label="Off" disabled defaultValue={1} />
      </AnnouncerProvider>,
    );
    await expectNoAxeViolations(container);
  });
});
