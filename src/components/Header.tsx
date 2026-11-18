import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

const NAV_ITEMS = [
  { label: 'Text to CAD', route: '/text-to-cad' },
  { label: 'Parametric', route: '/parametric-cad' },
  { label: 'Tools', route: '/tools' },
  { label: 'Examples', route: '/examples' },
  { label: 'Guides', route: '/guides' },
];

export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (e: React.MouseEvent, route: string) => {
    e.preventDefault();
    setMobileOpen(false);
    onNavigate(route);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        {/* Zone 1: Brand Wordmark (single clean text element) */}
        <a
          href="/"
          onClick={(e) => handleNav(e, '/')}
          className="whitespace-nowrap shrink-0 font-display text-lg font-bold tracking-tight text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4ED8]"
        >
          SolidCraft
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label="Primary navigation"
        >
          {NAV_ITEMS.map((item) => {
            const isActive =
              currentRoute === item.route ||
              (item.route === '/tools' && currentRoute.endsWith('-generator'));
            return (
              <a
                key={item.route}
                href={item.route}
                onClick={(e) => handleNav(e, item.route)}
                className={`whitespace-nowrap shrink-0 border-b-2 py-0.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4ED8] ${
                  isActive
                    ? 'border-[#1D4ED8] text-slate-900'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/enclosure-generator"
            onClick={(e) => handleNav(e, '/enclosure-generator')}
            className="hidden whitespace-nowrap shrink-0 rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E40AF] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] sm:inline-flex"
          >
            Enclosure Tool
          </a>
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.route}
                href={item.route}
                onClick={(e) => handleNav(e, item.route)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  currentRoute === item.route
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.label}
              </a>
            ))}
            <a
              href="/enclosure-generator"
              onClick={(e) => handleNav(e, '/enclosure-generator')}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Open Enclosure Generator
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
