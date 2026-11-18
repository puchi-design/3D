import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Eye, EyeOff, Layers, RotateCcw } from 'lucide-react';
import { CadParams, CameraPreset, MaterialFinish, PartKind } from '../types/cad';
import {
  buildCadPartGroup,
  CadMaterialBundle,
  createMaterialBundle,
  disposeObjectGroup,
} from '../three/cadModels';
import { IMAGES } from '../data/cadCatalog';

interface CadViewport3DProps {
  partKind: PartKind;
  params: CadParams;
  className?: string;
  initialFinish?: MaterialFinish;
  compactTitle?: string;
}

const FINISH_OPTIONS: { id: MaterialFinish; label: string; swatch: string }[] = [
  { id: 'charcoal', label: 'PA12 Charcoal', swatch: '#262b33' },
  { id: 'slate', label: 'PETG Slate', swatch: '#475569' },
  { id: 'aluminum', label: '6061 Aluminum', swatch: '#cbd5e1' },
  { id: 'resin', label: 'Draft Resin', swatch: '#3b82f6' },
];

const CAMERA_PRESETS: { id: CameraPreset; label: string; pos: [number, number, number] }[] = [
  { id: 'iso', label: 'Iso', pos: [4.8, 3.6, 5.2] },
  { id: 'top', label: 'Top', pos: [0.01, 6.6, 0.01] },
  { id: 'front', label: 'Front', pos: [0, 1.8, 6.4] },
  { id: 'side', label: 'Side', pos: [6.4, 1.8, 0] },
];

function createRadialContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.06,
      size / 2,
      size / 2,
      size * 0.5,
    );
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.32)');
    grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.12)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const _scratchTargetPos = new THREE.Vector3();
const _scratchDelta = new THREE.Vector3();

