import '@testing-library/jest-dom/vitest';
import { toHaveNoViolations } from 'jest-axe';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

afterEach(cleanup);

// jsdom lacks matchMedia and <dialog> methods.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.removeAttribute('open');
};

// jest-axe's matcher: expect(await axe(container)).toHaveNoViolations()
expect.extend(toHaveNoViolations);
