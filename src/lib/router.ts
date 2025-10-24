import * as React from 'react';

// Minimal hash-based router to avoid adding deps.
// Routes look like: #/dashboard, #/terminal, etc.

export type RoutePath =
  | '/dashboard'
  | '/terminal'
  | '/files'
  | '/editor'
  | '/wifi'
  | '/docker'
  | '/system'
  | '/libraries'
  | '/settings';

export function normalizeHash(hash: string): RoutePath {
  const cleaned = hash.replace(/^#/, '') || '/dashboard';
  const known: RoutePath[] = [
    '/dashboard',
    '/terminal',
    '/files',
    '/editor',
    '/wifi',
    '/docker',
    '/system',
    '/libraries',
    '/settings',
  ];
  if (known.includes(cleaned as RoutePath)) return cleaned as RoutePath;
  return '/dashboard';
}

export function useHashRoute() {
  const [route, setRoute] = React.useState<RoutePath>(
    normalizeHash(window.location.hash)
  );

  React.useEffect(() => {
    const onHashChange = () => setRoute(normalizeHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = React.useCallback(
    (to: RoutePath) => {
      if (normalizeHash(`#${to}`) !== route) {
        window.location.hash = to;
      }
    },
    [route]
  );

  return { route, navigate };
}
