import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { TOOL_PAGES } from '../data/cadCatalog';

interface ToolsDirectoryPageProps {
  onNavigate: (route: string) => void;
}

type ToolFilter = 'all' | 'verified' | 'planned';

export const ToolsDirectoryPage: React.FC<ToolsDirectoryPageProps> = ({ onNavigate }) => {
  const [filter, setFilter] = useState<ToolFilter>('all');

  const filteredTools = TOOL_PAGES.filter((t) => {
    if (filter === 'verified') return t.caseStatus === 'Verified Repository Case';
    if (filter === 'planned') return t.caseStatus === 'Planned Parametric Template';
    return true;
  });

  return (
    <div className="bg-[#F8FAFC] py-14">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-8 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-[#1D4ED8]">
              CAD Generators · Part-Specific Parametric Workflows
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Specialized CAD generators by part type
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Select a dedicated generator tailored to enclosures, utility boxes, phone stands,
              robot chassis plates, mounting brackets, or Raspberry Pi cases. Each tool details
              adjustable parameters, prompt examples, and STEP/STL output rules.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-slate-200/80 p-1" role="group" aria-label="Filter generators">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Tools (6)
            </button>
            <button
              type="button"
              onClick={() => setFilter('verified')}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === 'verified'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Verified Cases (3)
            </button>
            <button
              type="button"
              onClick={() => setFilter('planned')}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === 'planned'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Planned Templates (3)
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <article
              key={tool.route}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6"
            >
              <div>
                <div className="text-xs font-medium text-slate-500">
                  {tool.caseStatus} · {tool.route}
                </div>
                <h2 className="mt-2 font-display text-xl font-bold text-slate-900">
                  {tool.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{tool.summary}</p>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="text-xs font-semibold text-slate-800">Key Adjustable Parameters</div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
                    {tool.controls.slice(0, 5).map((ctrl) => (
                      <span key={ctrl.key} className="font-mono text-[11px]">
                        · {ctrl.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="font-mono text-xs tabular-nums text-slate-500">
                  Default {tool.defaultParams.length} × {tool.defaultParams.width} ×{' '}
                  {tool.defaultParams.height} mm
                </span>
                <a
                  href={tool.route}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(tool.route);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:underline"
                >
                  <span>Open Tool</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
