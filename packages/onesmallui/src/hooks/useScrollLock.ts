import { useEffect } from 'react';
import { cls } from '../utils/prefix';

let count = 0;
let restore: (() => void) | null = null;

const isIOS = () =>
  /iP(hone|ad|od)/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function lock() {
  count++;
  if (count > 1) return;
  const html = document.documentElement;
  const body = document.body;
  const scrollbar = Math.max(0, window.innerWidth - html.clientWidth);
  const prev = {
    padding: body.style.paddingInlineEnd,
    position: body.style.position,
    top: body.style.top,
    insetInline: body.style.insetInline,
    width: body.style.width,
  };
  html.classList.add(cls('scroll-locked'));
  // Fixed elements (fixed navbars, the toast viewport) read this to stay put.
  html.style.setProperty('--os-scrollbar-width', `${scrollbar}px`);
  if (scrollbar > 0) {
    const current = parseFloat(getComputedStyle(body).paddingInlineEnd) || 0;
    body.style.paddingInlineEnd = `${current + scrollbar}px`;
  }
  // iOS Safari ignores overflow: hidden on the root: pin the body instead.
  const ios = isIOS();
  const y = window.scrollY;
  if (ios) {
    body.style.position = 'fixed';
    body.style.top = `${-y}px`;
    body.style.insetInline = '0';
    body.style.width = '100%';
  }
  restore = () => {
    html.classList.remove(cls('scroll-locked'));
    html.style.removeProperty('--os-scrollbar-width');
    body.style.paddingInlineEnd = prev.padding;
    if (ios) {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.insetInline = prev.insetInline;
      body.style.width = prev.width;
      window.scrollTo(0, y);
    }
  };
}

function unlock() {
  count = Math.max(0, count - 1);
  if (count === 0) {
    restore?.();
    restore = null;
  }
}

/**
 * Stops the page from scrolling while `active`, without layout shift: the body is
 * padded by the scrollbar width (exposed as `--os-scrollbar-width` on `<html>`).
 * Nested locks are counted, so the page unlocks when the last one releases.
 * Works on iOS Safari. SSR safe.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}
