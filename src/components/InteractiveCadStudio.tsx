import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileCode2,
  HelpCircle,
  History,
  MessageSquare,
  RotateCcw,
  Send,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  CadParams,
  ChatTurn,
  PartKind,
  VersionSnapshot,
} from '../types/cad';
import {
  evaluateGeometryChecks,
  getToolById,
  TOOL_PAGES,
  VERIFIED_CASES,
} from '../data/cadCatalog';
import {
  generateSimulatedStepText,
  generateSimulatedStlText,
} from '../three/cadModels';
import { CadViewport3D } from './CadViewport3D';

interface InteractiveCadStudioProps {
  initialPart?: PartKind;
  allowPartSwitch?: boolean;
  onNavigate?: (route: string) => void;
}

type StudioTab = 'prompt' | 'params' | 'checks';

export const InteractiveCadStudio: React.FC<InteractiveCadStudioProps> = ({
  initialPart = 'enclosure',
  allowPartSwitch = true,
  onNavigate,
}) => {
  const [partKind, setPartKind] = useState<PartKind>(initialPart);
  const toolConfig = useMemo(() => getToolById(partKind), [partKind]);
  const verifiedCase = useMemo(
    () => VERIFIED_CASES.find((c) => c.id === partKind),
    [partKind],
  );

  const [params, setParams] = useState<CadParams>(toolConfig.defaultParams);
  const [activeTab, setActiveTab] = useState<StudioTab>('prompt');
  const [followUpInput, setFollowUpInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([
    {
      role: 'user',
      message: toolConfig.promptExample,
    },
    {
      role: 'assistant',
      message: verifiedCase
        ? `Loaded verified baseline model (${toolConfig.defaultParams.length} × ${toolConfig.defaultParams.width} × ${toolConfig.defaultParams.height} mm). Select "Apply Follow-up Edit" or adjust parameters directly.`
        : `Loaded ${toolConfig.shortName} parametric template (${toolConfig.defaultParams.length} × ${toolConfig.defaultParams.width} × ${toolConfig.defaultParams.height} mm).`,
    },
  ]);

  const [versions, setVersions] = useState<VersionSnapshot[]>(() =>
    verifiedCase
      ? verifiedCase.versions
      : [
          {
            version: 'v1.0',
            label: 'Template Baseline',
            originNote: 'Simulated Parametric Preset',
            promptOrChange: toolConfig.promptExample,
            params: toolConfig.defaultParams,
          },
        ],
  );
  const [activeVersion, setActiveVersion] = useState<string>('v1.0');
  const [exportFormat, setExportFormat] = useState<'step' | 'stl' | null>(null);

  // Reset studio state cleanly when switching part kind or initialPart prop
  useEffect(() => {
    setPartKind(initialPart);
  }, [initialPart]);

  useEffect(() => {
    const nextTool = getToolById(partKind);
    const nextCase = VERIFIED_CASES.find((c) => c.id === partKind);
    setParams(nextTool.defaultParams);
    setChatHistory([
      { role: 'user', message: nextTool.promptExample },
      {
        role: 'assistant',
        message: nextCase
          ? `Loaded verified repository case (${nextTool.defaultParams.length} × ${nextTool.defaultParams.width} × ${nextTool.defaultParams.height} mm). Try applying the follow-up edit or tuning sliders.`
          : `Loaded ${nextTool.shortName} parametric preset (${nextTool.defaultParams.length} × ${nextTool.defaultParams.width} × ${nextTool.defaultParams.height} mm).`,
      },
    ]);
    setVersions(
      nextCase
        ? nextCase.versions
        : [
            {
              version: 'v1.0',
              label: 'Template Baseline',
              originNote: 'Simulated Parametric Preset',
              promptOrChange: nextTool.promptExample,
              params: nextTool.defaultParams,
            },
          ],
    );
    setActiveVersion('v1.0');
    setFollowUpInput('');
  }, [partKind]);

  const geometryChecks = useMemo(
    () => evaluateGeometryChecks(partKind, params),
    [partKind, params],
  );

  const handleSliderChange = (key: keyof CadParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const applyFollowUpPatch = (promptText: string, patch: Partial<CadParams>, summaryText: string) => {
    const nextParams: CadParams = { ...params, ...patch };
    setParams(nextParams);
    const nextVersionTag = `v1.${versions.length}`;
    const changedLabels = Object.keys(patch).map((k) => {
      const def = toolConfig.controls.find((c) => c.key === k);
      return def ? `${def.label}: ${patch[k as keyof CadParams]} ${def.unit}` : k;
    });

    setChatHistory((prev) => [
      ...prev,
      { role: 'user', message: promptText },
      { role: 'assistant', message: summaryText, changedFields: changedLabels },
    ]);

    const snapshot: VersionSnapshot = {
      version: nextVersionTag,
      label: 'Simulated Edit',
      originNote: 'Interactive Session Revision',
      promptOrChange: promptText,
      params: nextParams,
    };
    setVersions((prev) => [...prev, snapshot]);
    setActiveVersion(nextVersionTag);
  };

  const handleSimulatedChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = followUpInput.trim();
    if (!raw) return;

    // Parse simple numbers & keywords to provide a responsive simulated CAD revision
    const lower = raw.toLowerCase();
    const numMatch = raw.match(/(\d+(?:\.\d+)?)\s*(?:mm|deg|°)?/);
    const numVal = numMatch ? parseFloat(numMatch[1]) : null;
    const patch: Partial<CadParams> = {};

    if (numVal !== null) {
      if (lower.includes('hole') || lower.includes('bore') || lower.includes('screw')) {
        patch.holeDiameter = Math.min(16, Math.max(2, numVal));
      } else if (lower.includes('wall') || lower.includes('thick')) {
        patch.wallThickness = Math.min(8, Math.max(1.6, numVal));
      } else if (lower.includes('height') || lower.includes('tall')) {
        patch.height = Math.min(150, Math.max(16, numVal));
      } else if (lower.includes('length') || lower.includes('long')) {
        patch.length = Math.min(240, Math.max(30, numVal));
      } else if (lower.includes('width') || lower.includes('wide')) {
        patch.width = Math.min(180, Math.max(20, numVal));
      } else if (lower.includes('angle') || lower.includes('tilt')) {
        patch.angle = Math.min(120, Math.max(45, numVal));
      } else if (lower.includes('clearance') || lower.includes('gap')) {
        patch.clearance = Math.min(0.6, Math.max(0.1, numVal));
      } else if (lower.includes('radius') || lower.includes('fillet')) {
        patch.cornerRadius = Math.min(14, Math.max(1, numVal));
      }
    }

    if (Object.keys(patch).length === 0) {
      // Fallback to applying the curated example patch so the user sees live geometry change
      applyFollowUpPatch(
        raw,
        toolConfig.followUpExample.patch,
        `Simulated revision applied based on your prompt while keeping untouched envelope parameters locked. (${toolConfig.followUpExample.outcome})`,
      );
    } else {
      const keysText = Object.entries(patch)
        .map(([k, v]) => `${k} → ${v}`)
        .join(', ');
      applyFollowUpPatch(
        raw,
        patch,
        `Updated ${keysText} in the 3D solid while preserving all other dimensions and mating constraints.`,
      );
    }
    setFollowUpInput('');
  };

  const handleRestoreVersion = (snap: VersionSnapshot) => {
    setParams(snap.params);
    setActiveVersion(snap.version);
  };

  const handleDownloadSimulatedFile = (fmt: 'step' | 'stl') => {
    const content =
      fmt === 'step'
        ? generateSimulatedStepText(partKind, params)
        : generateSimulatedStlText(partKind, params);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${partKind}_${params.length}x${params.width}x${params.height}_sample.${fmt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stepPreview = useMemo(
    () => generateSimulatedStepText(partKind, params),
    [partKind, params],
  );
  const stlPreview = useMemo(
    () => generateSimulatedStlText(partKind, params),
    [partKind, params],
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6">
      {/* Optional Part Category Switcher */}
      {allowPartSwitch && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="CAD part templates">
            {TOOL_PAGES.map((tool) => {
              const selected = tool.id === partKind;
              return (
                <button
                  key={tool.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setPartKind(tool.id)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
                    selected
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {tool.shortName}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{toolConfig.caseStatus}</span>
            {onNavigate && (
              <>
                <span aria-hidden="true">·</span>
                <a
                  href={toolConfig.route}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(toolConfig.route);
                  }}
                  className="font-medium text-[#1D4ED8] hover:underline"
                >
                  Open Dedicated Tool Page
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Split Studio: Controls Left / 3D Viewport Right */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* Left Control Column */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 lg:col-span-5">
          <div>
            {/* Studio Sub-Navigation Tabs */}
            <div className="mb-4 grid grid-cols-3 gap-1 rounded-lg bg-slate-200/70 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('prompt')}
                className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                  activeTab === 'prompt'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Prompt</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('params')}
                className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                  activeTab === 'params'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Parameters</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('checks')}
                className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
                  activeTab === 'checks'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="h-3.5 w-3.5" />
                <span>Checks</span>
              </button>
            </div>

            {/* Tab 1: Prompt & Conversational Modification */}
            {activeTab === 'prompt' && (
              <div className="space-y-3">
                <div className="max-h-[260px] space-y-2.5 overflow-y-auto pr-1">
                  {chatHistory.map((turn, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg border p-3 text-xs leading-relaxed ${
                        turn.role === 'user'
                          ? 'border-slate-200 bg-white text-slate-800'
                          : 'border-blue-200/80 bg-blue-50/60 text-slate-700'
                      }`}
                    >
                      <div className="mb-1 text-[11px] font-semibold text-slate-500">
                        {turn.role === 'user' ? 'Requirement Prompt' : 'SolidCraft CAD Engine (Simulated)'}
                      </div>
                      <p>{turn.message}</p>
                      {turn.changedFields && turn.changedFields.length > 0 && (
                        <div className="mt-2 font-mono text-[11px] text-[#1D4ED8]">
                          Updated: {turn.changedFields.join(' · ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick Example Follow-up Action */}
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-500">
                      Example Follow-Up Revision
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        applyFollowUpPatch(
                          toolConfig.followUpExample.prompt,
                          toolConfig.followUpExample.patch,
                          toolConfig.followUpExample.outcome,
                        )
                      }
                      className="whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-slate-800"
                    >
                      Apply Edit
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-700">
                    “{toolConfig.followUpExample.prompt}”
                  </p>
                </div>

                {/* Simulated Follow-up Chat Input */}
                <form onSubmit={handleSimulatedChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    placeholder="e.g., Change hole to 3.6 mm or wall to 3.2 mm"
                    aria-label="Follow-up CAD modification prompt"
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#1D4ED8] focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Apply simulated prompt change"
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#1D4ED8] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#1E40AF]"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Revise</span>
                  </button>
                </form>
              </div>
            )}

            {/* Tab 2: Live Parametric Sliders */}
            {activeTab === 'params' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">
                    Direct Dimension Controls (mm / deg)
                  </span>
                  <button
                    type="button"
                    onClick={() => setParams(toolConfig.defaultParams)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                </div>
                <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                  {toolConfig.controls.map((ctrl) => {
                    const val = Number(params[ctrl.key]);
                    return (
                      <div
                        key={ctrl.key}
                        className="rounded-lg border border-slate-200 bg-white p-2.5"
                      >
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <label htmlFor={`param-${ctrl.key}`} className="font-medium text-slate-800">
                            {ctrl.label}
                          </label>
                          <span className="font-mono font-semibold tabular-nums text-[#1D4ED8]">
                            {ctrl.step < 1 ? val.toFixed(ctrl.step === 0.05 ? 2 : 1) : val}{' '}
                            {ctrl.unit}
                          </span>
                        </div>
                        <input
                          id={`param-${ctrl.key}`}
                          type="range"
                          min={ctrl.min}
                          max={ctrl.max}
                          step={ctrl.step}
                          value={val}
                          onChange={(e) => handleSliderChange(ctrl.key, parseFloat(e.target.value))}
                          className="cad-slider w-full"
                        />
                        <p className="mt-1 text-[11px] text-slate-500">{ctrl.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Geometry Checks & Version History */}
            {activeTab === 'checks' && (
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-xs font-semibold text-slate-800">
                    Dimension &amp; Fit Inspection
                  </h3>
                  <div className="space-y-2">
                    {geometryChecks.map((chk) => (
                      <div
                        key={chk.id}
                        className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5 text-xs"
                      >
                        {chk.status === 'pass' && (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        )}
                        {chk.status === 'warning' && (
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        )}
                        {chk.status === 'question' && (
                          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#1D4ED8]" />
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">
                            {chk.status === 'pass'
                              ? 'Pass'
                              : chk.status === 'warning'
                                ? 'Warning'
                                : 'Clarification'}{' '}
                            · {chk.label}
                          </div>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                            {chk.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-xs font-semibold text-slate-800">
                    Revision History ({versions.length})
                  </h3>
                  <div className="max-h-[145px] space-y-1.5 overflow-y-auto pr-1">
                    {versions.map((v) => {
                      const isCurrent = v.version === activeVersion;
                      return (
                        <button
                          key={v.version}
                          type="button"
                          onClick={() => handleRestoreVersion(v)}
                          className={`flex w-full items-start justify-between gap-2 rounded-lg border p-2 text-left text-xs transition-colors ${
                            isCurrent
                              ? 'border-[#1D4ED8] bg-blue-50/50'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900">
                              <span className="font-mono">{v.version}</span> · {v.label}
                            </div>
                            <div className="truncate text-[11px] text-slate-500">
                              {v.originNote}
                            </div>
                          </div>
                          <span className="shrink-0 font-mono text-[11px] text-[#1D4ED8]">
                            {isCurrent ? 'Active' : 'Restore'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Export Action Row */}
          <div className="mt-4 border-t border-slate-200 pt-3">
            <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>Live Geometry Summary</span>
              <span className="font-mono tabular-nums text-slate-700">
                Wall {params.wallThickness.toFixed(1)} mm · Bore {params.holeDiameter.toFixed(1)} mm
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExportFormat('step')}
                className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50"
              >
                <FileCode2 className="h-3.5 w-3.5 text-[#1D4ED8]" />
                <span>Export STEP</span>
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('stl')}
                className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#1D4ED8] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1E40AF]"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export STL</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 3D Interactive CAD Viewport */}
        <div className="lg:col-span-7">
          <CadViewport3D
            partKind={partKind}
            params={params}
            compactTitle={toolConfig.shortName}
            className="h-full min-h-[400px] lg:min-h-[500px]"
          />
        </div>
      </div>

      {/* Simulated Export STEP / STL Modal */}
      {exportFormat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-modal-title"
        >
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="export-modal-title" className="font-display text-lg font-bold text-slate-900">
                  {exportFormat === 'step'
                    ? 'STEP Solid Exchange (.step)'
                    : 'STL 3D Print Mesh (.stl)'}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Simulated CAD delivery preview · {params.length} × {params.width} × {params.height} mm
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExportFormat(null)}
                aria-label="Close export modal"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
              {exportFormat === 'step' ? (
                <p>
                  <strong>STEP (ISO 10303-21)</strong> exports exact analytical B-Rep solid faces
                  and cylindrical holes for Fusion 360, Onshape, SolidWorks, or FreeCAD. Note: STEP
                  does not retain proprietary native CAD timeline feature history.
                </p>
              ) : (
                <p>
                  <strong>STL</strong> outputs a watertight millimeter triangle mesh ready for
                  PrusaSlicer, Bambu Studio, OrcaSlicer, or Cura without unit scaling adjustments.
                </p>
              )}
            </div>

            <pre className="mt-4 max-h-44 overflow-auto rounded-lg border border-slate-200 bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-slate-200">
              {exportFormat === 'step' ? stepPreview : stlPreview}
            </pre>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setExportFormat(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDownloadSimulatedFile(exportFormat)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1E40AF]"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Sample .{exportFormat.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
