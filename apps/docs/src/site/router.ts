import { useEffect, useState } from 'react';

/**
 * Tiny hash router so the docs work on any static host (GitHub Pages, Netlify, a folder).
 * Unknown hashes (like #main from the skip link) are treated as in-page anchors.
 */
export function useHashRoute(isRoute: (path: string) => boolean, fallback: string) {
  const read = () => decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));
  const [route, setRoute] = useState(() => (isRoute(read()) ? read() : fallback));

  useEffect(() => {
    const onChange = () => {
      const next = read();
      if (next === '') setRoute(fallback);
      else if (isRoute(next)) setRoute(next);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, [isRoute, fallback]);

  return route;
}
