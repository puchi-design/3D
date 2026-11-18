import React from 'react';
import { TOOL_PAGES } from '../data/cadCatalog';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleLink = (e: React.MouseEvent, route: string) => {
    e.preventDefault();
    onNavigate(route);
  };

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <a
              href="/"
              onClick={(e) => handleLink(e, '/')}
              className="font-display text-lg font-bold tracking-tight text-slate-900"
            >
              SolidCraft
            </a>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              AI parametric CAD workflow for turning natural-language part specs into editable
              3D solids ready for STEP exchange and STL 3D printing.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Interface demonstration · Static examples &amp; simulated parametric controls
            </p>
          </div>

          <div>
            <h2 className="font-display text-sm font-semibold text-slate-900">Core Platform</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
              <li>
                <a
                  href="/text-to-cad"
                  onClick={(e) => handleLink(e, '/text-to-cad')}
                  className="hover:text-slate-900"
                >
                  Text to CAD
                </a>
              </li>
              <li>
                <a
                  href="/parametric-cad"
                  onClick={(e) => handleLink(e, '/parametric-cad')}
                  className="hover:text-slate-900"
                >
                  Parametric CAD
                </a>
              </li>
              <li>
                <a
                  href="/examples"
                  onClick={(e) => handleLink(e, '/examples')}
                  className="hover:text-slate-900"
                >
                  Verified Examples
                </a>
              </li>
              <li>
                <a
                  href="/guides"
                  onClick={(e) => handleLink(e, '/guides')}
                  className="hover:text-slate-900"
                >
                  Guides &amp; Tolerances
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-sm font-semibold text-slate-900">Part Generators</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
              {TOOL_PAGES.slice(0, 3).map((tool) => (
                <li key={tool.route}>
                  <a
                    href={tool.route}
                    onClick={(e) => handleLink(e, tool.route)}
                    className="hover:text-slate-900"
                  >
                    {tool.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-sm font-semibold text-slate-900">More Generators</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-600">
              {TOOL_PAGES.slice(3).map((tool) => (
                <li key={tool.route}>
                  <a
                    href={tool.route}
                    onClick={(e) => handleLink(e, tool.route)}
                    className="hover:text-slate-900"
                  >
                    {tool.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/tools"
                  onClick={(e) => handleLink(e, '/tools')}
                  className="font-medium text-[#1D4ED8] hover:text-[#1E40AF]"
                >
                  View All CAD Tools
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>SolidCraft · Parametric CAD Showcase</p>
          <p>Export Formats: STEP (ISO 10303-21 B-Rep) · STL (Watertight Mesh)</p>
        </div>
      </div>
    </footer>
  );
};
