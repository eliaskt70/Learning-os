import { useEffect, useState } from 'react';

/**
 * Minimal hash router. Hash routing works on any static host and with file-based
 * previews without server rewrite rules.
 */
export function useHashRoute(): string[] {
  const read = () =>
    window.location.hash
      .replace(/^#\/?/, '')
      .split('/')
      .filter(Boolean)
      .map(decodeURIComponent);
  const [segments, setSegments] = useState<string[]>(read);

  useEffect(() => {
    const onChange = () => {
      setSegments(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return segments;
}

export function navigate(href: string) {
  window.location.hash = href.replace(/^#/, '');
}
