import * as THREE from 'three';
import { CadParams, MaterialFinish, PartKind } from '../types/cad';

const MM_TO_UNIT = 0.036; // 100mm -> 3.6 world units

export interface CadMaterialBundle {
  primary: THREE.MeshPhysicalMaterial;
  secondary: THREE.MeshPhysicalMaterial;
  metalSteel: THREE.MeshStandardMaterial;
  metalBrass: THREE.MeshStandardMaterial;
  pcbBoard: THREE.MeshStandardMaterial;
  elastomer: THREE.MeshStandardMaterial;
  edgeMat: THREE.LineBasicMaterial;
  dispose: () => void;
}

function createMicroGrainTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);
    const img = ctx.getImageData(0, 0, size, size);
    const data = img.data;
    // Deterministic fine FDM / bead-blast texture
    for (let y = 0; y < size; y++) {
      const layerWave = Math.sin(y * 1.4) * 10;
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const hash = ((x * 73856093) ^ (y * 19349663)) & 255;
        const grain = (hash % 24) - 12 + layerWave;
        const val = Math.max(85, Math.min(185, 132 + grain));
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  // Roughness/bump map remains linear (NoColorSpace)
  tex.needsUpdate = true;
  return tex;
}

export function createMaterialBundle(
  finish: MaterialFinish,
  maxAnisotropy: number,
): CadMaterialBundle {
  const grainTex = createMicroGrainTexture();
  grainTex.anisotropy = Math.min(8, maxAnisotropy);

  const presets: Record<
    MaterialFinish,
    {
      primaryColor: number;
      secondaryColor: number;
      roughness: number;
      metalness: number;
      clearcoat: number;
      edgeColor: number;
    }
  > = {
    charcoal: {
      primaryColor: 0x262b33,
      secondaryColor: 0x353c47,
      roughness: 0.62,
      metalness: 0.08,
      clearcoat: 0.08,
      edgeColor: 0x64748b,
    },
    slate: {
      primaryColor: 0x475569,
      secondaryColor: 0x64748b,
      roughness: 0.52,
      metalness: 0.12,
      clearcoat: 0.14,
      edgeColor: 0x1e293b,
    },
    aluminum: {
      primaryColor: 0xcbd5e1,
      secondaryColor: 0x94a3b8,
      roughness: 0.24,
      metalness: 0.88,
      clearcoat: 0.2,
      edgeColor: 0x334155,
    },
    resin: {
      primaryColor: 0x3b82f6,
      secondaryColor: 0x60a5fa,
      roughness: 0.2,
      metalness: 0.04,
      clearcoat: 0.72,
      edgeColor: 0x1e3a8a,
    },
  };

  const p = presets[finish];

  const primary = new THREE.MeshPhysicalMaterial({
    color: p.primaryColor,
    roughness: p.roughness,
    metalness: p.metalness,
    clearcoat: p.clearcoat,
    clearcoatRoughness: 0.25,
    bumpMap: grainTex,
    bumpScale: finish === 'aluminum' ? 0.004 : 0.012,
    roughnessMap: grainTex,
  });

  const secondary = new THREE.MeshPhysicalMaterial({
    color: p.secondaryColor,
    roughness: Math.min(0.9, p.roughness + 0.08),
    metalness: p.metalness,
    clearcoat: p.clearcoat * 0.8,
    bumpMap: grainTex,
    bumpScale: finish === 'aluminum' ? 0.004 : 0.01,
  });

  const metalSteel = new THREE.MeshStandardMaterial({
    color: 0xd8dee9,
    metalness: 0.92,
    roughness: 0.22,
  });

  const metalBrass = new THREE.MeshStandardMaterial({
    color: 0xd4a44a,
    metalness: 0.9,
    roughness: 0.26,
  });

  const pcbBoard = new THREE.MeshStandardMaterial({
    color: 0x166534,
    metalness: 0.12,
    roughness: 0.48,
  });

  const elastomer = new THREE.MeshStandardMaterial({
    color: 0x181b20,
    metalness: 0.0,
    roughness: 0.92,
  });

  const edgeMat = new THREE.LineBasicMaterial({
    color: p.edgeColor,
    transparent: true,
    opacity: 0.42,
  });

  return {
    primary,
    secondary,
    metalSteel,
    metalBrass,
    pcbBoard,
    elastomer,
    edgeMat,
    dispose: () => {
      grainTex.dispose();
      primary.dispose();
      secondary.dispose();
      metalSteel.dispose();
      metalBrass.dispose();
      pcbBoard.dispose();
      elastomer.dispose();
      edgeMat.dispose();
    },
  };
}

function makeRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  const radius = Math.min(r, w * 0.45, h * 0.45);
  const x = -w / 2;
  const y = -h / 2;

  shape.moveTo(x + radius, y);
  shape.lineTo(x + w - radius, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + radius);
  shape.lineTo(x + w, y + h - radius);
  shape.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  shape.lineTo(x + radius, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function makeRoundedRectPath(w: number, h: number, r: number): THREE.Path {
  const path = new THREE.Path();
  const radius = Math.max(0.01, Math.min(r, w * 0.45, h * 0.45));
  const x = -w / 2;
  const y = -h / 2;

  path.moveTo(x + radius, y);
  path.lineTo(x + w - radius, y);
  path.quadraticCurveTo(x + w, y, x + w, y + radius);
  path.lineTo(x + w, y + h - radius);
  path.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  path.lineTo(x + radius, y + h);
  path.quadraticCurveTo(x, y + h, x, y + h - radius);
  path.lineTo(x, y + radius);
  path.quadraticCurveTo(x, y, x + radius, y);
  return path;
}

function addPart(
  parent: THREE.Group,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  edgeMat: THREE.LineBasicMaterial,
  position: THREE.Vector3,
  explodeOffset: THREE.Vector3,
  showEdges: boolean,
  rotation?: THREE.Euler,
): THREE.Mesh {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  if (rotation) {
    mesh.rotation.copy(rotation);
  }
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.basePos = position.clone();
  mesh.userData.explodeOffset = explodeOffset.clone();

  const edges = new THREE.EdgesGeometry(geometry, 24);
  const line = new THREE.LineSegments(edges, edgeMat);
  line.name = 'cad-edge-overlay';
  line.visible = showEdges;
  mesh.add(line);

  parent.add(mesh);
  return mesh;
}

function addBolt(
  parent: THREE.Group,
  radius: number,
  length: number,
  mat: THREE.Material,
  edgeMat: THREE.LineBasicMaterial,
  pos: THREE.Vector3,
  explodeOffset: THREE.Vector3,
  showEdges: boolean,
) {
  const headRadius = radius * 1.55;
  const headHeight = radius * 0.9;
  const headGeo = new THREE.CylinderGeometry(headRadius, headRadius, headHeight, 16);
  addPart(
    parent,
    headGeo,
    mat,
    edgeMat,
    new THREE.Vector3(pos.x, pos.y + headHeight * 0.5, pos.z),
    explodeOffset,
    showEdges,
  );

  const shankGeo = new THREE.CylinderGeometry(radius * 0.82, radius * 0.82, length, 14);
  addPart(
    parent,
    shankGeo,
    mat,
    edgeMat,
    new THREE.Vector3(pos.x, pos.y - length * 0.5, pos.z),
    explodeOffset,
    showEdges,
  );
}

export function buildCadPartGroup(
  kind: PartKind,
  params: CadParams,
  materials: CadMaterialBundle,
  showEdges: boolean,
): THREE.Group {
  const root = new THREE.Group();
  root.name = `cad-part-${kind}`;

  const L = params.length * MM_TO_UNIT;
  const W = params.width * MM_TO_UNIT;
  const H = params.height * MM_TO_UNIT;
  const wall = params.wallThickness * MM_TO_UNIT;
  const r = params.cornerRadius * MM_TO_UNIT;
  const holeR = Math.max(0.03, (params.holeDiameter * 0.5) * MM_TO_UNIT);
  const gap = params.clearance * MM_TO_UNIT;

  if (kind === 'enclosure' || kind === 'box' || kind === 'raspberryPi') {
    const lidThick = Math.max(wall * 0.85, 2.2 * MM_TO_UNIT);
    const bodyHeight = Math.max(0.4, H - lidThick);
    const floorThick = Math.max(wall * 0.85, 2.2 * MM_TO_UNIT);

    // 1. Bottom base plate (grounded at y = 0)
    const baseShape = makeRoundedRectShape(L, W, r);
    const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
      depth: floorThick,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 2,
      curveSegments: 16,
    });
    baseGeo.rotateX(-Math.PI / 2);
    addPart(
      root,
      baseGeo,
      materials.primary,
      materials.edgeMat,
      new THREE.Vector3(0, 0.025, 0),
      new THREE.Vector3(0, 0, 0),
      showEdges,
    );

    // 2. Extruded perimeter walls
    const wallShape = makeRoundedRectShape(L, W, r);
    const innerL = Math.max(0.4, L - wall * 2);
    const innerW = Math.max(0.4, W - wall * 2);
    const innerR = Math.max(0.03, r - wall * 0.6);
    wallShape.holes.push(makeRoundedRectPath(innerL, innerW, innerR));

    const wallGeo = new THREE.ExtrudeGeometry(wallShape, {
      depth: Math.max(0.2, bodyHeight - floorThick),
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.018,
      bevelSegments: 2,
      curveSegments: 16,
    });
    wallGeo.rotateX(-Math.PI / 2);
    addPart(
      root,
      wallGeo,
      materials.primary,
      materials.edgeMat,
      new THREE.Vector3(0, floorThick, 0),
      new THREE.Vector3(0, 0.06, 0),
      showEdges,
    );

    // 3. Port bezel accent for Electronics Enclosure & Raspberry Pi
    if (kind === 'enclosure' || kind === 'raspberryPi') {
      const portWidth = Math.min(innerL * 0.35, 0.9);
      const portHeight = Math.min(bodyHeight * 0.38, 0.28);
      const portGeo = new THREE.BoxGeometry(portWidth, portHeight, wall * 1.15);
      addPart(
        root,
        portGeo,
        materials.elastomer,
        materials.edgeMat,
        new THREE.Vector3(0, floorThick + portHeight * 0.75, W * 0.5 - wall * 0.45),
        new THREE.Vector3(0, 0.08, 0.35),
        showEdges,
      );

      if (kind === 'raspberryPi') {
        // Side secondary HDMI/USB-C bezel
        const sidePortGeo = new THREE.BoxGeometry(wall * 1.15, portHeight * 0.85, portWidth * 0.85);
        addPart(
          root,
          sidePortGeo,
          materials.elastomer,
          materials.edgeMat,
          new THREE.Vector3(L * 0.5 - wall * 0.45, floorThick + portHeight * 0.72, 0),
          new THREE.Vector3(0.35, 0.08, 0),
          showEdges,
        );
      }
    }

    // 4. Corner standoffs + brass heat-set inserts (Enclosure & Raspberry Pi)
    const offsetX = innerL * 0.5 - Math.max(0.16, holeR * 1.8);
    const offsetZ = innerW * 0.5 - Math.max(0.16, holeR * 1.8);
    const corners: [number, number][] = [
      [-offsetX, -offsetZ],
      [offsetX, -offsetZ],
      [-offsetX, offsetZ],
      [offsetX, offsetZ],
    ];

    if (kind === 'enclosure' || kind === 'raspberryPi') {
      const bossH = Math.max(0.2, bodyHeight - floorThick - 0.04);
      const bossOuterR = Math.max(0.11, holeR * 1.85);
      const bossInnerR = Math.max(0.04, holeR * 0.78);
      const bossShape = new THREE.Shape();
      bossShape.absarc(0, 0, bossOuterR, 0, Math.PI * 2, false);
      const bossHole = new THREE.Path();
      bossHole.absarc(0, 0, bossInnerR, 0, Math.PI * 2, true);
      bossShape.holes.push(bossHole);

      const bossGeo = new THREE.ExtrudeGeometry(bossShape, {
        depth: bossH,
        bevelEnabled: false,
        curveSegments: 16,
      });
      bossGeo.rotateX(-Math.PI / 2);

      const insertRingGeo = new THREE.CylinderGeometry(
        bossInnerR * 1.15,
        bossInnerR * 1.15,
        0.12,
        14,
        1,
        true,
      );

      corners.forEach(([cx, cz]) => {
        addPart(
          root,
          bossGeo.clone(),
          materials.secondary,
          materials.edgeMat,
          new THREE.Vector3(cx, floorThick, cz),
          new THREE.Vector3(0, 0.24, 0),
          showEdges,
        );
        addPart(
          root,
          insertRingGeo.clone(),
          materials.metalBrass,
          materials.edgeMat,
          new THREE.Vector3(cx, floorThick + bossH - 0.06, cz),
          new THREE.Vector3(0, 0.55, 0),
          showEdges,
        );
      });
      bossGeo.dispose();
      insertRingGeo.dispose();

      // Reference PCB silhouette inside Raspberry Pi case
      if (kind === 'raspberryPi') {
        const pcbGeo = new THREE.BoxGeometry(innerL * 0.88, 0.06, innerW * 0.86);
        addPart(
          root,
          pcbGeo,
          materials.pcbBoard,
          materials.edgeMat,
          new THREE.Vector3(0, floorThick + bossH * 0.55, 0),
          new THREE.Vector3(0, 0.75, 0),
          showEdges,
        );
        const heatsinkGeo = new THREE.BoxGeometry(0.45, 0.14, 0.45);
        addPart(
          root,
          heatsinkGeo,
          materials.metalSteel,
          materials.edgeMat,
          new THREE.Vector3(-0.15, floorThick + bossH * 0.55 + 0.1, 0),
          new THREE.Vector3(0, 0.92, 0),
          showEdges,
        );
      }
    }

    // 5. Stepped alignment lip on lid underside
    const lipL = Math.max(0.3, innerL - gap * 2);
    const lipW = Math.max(0.3, innerW - gap * 2);
    const lipShape = makeRoundedRectShape(lipL, lipW, Math.max(0.02, innerR - gap));
    const lipInnerL = Math.max(0.2, lipL - wall * 1.3);
    const lipInnerW = Math.max(0.2, lipW - wall * 1.3);
    lipShape.holes.push(makeRoundedRectPath(lipInnerL, lipInnerW, 0.02));
    const lipGeo = new THREE.ExtrudeGeometry(lipShape, {
      depth: 0.12,
      bevelEnabled: false,
      curveSegments: 14,
    });
    lipGeo.rotateX(-Math.PI / 2);
    addPart(
      root,
      lipGeo,
      materials.secondary,
      materials.edgeMat,
      new THREE.Vector3(0, bodyHeight - 0.1, 0),
      new THREE.Vector3(0, 1.12, 0),
      showEdges,
    );

    // 6. Top lid plate (with screw holes or vent slots)
    const lidShape = makeRoundedRectShape(L, W, r);
    if (kind === 'enclosure' || kind === 'raspberryPi') {
      corners.forEach(([cx, cz]) => {
        const p = new THREE.Path();
        // Extrude rotated -PI/2 maps shape Y -> -world Z
        p.absarc(cx, -cz, holeR, 0, Math.PI * 2, true);
        lidShape.holes.push(p);
      });
    }
    if (kind === 'raspberryPi') {
      // Longitudinal cooling vent slots
      for (let i = -2; i <= 2; i++) {
        const slot = new THREE.Path();
        const sw = L * 0.42;
        const sh = 0.075;
        const sy = i * 0.19;
        slot.moveTo(-sw / 2, sy - sh / 2);
        slot.lineTo(sw / 2, sy - sh / 2);
        slot.lineTo(sw / 2, sy + sh / 2);
        slot.lineTo(-sw / 2, sy + sh / 2);
        slot.closePath();
        lidShape.holes.push(slot);
      }
    }

    const lidGeo = new THREE.ExtrudeGeometry(lidShape, {
      depth: lidThick,
      bevelEnabled: true,
      bevelThickness: 0.024,
      bevelSize: 0.024,
      bevelSegments: 2,
      curveSegments: 16,
    });
    lidGeo.rotateX(-Math.PI / 2);
    addPart(
      root,
      lidGeo,
      materials.secondary,
      materials.edgeMat,
      new THREE.Vector3(0, bodyHeight + 0.01, 0),
      new THREE.Vector3(0, 1.32, 0),
      showEdges,
    );

    // 7. Lid M3/M2.5 socket-head bolts
    if (kind === 'enclosure' || kind === 'raspberryPi') {
      corners.forEach(([cx, cz]) => {
        addBolt(
          root,
          holeR * 0.86,
          0.26,
          materials.metalSteel,
          materials.edgeMat,
          new THREE.Vector3(cx, bodyHeight + lidThick + 0.035, cz),
          new THREE.Vector3(0, 1.82, 0),
          showEdges,
        );
      });
    }
  } else if (kind === 'phoneStand') {
    const tiltRad = THREE.MathUtils.degToRad(params.angle || 64);
    const padThick = 0.04;
    const plate = Math.max(0.1, wall);

    // 1. Rubberized non-slip base foot pad (y = 0)
    const padShape = makeRoundedRectShape(L * 0.94, W * 0.94, Math.max(0.05, r * 0.8));
    const padGeo = new THREE.ExtrudeGeometry(padShape, {
      depth: padThick,
      bevelEnabled: false,
      curveSegments: 12,
    });
    padGeo.rotateX(-Math.PI / 2);
    addPart(
      root,
      padGeo,
      materials.elastomer,
      materials.edgeMat,
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -0.22, 0),
      showEdges,
    );

    // 2. Weighted Base Plate
    const baseShape = makeRoundedRectShape(L, W, r);
    const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
      depth: plate,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
      curveSegments: 14,
    });
    baseGeo.rotateX(-Math.PI / 2);
    addPart(
      root,
      baseGeo,
      materials.primary,
      materials.edgeMat,
      new THREE.Vector3(0, padThick, 0),
      new THREE.Vector3(0, 0, 0),
      showEdges,
    );

    // 3. Angled Backrest Plate with center cable slot
    const backLen = H;
    const backW = W * 0.88;
    const backShape = makeRoundedRectShape(backW, backLen, r);
    const slotW = Math.min(backW * 0.28, 0.52);
    const slotH = Math.min(backLen * 0.34, 0.95);
    const cableSlot = new THREE.Path();
    cableSlot.moveTo(-slotW / 2, -backLen * 0.42);
    cableSlot.lineTo(slotW / 2, -backLen * 0.42);
    cableSlot.lineTo(slotW / 2, -backLen * 0.42 + slotH);
    cableSlot.lineTo(-slotW / 2, -backLen * 0.42 + slotH);
    cableSlot.closePath();
    backShape.holes.push(cableSlot);

    const backGeo = new THREE.ExtrudeGeometry(backShape, {
      depth: plate,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
      curveSegments: 14,
    });
    backGeo.translate(0, backLen / 2, -plate / 2);
    const backRotation = new THREE.Euler(-(Math.PI / 2 - tiltRad), 0, 0);
    addPart(
      root,
      backGeo,
      materials.secondary,
      materials.edgeMat,
      new THREE.Vector3(0, padThick + plate * 0.85, -L * 0.12),
      new THREE.Vector3(0, 0.55, -0.45),
      showEdges,
      backRotation,
    );

    // 4. Front Retention Lip
    const lipH = 14 * MM_TO_UNIT;
    const lipGeo = new THREE.BoxGeometry(backW, lipH, plate);
    addPart(
      root,
      lipGeo,
      materials.primary,
      materials.edgeMat,
      new THREE.Vector3(0, padThick + plate + lipH * 0.5, L * 0.34),
      new THREE.Vector3(0, 0.28, 0.48),
      showEdges,
    );

    // 5. Twin Side Triangular Reinforcement Gussets
    const gussetShape = new THREE.Shape();
    const gRun = L * 0.45;
    const gRise = Math.min(H * 0.58, 2.2);
    gussetShape.moveTo(0, 0);
    gussetShape.lineTo(gRun, 0);
    gussetShape.lineTo(0, gRise);
    gussetShape.closePath();
    const gussetGeo = new THREE.ExtrudeGeometry(gussetShape, {
      depth: plate * 0.8,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 1,
    });
    gussetGeo.rotateY(Math.PI / 2);
    [-backW * 0.36, backW * 0.36].forEach((gx, idx) => {
      addPart(
        root,
        gussetGeo.clone(),
        materials.primary,
        materials.edgeMat,
        new THREE.Vector3(gx, padThick + plate, -L * 0.36),
        new THREE.Vector3(idx === 0 ? -0.45 : 0.45, 0.32, 0),
        showEdges,
      );
    });
    gussetGeo.dispose();
  } else if (kind === 'chassis') {
    const deckThick = Math.max(0.12, wall);
    // 1. Main Chassis Deck Plate with slotted mounting holes
    const deckShape = makeRoundedRectShape(L, W, r);
    for (let sx = -1; sx <= 1; sx++) {
      for (let sz = -1; sz <= 1; sz++) {
        if (sx === 0 && sz === 0) continue;
        const slot = new THREE.Path();
        const cx = sx * (L * 0.28);
        const cz = sz * (W * 0.22);
        const sw = 0.42;
        const sh = 0.11;
        slot.moveTo(cx - sw / 2, cz - sh / 2);
        slot.lineTo(cx + sw / 2, cz - sh / 2);
        slot.lineTo(cx + sw / 2, cz + sh / 2);
        slot.lineTo(cx - sw / 2, cz + sh / 2);
        slot.closePath();
        deckShape.holes.push(slot);
      }
    }
    const deckGeo = new THREE.ExtrudeGeometry(deckShape, {
      depth: deckThick,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
      curveSegments: 14,
    });
    deckGeo.rotateX(-Math.PI / 2);
    addPart(
      root,
      deckGeo,
      materials.primary,
      materials.edgeMat,
      new THREE.Vector3(0, 0.02, 0),
      new THREE.Vector3(0, 0, 0),
      showEdges,
    );

    // 2. Twin Upright Axle Support Towers with Shaft Bore
    const towerH = Math.max(0.65, H - deckThick);
    const towerW = Math.max(0.85, holeR * 4.5);
    const towerThick = Math.max(0.16, deckThick * 1.15);
    const boreY = towerH * 0.62;

    const towerShape = new THREE.Shape();
    towerShape.moveTo(-towerW / 2, 0);
    towerShape.lineTo(towerW / 2, 0);
    towerShape.lineTo(towerW * 0.36, towerH);
    towerShape.quadraticCurveTo(0, towerH + 0.12, -towerW * 0.36, towerH);
    towerShape.closePath();

    const borePath = new THREE.Path();
    borePath.absarc(0, boreY, holeR, 0, Math.PI * 2, true);
    towerShape.holes.push(borePath);

    const towerGeo = new THREE.ExtrudeGeometry(towerShape, {
      depth: towerThick,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 2,
      curveSegments: 16,
    });
    towerGeo.translate(0, 0, -towerThick / 2);

    const towerZ = W * 0.5 - towerThick * 0.85;
    const axleX = -L * 0.16;

    [-towerZ, towerZ].forEach((tz, idx) => {
      addPart(
        root,
        towerGeo.clone(),
        materials.secondary,
        materials.edgeMat,
        new THREE.Vector3(axleX, deckThick, tz),
        new THREE.Vector3(0, 0.45, idx === 0 ? -0.45 : 0.45),
        showEdges,
      );

      // Machined bearing sleeve ring
      const bushingGeo = new THREE.CylinderGeometry(
        holeR * 1.24,
        holeR * 1.24,
        towerThick * 1.28,
        20,
        1,
        true,
      );
      bushingGeo.rotateX(Math.PI / 2);
      addPart(
        root,
        bushingGeo,
        materials.metalBrass,
        materials.edgeMat,
        new THREE.Vector3(axleX, deckThick + boreY, tz),
        new THREE.Vector3(0, 0.45, idx === 0 ? -0.78 : 0.78),
        showEdges,
      );
    });
    towerGeo.dispose();

    // 3. Steel Drive Axle Shaft passing through both bores
    const shaftGeo = new THREE.CylinderGeometry(holeR * 0.86, holeR * 0.86, W * 1.22, 20);
    shaftGeo.rotateX(Math.PI / 2);
    addPart(
      root,
      shaftGeo,
      materials.metalSteel,
      materials.edgeMat,
      new THREE.Vector3(axleX, deckThick + boreY, 0),
      new THREE.Vector3(0, 1.15, 0),
      showEdges,
    );

    // 4. Front Sensor Mount Bar & Rear Caster Boss
    const sensorBarGeo = new THREE.BoxGeometry(0.24, 0.22, W * 0.58);
    addPart(
      root,
      sensorBarGeo,
      materials.secondary,
      materials.edgeMat,
      new THREE.Vector3(L * 0.39, deckThick + 0.11, 0),
      new THREE.Vector3(0.35, 0.28, 0),
      showEdges,
    );
    const casterGeo = new THREE.CylinderGeometry(0.22, 0.26, 0.18, 18);
    addPart(
      root,
      casterGeo,
      materials.elastomer,
      materials.edgeMat,
      new THREE.Vector3(-L * 0.4, -0.08, 0),
      new THREE.Vector3(-0.35, -0.22, 0),
      showEdges,
    );
  } else {
    // 'bracket' — Parametric L-Bracket with configurable angle, gussets & bolts
    const plate = Math.max(0.12, wall);
    const bendRad = THREE.MathUtils.degToRad(params.angle || 90);

    // 1. Horizontal Base Flange with bolt holes
    const baseShape = makeRoundedRectShape(L, W, r);
    const holeOffsets: [number, number][] = [
      [L * 0.22, -W * 0.25],
      [L * 0.22, W * 0.25],
    ];
    holeOffsets.forEach(([hx, hz]) => {
      const h = new THREE.Path();
      h.absarc(hx, -hz, holeR, 0, Math.PI * 2, true);
      baseShape.holes.push(h);
    });
    const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
      depth: plate,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.018,
      bevelSegments: 2,
      curveSegments: 14,
    });
    baseGeo.rotateX(-Math.PI / 2);
    addPart(
      root,
      baseGeo,
      materials.primary,
      materials.edgeMat,
      new THREE.Vector3(0, 0.018, 0),
      new THREE.Vector3(0, 0, 0),
      showEdges,
    );

    // 2. Vertical / Angled Flange with bolt holes
    const armShape = makeRoundedRectShape(W, H, r);
    const armHoleOffsets: [number, number][] = [
      [-W * 0.25, H * 0.18],
      [W * 0.25, H * 0.18],
    ];
    armHoleOffsets.forEach(([ax, ay]) => {
      const h = new THREE.Path();
      h.absarc(ax, ay, holeR, 0, Math.PI * 2, true);
      armShape.holes.push(h);
    });
    const armGeo = new THREE.ExtrudeGeometry(armShape, {
      depth: plate,
      bevelEnabled: true,
      bevelThickness: 0.018,
      bevelSize: 0.018,
      bevelSegments: 2,
      curveSegments: 14,
    });
    armGeo.translate(0, H / 2, -plate / 2);
    armGeo.rotateY(Math.PI / 2);
    const tiltDelta = Math.PI / 2 - bendRad;
    addPart(
      root,
      armGeo,
      materials.secondary,
      materials.edgeMat,
      new THREE.Vector3(-L * 0.5 + plate * 0.5, plate, 0),
      new THREE.Vector3(-0.4, 0.45, 0),
      showEdges,
      new THREE.Euler(0, 0, tiltDelta),
    );

    // 3. Twin Side Reinforcement Gussets
    const gussetShape = new THREE.Shape();
    const gx = L * 0.52;
    const gy = H * 0.58;
    gussetShape.moveTo(0, 0);
    gussetShape.lineTo(gx, 0);
    gussetShape.lineTo(Math.sin(tiltDelta) * gy, Math.cos(tiltDelta) * gy);
    gussetShape.closePath();
    const gussetGeo = new THREE.ExtrudeGeometry(gussetShape, {
      depth: plate * 0.72,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 1,
    });
    [-W * 0.42, W * 0.42 - plate * 0.72].forEach((gz, idx) => {
      addPart(
        root,
        gussetGeo.clone(),
        materials.primary,
        materials.edgeMat,
        new THREE.Vector3(-L * 0.5 + plate * 0.65, plate, gz),
        new THREE.Vector3(0, 0.25, idx === 0 ? -0.45 : 0.45),
        showEdges,
      );
    });
    gussetGeo.dispose();

    // 4. Steel Base Bolts
    holeOffsets.forEach(([hx, hz]) => {
      addBolt(
        root,
        holeR * 0.84,
        0.26,
        materials.metalSteel,
        materials.edgeMat,
        new THREE.Vector3(hx, plate + 0.04, hz),
        new THREE.Vector3(0, 0.85, 0),
        showEdges,
      );
    });
  }

  return root;
}

