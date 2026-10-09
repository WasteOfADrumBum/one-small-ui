import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, ButtonGroup, ButtonToolbar, ToggleButton, ToggleButtonGroup } from '../src';

describe('Button options', () => {
  it('renders shape, size and pressed state', () => {
    render(
      <Button shape="pill" size="xs" pressed>
        Mute
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Mute' });
    expect(btn).toHaveAttribute('data-shape', 'pill');
    expect(btn).toHaveAttribute('data-size', 'xs');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('marks an active link as the current page', () => {
    render(
      <Button href="#a" active>
        Home
      </Button>,
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });
});

describe('ButtonGroup', () => {
  it('passes defaults to children, which can override them', () => {
    render(
      <ButtonGroup aria-label="g" variant="outline" size="sm" color="accent">
        <Button>A</Button>
        <Button variant="solid">B</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('group', { name: 'g' })).toHaveAttribute('data-attached');
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('data-variant', 'outline');
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('data-size', 'sm');
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('data-variant', 'solid');
  });
});

describe('ButtonToolbar', () => {
  it('has one tab stop and moves with arrow keys', async () => {
    render(
      <ButtonToolbar aria-label="Tools">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonToolbar>,
    );
    const [one, two, three] = screen.getAllByRole('button');
    expect(one).toHaveAttribute('tabindex', '0');
    expect(two).toHaveAttribute('tabindex', '-1');
    one!.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(two).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(three).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(one).toHaveFocus();
  });
});

describe('ToggleButton', () => {
  it('works as a checkbox on its own', async () => {
    render(<ToggleButton>Bold</ToggleButton>);
    const box = screen.getByRole('checkbox', { name: 'Bold' });
    await userEvent.click(screen.getByText('Bold'));
    expect(box).toBeChecked();
  });

  it('groups as radios with a shared value', async () => {
    const onValueChange = vi.fn();
    render(
      <ToggleButtonGroup aria-label="Align" defaultValue={['l']} onValueChange={onValueChange}>
        <ToggleButton value="l">Left</ToggleButton>
        <ToggleButton value="r">Right</ToggleButton>
      </ToggleButtonGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Left' })).toBeChecked();
    await userEvent.click(screen.getByText('Right'));
    expect(screen.getByRole('radio', { name: 'Right' })).toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith(['r']);
  });
});
