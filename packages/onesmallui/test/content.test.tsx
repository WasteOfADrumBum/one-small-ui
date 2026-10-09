import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Blockquote, Container, Table } from '../src';

async function expectNoAxeViolations(container: HTMLElement) {
  const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

function People(props: Partial<Parameters<typeof Table>[0]>) {
  return (
    <Table caption="Team" {...props}>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Role</th>
        </tr>
      </thead>
      <tbody>
        <tr data-color="success">
          <th scope="row">Ada</th>
          <td>Engineer</td>
        </tr>
        <tr data-state="active">
          <th scope="row">Grace</th>
          <td data-label="Job">Admiral</td>
        </tr>
      </tbody>
    </Table>
  );
}

describe('Table', () => {
  it('maps props to data attributes and renders a caption', async () => {
    const { container } = render(<People striped hover bordered size="sm" variant="card" color="info" captionSide="bottom" />);
    const table = screen.getByRole('table', { name: 'Team' });
    expect(table).toHaveClass('os-table');
    expect(table).toHaveAttribute('data-striped', 'rows');
    expect(table).toHaveAttribute('data-hover');
    expect(table).toHaveAttribute('data-bordered');
    expect(table).toHaveAttribute('data-size', 'sm');
    expect(table).toHaveAttribute('data-variant', 'card');
    expect(table).toHaveAttribute('data-color', 'info');
    expect(table).toHaveAttribute('data-caption', 'bottom');
    await expectNoAxeViolations(container);
  });

  it('stripes columns and leaves defaults off', () => {
    render(<People striped="columns" />);
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('data-striped', 'columns');
    expect(table).not.toHaveAttribute('data-hover');
    expect(table).not.toHaveAttribute('data-size');
  });

  it('labels cells and pins roles when stacked', () => {
    render(<People stacked />);
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('data-stacked', 'md');
    expect(table).toHaveAttribute('role', 'table');
    expect(screen.getByText('Ada')).toHaveAttribute('data-label', 'Name');
    expect(screen.getByText('Ada')).toHaveAttribute('role', 'rowheader');
    expect(screen.getByText('Engineer')).toHaveAttribute('data-label', 'Role');
    expect(screen.getByText('Engineer')).toHaveAttribute('role', 'cell');
    // Explicit labels win.
    expect(screen.getByText('Admiral')).toHaveAttribute('data-label', 'Job');
    expect(screen.getByText('Name')).toHaveAttribute('role', 'columnheader');
  });

  it('wraps in a focusable region named by the caption when responsive', async () => {
    const { container } = render(<People responsive />);
    const region = screen.getByRole('region', { name: 'Team' });
    expect(region).toHaveClass('os-table-responsive');
    expect(region).toHaveAttribute('tabindex', '0');
    await expectNoAxeViolations(container);
  });

  it('uses regionLabel when given', () => {
    render(<People caption={undefined} aria-label="People" responsive regionLabel="People table" />);
    expect(screen.getByRole('region', { name: 'People table' })).toBeInTheDocument();
  });

  it('forwards refs', () => {
    const ref = { current: null as HTMLTableElement | null };
    render(<People ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTableElement);
  });
});

describe('Blockquote', () => {
  it('renders a bare blockquote', () => {
    render(<Blockquote cite="https://example.com">Stay curious.</Blockquote>);
    const quote = screen.getByText('Stay curious.');
    expect(quote.tagName).toBe('BLOCKQUOTE');
    expect(quote).toHaveClass('os-blockquote');
    expect(quote).toHaveAttribute('cite', 'https://example.com');
  });

  it('wraps in a figure with source and cite', async () => {
    const { container } = render(
      <Blockquote source="Ada Lovelace" sourceTitle="Notes" align="center">
        <p>The engine weaves algebraic patterns.</p>
      </Blockquote>,
    );
    const figure = container.querySelector('figure')!;
    expect(figure).toHaveClass('os-text-center');
    expect(container.querySelector('blockquote')).toHaveAttribute('data-variant', 'plain');
    expect(container.querySelector('figcaption')).toHaveTextContent('Ada Lovelace, Notes');
    expect(container.querySelector('cite')).toHaveTextContent('Notes');
    await expectNoAxeViolations(container);
  });
});

describe('Container', () => {
  it('accepts the responsive size', () => {
    render(<Container size="responsive">x</Container>);
    expect(screen.getByText('x')).toHaveAttribute('data-size', 'responsive');
  });
});
