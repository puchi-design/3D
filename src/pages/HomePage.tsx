import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  FileCode2,
  Layers,
  RotateCcw,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import {
  evaluateGeometryChecks,
  HOME_FAQS,
  IMAGES,
  TOOL_PAGES,
  VERIFIED_CASES,
} from '../data/cadCatalog';
import { CadParams, PartKind } from '../types/cad';
import { HeroCadShowcase3D } from '../components/HeroCadShowcase3D';
import { InteractiveCadStudio } from '../components/InteractiveCadStudio';
import { FaqList } from '../components/FaqList';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

interface HeroPreset {
  id: PartKind;
  shortLabel: string;
  title: string;
  prompt: string;
  baseParams: CadParams;
  quickTweaks: {
    label: string;
    note: string;
    patch: Partial<CadParams>;
  }[];
}

const HERO_PRESETS: HeroPreset[] = [
  {
    id: 'enclosure',
    shortLabel: '01. Enclosure',
    title: 'Electronics Enclosure',
    prompt:
      'Generate a 100 × 66 × 28 mm electronics enclosure, 3 mm wall thickness, removable top lid, and four internal mounting standoffs.',
    baseParams: VERIFIED_CASES[0].params,
    quickTweaks: [
      {
        label: 'Lid Bore → 4.2 mm',
        note: 'Opened M4 clearance bores while locking 3.0 mm walls',
        patch: { holeDiameter: 4.2 },
      },
      {
        label: 'Tall Case → 38 mm',
        note: 'Raised ceiling height +10 mm for tall relays',
        patch: { height: 38 },
      },
      {
        label: 'Wall → 4.2 mm',
        note: 'Reinforced perimeter walls for rugged shop use',
        patch: { wallThickness: 4.2 },
      },
    ],
  },
  {
    id: 'phoneStand',
    shortLabel: '02. Phone Stand',
    title: 'Desktop Phone Stand',
    prompt:
      'Design a desktop phone stand with an 88 × 78 mm base, 64-degree backrest tilt, 14 mm front lip, and 4 mm structural plates.',
    baseParams: VERIFIED_CASES[1].params,
    quickTweaks: [
      {
        label: 'Tilt → 52° Recline',
        note: 'Lowered viewing angle to 52° while locking base footprint',
        patch: { angle: 52 },
      },
      {
        label: 'Backrest → 128 mm',
        note: 'Extended backrest height for tablet / max-size phones',
        patch: { height: 128 },
      },
      {
        label: 'Wide Base → 94 mm',
        note: 'Widened lateral cradle support to 94 mm',
        patch: { width: 94 },
      },
    ],
  },
  {
    id: 'chassis',
    shortLabel: '03. Robot Chassis',
    title: 'Robot Car Chassis',
    prompt:
      'Build a 160 × 112 mm robot car chassis plate, 5 mm thick, with upright axle brackets and 8.4 mm bearing shaft bores.',
    baseParams: VERIFIED_CASES[2].params,
    quickTweaks: [
      {
        label: 'Shaft Bore → 12.0 mm',
        note: 'Opened upright axle bores to 12.0 mm for flanged bearings',
        patch: { holeDiameter: 12.0 },
      },
      {
        label: 'Deck → 188 mm',
        note: 'Lengthened chassis deck for dual LiPo battery bays',
        patch: { length: 188 },
      },
      {
        label: 'Tower Height → 48 mm',
        note: 'Raised axle support towers for larger wheel clearance',
        patch: { height: 48 },
      },
    ],
  },
];

