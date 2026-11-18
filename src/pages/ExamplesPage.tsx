import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Download, FileCode2 } from 'lucide-react';
import { VERIFIED_CASES } from '../data/cadCatalog';
import { CadViewport3D } from '../components/CadViewport3D';
import {
  generateSimulatedStepText,
  generateSimulatedStlText,
} from '../three/cadModels';

interface ExamplesPageProps {
  onNavigate: (route: string) => void;
}

export const ExamplesPage: React.FC<ExamplesPageProps> = ({ onNavigate }) => {
  const [activeVersionMap, setActiveVersionMap] = useState<Record<string, number>>({
    enclosure: 1,
    phoneStand: 1,
    chassis: 1,
  });

  const handleDownload = (
    partId: (typeof VERIFIED_CASES)[number]['id'],
    params: (typeof VERIFIED_CASES)[number]['params'],
    fmt: 'step' | 'stl',
    fileName: string,
  ) => {
    const text =
      fmt === 'step'
        ? generateSimulatedStepText(partId, params)
        : generateSimulatedStlText(partId, params);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#F8FAFC] py-14">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="max-w-3xl border-b border-slate-200 pb-8">
          <p className="text-xs font-medium text-[#1D4ED8]">
            Verified Repository Cases · Reference Prompts, Revisions &amp; Files
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Verified AI CAD examples and revision histories
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            These three parts come from verified repository test cases—not live generated mocks.
            Each entry documents the original natural-language prompt, extracted parameters, a
            follow-up revision preserving unrelated constraints, and downloadable STEP/STL sample
            outputs.
          </p>
        </div>

        <div className="mt-10 space-y-12">
          {VERIFIED_CASES.map((item, idx) => {
            const verIdx = activeVersionMap[item.id] ?? item.versions.length - 1;
            const currentSnap = item.versions[verIdx] || item.versions[0];
            const toolRoute =
              item.id === 'enclosure'
                ? '/enclosure-generator'
                : item.id === 'phoneStand'
                  ? '/phone-stand-generator'
                  : '/chassis-generator';

            return (
              <section
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8"
              >
                <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
                  <div>
                    <div className="text-xs font-medium text-slate-500">
                      0{idx + 1}. {item.provenance}
                    </div>
                    <h2 className="mt-1 font-display text-2xl font-bold text-slate-900">
                      {item.title}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex rounded-lg bg-slate-100 p-1">
                      {item.versions.map((v, vIdx) => (
                        <button
                          key={v.version}
                          type="button"
                          onClick={() =>
                            setActiveVersionMap((prev) => ({ ...prev, [item.id]: vIdx }))
                          }
                          className={`whitespace-nowrap rounded-md px-3 py-1.5 font-mono text-xs font-medium transition-colors ${
                            verIdx === vIdx
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {v.version} · {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
                  {/* Left: Specs, Prompts, Photo & Files */}
                  <div className="flex flex-col justify-between space-y-5 lg:col-span-5">
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      <img
                        src={item.imagePath}
                        alt={item.imageAlt}
                        referrerPolicy="no-referrer"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
                      <div className="text-xs font-semibold text-slate-500">
                        Original Prompt ({item.versions[0].version})
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-800">
                        “{item.originalPrompt}”
                      </p>

                      <div className="mt-3 border-t border-slate-200 pt-3">
                        <div className="text-xs font-semibold text-[#1D4ED8]">
                          Follow-Up Modification ({item.versions[1]?.version ?? 'v1.1'})
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-slate-800">
                          “{item.followUpPrompt}”
                        </p>
                        <p className="mt-1.5 text-[11px] text-slate-600">{item.followUpSummary}</p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-semibold text-slate-800">
                        Active Snapshot Parameters ({currentSnap.version})
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs tabular-nums">
                        <div className="rounded bg-slate-50 px-2.5 py-1.5 text-slate-700">
                          L: {currentSnap.params.length} mm
                        </div>
                        <div className="rounded bg-slate-50 px-2.5 py-1.5 text-slate-700">
                          W: {currentSnap.params.width} mm
                        </div>
                        <div className="rounded bg-slate-50 px-2.5 py-1.5 text-slate-700">
                          H: {currentSnap.params.height} mm
                        </div>
                        <div className="rounded bg-slate-50 px-2.5 py-1.5 text-slate-700">
                          Wall: {currentSnap.params.wallThickness.toFixed(1)} mm
                        </div>
                        {currentSnap.params.holeDiameter > 0 && (
                          <div className="rounded bg-slate-50 px-2.5 py-1.5 text-slate-700">
                            Bore: {currentSnap.params.holeDiameter.toFixed(1)} mm
                          </div>
                        )}
                        {currentSnap.params.angle > 0 && (
                          <div className="rounded bg-slate-50 px-2.5 py-1.5 text-slate-700">
                            Angle: {currentSnap.params.angle}°
                          </div>
                        )}
                        <div className="rounded bg-slate-50 px-2.5 py-1.5 text-slate-700">
                          Gap: {currentSnap.params.clearance.toFixed(2)} mm
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Interactive 3D CAD Viewport + Files */}
                  <div className="flex flex-col justify-between gap-4 lg:col-span-7">
                    <CadViewport3D
                      partKind={item.id}
                      params={currentSnap.params}
                      compactTitle={`${item.title} (${currentSnap.version})`}
                      className="min-h-[400px] flex-1"
                    />

                    <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="text-xs font-semibold text-slate-900">
                          Included Components &amp; Verified Deliverables
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
                          {item.components.slice(0, 3).map((comp) => (
                            <span key={comp} className="inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(
                              item.id,
                              currentSnap.params,
                              'step',
                              item.files.stepName,
                            )
                          }
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                        >
                          <FileCode2 className="h-3.5 w-3.5 text-[#1D4ED8]" />
                          <span>STEP ({item.files.stepSizeKb} KB)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(
                              item.id,
                              currentSnap.params,
                              'stl',
                              item.files.stlName,
                            )
                          }
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#1D4ED8] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1E40AF]"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>STL ({item.files.stlTriangles.toLocaleString()} tris)</span>
                        </button>
                        <a
                          href={toolRoute}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate(toolRoute);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-[#1D4ED8] hover:underline"
                        >
                          <span>Customize</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};