export const CadViewport3D: React.FC<CadViewport3DProps> = ({
  partKind,
  params,
  className = '',
  initialFinish = 'charcoal',
  compactTitle,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [explodeRatio, setExplodeRatio] = useState(0);
  const [finish, setFinish] = useState<MaterialFinish>(initialFinish);
  const [showEdges, setShowEdges] = useState(true);
  const [activePreset, setActivePreset] = useState<CameraPreset>('iso');
  const [hudCollapsed, setHudCollapsed] = useState(false);
  const [webglError, setWebglError] = useState(false);

  // Refs bridging React UI state into stable WebGL loop
  const explodeTargetRef = useRef(0);
  const explodeCurrentRef = useRef(0);
  const partGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<CadMaterialBundle | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraGoalRef = useRef<THREE.Vector3 | null>(null);
  const requestRenderRef = useRef<() => void>(() => {});
  const isSoftwareGlRef = useRef(false);

  // Sync explode slider target
  useEffect(() => {
    explodeTargetRef.current = explodeRatio;
    requestRenderRef.current();
  }, [explodeRatio]);

  // Initialize Three.js scene once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();
    isSoftwareGlRef.current = isSoftwareGl;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 260);
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bgHex = 0xeff3f8;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.Fog(bgHex, 14, 34);
    sceneRef.current = scene;

    // Studio Environment reflections via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(4.8, 3.6, 5.2);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2.4;
    controls.maxDistance = 14.0;
    controls.maxPolarAngle = Math.PI * 0.485;
    controls.target.set(0, 0.55, 0);
    controls.update();
    controlsRef.current = controls;

    // 3-Point Studio Lighting (Warm key + Cool Hemisphere fill + Rim)
    const hemi = new THREE.HemisphereLight(0xdbeafe, 0x94a3b8, 0.68);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.9);
    keyLight.position.set(5.5, 8.5, 5.0);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 24;
    keyLight.shadow.camera.left = -5.5;
    keyLight.shadow.camera.right = 5.5;
    keyLight.shadow.camera.top = 5.5;
    keyLight.shadow.camera.bottom = -5.5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe0f2fe, 0.9);
    rimLight.position.set(-5.0, 4.0, -5.5);
    scene.add(rimLight);

    // Calibrated drafting stage & soft radial contact shadow
    const grid = new THREE.GridHelper(18, 24, 0xcbd5e1, 0xdbe3ee);
    grid.position.y = -0.01;
    const gridMat = grid.material as THREE.Material;
    gridMat.polygonOffset = true;
    gridMat.polygonOffsetFactor = 1;
    gridMat.polygonOffsetUnits = 1;
    scene.add(grid);

    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: createRadialContactShadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.72,
    });
    const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 8.5), shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.0;
    shadowPlane.renderOrder = 1;
    scene.add(shadowPlane);

    // Subtle ground receiver for directional shadow when GPU enabled
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.14 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0.002;
    ground.receiveShadow = true;
    scene.add(ground);

    // Initial materials & part
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const matBundle = createMaterialBundle(finish, maxAniso);
    materialsRef.current = matBundle;

    const initialGroup = buildCadPartGroup(partKind, params, matBundle, showEdges);
    partGroupRef.current = initialGroup;
    scene.add(initialGroup);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Coalesced on-demand render loop with software-GL fence pacing
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let disposed = false;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      if (disposed) return;
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        if (disposed) return;
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;
        renderDirty = false;

        let needsFollowUp = false;

        // Exponential damping for exploded-view subparts
        const explodeDiff = Math.abs(explodeTargetRef.current - explodeCurrentRef.current);
        if (explodeDiff > 0.002) {
          explodeCurrentRef.current = THREE.MathUtils.damp(
            explodeCurrentRef.current,
            explodeTargetRef.current,
            10,
            dt,
          );
          needsFollowUp = true;
        } else {
          explodeCurrentRef.current = explodeTargetRef.current;
        }

        if (partGroupRef.current) {
          const factor = explodeCurrentRef.current;
          partGroupRef.current.children.forEach((child) => {
            const base = child.userData.basePos as THREE.Vector3 | undefined;
            const offset = child.userData.explodeOffset as THREE.Vector3 | undefined;
            if (base && offset) {
              _scratchTargetPos.copy(base).addScaledVector(offset, factor);
              child.position.copy(_scratchTargetPos);
            }
          });
        }

        // Exponential damping for camera presets
        if (cameraGoalRef.current) {
          const dist = camera.position.distanceTo(cameraGoalRef.current);
          if (dist > 0.025) {
            camera.position.x = THREE.MathUtils.damp(
              camera.position.x,
              cameraGoalRef.current.x,
              8,
              dt,
            );
            camera.position.y = THREE.MathUtils.damp(
              camera.position.y,
              cameraGoalRef.current.y,
              8,
              dt,
            );
            camera.position.z = THREE.MathUtils.damp(
              camera.position.z,
              cameraGoalRef.current.z,
              8,
              dt,
            );
            needsFollowUp = true;
          } else {
            camera.position.copy(cameraGoalRef.current);
            cameraGoalRef.current = null;
          }
        }

        controls.update();
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty || needsFollowUp) {
            requestRender();
          }
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    requestRenderRef.current = requestRender;

    const handleControlStart = () => {
      cameraGoalRef.current = null;
    };
    const handleControlChange = () => {
      requestRender();
    };
    controls.addEventListener('start', handleControlStart);
    controls.addEventListener('change', handleControlChange);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const handleContextRestored = () => {
      setWebglError(false);
      requestRender();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(entry.contentRect.width, 280);
        const h = Math.max(entry.contentRect.height, 240);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        requestRender();
      }
    });
    resizeObserver.observe(container);

    requestRender();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', handleControlStart);
      controls.removeEventListener('change', handleControlChange);
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      if (partGroupRef.current) {
        disposeObjectGroup(partGroupRef.current);
      }
      materialsRef.current?.dispose();
      envTex.dispose();
      shadowPlaneMat.map?.dispose();
      shadowPlaneMat.dispose();
      shadowPlane.geometry.dispose();
      groundMat.dispose();
      ground.geometry.dispose();
      gridMat.dispose();
      grid.geometry.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild geometry when partKind, params, or finish changes
  useEffect(() => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    if (!scene || !renderer) return;

    if (partGroupRef.current) {
      scene.remove(partGroupRef.current);
      disposeObjectGroup(partGroupRef.current);
    }
    materialsRef.current?.dispose();

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const nextMaterials = createMaterialBundle(finish, maxAniso);
    materialsRef.current = nextMaterials;

    const nextGroup = buildCadPartGroup(partKind, params, nextMaterials, showEdges);
    // Apply current explode factor immediately so slider updates stay visually locked
    const factor = explodeCurrentRef.current;
    nextGroup.children.forEach((child) => {
      const base = child.userData.basePos as THREE.Vector3 | undefined;
      const offset = child.userData.explodeOffset as THREE.Vector3 | undefined;
      if (base && offset) {
        _scratchDelta.copy(base).addScaledVector(offset, factor);
        child.position.copy(_scratchDelta);
      }
    });

    partGroupRef.current = nextGroup;
    scene.add(nextGroup);
    requestRenderRef.current();
  }, [partKind, params, finish, showEdges]);

  const handleCameraPreset = (preset: CameraPreset) => {
    setActivePreset(preset);
    const found = CAMERA_PRESETS.find((c) => c.id === preset);
    if (!found || !controlsRef.current || !cameraRef.current) return;
    controlsRef.current.target.set(0, 0.55, 0);
    if (isSoftwareGlRef.current) {
      cameraRef.current.position.set(...found.pos);
      controlsRef.current.update();
      requestRenderRef.current();
    } else {
      cameraGoalRef.current = new THREE.Vector3(...found.pos);
      requestRenderRef.current();
    }
  };

  const handleResetView = () => {
    setExplodeRatio(0);
    handleCameraPreset('iso');
  };

  const fallbackImg =
    partKind === 'phoneStand'
      ? IMAGES.phoneStandCase
      : partKind === 'chassis'
        ? IMAGES.chassisCase
        : IMAGES.enclosureCase;

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl border border-slate-200 bg-[#EFF3F8] select-none ${className}`}
    >
      {/* Top-Left Minimal Part Dimension Readout */}
      <div className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-2 rounded-md border border-slate-200/90 bg-white/95 px-2.5 py-1.5 text-xs text-slate-700 shadow-xs">
        <span className="font-medium text-slate-900">{compactTitle || '3D Solid Preview'}</span>
        <span aria-hidden="true" className="text-slate-300">
          ·
        </span>
        <span className="font-mono tabular-nums text-slate-600">
          {params.length} × {params.width} × {params.height} mm
        </span>
      </div>

      {/* Dedicated WebGL Mount Container */}
      {webglError ? (
        <div className="flex h-full min-h-[340px] w-full flex-col items-center justify-center bg-slate-100 p-6 text-center">
          <img
            src={fallbackImg}
            alt="Static CAD prototype fallback preview"
            referrerPolicy="no-referrer"
            className="mb-3 h-52 w-auto rounded-lg border border-slate-200 object-cover"
          />
          <p className="text-sm font-medium text-slate-800">
            Interactive WebGL preview unavailable in this browser context
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Showing reference build photograph ({params.length} × {params.width} × {params.height} mm)
          </p>
        </div>
      ) : (
        <div
          ref={mountRef}
          className="h-full min-h-[360px] w-full cursor-grab active:cursor-grabbing"
          aria-label="Interactive 3D CAD Viewport. Drag to orbit, scroll to zoom."
        />
      )}

      {/* Collapsible Bottom Control Dock (solid/rgba only, zero backdrop-blur) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex flex-col items-center px-3">
        <button
          type="button"
          onClick={() => setHudCollapsed((prev) => !prev)}
          className="pointer-events-auto mb-1.5 inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white/95 px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          {hudCollapsed ? (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>Show 3D Controls</span>
            </>
          ) : (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              <span>Hide Controls</span>
            </>
          )}
        </button>

        {!hudCollapsed && (
          <div className="pointer-events-auto flex w-full max-w-[780px] flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-[#FFFFFF]/95 px-3 py-2 shadow-sm">
            {/* Exploded View Slider */}
            <div className="flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              <label
                htmlFor="explode-slider"
                className="whitespace-nowrap text-xs font-medium text-slate-700"
              >
                Explode
              </label>
              <input
                id="explode-slider"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={explodeRatio}
                onChange={(e) => setExplodeRatio(parseFloat(e.target.value))}
                className="cad-slider w-20 sm:w-24"
              />
              <span className="w-8 text-right font-mono text-[11px] tabular-nums text-slate-600">
                {Math.round(explodeRatio * 100)}%
              </span>
            </div>

            {/* Material Finish Swatches */}
            <div className="flex items-center gap-1.5" role="group" aria-label="Material finish">
              {FINISH_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  title={opt.label}
                  onClick={() => setFinish(opt.id)}
                  aria-label={`Material: ${opt.label}`}
                  aria-pressed={finish === opt.id}
                  className={`h-5 w-5 rounded border transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
                    finish === opt.id
                      ? 'scale-110 border-[#1D4ED8] ring-2 ring-[#1D4ED8]/30'
                      : 'border-slate-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: opt.swatch }}
                />
              ))}
            </div>

            {/* Camera Angle Presets + Edges Toggle */}
            <div className="flex items-center gap-1">
              {CAMERA_PRESETS.map((cam) => (
                <button
                  key={cam.id}
                  type="button"
                  onClick={() => handleCameraPreset(cam.id)}
                  className={`whitespace-nowrap rounded px-2 py-1 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
                    activePreset === cam.id
                      ? 'bg-[#1D4ED8] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowEdges((prev) => !prev)}
                aria-pressed={showEdges}
                className={`ml-1 whitespace-nowrap rounded px-2 py-1 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
                  showEdges
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Edges
              </button>
              <button
                type="button"
                onClick={handleResetView}
                title="Reset camera and assembly"
                aria-label="Reset camera and assembly"
                className="ml-0.5 rounded p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
