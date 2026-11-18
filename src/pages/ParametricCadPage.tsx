import React from 'react';
import { ArrowRight, CheckCircle2, Lock, RefreshCw } from 'lucide-react';
import { InteractiveCadStudio } from '../components/InteractiveCadStudio';

interface ParametricCadPageProps {
  onNavigate: (route: string) => void;
}

const PARAMETER_CATEGORIES = [
  {
    title: 'Envelope & Structural Walls',
    params: ['Outer Length / Width / Height', 'Perimeter Wall Thickness', 'Floor / Plate Thickness', 'Outer Corner Fillet Radius'],
    note: 'Wall thickness automatically adjusts inner cavity clearance while preserving overall mounting bounds.',
  },
  {
    title: 'Fasteners, Bores & Standoffs',
    params: ['Lid Screw Hole Diameter', 'Axle / Bearing Bore Diameter', 'Internal Standoff Height', 'Mounting Flange Spacing'],
    note: 'Hole bores scale independently from surrounding boss shoulders so thin-wall warnings trigger if margin drops.',
  },
  {
    title: 'Angles & Mating Clearances',
    params: ['Backrest or Flange Tilt Angle', 'Lid Alignment Lip Radial Gap', 'Retention Ledge Height', 'Exploded Assembly Inspection'],
    note: 'Clearances default to FDM-tested 0.20–0.30 mm ranges and remain tunable per printer calibration.',
  },
];

export const ParametricCadPage: React.FC<ParametricCadPageProps> = ({ onNavigate }) => {
  return (
    <div>
      <section className="border-b border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-xs font-medium text-[#1D4ED8]">
              AI Parametric CAD · Dimensions, Constraints &amp; Non-Destructive Revisions
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Edit dimensions directly or through follow-up prompts
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              AI-generated meshes break down the moment a real screw hole needs to move by 0.4 mm.
              SolidCraft represents parts through explicit parameters—length, wall thickness, bore
              diameter, angle, and mating clearance—so every change regenerates cleanly.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-5">
              <Lock className="h-5 w-5 text-[#1D4ED8]" />
              <h2 className="mt-3 font-display text-base font-bold text-slate-900">
                Preserve Untouched Constraints
              </h2>
              <p className="mt-1.5 text-sm text-slate-600">
                Conversational revisions modify only the named feature—such as changing lid bores
                to 3.6 mm—while locking walls and standoff spacing.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-5">
              <RefreshCw className="h-5 w-5 text-[#1D4ED8]" />
              <h2 className="mt-3 font-display text-base font-bold text-slate-900">
                Instant Geometric Regeneration
              </h2>
              <p className="mt-1.5 text-sm text-slate-600">
                Adjust sliders for millimeter dimensions or angles and inspect the updated multi-body
                3D assembly immediately.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h2 className="mt-3 font-display text-base font-bold text-slate-900">
                Automated Fit &amp; Wall Checks
              </h2>
              <p className="mt-1.5 text-sm text-slate-600">
                Flag sub-1.8 mm walls, tight lid clearances under 0.15 mm, or low bore-edge margins
                before exporting STEP or STL.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Parameter Taxonomy */}
      <section className="border-b border-slate-200 bg-[#F8FAFC] py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Supported parametric dimensions by category
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {PARAMETER_CATEGORIES.map((cat) => (
              <div key={cat.title} className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="font-display text-base font-bold text-slate-900">{cat.title}</h3>
                <ul className="mt-3 space-y-1.5 text-xs font-medium text-slate-700">
                  {cat.params.map((p) => (
                    <li key={p} className="border-b border-slate-100 pb-1.5 last:border-0">
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">{cat.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Parametric Sandbox */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Try live parametric tuning &amp; follow-up edits
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Switch to the Parameters or Checks tab below to test how dimension updates affect
                3D geometry and fit verification.
              </p>
            </div>
            <a
              href="/tools"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/tools');
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:underline"
            >
              <span>Browse all part tools</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <InteractiveCadStudio initialPart="chassis" allowPartSwitch onNavigate={onNavigate} />
        </div>
      </section>
    </div>
  );
};
