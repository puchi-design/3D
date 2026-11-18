import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { GUIDES } from '../data/cadCatalog';

interface GuidesPageProps {
  onNavigate: (route: string) => void;
}

export const GuidesPage: React.FC<GuidesPageProps> = ({ onNavigate }) => {
  const categories = ['All Guides', ...Array.from(new Set(GUIDES.map((g) => g.category)))];
  const [selectedCat, setSelectedCat] = useState('All Guides');

  const visibleGuides = GUIDES.filter(
    (g) => selectedCat === 'All Guides' || g.category === selectedCat,
  );

  return (
    <div className="bg-[#F8FAFC] py-14">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-8 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-[#1D4ED8]">
              Technical Guides · Tolerances, File Formats &amp; Print Preparation
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Practical CAD sizing &amp; 3D printing guides
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Reference values for FDM screw clearances, lid alignment lips, wall perimeter rules,
              and importing STEP B-Rep solids cleanly into Fusion 360 or FreeCAD.
            </p>
          </div>

          <div className="flex flex-wrap gap-1 rounded-lg bg-slate-200/80 p-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedCat === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {visibleGuides.map((guide) => (
            <article
              key={guide.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span>{guide.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{guide.readTime}</span>
                </div>
                <h2 className="mt-2 font-display text-xl font-bold text-slate-900">
                  {guide.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{guide.summary}</p>

                <div className="mt-5 space-y-5 border-t border-slate-100 pt-5">
                  {guide.sections.map((sec) => (
                    <div key={sec.heading}>
                      <h3 className="font-display text-sm font-bold text-slate-900">
                        {sec.heading}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{sec.body}</p>

                      {sec.specRows && (
                        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                          <table className="w-full text-left text-xs">
                            <tbody className="divide-y divide-slate-200">
                              {sec.specRows.map((row) => (
                                <tr key={row.label} className="bg-slate-50/70">
                                  <td className="px-3 py-2 font-medium text-slate-800">
                                    {row.label}
                                  </td>
                                  <td className="px-3 py-2 font-mono font-semibold tabular-nums text-[#1D4ED8]">
                                    {row.value}
                                  </td>
                                  <td className="px-3 py-2 text-slate-500">{row.note}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-4">
                <a
                  href={guide.relatedToolRoute}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(guide.relatedToolRoute);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1D4ED8] hover:underline"
                >
                  <span>{guide.relatedToolLabel}</span>
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
