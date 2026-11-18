import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { IMAGES, VERIFIED_CASES } from '../data/cadCatalog';
import { CadViewport3D } from '../components/CadViewport3D';

interface TextToCadPageProps {
  onNavigate: (route: string) => void;
}

const PROMPT_ANATOMY = [
  {
    clause: '“100 mm long, 66 mm wide, 28 mm tall”',
    mapping: 'Outer Bounding Envelope (X, Z, Y)',
    detail: 'Locks external housing limits while computing internal cavity bounds automatically.',
  },
  {
    clause: '“wall thickness 3 mm”',
    mapping: 'Shell & Base Thickness Constraint',
    detail: 'Maintains uniform perimeter extrusion aligned to 0.4 mm nozzle line widths.',
  },
  {
    clause: '“removable top lid”',
    mapping: 'Stepped Alignment Lip + Radial Clearance',
    detail: 'Splits assembly into two printable solids with a 0.20–0.25 mm slip-fit lip.',
  },
  {
    clause: '“four internal mounting standoffs”',
    mapping: 'Symmetric Boss Array + Lid Screw Bores',
    detail: 'Generates corner bosses and aligned countersunk clearance holes through the lid.',
  },
];

export const TextToCadPage: React.FC<TextToCadPageProps> = ({ onNavigate }) => {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const activeCase = VERIFIED_CASES[selectedCaseIdx];

  return (
    <div>
      {/* Header Banner */}
      <section className="border-b border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="text-xs font-medium text-[#1D4ED8]">
                Text to CAD · Natural Language to Solid Geometry
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                How plain-English part specs become parametric 3D CAD
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Describe what a part needs to hold, support, or mount—including key lengths, wall
                thickness, hole diameters, and angles. SolidCraft maps natural-language clauses
                into structured solid geometry instead of uneditable triangle blobs.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/enclosure-generator"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/enclosure-generator');
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E40AF]"
                >
                  <span>Try Enclosure Generator</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/parametric-cad"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/parametric-cad');
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <span>Explore Parametric Controls</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img
                  src={IMAGES.workshopHero}
                  alt="Custom 3D printed electronics enclosure beside calipers and circuit board"
                  referrerPolicy="no-referrer"
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prompt-to-Constraint Breakdown */}
      <section className="border-b border-slate-200 bg-[#F8FAFC] py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Anatomy of a Text-to-CAD specification
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Each engineering detail in your sentence maps directly to a named parametric feature
              that remains editable afterward.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {PROMPT_ANATOMY.map((row) => (
              <div key={row.mapping} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="font-mono text-xs font-semibold text-[#1D4ED8]">{row.clause}</div>
                <h3 className="mt-2 font-display text-base font-bold text-slate-900">
                  {row.mapping}
                </h3>
                <p className="mt-1.5 text-sm text-slate-600">{row.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Verified Prompt -> Result Explorer */}
      <section className="border-b border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Input prompt to verified 3D output
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Select any of the three verified repository builds to compare original prompt,
                extracted parts, and 3D model.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 rounded-lg bg-slate-100 p-1">
              {VERIFIED_CASES.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCaseIdx(idx)}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedCaseIdx === idx
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-6 lg:col-span-5">
              <div>
                <div className="text-xs font-medium text-slate-500">{activeCase.provenance}</div>
                <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
                  {activeCase.title}
                </h3>

                <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold text-slate-500">Original Prompt</div>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-800">
                    “{activeCase.originalPrompt}”
                  </p>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-semibold text-slate-700">
                    Generated Structural Sub-Parts
                  </div>
                  <ul className="mt-2 space-y-2">
                    {activeCase.components.map((comp) => (
                      <li key={comp} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>{comp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-xs">
                <span className="font-mono text-slate-600">
                  {activeCase.files.stepName} · {activeCase.files.stlName}
                </span>
                <a
                  href="/examples"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/examples');
                  }}
                  className="font-semibold text-[#1D4ED8] hover:underline"
                >
                  Full Case Details
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <CadViewport3D
                partKind={activeCase.id}
                params={activeCase.params}
                compactTitle={activeCase.title}
                className="h-full min-h-[420px]"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
