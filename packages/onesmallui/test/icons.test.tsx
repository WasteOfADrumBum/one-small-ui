import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import * as Icons from '../src/icons';
import { CheckIcon, Icon, LoaderIcon, StarIcon, createIcon } from '../src/icons';

describe('Icons', () => {
  it('is decorative by default and sized by preset', () => {
    const { container } = render(<CheckIcon />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveClass('os-icon');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveAttribute('data-size', 'md');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('stroke-width', '2');
    expect(svg).not.toHaveAttribute('role');
  });

  it('exposes a labelled image and takes numeric sizes, stroke width and a ref', () => {
    const ref = createRef<SVGSVGElement>();
    render(<StarIcon ref={ref} label="Favorite" size={32} strokeWidth={1.5} className="extra" />);
    const svg = screen.getByRole('img', { name: 'Favorite' });
    expect(ref.current).toBe(svg);
    expect(svg).not.toHaveAttribute('aria-hidden');
    expect(svg).not.toHaveAttribute('data-size');
    expect(svg).toHaveStyle({ width: '32px', height: '32px' });
    expect(svg).toHaveAttribute('stroke-width', '1.5');
    expect(svg).toHaveClass('os-icon', 'extra');
  });

  it('spins the loader and names components', () => {
    const { container } = render(<LoaderIcon />);
    expect(container.querySelector('svg')).toHaveAttribute('data-spin', '');
    expect(createIcon('Dot', <circle cx="12" cy="12" r="2" />).displayName).toBe('DotIcon');
    const names = Object.keys(Icons).filter((k) => /^[A-Z]\w+Icon$/.test(k));
    expect(names).toHaveLength(44);
    for (const n of names) expect((Icons as unknown as Record<string, { displayName?: string }>)[n].displayName).toBe(n);
  });

  it('renders custom children through the base Icon', () => {
    const { container } = render(
      <Icon size="lg">
        <path d="M4 12h16" />
      </Icon>,
    );
    expect(container.querySelector('svg path')).toHaveAttribute('d', 'M4 12h16');
    expect(container.querySelector('svg')).toHaveAttribute('data-size', 'lg');
  });
});
