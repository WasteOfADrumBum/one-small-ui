import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  CommandPalette,
  Drawer,
  Kbd,
  SearchIcon,
  SkipLink,
  ThemeToggle,
  useHotkeyPlatform,
  type CommandGroup,
  type CommandItem,
} from '@onesmall/ui';
import { componentDocs, groups } from './site/componentDocs';
import { useHashRoute } from './site/router';
import { Home } from './pages/Home';
import { GettingStarted } from './pages/GettingStarted';
import { Theming } from './pages/Theming';
import { Utilities } from './pages/Utilities';
import { Accessibility } from './pages/Accessibility';
import { ComponentPage } from './pages/ComponentPage';

const guides = [
  { path: 'getting-started', label: 'Getting started' },
  { path: 'theming', label: 'Theming & tokens' },
  { path: 'utilities', label: 'Utility classes' },
  { path: 'accessibility', label: 'Accessibility' },
];

const isRoute = (p: string) =>
  p === 'home' || guides.some((g) => g.path === p) || componentDocs.some((d) => `components/${d.slug}` === p);

// The hash router reads the hash. (Options with href="#…" would work too, but axe's skip-link
// rule flags in-page hash links whose target id doesn't exist once they scroll out of view.)
const go = (item: CommandItem) => {
  window.location.hash = item.id;
};

/** Every docs page, grouped like the sidebar, for the Mod+K search palette. */
function useDocsSearchGroups(): CommandGroup[] {
  return useMemo(
    () => [
      { heading: 'Guides', items: guides.map((g) => ({ id: g.path, label: g.label, onSelect: go })) },
      ...groups.map((group) => ({
        heading: group,
        items: componentDocs
          .filter((d) => d.group === group)
          .map((d) => ({ id: `components/${d.slug}`, label: d.name, keywords: [d.slug, d.group], onSelect: go })),
      })),
    ],
    [],
  );
}

function DocsSearch() {
  const [open, setOpen] = useState(false);
  const searchGroups = useDocsSearchGroups();
  const platform = useHotkeyPlatform();
  return (
    <>
      <Button
        className="docs-search-btn"
        variant="outline"
        color="neutral"
        aria-keyshortcuts={platform === 'mac' ? 'Meta+K' : 'Control+K'}
        leftIcon={<SearchIcon />}
        rightIcon={<Kbd combo="Mod+K" size="sm" className="docs-search-btn__kbd" />}
        onClick={() => setOpen(true)}
      >
        <span className="docs-search-btn__label">Search docs</span>
      </Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={searchGroups}
        label="Search the documentation"
        inputLabel="Search docs pages"
        placeholder="Search components, hooks and guides…"
        recent={{ storageKey: 'onesmallui-docs-recent', max: 5, label: 'Recently visited' }}
      />
    </>
  );
}

function Nav({ route, onNavigate }: { route: string; onNavigate?: () => void }) {
  const link = (path: string, label: string) => (
    <li key={path}>
      <a href={`#${path}`} aria-current={route === path ? 'page' : undefined} onClick={onNavigate}>
        {label}
      </a>
    </li>
  );
  return (
    <nav aria-label="Documentation" className="docs-nav">
      <p className="docs-nav__heading">Guides</p>
      <ul>{guides.map((g) => link(g.path, g.label))}</ul>
      {groups.map((group) => (
        <div key={group}>
          <p className="docs-nav__heading">{group}</p>
          <ul>{componentDocs.filter((d) => d.group === group).map((d) => link(`components/${d.slug}`, d.name))}</ul>
        </div>
      ))}
    </nav>
  );
}

function Logo() {
  return (
    <a href="#home" className="docs-logo" aria-label="1SmUI home">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--os-primary)" />
            <stop offset="1" stopColor="var(--os-accent)" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="22" fill="none" stroke="url(#logo-g)" strokeWidth="5" />
        <circle cx="32" cy="32" r="8" fill="url(#logo-g)" />
      </svg>
      <span className="docs-logo__word">
        1Sm<span className="os-gradient-text">UI</span>
      </span>
    </a>
  );
}

export function App() {
  const route = useHashRoute(isRoute, 'home');
  const [menuOpen, setMenuOpen] = useState(false);
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);

  // On navigation, scroll to top and move focus to the new page heading for screen readers.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    const h1 = main.current?.querySelector<HTMLElement>('h1');
    if (h1) {
      h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: true });
    }
  }, [route]);

  const doc = componentDocs.find((d) => `components/${d.slug}` === route);
  const title = doc?.name ?? guides.find((g) => g.path === route)?.label;
  useEffect(() => {
    document.title = title ? `${title} · OneSmallUI` : 'OneSmallUI · 1SmUI';
  }, [title]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  let page;
  if (doc) page = <ComponentPage doc={doc} />;
  else if (route === 'getting-started') page = <GettingStarted />;
  else if (route === 'theming') page = <Theming />;
  else if (route === 'utilities') page = <Utilities />;
  else if (route === 'accessibility') page = <Accessibility />;
  else page = <Home />;

  return (
    <div className="docs-shell">
      <SkipLink href="#main" />
      <header className="docs-header">
        <Button
          className="docs-menu-btn"
          variant="ghost"
          color="neutral"
          iconOnly
          aria-label="Open navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h10" />
          </svg>
        </Button>
        <Logo />
        <div className="docs-header__actions">
          <DocsSearch />
          <a className="docs-header__link" href="#getting-started">
            Docs
          </a>
          <a className="docs-header__link" href="https://github.com/WasteOfADrumBum/one-small-ui" rel="noreferrer">
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </header>

      <div className="docs-body">
        <aside className="docs-sidebar">
          <Nav route={route} />
        </aside>
        <main id="main" ref={main} className="docs-main" tabIndex={-1}>
          <div key={route} className="docs-page">
            {page}
          </div>
          <footer className="docs-footer">
            <p>OneSmallUI · MIT licensed · Built with its own components.</p>
          </footer>
        </main>
      </div>

      <Drawer open={menuOpen} onClose={closeMenu} placement="start" size="sm" title="Navigation">
        <Nav route={route} onNavigate={closeMenu} />
      </Drawer>
    </div>
  );
}
