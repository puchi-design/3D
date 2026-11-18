import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Layers, Pause, Play, Sparkles } from 'lucide-react';
import { CadParams, MaterialFinish, PartKind } from '../types/cad';
import {
  buildCadPartGroup,
  CadMaterialBundle,
  createMaterialBundle,
  disposeObjectGroup,
} from '../three/cadModels';
import { IMAGES } from '../data/cadCatalog';

interface HeroCadShowcase3DProps {
  partKind: PartKind;
  params: CadParams;
  finish?: MaterialFinish;
  scanTriggerKey: number;
}

const _scratchPos = new THREE.Vector3();

function createDarkStageGlowTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.02,
      size / 2,
      size / 2,
      size * 0.5,
    );
    grad.addColorStop(0, 'rgba(37, 99, 235, 0.34)');
    grad.addColorStop(0.45, 'rgba(56, 189, 248, 0.12)');
    grad.addColorStop(1, 'rgba(7, 11, 20, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createCompassRingGroup(): THREE.Group {
  const ringGroup = new THREE.Group();
  const outerGeo = new THREE.RingGeometry(2.75, 2.78, 96);
  outerGeo.rotateX(-Math.PI / 2);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const outerRing = new THREE.Mesh(outerGeo, outerMat);
  outerRing.position.y = 0.012;
  ringGroup.add(outerRing);

  const innerGeo = new THREE.RingGeometry(2.2, 2.215, 72);
  innerGeo.rotateX(-Math.PI / 2);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x2563eb,
    transparent: true,
    opacity: 0.24,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const innerRing = new THREE.Mesh(innerGeo, innerMat);
  innerRing.position.y = 0.014;
  ringGroup.add(innerRing);

  // Tick marks around perimeter
  const tickPts: THREE.Vector3[] = [];
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const r0 = i % 3 === 0 ? 2.66 : 2.71;
    const r1 = 2.78;
    tickPts.push(new THREE.Vector3(Math.cos(a) * r0, 0.015, Math.sin(a) * r0));
    tickPts.push(new THREE.Vector3(Math.cos(a) * r1, 0.015, Math.sin(a) * r1));
  }
  const tickGeo = new THREE.BufferGeometry().setFromPoints(tickPts);
  const tickMat = new THREE.LineBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.45,
  });
  ringGroup.add(new THREE.LineSegments(tickGeo, tickMat));

  return ringGroup;
}

const HERO_FINISHES: { id: MaterialFinish; label: string; color: string }[] = [
  { id: 'aluminum', label: '6061 Aluminum', color: '#cbd5e1' },
  { id: 'charcoal', label: 'PA12 Charcoal', color: '#262b33' },
  { id: 'slate', label: 'PETG Slate', color: '#475569' },
  { id: 'resin', label: 'Draft Resin', color: '#3b82f6' },
];

