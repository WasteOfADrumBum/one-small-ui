import { useEffect, useState } from 'react';

/**
 * Tiny hash router so the docs work on any static host (GitHub Pages, Netlify, a folder).
 * Unknown hashes (like #main from the skip link) are treated as in-page anchors, except unknown
 * `components/…` paths, which are broken links to a page: those show the not-found page.
 */
export const NOT_FOUND = 'not-found';
const missingPage = (path: string) => /^components\//.test(path);

export function useHashRoute(isRoute: (path: string) => boolean, fallback: string) {
  const read = () => {
    try {
      return decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));
    } catch {
      return window.location.hash.replace(/^#\/?/, '');
    }
  };
  const resolve = (path: string, current: string) => (isRoute(path) ? path : missingPage(path) ? NOT_FOUND : current);
  const [route, setRoute] = useState(() => resolve(read(), fallback));

  useEffect(() => {
    const onChange = () => {
      const next = read();
      if (next === '') setRoute(fallback);
      else setRoute((current) => resolve(next, current));
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, [isRoute, fallback]);

  return route;
}
