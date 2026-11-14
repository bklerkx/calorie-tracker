// Eenvoudige hash-router (#/vandaag). Hash-URL's werken zonder serverconfiguratie
// op het GitHub Pages-subpad en offline vanaf het beginscherm.

export const TABS = ['vandaag', 'week', 'scan', 'producten', 'instellingen'] as const;
export type Tab = (typeof TABS)[number];

function parse(hash: string): Tab {
  const name = hash.replace(/^#\/?/, '').split('/')[0];
  return (TABS as readonly string[]).includes(name) ? (name as Tab) : 'vandaag';
}

export const route = $state({ tab: parse(location.hash) });

window.addEventListener('hashchange', () => {
  route.tab = parse(location.hash);
});

export function navigate(tab: Tab) {
  if (route.tab === tab) return;
  location.hash = `#/${tab}`;
}