export const HeroCadShowcase3D: React.FC<HeroCadShowcase3DProps> = ({
  partKind,
  params,
  finish = 'aluminum',
  scanTriggerKey,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeFinish, setActiveFinish] = useState<MaterialFinish>(finish);
  const [exploded, setExploded] = useState(false);
  const [autoSpin, setAutoSpin] = useState(true);
  const [wireframeHighlight, setWireframeHighlight] = useState(true);
  const [webglError, setWebglError] = useState(false);

  const explodedRef = useRef(false);
  const autoSpinRef = useRef(true);
  const wireframeRef = useRef(true);
  const explodeCurrentRef = useRef(0.75);
  const scanProgressRef = useRef(0); // 0..1 active scan sweep
  const isUserInteractingRef = useRef(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const partContainerRef = useRef<THREE.Group | null>(null);
  const partGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<CadMaterialBundle | null>(null);
  const scanRingRef = useRef<THREE.Mesh | null>(null);
  const compassRingRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    explodedRef.current = exploded;
  }, [exploded]);

  useEffect(() => {
    autoSpinRef.current = autoSpin;
  }, [autoSpin]);

  useEffect(() => {
    wireframeRef.current = wireframeHighlight;
    if (partGroupRef.current) {
      partGroupRef.current.traverse((obj) => {
        if (obj.name === 'cad-edge-overlay') {
          obj.visible = wireframeHighlight;
        }
      });
    }
  }, [wireframeHighlight]);

  // Trigger dramatic assemble-from-exploded + laser scan sweep on preset switch
  useEffect(() => {
    scanProgressRef.current = 0;
    explodeCurrentRef.current = 0.85;
  }, [scanTriggerKey]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas');
        const gl = probe.getContext('webgl2');
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
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 340);
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bgColor = 0x070b14;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.042);
    sceneRef.current = scene;

    // Studio IBL environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(4.9, 3.4, 5.4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 2.8;
    controls.maxDistance = 12;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.target.set(0, 0.6, 0);
    controls.update();

    controls.addEventListener('start', () => {
      isUserInteractingRef.current = true;
    });
    controls.addEventListener('end', () => {
      isUserInteractingRef.current = false;
    });

    // Dramatic dark studio 3-point + dual-color rim lighting
    const hemi = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.72);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.3);
    keyLight.position.set(5.5, 8.0, 5.2);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 24;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const cobaltRim = new THREE.DirectionalLight(0x38bdf8, 1.85);
    cobaltRim.position.set(-5.5, 4.2, -5.0);
    scene.add(cobaltRim);

    const amberAccent = new THREE.DirectionalLight(0xfbbf24, 0.75);
    amberAccent.position.set(4.5, 2.5, -5.5);
    scene.add(amberAccent);

    // Dark precision drafting floor & radial cobalt spotlight
    const grid = new THREE.GridHelper(22, 28, 0x1e3a8a, 0x111c33);
    grid.position.y = -0.01;
    const gridMat = grid.material as THREE.Material;
    gridMat.polygonOffset = true;
    gridMat.polygonOffsetFactor = 1;
    gridMat.polygonOffsetUnits = 1;
    scene.add(grid);

    const glowMat = new THREE.MeshBasicMaterial({
      map: createDarkStageGlowTexture(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const glowPlane = new THREE.Mesh(new THREE.PlaneGeometry(8.8, 8.8), glowMat);
    glowPlane.rotation.x = -Math.PI / 2;
    glowPlane.position.y = 0.004;
    scene.add(glowPlane);

    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    const shadowReceiver = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), shadowMat);
    shadowReceiver.rotation.x = -Math.PI / 2;
    shadowReceiver.position.y = 0.002;
    shadowReceiver.receiveShadow = true;
    scene.add(shadowReceiver);

    // Compass ring on floor
    const compassGroup = createCompassRingGroup();
    compassRingRef.current = compassGroup;
    scene.add(compassGroup);

    // Volumetric laser scan ring (sweeps vertically on transitions)
    const scanRingGeo = new THREE.RingGeometry(1.7, 2.25, 64);
    scanRingGeo.rotateX(-Math.PI / 2);
    const scanRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRingRef.current = scanRing;
    scene.add(scanRing);

    // Rotating turntable group holding the parametric CAD model
    const partContainer = new THREE.Group();
    partContainerRef.current = partContainer;
    scene.add(partContainer);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const initialMats = createMaterialBundle(activeFinish, maxAniso);
    initialMats.edgeMat.color.setHex(0x60a5fa);
    initialMats.edgeMat.opacity = 0.55;
    materialsRef.current = initialMats;

    const initialGroup = buildCadPartGroup(partKind, params, initialMats, wireframeRef.current);
    partGroupRef.current = initialGroup;
    partContainer.add(initialGroup);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const handleContextRestored = () => {
      setWebglError(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(entry.contentRect.width, 280);
        const h = Math.max(entry.contentRect.height, 280);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // Continuous kinetic render loop with software-WebGL fence pacing
    let disposed = false;
    let frameId = 0;
    let lastTime = performance.now();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    function tick(now: number) {
      if (disposed) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      // 1. Smooth turntable rotation
      if (!prefersReducedMotion && autoSpinRef.current && !isUserInteractingRef.current) {
        partContainer.rotation.y += dt * 0.28;
        if (compassRingRef.current) {
          compassRingRef.current.rotation.y -= dt * 0.12;
        }
      }

      // 2. Smooth exploded assembly settle (or manual toggle)
      const targetExplode = explodedRef.current ? 0.85 : 0;
      explodeCurrentRef.current = THREE.MathUtils.damp(
        explodeCurrentRef.current,
        targetExplode,
        4.5,
        dt,
      );

      if (partGroupRef.current) {
        const f = explodeCurrentRef.current;
        partGroupRef.current.children.forEach((child) => {
          const base = child.userData.basePos as THREE.Vector3 | undefined;
          const offset = child.userData.explodeOffset as THREE.Vector3 | undefined;
          if (base && offset) {
            _scratchPos.copy(base).addScaledVector(offset, f);
            child.position.copy(_scratchPos);
          }
        });
      }

      // 3. Volumetric laser scan ring sweep
      if (scanRingRef.current) {
        if (scanProgressRef.current < 1) {
          scanProgressRef.current = Math.min(1, scanProgressRef.current + dt * 0.72);
          const p = scanProgressRef.current;
          const heightSweep = Math.sin(p * Math.PI) * 2.4;
          scanRingRef.current.position.y = heightSweep;
          const mat = scanRingRef.current.material as THREE.MeshBasicMaterial;
          mat.opacity = Math.sin(p * Math.PI) * 0.65;
          const s = 0.85 + Math.sin(p * Math.PI) * 0.25;
          scanRingRef.current.scale.set(s, 1, s);
        } else {
          (scanRingRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(() => tick(performance.now()));
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (isSoftwareGl) {
      afterDraw(() => tick(performance.now()));
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      if (partGroupRef.current) {
        disposeObjectGroup(partGroupRef.current);
      }
      materialsRef.current?.dispose();
      envTex.dispose();
      glowMat.map?.dispose();
      glowMat.dispose();
      glowPlane.geometry.dispose();
      shadowMat.dispose();
      shadowReceiver.geometry.dispose();
      gridMat.dispose();
      grid.geometry.dispose();
      scanRingGeo.dispose();
      scanRingMat.dispose();
      compassGroup.traverse((c) => {
        if ((c as THREE.Mesh).geometry) (c as THREE.Mesh).geometry.dispose();
        const m = (c as THREE.Mesh).material;
        if (m && !Array.isArray(m)) m.dispose();
      });
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild geometry cleanly when preset part or finish changes
  useEffect(() => {
    const containerGroup = partContainerRef.current;
    const renderer = rendererRef.current;
    if (!containerGroup || !renderer) return;

    if (partGroupRef.current) {
      containerGroup.remove(partGroupRef.current);
      disposeObjectGroup(partGroupRef.current);
    }
    materialsRef.current?.dispose();

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const nextMats = createMaterialBundle(activeFinish, maxAniso);
    nextMats.edgeMat.color.setHex(0x60a5fa);
    nextMats.edgeMat.opacity = 0.55;
    materialsRef.current = nextMats;

    const nextGroup = buildCadPartGroup(partKind, params, nextMats, wireframeRef.current);
    partGroupRef.current = nextGroup;
    containerGroup.add(nextGroup);
  }, [partKind, params, activeFinish]);

  const fallbackImg =
    partKind === 'phoneStand'
      ? IMAGES.phoneStandCase
      : partKind === 'chassis'
        ? IMAGES.chassisCase
        : IMAGES.enclosureCase;

  return (
    <div className="relative h-full min-h-[400px] w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#070B14] select-none lg:min-h-[500px]">
      {/* Subtle Corner Technical Reticle Markings */}
      <div className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-2 rounded-md border border-slate-700/80 bg-[#0F172A]/90 px-3 py-1.5 text-xs text-slate-200">
        <span className="font-mono font-semibold text-sky-400">B-REP</span>
        <span aria-hidden="true" className="text-slate-600">
          ·
        </span>
        <span className="font-mono tabular-nums text-slate-300">
          {params.length} × {params.width} × {params.height} mm
        </span>
      </div>

      {/* WebGL Stage */}
      {webglError ? (
        <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center p-6 text-center">
          <img
            src={fallbackImg}
            alt="SolidCraft 3D CAD prototype preview"
            referrerPolicy="no-referrer"
            className="mb-3 h-56 w-auto rounded-lg border border-slate-700 object-cover"
          />
          <p className="text-xs text-slate-400">
            Reference CAD build ({params.length} × {params.width} × {params.height} mm)
          </p>
        </div>
      ) : (
        <div
          ref={mountRef}
          className="h-full min-h-[400px] w-full cursor-grab active:cursor-grabbing lg:min-h-[500px]"
          aria-label="Interactive 3D CAD Hero Stage. Drag to orbit, scroll to zoom."
        />
      )}

      {/* Compact Bottom Dock (solid rgba, zero backdrop-blur) */}
      <div className="pointer-events-auto absolute right-3 bottom-3 left-3 z-10 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#0B1220]/95 px-3 py-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5" role="group" aria-label="Hero material finish">
            {HERO_FINISHES.map((sw) => (
              <button
                key={sw.id}
                type="button"
                title={sw.label}
                aria-label={`Finish: ${sw.label}`}
                aria-pressed={activeFinish === sw.id}
                onClick={() => setActiveFinish(sw.id)}
                className={`h-4 w-4 rounded border transition-transform ${
                  activeFinish === sw.id
                    ? 'scale-110 border-sky-400 ring-2 ring-sky-400/35'
                    : 'border-slate-600 hover:scale-105'
                }`}
                style={{ backgroundColor: sw.color }}
              />
            ))}
          </div>
          <span className="hidden font-mono text-[11px] text-slate-400 sm:inline">
            · Drag to orbit
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setExploded((prev) => !prev)}
            aria-pressed={exploded}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
              exploded
                ? 'bg-[#2563EB] text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{exploded ? 'Assemble' : 'Explode'}</span>
          </button>
          <button
            type="button"
            onClick={() => setWireframeHighlight((prev) => !prev)}
            aria-pressed={wireframeHighlight}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
              wireframeHighlight
                ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>CAD Edges</span>
          </button>
          <button
            type="button"
            onClick={() => setAutoSpin((prev) => !prev)}
            aria-pressed={autoSpin}
            aria-label={autoSpin ? 'Pause turntable rotation' : 'Resume turntable rotation'}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:bg-slate-700"
          >
            {autoSpin ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            <span>{autoSpin ? 'Orbiting' : 'Paused'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
