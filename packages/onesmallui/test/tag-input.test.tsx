import { useState } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { describe, expect, it, vi } from 'vitest';
import { TagInput } from '../src/components/TagInput';
import { Field } from '../src/components/Field';
import { Form } from '../src/components/Form';
import { AnnouncerProvider } from '../src/hooks/useAnnouncer';

const wait = (ms: number) => act(() => new Promise((r) => setTimeout(r, ms)));
// The last region: a provider rendered by the test comes after any body fallback left by earlier tests.
const region = (politeness: 'polite' | 'assertive') =>
  Array.from(document.querySelectorAll<HTMLElement>(`[data-os-announcer="${politeness}"]`)).pop() ?? null;

async function expectNoAxeViolations(container: HTMLElement) {
  const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

const chipLabels = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('.os-chip__label')).map((el) => el.textContent);

function renderTags(props: Partial<Parameters<typeof TagInput>[0]> = {}) {
  const onValueChange = vi.fn();
  const utils = render(
    <AnnouncerProvider>
      <Field label="Tags">
        <TagInput name="tags" onValueChange={onValueChange} {...props} />
      </Field>
    </AnnouncerProvider>,
  );
  const input = screen.getAllByLabelText('Tags').find((el) => el.tagName === 'INPUT') as HTMLInputElement;
  return { ...utils, input, onValueChange };
}

describe('TagInput: adding', () => {
  it('adds on Enter and comma, trims, and ignores empty entries', async () => {
    const { input, onValueChange, container } = renderTags();
    await userEvent.type(input, ' Design {Enter}Research,');
    expect(onValueChange).toHaveBeenLastCalledWith(['Design', 'Research']);
    expect(input).toHaveValue('');
    await userEvent.type(input, ' ,');
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(chipLabels(container)).toEqual(['Design', 'Research']);
  });

  it('uses custom delimiters', async () => {
    const { input, onValueChange } = renderTags({ delimiters: ['Enter', ';', ' '] });
    await userEvent.type(input, 'a;b c,d{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b', 'c,d']);
  });

  it('commits the draft on blur', async () => {
    const { input, onValueChange } = renderTags();
    await userEvent.type(input, 'Ops');
    await userEvent.tab();
    expect(onValueChange).toHaveBeenLastCalledWith(['Ops']);
  });

  it('lets an empty Enter submit the form', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <TagInput aria-label="Tags" />
        <button type="submit">Send</button>
      </form>,
    );
    await userEvent.type(screen.getByLabelText('Tags'), '{Enter}');
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});

describe('TagInput: paste', () => {
  it('splits pasted lists on commas and newlines', async () => {
    const { input, onValueChange } = renderTags();
    await userEvent.click(input);
    await userEvent.paste('alpha, beta\ngamma\r\ndelta');
    expect(onValueChange).toHaveBeenLastCalledWith(['alpha', 'beta', 'gamma', 'delta']);
    expect(input).toHaveValue('');
  });

  it('splits on custom single-character delimiters', async () => {
    const { input, onValueChange } = renderTags({ delimiters: ['Enter', '|'] });
    await userEvent.click(input);
    await userEvent.paste('one|two, three');
    expect(onValueChange).toHaveBeenLastCalledWith(['one', 'two, three']);
  });

  it('pastes plain text without a delimiter into the input', async () => {
    const { input, onValueChange } = renderTags();
    await userEvent.click(input);
    await userEvent.paste('single');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('single');
  });

  it('keeps rejected pasted entries in the input', async () => {
    const { input, onValueChange } = renderTags({ validate: (t) => t.length > 1 || 'Too short.' });
    await userEvent.click(input);
    await userEvent.paste('ok,x,fine');
    expect(onValueChange).toHaveBeenLastCalledWith(['ok', 'fine']);
    expect(input).toHaveValue('x');
    expect(input).toHaveAccessibleDescription('Too short.');
  });
});