const WORKFLOW_STEPS = [
  {
    index: '01. Describe',
    title: 'Plain-English Specs',
    body: 'State dimensions, wall thickness, mounting bosses, angles, or fit clearance without writing CAD scripts.',
  },
  {
    index: '02. Generate',
    title: 'Parametric 3D Solid',
    body: 'SolidCraft converts your constraints into a multi-part solid assembly with real bores and alignment lips.',
  },
  {
    index: '03. Inspect',
    title: 'Dimension & Fit Checks',
    body: 'Orbit, zoom, explode sub-components, and catch thin walls or tight printer clearances before slicing.',
  },
  {
    index: '04. Modify',
    title: 'Chat or Slider Edits',
    body: 'Change a screw hole to 3.6 mm or adjust wall thickness while keeping untouched dimensions locked.',
  },
  {
    index: '05. Download',
    title: 'STEP & STL Delivery',
    body: 'Export watertight STL meshes for 3D printing or STEP B-Rep solids for Fusion 360 and FreeCAD.',
  },
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroParams, setHeroParams] = useState<CadParams>(HERO_PRESETS[0].baseParams);
  const [heroStatusNote, setHeroStatusNote] = useState<string>(
    'Verified Baseline · Select any quick tweak or type a dimension change',
  );
  const [heroQuickInput, setHeroQuickInput] = useState('');
  const [scanTriggerKey, setScanTriggerKey] = useState(1);
  const [activeTweakLabel, setActiveTweakLabel] = useState<string | null>(null);
  const [caseVersionState, setCaseVersionState] = useState<Record<string, number>>({
    enclosure: 1,
    phoneStand: 1,
    chassis: 1,
  });

  const activePreset = HERO_PRESETS[heroIdx];
  const heroChecks = useMemo(
    () => evaluateGeometryChecks(activePreset.id, heroParams),
    [activePreset.id, heroParams],
  );
  const hasWarning = heroChecks.some((c) => c.status === 'warning');

  const handleSelectHeroPreset = (idx: number) => {
    setHeroIdx(idx);
    setHeroParams(HERO_PRESETS[idx].baseParams);
    setActiveTweakLabel(null);
    setHeroStatusNote(
      `Loaded ${HERO_PRESETS[idx].title} · Drag 3D stage or apply a constraint edit`,
    );
    setScanTriggerKey((k) => k + 1);
  };

  const handleApplyHeroTweak = (tweak: HeroPreset['quickTweaks'][number]) => {
    setHeroParams((prev) => ({ ...prev, ...tweak.patch }));
    setActiveTweakLabel(tweak.label);
    setHeroStatusNote(tweak.note);
    setScanTriggerKey((k) => k + 1);
  };

  const handleResetHeroPreset = () => {
    setHeroParams(activePreset.baseParams);
    setActiveTweakLabel(null);
    setHeroStatusNote(`Reset ${activePreset.title} to verified baseline dimensions`);
    setScanTriggerKey((k) => k + 1);
  };

  const handleHeroQuickCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = heroQuickInput.trim();
    if (!raw) return;
    const lower = raw.toLowerCase();
    const numMatch = raw.match(/(\d+(?:\.\d+)?)/);
    const val = numMatch ? parseFloat(numMatch[1]) : null;
    const patch: Partial<CadParams> = {};

    if (val !== null) {
      if (lower.includes('wall') || lower.includes('thick')) {
        patch.wallThickness = Math.min(8, Math.max(1.6, val));
      } else if (lower.includes('hole') || lower.includes('bore') || lower.includes('screw')) {
        patch.holeDiameter = Math.min(16, Math.max(2, val));
      } else if (lower.includes('height') || lower.includes('tall')) {
        patch.height = Math.min(150, Math.max(18, val));
      } else if (lower.includes('length') || lower.includes('long')) {
        patch.length = Math.min(220, Math.max(40, val));
      } else if (lower.includes('width') || lower.includes('wide')) {
        patch.width = Math.min(160, Math.max(30, val));
      } else if (lower.includes('angle') || lower.includes('tilt')) {
        patch.angle = Math.min(115, Math.max(45, val));
      }
    }

    if (Object.keys(patch).length > 0) {
      setHeroParams((prev) => ({ ...prev, ...patch }));
      const desc = Object.entries(patch)
        .map(([k, v]) => `${k} → ${v}`)
        .join(', ');
      setHeroStatusNote(`Applied "${raw}" (${desc}) · Other parameters preserved`);
      setActiveTweakLabel(null);
      setScanTriggerKey((k) => k + 1);
    } else {
      const fallback = activePreset.quickTweaks[0];
      handleApplyHeroTweak(fallback);
    }
    setHeroQuickInput('');
  };

  const handleLink = (e: React.MouseEvent, route: string) => {
    e.preventDefault();
    onNavigate(route);
  };

  const scrollToWorkbench = () => {
    const el = document.getElementById('workbench');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* High-Impact Dark Precision CAD Hero Stage */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-[#070B14] text-white">
        {/* Subtle Precision Blueprint Grid & Studio Ambient Radial Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 75% 35%, rgba(37, 99, 235, 0.28), transparent 52%), radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.14), transparent 45%), linear-gradient(to right, rgba(51, 65, 85, 0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(51, 65, 85, 0.22) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 100% 100%, 48px 48px, 48px 48px',
          }}
        />

        <div className="relative mx-auto max-w-[1200px] px-4 pt-10 pb-14 sm:px-6 sm:pt-14 sm:pb-16">
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Left Command & Interactive Spec Column */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-between lg:col-span-5"
            >
              <div>
                <p className="text-xs font-medium tracking-wide text-sky-400">
                  AI Parametric CAD · Text to Editable 3D Solids · STEP &amp; STL
                </p>
                <h1 className="mt-3 font-display text-[clamp(2.1rem,3.8vw,3.35rem)] leading-[1.08] font-bold tracking-tight text-white">
                  Turn plain-English specs into{' '}
                  <span className="text-sky-400">editable 3D CAD</span>
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                  Describe mechanical parts with real dimensions, iterate via follow-up prompts
                  without breaking mating fits, and download STEP or STL ready for CAD or 3D
                  printing.
                </p>

                {/* Interactive Part Switcher */}
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Interactive 3D Case Switcher</span>
                    <button
                      type="button"
                      onClick={handleResetHeroPreset}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 transition-colors hover:text-white"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                  </div>
                  <div
                    className="grid grid-cols-3 gap-1.5 rounded-xl border border-slate-800 bg-[#0B1220] p-1"
                    role="tablist"
                    aria-label="Hero 3D model selector"
                  >
                    {HERO_PRESETS.map((preset, idx) => {
                      const active = idx === heroIdx;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => handleSelectHeroPreset(idx)}
                          className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                            active
                              ? 'bg-[#2563EB] text-white'
                              : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                          }`}
                        >
                          {preset.shortLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Animated Prompt & Instant Revision Console */}
                <div className="mt-4 rounded-xl border border-slate-800 bg-[#0B1220] p-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-medium text-slate-300">Active Natural-Language Spec</span>
                    <span className="font-mono text-sky-400">{activePreset.title}</span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.p
                      key={activePreset.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 text-xs leading-relaxed text-slate-200 sm:text-sm"
                    >
                      “{activePreset.prompt}”
                    </motion.p>
                  </AnimatePresence>

                  {/* One-click Live 3D Constraint Tweaks */}
                  <div className="mt-3.5 border-t border-slate-800 pt-3">
                    <div className="mb-2 text-[11px] font-medium text-slate-400">
                      Click to morph 3D geometry live:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activePreset.quickTweaks.map((tw) => {
                        const selected = activeTweakLabel === tw.label;
                        return (
                          <motion.button
                            key={tw.label}
                            type="button"
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleApplyHeroTweak(tw)}
                            className={`whitespace-nowrap rounded-md border px-2.5 py-1.5 font-mono text-[11px] font-medium transition-colors ${
                              selected
                                ? 'border-sky-400 bg-sky-500/20 text-sky-200'
                                : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-white'
                            }`}
                          >
                            {tw.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Direct Quick-Edit Prompt Bar */}
                  <form onSubmit={handleHeroQuickCommand} className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={heroQuickInput}
                      onChange={(e) => setHeroQuickInput(e.target.value)}
                      placeholder="Try: Set wall 4.5 mm or hole 3.8 mm"
                      aria-label="Quick parametric prompt command"
                      className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#070B14] px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      aria-label="Run quick CAD revision"
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
                    >
                      <Send className="h-3.5 w-3.5 text-sky-400" />
                      <span>Apply</span>
                    </button>
                  </form>

                  <p className="mt-2.5 font-mono text-[11px] text-sky-300/90">{heroStatusNote}</p>
                </div>
              </div>

              {/* Hero CTAs */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={scrollToWorkbench}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
                >
                  <span>Open Full CAD Studio</span>
                  <ArrowDown className="h-4 w-4" />
                </button>
                <a
                  href="/examples"
                  onClick={(e) => handleLink(e, '/examples')}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-700 bg-[#0B1220] px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:text-white"
                >
                  <span>Verified Cases</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>

            {/* Right Kinetic 3D CAD Stage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col justify-between gap-3 lg:col-span-7"
            >
              <HeroCadShowcase3D
                partKind={activePreset.id}
                params={heroParams}
                finish="aluminum"
                scanTriggerKey={scanTriggerKey}
              />

              {/* Live Dimensional Telemetry Bar below 3D Stage */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-800 bg-[#0B1220] px-3 py-2.5">
                  <div className="text-[11px] text-slate-400">Envelope</div>
                  <div className="mt-0.5 font-mono text-xs font-semibold tabular-nums text-white">
                    {heroParams.length} × {heroParams.width} × {heroParams.height} mm
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#0B1220] px-3 py-2.5">
                  <div className="text-[11px] text-slate-400">Wall / Plate</div>
                  <div className="mt-0.5 font-mono text-xs font-semibold tabular-nums text-white">
                    {heroParams.wallThickness.toFixed(1)} mm
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#0B1220] px-3 py-2.5">
                  <div className="text-[11px] text-slate-400">
                    {activePreset.id === 'phoneStand' ? 'Tilt Angle' : 'Primary Bore'}
                  </div>
                  <div className="mt-0.5 font-mono text-xs font-semibold tabular-nums text-sky-400">
                    {activePreset.id === 'phoneStand'
                      ? `${heroParams.angle}°`
                      : `${heroParams.holeDiameter.toFixed(1)} mm`}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#0B1220] px-3 py-2.5">
                  <div className="text-[11px] text-slate-400">Geometry Check</div>
                  <div
                    className={`mt-0.5 font-mono text-xs font-semibold ${
                      hasWarning ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {hasWarning ? 'Warning · Tight Fit' : 'Pass · Print Ready'}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Full Interactive CAD Workbench Section */}
      <section id="workbench" className="border-b border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-medium text-[#1D4ED8]">
                Full Parametric Workbench · Simulated Chat, Sliders, Checks &amp; Export
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Inspect every dimension, run fit checks, and export STEP or STL
              </h2>
            </div>
            <a
              href="/enclosure-generator"
              onClick={(e) => handleLink(e, '/enclosure-generator')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:underline"
            >
              <span>Open Enclosure Generator</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <InteractiveCadStudio initialPart="enclosure" allowPartSwitch onNavigate={onNavigate} />
        </div>
      </section>

      {/* Core 5-Step Workflow Strip */}
      <section className="border-b border-slate-200 bg-[#F8FAFC] py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Built around verifiable CAD engineering steps
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              Instead of guessing meshes, SolidCraft keeps every part anchored to explicit
              dimensions, clearance rules, and revision history.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {WORKFLOW_STEPS.map((step) => (
              <div
                key={step.index}
                className="rounded-xl border border-slate-200 bg-white p-5 transition-transform duration-150 hover:-translate-y-0.5"
              >
                <div className="font-mono text-xs font-semibold text-[#1D4ED8]">{step.index}</div>
                <h3 className="mt-2 font-display text-base font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verified Repository Cases with Interactive Revision Toggle */}
      <section className="border-b border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Reference Builds · Prompts, Dimensions &amp; Revision Logs
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Verified CAD examples from the repository
              </h2>
            </div>
            <a
              href="/examples"
              onClick={(e) => handleLink(e, '/examples')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:underline"
            >
              <span>Inspect all verified cases</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {VERIFIED_CASES.map((item) => {
              const verIdx = caseVersionState[item.id] ?? 1;
              const snap = item.versions[verIdx] || item.versions[0];
              return (
                <article
                  key={item.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-[#F8FAFC]"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden border-b border-slate-200 bg-slate-100">
                    <img
                      src={item.imagePath}
                      alt={item.imageAlt}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="text-xs font-medium text-slate-500">{item.provenance}</div>
                      <h3 className="mt-1.5 font-display text-lg font-bold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.summary}</p>

                      {/* Interactive v1.0 vs v1.1 Diff Toggle */}
                      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-slate-500">
                            Revision Snapshot
                          </span>
                          <div className="flex rounded bg-slate-100 p-0.5">
                            {item.versions.map((v, vIdx) => (
                              <button
                                key={v.version}
                                type="button"
                                onClick={() =>
                                  setCaseVersionState((prev) => ({ ...prev, [item.id]: vIdx }))
                                }
                                className={`rounded px-2 py-0.5 font-mono text-[11px] font-medium transition-colors ${
                                  verIdx === vIdx
                                    ? 'bg-white text-[#1D4ED8] shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                {v.version}
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-slate-700">{snap.promptOrChange}</p>
                        <div className="mt-2 font-mono text-[11px] tabular-nums text-slate-500">
                          {snap.params.length} × {snap.params.width} × {snap.params.height} mm ·
                          Wall {snap.params.wallThickness.toFixed(1)} mm
                          {snap.params.holeDiameter > 0
                            ? ` · Bore ${snap.params.holeDiameter.toFixed(1)} mm`
                            : ''}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs">
                      <span className="font-mono text-slate-600">{item.files.stepName}</span>
                      <a
                        href="/examples"
                        onClick={(e) => handleLink(e, '/examples')}
                        className="font-semibold text-[#1D4ED8] hover:underline"
                      >
                        Inspect 3D
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Capabilities Asymmetric Bento */}
      <section className="border-b border-slate-200 bg-[#F8FAFC] py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Control every dimension through prompts or sliders
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              SolidCraft pairs conversational geometry updates with deterministic parameter controls
              and clear tolerance checks.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1D4ED8]">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Parametric Constraint Preservation</span>
                </div>
                <h3 className="mt-2 font-display text-xl font-bold text-slate-900">
                  Revise one feature without scrambling the rest of your part
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Ask to open lid screw bores from 3.2 mm to 3.6 mm or raise backrest reach to
                  112 mm. Unrelated wall thicknesses, standoff coordinates, and outer envelopes stay
                  locked, and every revision is recorded in version history.
                </p>
              </div>
              <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
                <img
                  src={IMAGES.workshopHero}
                  alt="3D printed electronics housing beside digital calipers and circuit board on drafting desk"
                  referrerPolicy="no-referrer"
                  className="aspect-[16/9] w-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:col-span-5">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Printability &amp; Fit Verification</span>
                </div>
                <h3 className="mt-2 font-display text-lg font-bold text-slate-900">
                  Catch thin walls and tight clearances early
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Automated checks evaluate wall thickness against 0.4 mm nozzle perimeters, verify
                  lid slip-fit gaps (0.20–0.30 mm), and highlight missing specs before export.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Layers className="h-4 w-4 text-[#1D4ED8]" />
                  <span>Multi-Body Inspection</span>
                </div>
                <h3 className="mt-2 font-display text-lg font-bold text-slate-900">
                  Inspect bottom trays, lids, bosses, and hardware together
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Orbit, zoom, toggle CAD edge overlays, and use the Explode slider to verify
                  internal standoffs and alignment lips seat cleanly.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <FileCode2 className="h-4 w-4 text-slate-700" />
                  <span>STEP &amp; STL Delivery</span>
                </div>
                <h3 className="mt-2 font-display text-lg font-bold text-slate-900">
                  Hand off cleanly to slicers or desktop CAD
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Download STL meshes for immediate 3D printing or STEP B-Rep solids for Fusion 360,
                  Onshape, and FreeCAD. STEP carries solid geometry without native feature trees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Part Generators Overview */}
      <section className="border-b border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Part-specific CAD generators
              </h2>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">
                Start from an engineering template tailored to your hardware geometry and mounting
                requirements.
              </p>
            </div>
            <a
              href="/tools"
              onClick={(e) => handleLink(e, '/tools')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8] hover:underline"
            >
              <span>All CAD tools</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOL_PAGES.map((tool) => (
              <a
                key={tool.route}
                href={tool.route}
                onClick={(e) => handleLink(e, tool.route)}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 transition-colors hover:border-[#1D4ED8]/60 hover:bg-white"
              >
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    {tool.caseStatus} · {tool.targetTopic}
                  </div>
                  <h3 className="mt-1.5 font-display text-base font-bold text-slate-900 group-hover:text-[#1D4ED8]">
                    {tool.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{tool.summary}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs font-medium text-[#1D4ED8]">
                  <span>Open generator</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="bg-[#F8FAFC] py-16">
        <div className="mx-auto max-w-[900px] px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Frequently asked questions
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Practical answers about 3D print readiness, STEP compatibility, and parameter edits.
            </p>
          </div>
          <FaqList items={HOME_FAQS} />
        </div>
      </section>
    </div>
  );
};
