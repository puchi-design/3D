import React from 'react';
import { ArrowRight, CheckCircle2, FileCode2, Layers } from 'lucide-react';
import { ToolPageConfig } from '../types/cad';
import { InteractiveCadStudio } from '../components/InteractiveCadStudio';
import { FaqList } from '../components/FaqList';

interface ToolDetailPageProps {
  tool: ToolPageConfig;
  onNavigate: (route: string) => void;
}

export const ToolDetailPage: React.FC<ToolDetailPageProps> = ({ tool, onNavigate }) => {
  const handleLink = (e: React.MouseEvent, route: string) => {
    e.preventDefault();
    onNavigate(route);
  };

  return (
    <div>
      {/* Hero + Interactive Tool Studio */}
      <section className="border-b border-slate-200 bg-white pt-10 pb-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <span className="text-[#1D4ED8]">{tool.caseStatus}</span>
              <span aria-hidden="true">·</span>
              <span>Target Focus: {tool.targetTopic}</span>
              <span aria-hidden="true">·</span>
              <span>STEP &amp; STL Export</span>
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {tool.h1}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600">{tool.summary}</p>
          </div>

          <div className="mt-8">
            <InteractiveCadStudio
              initialPart={tool.id}
              allowPartSwitch={false}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      </section>

      {/* Use Cases, Scope & Prompt Examples */}
      <section className="border-b border-slate-200 bg-[#F8FAFC] py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Common use cases &amp; supported scope
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {tool.useCases.map((uc) => (
                  <li key={uc} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{uc}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-semibold text-slate-800">Geometric Scope</h3>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                  {tool.supportedScope.map((sc) => (
                    <li key={sc}>· {sc}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Prompt &amp; conversational revision example
                </h2>
                <div className="mt-4 rounded-lg border border-slate-200 bg-[#F8FAFC] p-4">
                  <div className="text-xs font-semibold text-slate-500">Initial Prompt</div>
                  <p className="mt-1 text-sm text-slate-800">“{tool.promptExample}”</p>
                </div>
                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 p-4">
                  <div className="text-xs font-semibold text-[#1D4ED8]">
                    Follow-Up Revision Prompt
                  </div>
                  <p className="mt-1 text-sm text-slate-800">“{tool.followUpExample.prompt}”</p>
                  <p className="mt-1.5 text-xs text-slate-600">{tool.followUpExample.outcome}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-slate-100 pt-4 text-xs text-slate-600">
                <FileCode2 className="h-4 w-4 shrink-0 text-[#1D4ED8]" />
                <span>
                  Exports watertight STL for slicing and STEP B-Rep solids for Fusion 360 or
                  FreeCAD (native feature trees not included in STEP).
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parameter Reference Table */}
      <section className="border-b border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Adjustable parameters &amp; dimension ranges
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Every parameter below can be adjusted directly with sliders or targeted in a follow-up
              text prompt.
            </p>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
                <tr>
                  <th className="px-4 py-3">Parameter</th>
                  <th className="px-4 py-3">Default</th>
                  <th className="px-4 py-3">Range</th>
                  <th className="px-4 py-3">Engineering Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-xs sm:text-sm">
                {tool.controls.map((ctrl) => (
                  <tr key={ctrl.key}>
                    <td className="px-4 py-3 font-medium text-slate-900">{ctrl.label}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-[#1D4ED8]">
                      {String(tool.defaultParams[ctrl.key])} {ctrl.unit}
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums text-slate-600">
                      {ctrl.min} – {ctrl.max} {ctrl.unit}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{ctrl.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Step-by-Step Workflow & Related Tools */}
      <section className="border-b border-slate-200 bg-[#F8FAFC] py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            How to generate &amp; export this part
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tool.steps.map((st) => (
              <div key={st.title} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="font-mono text-xs font-semibold text-[#1D4ED8]">{st.title}</div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{st.detail}</p>
              </div>
            ))}
          </div>

          {/* Related Tools & Guides */}
          <div className="mt-12">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Related generators &amp; guides
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              {tool.relatedRoutes.map((rel) => (
                <a
                  key={rel.label}
                  href={rel.route}
                  onClick={(e) => handleLink(e, rel.route)}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-[#1D4ED8]/60"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                      <Layers className="h-3.5 w-3.5 text-[#1D4ED8]" />
                      <span>{rel.label}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{rel.note}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#1D4ED8]" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tool FAQ */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-[900px] px-4 sm:px-6">
          <h2 className="mb-6 font-display text-2xl font-bold text-slate-900">
            {tool.shortName} generator questions
          </h2>
          <FaqList items={tool.faqs} />
        </div>
      </section>
    </div>
  );
};