describe('TagInput: dedupe', () => {
  it('dedupes case-insensitively by default and says so', async () => {
    const { input, onValueChange } = renderTags({ defaultValue: ['Design'] });
    await userEvent.type(input, 'design{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input).toHaveAccessibleDescription('Design is already added.');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('dedupe={true} only skips exact matches', async () => {
    const { input, onValueChange } = renderTags({ defaultValue: ['Design'], dedupe: true });
    await userEvent.type(input, 'design{Enter}Design{Enter}');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith(['Design', 'design']);
  });

  it('dedupe={false} allows duplicates', async () => {
    const { input, onValueChange, container } = renderTags({ defaultValue: ['a'], dedupe: false });
    await userEvent.type(input, 'a{Enter}a{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'a', 'a']);
    expect(container.querySelectorAll('input[type="hidden"]')).toHaveLength(3);
  });

  it('dedupes inside one paste', async () => {
    const { input, onValueChange } = renderTags();
    await userEvent.click(input);
    await userEvent.paste('x, X, y');
    expect(onValueChange).toHaveBeenLastCalledWith(['x', 'y']);
  });
});

describe('TagInput: maxTags and validate', () => {
  it('stops at maxTags and announces the limit', async () => {
    const { input, onValueChange } = renderTags({ maxTags: 2 });
    await userEvent.click(input);
    await userEvent.paste('a, b, c');
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b']);
    expect(input).toHaveValue('c');
    expect(input).toHaveAccessibleDescription('Tag limit reached: 2 of 2.');
    await wait(150);
    expect(region('polite')).toHaveTextContent('Tag limit reached: 2 of 2.');
  });

  it('announces when an add fills the last slot', async () => {
    const { input } = renderTags({ maxTags: 1 });
    await userEvent.type(input, 'only{Enter}');
    await wait(150);
    expect(region('polite')).toHaveTextContent('Added tag: only. Tag limit reached: 1 of 1.');
  });

  it('shows the validate message inline, marks invalid and announces assertively', async () => {
    const validate = vi.fn((t: string, tags: string[]) => (t.includes('@') ? true : `${t} needs an @ (${tags.length} so far).`));
    const { input, onValueChange } = renderTags({ validate });
    await userEvent.type(input, 'ada{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('ada');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('ada needs an @ (0 so far).');
    await wait(150);
    expect(region('assertive')).toHaveTextContent('ada needs an @');
    await userEvent.type(input, '@x{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['ada@x']);
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAccessibleDescription();
  });

  it('uses a default message when validate returns false', async () => {
    const { input } = renderTags({ validate: () => false });
    await userEvent.type(input, 'nope{Enter}');
    expect(input).toHaveAccessibleDescription('"nope" is not a valid tag.');
  });
});

describe('TagInput: keyboard', () => {
  it('Backspace in the empty input removes the last tag', async () => {
    const { input, onValueChange } = renderTags({ defaultValue: ['a', 'b'] });
    await userEvent.click(input);
    await userEvent.keyboard('{Backspace}');
    expect(onValueChange).toHaveBeenLastCalledWith(['a']);
    await wait(150);
    expect(region('polite')).toHaveTextContent('Removed tag: b.');
  });

  it('arrow keys move between tags and back to the input; Delete removes the focused tag', async () => {
    const { input, onValueChange } = renderTags({ defaultValue: ['a', 'b', 'c'] });
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Remove tag: c' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Remove tag: a' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Remove tag: b' })).toHaveFocus();
    await userEvent.keyboard('{Delete}');
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'c']);
    expect(screen.getByRole('button', { name: 'Remove tag: c' })).toHaveFocus();
    await userEvent.keyboard('{Backspace}');
    expect(onValueChange).toHaveBeenLastCalledWith(['a']);
    expect(input).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}{ArrowRight}');
    expect(input).toHaveFocus();
  });

  it('ArrowLeft with text before the caret moves the caret, not focus', async () => {
    const { input } = renderTags({ defaultValue: ['a'] });
    await userEvent.type(input, 'xy{ArrowLeft}');
    expect(input).toHaveFocus();
  });

  it('clicking a remove button removes that tag and keeps focus in the widget', async () => {
    const { onValueChange } = renderTags({ defaultValue: ['a', 'b'] });
    await userEvent.click(screen.getByRole('button', { name: 'Remove tag: a' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['b']);
    expect(screen.getByRole('button', { name: 'Remove tag: b' })).toHaveFocus();
  });

  it('Escape clears the draft', async () => {
    const { input } = renderTags();
    await userEvent.type(input, 'abc{Escape}');
    expect(input).toHaveValue('');
  });
});

describe('TagInput: suggestions', () => {
  const suggestions = ['Design', 'Development', 'Research', 'Ops'];

  it('has no combobox role without suggestions', () => {
    renderTags();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.getByRole('textbox', { name: 'Tags' })).toBeInTheDocument();
  });

  it('filters by the draft, excludes added tags, navigates with arrows and picks with Enter', async () => {
    const { onValueChange } = renderTags({ suggestions, defaultValue: ['Development'] });
    const input = screen.getByRole('combobox', { name: 'Tags' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
    await userEvent.type(input, 'de');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    const listbox = screen.getByRole('listbox', { name: 'Tags' });
    expect(input).toHaveAttribute('aria-controls', listbox.id);
    expect(within(listbox).getAllByRole('option').map((o) => o.textContent)).toEqual(['Design']);
    // Free mode: nothing is active until the user arrows into the list.
    expect(input).not.toHaveAttribute('aria-activedescendant');
    await userEvent.keyboard('{ArrowDown}');
    const design = within(listbox).getByRole('option', { name: 'Design' });
    expect(input).toHaveAttribute('aria-activedescendant', design.id);
    expect(design).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['Development', 'Design']);
    expect(input).toHaveValue('');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('Enter without an active option adds the typed text in free mode', async () => {
    const { onValueChange } = renderTags({ suggestions });
    await userEvent.type(screen.getByRole('combobox'), 'des{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['des']);
  });

  it('ArrowDown opens the full list, Escape closes it', async () => {
    renderTags({ suggestions });
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('option')).toHaveLength(4);
    await userEvent.keyboard('{ArrowUp}');
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Ops' }).id);
    await userEvent.keyboard('{Escape}');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('picks a suggestion with the mouse', async () => {
    const { onValueChange } = renderTags({ suggestions });
    await userEvent.type(screen.getByRole('combobox'), 'r');
    await userEvent.click(screen.getByRole('option', { name: 'Research' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['Research']);
  });

  it('announces the number of suggestions', async () => {
    renderTags({ suggestions });
    await userEvent.type(screen.getByRole('combobox'), 'e');
    await wait(150);
    expect(region('polite')).toHaveTextContent('3 suggestions available.');
  });

  it('uses option values for tags and labels for chips', async () => {
    const { onValueChange, container } = renderTags({
      suggestions: [
        { value: 'fe', label: 'Frontend' },
        { value: 'be', label: 'Backend' },
      ],
    });
    await userEvent.type(screen.getByRole('combobox'), 'backend{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['be']);
    expect(chipLabels(container)).toEqual(['Backend']);
    expect(screen.getByRole('button', { name: 'Remove tag: Backend' })).toBeInTheDocument();
    expect(container.querySelector<HTMLInputElement>('input[type="hidden"]')!.value).toBe('be');
  });

  it('suggestions-only mode rejects free text and auto-activates the first match', async () => {
    const { onValueChange } = renderTags({ suggestions, mode: 'suggestions-only' });
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'xyz');
    expect(screen.getByText('No matching suggestions')).toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('"xyz" is not in the list. Choose a suggestion.');
    await wait(150);
    expect(region('assertive')).toHaveTextContent('is not in the list');
    await userEvent.clear(input);
    await userEvent.type(input, 'res{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(['Research']);
  });

  it('suggestions-only mode accepts an exact typed match and filters pastes', async () => {
    const { onValueChange } = renderTags({ suggestions, mode: 'suggestions-only' });
    const input = screen.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.paste('ops, nope, design');
    expect(onValueChange).toHaveBeenLastCalledWith(['Ops', 'Design']);
    expect(input).toHaveValue('nope');
  });
});

describe('TagInput: states', () => {
  it('readOnly shows no remove buttons and refuses adds and removes', async () => {
    const { input, onValueChange, container } = renderTags({ defaultValue: ['a'], readOnly: true });
    expect(input).toHaveAttribute('readonly');
    expect(screen.queryByRole('button')).toBeNull();
    await userEvent.type(input, 'b{Enter}{Backspace}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(container.querySelector('.os-tag-input')).toHaveAttribute('data-readonly');
  });

  it('readOnly comes from Field', () => {
    render(
      <Field label="Tags" readOnly>
        <TagInput defaultValue={['a']} />
      </Field>,
    );
    expect(screen.getByLabelText('Tags')).toHaveAttribute('readonly');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('disabled disables the input, the remove buttons and the hidden inputs', () => {
    const { input, container } = renderTags({ defaultValue: ['a'], disabled: true });
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove tag: a' })).toBeDisabled();
    expect(container.querySelector('input[type="hidden"]')).toBeDisabled();
  });

  it('invalid and Field errors set aria-invalid', () => {
    render(
      <>
        <TagInput aria-label="One" invalid />
        <Field label="Two" error="Pick at least one.">
          <TagInput />
        </Field>
      </>,
    );
    expect(screen.getByLabelText('One')).toHaveAttribute('aria-invalid', 'true');
    const two = screen.getByLabelText('Two');
    expect(two).toHaveAttribute('aria-invalid', 'true');
    expect(two).toHaveAccessibleDescription('Pick at least one.');
  });

  it('Field description and the inline notice both describe the input', async () => {
    render(
      <Field label="Tags" description="Up to 3.">
        <TagInput maxTags={1} defaultValue={['a']} />
      </Field>,
    );
    const input = screen.getByLabelText('Tags');
    expect(input).toHaveAccessibleDescription('Up to 3.');
    await userEvent.type(input, 'b{Enter}');
    expect(input).toHaveAccessibleDescription('Tag limit reached: 1 of 1. Up to 3.');
  });

  it('applies size', () => {
    const { container } = render(<TagInput aria-label="Tags" size="xs" />);
    expect(container.querySelector('.os-tag-input')).toHaveAttribute('data-size', 'xs');
  });
});

describe('TagInput: state ownership', () => {
  it('works controlled', async () => {
    function Controlled() {
      const [tags, setTags] = useState(['a']);
      return (
        <>
          <TagInput aria-label="Tags" value={tags} onValueChange={(v) => setTags(v.map((t) => t.toUpperCase()))} />
          <output data-testid="out">{tags.join('|')}</output>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.type(screen.getByLabelText('Tags'), 'b{Enter}');
    expect(screen.getByTestId('out')).toHaveTextContent('A|B');
  });

  it('a controlled value that the parent refuses stays put', async () => {
    const onValueChange = vi.fn();
    const { container } = render(<TagInput aria-label="Tags" value={['a']} onValueChange={onValueChange} />);
    await userEvent.type(screen.getByLabelText('Tags'), 'b{Enter}');
    expect(onValueChange).toHaveBeenCalledWith(['a', 'b']);
    expect(chipLabels(container)).toEqual(['a']);
  });

  it('works uncontrolled', async () => {
    const { container } = render(<TagInput aria-label="Tags" defaultValue={['a']} />);
    await userEvent.type(screen.getByLabelText('Tags'), 'b{Enter}');
    expect(chipLabels(container)).toEqual(['a', 'b']);
  });
});

describe('TagInput: forms', () => {
  it('submits one hidden input per tag', async () => {
    let data: FormData | undefined;
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          data = new FormData(e.currentTarget);
        }}
      >
        <TagInput aria-label="Tags" name="tags" defaultValue={['a']} />
        <button type="submit">Send</button>
      </form>,
    );
    await userEvent.type(screen.getByLabelText('Tags'), 'b{Enter}');
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(data!.getAll('tags')).toEqual(['a', 'b']);
  });

  it('required: the text input is required only while there are no tags', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <Form onSubmit={onSubmit}>
        <Field label="Tags" required>
          <TagInput name="tags" />
        </Field>
        <button type="submit">Send</button>
      </Form>,
    );
    const input = screen.getByLabelText(/Tags/) as HTMLInputElement;
    expect(input).toBeRequired();
    expect(input.checkValidity()).toBe(false);
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.type(input, 'a{Enter}');
    expect(input).not.toHaveAttribute('required');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input.checkValidity()).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('form reset restores the default tags', async () => {
    const { container } = render(
      <form>
        <TagInput aria-label="Tags" defaultValue={['a']} />
        <button type="reset">Reset</button>
      </form>,
    );
    await userEvent.type(screen.getByLabelText('Tags'), 'b{Enter}');
    expect(chipLabels(container)).toEqual(['a', 'b']);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(chipLabels(container)).toEqual(['a']);
  });
});

describe('TagInput: announcements', () => {
  it('announces adds through the shared announcer, not a private live region', async () => {
    const { container, input } = renderTags();
    expect(container.querySelector('.os-tag-input [aria-live]')).toBeNull();
    await userEvent.click(input);
    await userEvent.paste('a, b');
    await wait(150);
    expect(region('polite')).toHaveTextContent('Added 2 tags: a, b.');
  });

  it('falls back to the body announcer outside a provider', async () => {
    render(<TagInput aria-label="Tags" />);
    await userEvent.type(screen.getByLabelText('Tags'), 'x{Enter}');
    await wait(150);
    expect(document.body.querySelector('[data-os-announcer="polite"]')).toHaveTextContent('Added tag: x.');
  });

  it('accepts translated messages', async () => {
    render(
      <AnnouncerProvider>
        <TagInput
          aria-label="Etiquetas"
          defaultValue={['uno']}
          messages={{ removeLabel: (t) => `Quitar ${t}`, removed: (t) => `${t} quitada` }}
        />
      </AnnouncerProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Quitar uno' }));
    await wait(150);
    expect(region('polite')).toHaveTextContent('uno quitada');
  });
});

describe('TagInput: accessibility', () => {
  it('has no axe violations in common states', async () => {
    const { container } = render(
      <AnnouncerProvider>
        <Field label="Skills" description="Press Enter or comma to add.">
          <TagInput defaultValue={['Design']} suggestions={['Design', 'Research']} name="skills" />
        </Field>
        <Field label="Plain" required>
          <TagInput />
        </Field>
        <TagInput aria-label="Read only" readOnly defaultValue={['a']} />
        <TagInput aria-label="Disabled" disabled defaultValue={['b']} />
      </AnnouncerProvider>,
    );
    await expectNoAxeViolations(container);
    await userEvent.type(screen.getByRole('combobox', { name: 'Skills' }), 're');
    await userEvent.keyboard('{ArrowDown}');
    await expectNoAxeViolations(container);
  });

  it('has no axe violations with an inline error', async () => {
    const { container } = render(<TagInput aria-label="Emails" validate={() => 'Enter an email.'} />);
    await userEvent.type(screen.getByLabelText('Emails'), 'x{Enter}');
    await expectNoAxeViolations(container);
  });
});