export function disposeObjectGroup(group: THREE.Object3D) {
  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh || (child as THREE.LineSegments).isLineSegments) {
      const geo = (child as THREE.Mesh).geometry;
      if (geo) geo.dispose();
    }
  });
}

export function generateSimulatedStepText(kind: PartKind, params: CadParams): string {
  const stamp = new Date().toISOString().slice(0, 19);
  return `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('SolidCraft Parametric CAD Exchange Body'),'2;1');
FILE_NAME('${kind}_${params.length}x${params.width}x${params.height}.step','${stamp}',('SolidCraft'),('SolidCraft Parametric Studio'),'SolidCraft B-Rep Kernel','1.0','');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 1 }'));
ENDSEC;
DATA;
/* Parametric Summary (mm):
 * Part Type      : ${kind}
 * Envelope       : ${params.length} x ${params.width} x ${params.height} mm
 * Wall Thickness : ${params.wallThickness.toFixed(2)} mm
 * Bore / Screw   : ${params.holeDiameter.toFixed(2)} mm
 * Fit Clearance  : ${params.clearance.toFixed(2)} mm
 * Note           : Neutral B-Rep solid exchange (native CAD feature history not carried by STEP).
 */
#10=APPLICATION_CONTEXT('configuration controlled 3d designs of mechanical parts and assemblies');
#20=SHAPE_DEFINITION_REPRESENTATION(#30,#40);
#30=PRODUCT_DEFINITION_SHAPE('','',#35);
#40=ADVANCED_BREP_SHAPE_REPRESENTATION('${kind}_solid',(#50),#60);
ENDSEC;
END-ISO-10303-21;`;
}

export function generateSimulatedStlText(kind: PartKind, params: CadParams): string {
  const lx = (params.length * 0.5).toFixed(2);
  const wz = (params.width * 0.5).toFixed(2);
  const hy = params.height.toFixed(2);
  return `solid solidcraft_${kind}_${params.length}x${params.width}x${params.height}mm
  ; Watertight millimeter mesh envelope (${params.length} x ${params.width} x ${params.height} mm, wall ${params.wallThickness.toFixed(1)} mm)
  facet normal 0 0 -1
    outer loop
      vertex -${lx} -${wz} 0.00
      vertex ${lx} -${wz} 0.00
      vertex ${lx} ${wz} 0.00
    endloop
  endfacet
  facet normal 0 0 1
    outer loop
      vertex -${lx} -${wz} ${hy}
      vertex ${lx} ${wz} ${hy}
      vertex -${lx} ${wz} ${hy}
    endloop
  endfacet
endsolid solidcraft_${kind}`;
}
