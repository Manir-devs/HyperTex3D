/**
 * HyperTex3D Ultimate — Hyperbuild 4D Voxel, Proportional Joint Rig, Internal Organ & .hb Studio
 * Standalone Zero-Backend Engine (WebGL 3D + Hyperbuild 4D Volumetric Organ & .hb Pipeline)
 */

export const HT3D_MAGIC = 0x32565448; // "HTV2"
export const HB_FORMAT_VERSION = 'HYPERBUILD_4D_HB_V1';
export const MAX_BACKUPS = 30;
export const NUM_OUTER_PARTS = 11;
export const NUM_ORGAN_PARTS = 9;
export const NUM_BODY_PARTS = 20; // 1..11 Outer Rig, 12..20 Volumetric 3D Internal Organs
export const NUM_JOINTS = 10;

export const STATE_STARTUP = 0;
export const STATE_EDITOR = 1;
export const STATE_IMPORT_2D = 2;
export const STATE_BACKUP_LIST = 3;

export const TOOL_BRUSH = 0;
export const TOOL_RECT_2D = 1;
export const TOOL_LINE = 2;
export const TOOL_SELECT = 3;
export const TOOL_PICKER = 4;
export const TOOL_ERASER = 5;
export const TOOL_BOX_3D = 6;
export const TOOL_SPHERE_3D = 7;

/**
 * Base 20-Part Anatomical Specification (calibrated for standard 16x16x16 Head Size).
 * When headSize changes (e.g. 8, 12, 16, 20, 24), all body parts, organs, and joints scale proportionally!
 * Every part explicitly records `followJoint` (which skeletal joint it follows in Hyperbuild 4D).
 */
export const BODY_PART_SPECS = [
  { id: 0, name: 'SHOW ALL PARTS', category: 'world', color: '#adb5bd', tissue: 'World', followJoint: 'root_origin' },
  // 1..11: Articulated Outer Body Parts
  { id: 1, name: '1. Head (Cranium)', category: 'outer', color: '#ebb491', tissue: 'Epidermis/Cranium', followJoint: 'neck_joint', baseBounds: [16, 50, 8, 16, 16, 16], bounds: [16, 50, 8, 16, 16, 16] },
  { id: 2, name: '2. Upper Torso (Thorax Shell)', category: 'outer', color: '#00b4c3', tissue: 'Thoracic Shell', followJoint: 'waist_joint', baseBounds: [16, 38, 12, 16, 12, 8], bounds: [16, 38, 12, 16, 12, 8] },
  { id: 3, name: '3. Lower Torso (Abdomen Shell)', category: 'outer', color: '#0096a5', tissue: 'Abdominal Shell', followJoint: 'waist_joint', baseBounds: [16, 26, 12, 16, 12, 8], bounds: [16, 26, 12, 16, 12, 8] },
  { id: 4, name: '4. L-Arm Upper', category: 'outer', color: '#00a5b4', tissue: 'Limb Muscle/Skin', followJoint: 'l_shoulder_joint', baseBounds: [8, 38, 12, 8, 12, 8], bounds: [8, 38, 12, 8, 12, 8] },
  { id: 5, name: '5. L-Arm Lower', category: 'outer', color: '#e1aa87', tissue: 'Forearm/Hand', followJoint: 'l_elbow_joint', baseBounds: [8, 26, 12, 8, 12, 8], bounds: [8, 26, 12, 8, 12, 8] },
  { id: 6, name: '6. R-Arm Upper', category: 'outer', color: '#00a5b4', tissue: 'Limb Muscle/Skin', followJoint: 'r_shoulder_joint', baseBounds: [32, 38, 12, 8, 12, 8], bounds: [32, 38, 12, 8, 12, 8] },
  { id: 7, name: '7. R-Arm Lower', category: 'outer', color: '#e1aa87', tissue: 'Forearm/Hand', followJoint: 'r_elbow_joint', baseBounds: [32, 26, 12, 8, 12, 8], bounds: [32, 26, 12, 8, 12, 8] },
  { id: 8, name: '8. L-Leg Upper', category: 'outer', color: '#3755af', tissue: 'Femoral Muscle', followJoint: 'l_hip_joint', baseBounds: [16, 14, 12, 8, 12, 8], bounds: [16, 14, 12, 8, 12, 8] },
  { id: 9, name: '9. L-Leg Lower', category: 'outer', color: '#2d4696', tissue: 'Tibial/Boot', followJoint: 'l_knee_joint', baseBounds: [16, 2, 12, 8, 12, 8], bounds: [16, 2, 12, 8, 12, 8] },
  { id: 10, name: '10. R-Leg Upper', category: 'outer', color: '#3755af', tissue: 'Femoral Muscle', followJoint: 'r_hip_joint', baseBounds: [24, 14, 12, 8, 12, 8], bounds: [24, 14, 12, 8, 12, 8] },
  { id: 11, name: '11. R-Leg Lower', category: 'outer', color: '#2d4696', tissue: 'Tibial/Boot', followJoint: 'r_knee_joint', baseBounds: [24, 2, 12, 8, 12, 8], bounds: [24, 2, 12, 8, 12, 8] },
  // 12..20: Volumetric 3D Internal Organs (Inside the Character, following their parent cavity's joint!)
  { id: 12, name: '12. Brain & Neural Stem [ORGAN]', category: 'organ', color: '#f06595', tissue: 'Neural/Cerebral', parentPart: 1, followJoint: 'neck_joint', damageMult: 3.5, baseBounds: [18, 52, 11, 12, 11, 10], bounds: [18, 52, 11, 12, 11, 10] },
  { id: 13, name: '13. Optic & Sensory Bulbs [ORGAN]', category: 'organ', color: '#4dabf7', tissue: 'Sensory/Optical', parentPart: 1, followJoint: 'neck_joint', damageMult: 2.2, baseBounds: [18, 55, 18, 12, 4, 5], bounds: [18, 55, 18, 12, 4, 5] },
  { id: 14, name: '14. Ribcage & Spine [SKELETON]', category: 'organ', color: '#f1f3f5', tissue: 'Calcified Bone', parentPart: 2, followJoint: 'waist_joint', damageMult: 1.4, baseBounds: [17, 27, 13, 14, 23, 6], bounds: [17, 27, 13, 14, 23, 6] },
  { id: 15, name: '15. Heart (4D Ventricle) [ORGAN]', category: 'organ', color: '#e03131', tissue: 'Cardiac Myocardium', parentPart: 2, followJoint: 'waist_joint', damageMult: 4.0, baseBounds: [22, 41, 15, 5, 6, 4], bounds: [22, 41, 15, 5, 6, 4] },
  { id: 16, name: '16. Lungs (L & R Lobes) [ORGAN]', category: 'organ', color: '#ff8787', tissue: 'Pulmonary Alveoli', parentPart: 2, followJoint: 'waist_joint', damageMult: 2.5, baseBounds: [18, 39, 14, 12, 9, 5], bounds: [18, 39, 14, 12, 9, 5] },
  { id: 17, name: '17. Stomach & Esophagus [ORGAN]', category: 'organ', color: '#f783ac', tissue: 'Gastric Viscera', parentPart: 3, followJoint: 'waist_joint', damageMult: 1.8, baseBounds: [23, 33, 14, 6, 6, 5], bounds: [23, 33, 14, 6, 6, 5] },
  { id: 18, name: '18. Liver & Kidneys [ORGAN]', category: 'organ', color: '#9c36b5', tissue: 'Hepatic/Renal', parentPart: 3, followJoint: 'waist_joint', damageMult: 2.0, baseBounds: [18, 32, 14, 10, 6, 5], bounds: [18, 32, 14, 10, 6, 5] },
  { id: 19, name: '19. Coiled Intestines [ORGAN]', category: 'organ', color: '#ffa94d', tissue: 'Enteric Tract', parentPart: 3, followJoint: 'waist_joint', damageMult: 1.6, baseBounds: [18, 27, 14, 12, 6, 5], bounds: [18, 27, 14, 12, 6, 5] },
  { id: 20, name: '20. 4D Hyper-Gland Core [4D ORGAN]', category: 'organ', color: '#00f5d4', tissue: '4D Tesseract Nexus', parentPart: 2, followJoint: 'waist_joint', damageMult: 5.0, baseBounds: [22, 37, 15, 4, 4, 4], bounds: [22, 37, 15, 4, 4, 4] },
];

export const BASE_CHAR_JOINTS = [
  { id: 'neck_joint', name: '1. Neck Joint', basePos: [24.0, 50.0, 16.0], pos: [24.0, 50.0, 16.0], parentPart: 2, childPart: 1, parentAnchor: [0, 12, 0], childAnchor: [0, 0, 0] },
  { id: 'waist_joint', name: '2. Waist Joint', basePos: [24.0, 38.0, 16.0], pos: [24.0, 38.0, 16.0], parentPart: 2, childPart: 3, parentAnchor: [0, 0, 0], childAnchor: [0, 12, 0] },
  { id: 'l_shoulder_joint', name: '3. L-Shoulder Joint', basePos: [16.0, 48.0, 16.0], pos: [16.0, 48.0, 16.0], parentPart: 2, childPart: 4, parentAnchor: [-8, 10, 0], childAnchor: [4, 11, 0] },
  { id: 'l_elbow_joint', name: '4. L-Elbow Joint', basePos: [12.0, 38.0, 16.0], pos: [12.0, 38.0, 16.0], parentPart: 4, childPart: 5, parentAnchor: [0, 0, 0], childAnchor: [0, 12, 0] },
  { id: 'r_shoulder_joint', name: '5. R-Shoulder Joint', basePos: [32.0, 48.0, 16.0], pos: [32.0, 48.0, 16.0], parentPart: 2, childPart: 6, parentAnchor: [8, 10, 0], childAnchor: [-4, 11, 0] },
  { id: 'r_elbow_joint', name: '6. R-Elbow Joint', basePos: [36.0, 38.0, 16.0], pos: [36.0, 38.0, 16.0], parentPart: 6, childPart: 7, parentAnchor: [0, 0, 0], childAnchor: [0, 12, 0] },
  { id: 'l_hip_joint', name: '7. L-Hip Joint', basePos: [20.0, 26.0, 16.0], pos: [20.0, 26.0, 16.0], parentPart: 3, childPart: 8, parentAnchor: [-4, 0, 0], childAnchor: [0, 12, 0] },
  { id: 'l_knee_joint', name: '8. L-Knee Joint', basePos: [20.0, 14.0, 16.0], pos: [20.0, 14.0, 16.0], parentPart: 8, childPart: 9, parentAnchor: [0, 0, 0], childAnchor: [0, 12, 0] },
  { id: 'r_hip_joint', name: '9. R-Hip Joint', basePos: [28.0, 26.0, 16.0], pos: [28.0, 26.0, 16.0], parentPart: 3, childPart: 10, parentAnchor: [4, 0, 0], childAnchor: [0, 12, 0] },
  { id: 'r_knee_joint', name: '10. R-Knee Joint', basePos: [28.0, 14.0, 16.0], pos: [28.0, 14.0, 16.0], parentPart: 10, childPart: 11, parentAnchor: [0, 0, 0], childAnchor: [0, 12, 0] },
];

export const CHAR_JOINTS = BASE_CHAR_JOINTS;

// ==================== ENGINE STATE ====================
export const engine = {
  appState: STATE_STARTUP,
  prevStateBeforeBackup: STATE_STARTUP,
  gridX: 32,
  gridY: 32,
  gridZ: 32,
  headSize: 16, // Default 16x16x16 head; body, limbs, organs & joints scale proportionally!
  totalVoxels: 0,
  activeVoxelCount: 0,

  // Flat Typed Arrays for ultra-fast memory & zero GC
  active: null, // Uint8Array (0 or 1)
  mask: null,   // Uint8Array (bitmask 1..63)
  partId: null, // Uint8Array (0..20)
  color: null,  // Uint8Array (length * 4: R, G, B, A)

  isCharacterMode: false,
  activePartFilter: 0, // 0 = show all, 1..20 = solo specific part
  paintTargetPart: 0,  // 0 = auto, 1..20 = force paint into this part/organ
  partTabFilter: 'all', // 'all' | 'outer' | 'organs'
  partHidden: new Uint8Array(NUM_BODY_PARTS + 1),

  showJointsOverlay: true,
  organPulseAnim: true,
  smoothShading: true,
  showWireframe: true,
  xrayOuterShell: false,
  cutawayMode: 0, // 0 = Off, 1 = Front Cutaway, 2 = Sagittal Cutaway
  mirrorX: false,

  isMouseLocked: false,
  moveSpeed: 1.4,
  cameraPos: [24.0, 38.0, 68.0],
  cameraAngle: [-Math.PI / 2, -0.06],

  currentTool: TOOL_BRUSH,
  brushSize: 1,
  selColorIdx: 3,
  currentAlpha: 255,
  pickerHue: 190.0,
  pickerSV: [1.0, 1.0],

  hotbar: [
    [0, 0, 0, 0],         // 0: TOOL
    [0, 0, 0, 0],         // 1: PLANE
    [0, 0, 0, 0],         // 2: AIR / INV CAVITY
    [0, 210, 255, 255],   // 3: CUSTOM PALETTE
    [240, 101, 149, 255], // 4: Neural Pink (Brain)
    [224, 49, 49, 255],   // 5: Arterial Red (Heart)
    [0, 245, 212, 255],   // 6: 4D Hyper-Cyan (4D Core)
    [255, 190, 11, 255],  // 7: Solar Gold
    [156, 54, 181, 255],  // 8: Hepatic Violet (Liver)
    [248, 249, 250, 255], // 9: Bone Ivory (Ribcage)
  ],

  hpState: 0, // 0=3D, 1=Y-SLICE, 2=X-SLICE, 3=Z-SLICE
  hpPos: 0,
  sliceCullAbove: true,

  // Selection & Clipboard
  selStart: [0, 0, 0],
  selEnd: [0, 0, 0],
  clipboard: [],
  clipSize: [0, 0, 0],
  isPasting: false,
  pastePos: [0, 0, 0],

  // Undo / Redo ring buffer
  undoStack: [],
  redoStack: [],

  // Export Mode: default to '.hb' Hyperbuild 4D structure format
  exportFormat: 'hb-structure', // 'hb-structure' | 'hyperbuild-volumetric' | 'anatomical-20parts' | 'raw-z-strip'
  meshDirty: true,
};

// ==================== PROPORTIONAL HEAD-TO-BODY SCALING HELPERS ====================
/**
 * Computes proportional character body dimensions from `headSize` (default 16 -> 16x16x16).
 * If head is HxHxH:
 * - Head: [H, H, H]
 * - Upper Torso: [H, 0.75*H, 0.5*H] (16x12x8 at H=16)
 * - Lower Torso: [H, 0.75*H, 0.5*H] (16x12x8 at H=16)
 * - Total Torso: [H, 1.5*H, 0.5*H]  (16x24x8 at H=16)
 * - Each Limb Segment (Upper/Lower Arm & Leg): [0.5*H, 0.75*H, 0.5*H] (8x12x8 at H=16)
 * - Workspace Grid: [3*H, 4.5*H, 2*H] (48x72x32 at H=16)
 */
export function computeBodyProportionsFromHead(headSize = 16) {
  const H = Math.max(8, Math.min(28, Math.round(Number(headSize) || 16)));
  const s = H / 16.0;
  const sc = (v) => Math.max(1, Math.round(v * s));
  return {
    headSize: [H, H, H],
    scaleFactor: Number(s.toFixed(4)),
    workspaceDimensions: [sc(48), sc(72), sc(32)],
    head: [H, H, H],
    upperTorso: [sc(16), sc(12), sc(8)],
    lowerTorso: [sc(16), sc(12), sc(8)],
    fullTorso: [sc(16), sc(24), sc(8)],
    armUpper: [sc(8), sc(12), sc(8)],
    armLower: [sc(8), sc(12), sc(8)],
    legUpper: [sc(8), sc(12), sc(8)],
    legLower: [sc(8), sc(12), sc(8)],
  };
}

/**
 * Updates `BODY_PART_SPECS[i].bounds` and `CHAR_JOINTS[j].pos` proportionally for the active `headSize`.
 */
export function syncProportionalRigToHeadSize(headSize = 16) {
  const H = Math.max(8, Math.min(28, Math.round(Number(headSize) || 16)));
  engine.headSize = H;
  const s = H / 16.0;
  const sc = (v) => Math.max(1, Math.round(v * s));
  const scCoord = (v) => Math.round(v * s);

  BODY_PART_SPECS[1].name = `1. Head (${H}x${H}x${H} Cranium)`;
  for (let p = 1; p <= NUM_BODY_PARTS; p++) {
    const spec = BODY_PART_SPECS[p];
    if (spec && spec.baseBounds) {
      const [bx, by, bz, bw, bh, bd] = spec.baseBounds;
      spec.bounds = [scCoord(bx), scCoord(by), scCoord(bz), sc(bw), sc(bh), sc(bd)];
    }
  }

  for (const j of CHAR_JOINTS) {
    j.pos = [
      Number((j.basePos[0] * s).toFixed(2)),
      Number((j.basePos[1] * s).toFixed(2)),
      Number((j.basePos[2] * s).toFixed(2)),
    ];
    j.scaledParentAnchor = j.parentAnchor.map((a) => Number((a * s).toFixed(2)));
    j.scaledChildAnchor = j.childAnchor.map((a) => Number((a * s).toFixed(2)));
  }
}

export function getJointForPart(partId) {
  const spec = BODY_PART_SPECS[partId] || BODY_PART_SPECS[0];
  const jointId = spec.followJoint || 'waist_joint';
  const jointObj = CHAR_JOINTS.find((j) => j.id === jointId) || null;
  return {
    jointId,
    jointName: jointObj ? jointObj.name : 'Root Origin',
    jointPos: jointObj ? [...jointObj.pos] : [engine.gridX / 2, engine.gridY / 2, engine.gridZ / 2],
  };
}

// ==================== PURE UTILITY & ENGINE FUNCTIONS ====================
export function getIndex(x, y, z, gx = engine.gridX, gy = engine.gridY) {
  return z * gx * gy + y * gx + x;
}

export function inBounds(x, y, z, gx = engine.gridX, gy = engine.gridY, gz = engine.gridZ) {
  return x >= 0 && x < gx && y >= 0 && y < gy && z >= 0 && z < gz;
}

export function hexToRgba(hex) {
  const clean = String(hex || '').replace('#', '').trim();
  let r = 0, g = 210, b = 255, a = 255;
  if (clean.length >= 6) {
    r = parseInt(clean.slice(0, 2), 16) || 0;
    g = parseInt(clean.slice(2, 4), 16) || 0;
    b = parseInt(clean.slice(4, 6), 16) || 0;
  }
  if (clean.length >= 8) {
    a = parseInt(clean.slice(6, 8), 16);
    if (Number.isNaN(a)) a = 255;
  }
  return [r, g, b, a];
}

export function rgbaToHex(r, g, b, a = 255) {
  const toH = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0').toUpperCase();
  return `#${toH(r)}${toH(g)}${toH(b)}${toH(a)}`;
}

export function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

export function rgbToHsv(r, g, b) {
  const rf = r / 255, gf = g / 255, bf = b / 255;
  const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (max !== min) {
    if (max === rf) h = ((gf - bf) / d + (gf < bf ? 6 : 0)) * 60;
    else if (max === gf) h = ((bf - rf) / d + 2) * 60;
    else h = ((rf - gf) / d + 4) * 60;
  }
  return [h, s, v];
}

export function isPartVisible(partId) {
  if (!engine.isCharacterMode) return true;
  if (partId >= 1 && partId <= NUM_BODY_PARTS) {
    if (engine.partHidden[partId]) return false;
  }
  if (engine.activePartFilter !== 0 && partId !== engine.activePartFilter) {
    return false;
  }
  return true;
}

export function isVoxelCutawayHidden(x, y, z, partId) {
  if (engine.hpState !== 0 && engine.sliceCullAbove) {
    if (engine.hpState === 1 && y > engine.hpPos) return true;
    if (engine.hpState === 2 && x > engine.hpPos) return true;
    if (engine.hpState === 3 && z > engine.hpPos) return true;
  }
  if (engine.isCharacterMode && engine.cutawayMode !== 0 && partId >= 1 && partId <= 3) {
    const midZ = Math.floor(engine.gridZ / 2);
    const midX = Math.floor(engine.gridX / 2);
    if (engine.cutawayMode === 1 && z >= midZ) return true;
    if (engine.cutawayMode === 2 && x < midX) return true;
  }
  return false;
}

export function initEngine(sx, sy, sz) {
  const gx = Math.max(4, Math.min(128, Math.floor(sx || 32)));
  const gy = Math.max(4, Math.min(128, Math.floor(sy || 32)));
  const gz = Math.max(4, Math.min(128, Math.floor(sz || 32)));

  engine.gridX = gx;
  engine.gridY = gy;
  engine.gridZ = gz;

  const total = gx * gy * gz;
  engine.totalVoxels = total;
  engine.active = new Uint8Array(total);
  engine.mask = new Uint8Array(total);
  engine.partId = new Uint8Array(total);
  engine.color = new Uint8Array(total * 4);
  engine.activeVoxelCount = 0;

  engine.isCharacterMode = false;
  engine.activePartFilter = 0;
  engine.paintTargetPart = 0;
  engine.partHidden.fill(0);
  engine.undoStack = [];
  engine.redoStack = [];
  engine.meshDirty = true;
}

export function setVoxelRaw(x, y, z, partId, r, g, b, a = 255, checkerAmp = 0) {
  if (!inBounds(x, y, z)) return;
  const idx = getIndex(x, y, z);
  engine.active[idx] = 1;
  engine.partId[idx] = partId;
  const chk = checkerAmp ? (((x + y + z) % 2 === 0) ? checkerAmp : -checkerAmp) : 0;
  const c4 = idx * 4;
  engine.color[c4] = Math.max(0, Math.min(255, r + chk));
  engine.color[c4 + 1] = Math.max(0, Math.min(255, g + chk));
  engine.color[c4 + 2] = Math.max(0, Math.min(255, b + chk));
  engine.color[c4 + 3] = a;
}

export function fillBoxPart(x1, y1, z1, x2, y2, z2, partId, rgba, hollowThickness = 0, checkerAmp = 5) {
  const [r, g, b, a] = rgba;
  for (let x = x1; x <= x2; x++) {
    for (let y = y1; y <= y2; y++) {
      for (let z = z1; z <= z2; z++) {
        if (hollowThickness > 0) {
          const onShell =
            x < x1 + hollowThickness || x > x2 - hollowThickness ||
            y < y1 + hollowThickness || y > y2 - hollowThickness ||
            z < z1 + hollowThickness || z > z2 - hollowThickness;
          if (!onShell) continue;
        }
        setVoxelRaw(x, y, z, partId, r, g, b, a, checkerAmp);
      }
    }
  }
}

export function fillEllipsoidOrgan(cx, cy, cz, rx, ry, rz, partId, rgba, checkerAmp = 7) {
  const [r, g, b, a] = rgba;
  const xMin = Math.floor(cx - rx), xMax = Math.ceil(cx + rx);
  const yMin = Math.floor(cy - ry), yMax = Math.ceil(cy + ry);
  const zMin = Math.floor(cz - rz), zMax = Math.ceil(cz + rz);
  for (let x = xMin; x <= xMax; x++) {
    for (let y = yMin; y <= yMax; y++) {
      for (let z = zMin; z <= zMax; z++) {
        const dx = (x - cx) / Math.max(0.5, rx);
        const dy = (y - cy) / Math.max(0.5, ry);
        const dz = (z - cz) / Math.max(0.5, rz);
        if (dx * dx + dy * dy + dz * dz <= 1.0) {
          setVoxelRaw(x, y, z, partId, r, g, b, a, checkerAmp);
        }
      }
    }
  }
}

/**
 * Generates all 9 Volumetric 3D Internal Organs inside the Hyperbuild 4D Character,
 * scaled proportionally to `engine.headSize`!
 */
export function populateInternalOrgans(headSize = engine.headSize) {
  const s = Math.max(8, Math.min(28, Number(headSize) || 16)) / 16.0;
  const sc = (v) => Math.round(v * s);
  const scSpan = (v1, v2) => [Math.round(v1 * s), Math.max(Math.round(v1 * s), Math.round((v2 + 1) * s) - 1)];
  const scBox = (x1, x2, y1, y2, z1, z2) => {
    const [xs1, xs2] = scSpan(x1, x2);
    const [ys1, ys2] = scSpan(y1, y2);
    const [zs1, zs2] = scSpan(z1, z2);
    return [xs1, ys1, zs1, xs2, ys2, zs2];
  };

  for (let i = 0; i < engine.totalVoxels; i++) {
    if (engine.active[i] && engine.partId[i] >= 12 && engine.partId[i] <= 20) {
      engine.active[i] = 0;
    }
  }

  // 12. Brain & Neural Stem (Part 12) inside Cranium — follows neck_joint
  fillEllipsoidOrgan(21.0 * s, 59.0 * s, 15.5 * s, 3.2 * s, 3.2 * s, 4.2 * s, 12, [240, 101, 149, 255], 9);
  fillEllipsoidOrgan(26.0 * s, 59.0 * s, 15.5 * s, 3.2 * s, 3.2 * s, 4.2 * s, 12, [232, 90, 140, 255], 9);
  fillBoxPart(...scBox(22, 25, 57, 59, 14, 17), 12, [214, 51, 108, 255], 0, 5);
  fillEllipsoidOrgan(23.5 * s, 55.0 * s, 13.0 * s, 3.0 * s, 2.0 * s, 2.2 * s, 12, [194, 37, 92, 255], 7);
  fillBoxPart(...scBox(23, 24, 51, 55, 14, 16), 12, [229, 153, 247, 255], 0, 4);

  // 13. Optic & Sensory Bulbs (Part 13) — follows neck_joint
  fillBoxPart(...scBox(19, 20, 56, 57, 18, 22), 13, [77, 171, 247, 255], 0, 4);
  fillBoxPart(...scBox(27, 28, 56, 57, 18, 22), 13, [77, 171, 247, 255], 0, 4);
  fillBoxPart(...scBox(21, 26, 56, 57, 17, 18), 13, [116, 192, 252, 255], 0, 4);

  // 14. Ribcage & Spine (Part 14) — follows waist_joint
  const [spY0, spY1] = scSpan(27, 50);
  const [spX0, spX1] = scSpan(23, 24);
  const spZ = sc(13);
  for (let y = spY0; y <= spY1; y++) {
    const isDisc = y % 2 === 0;
    const col = isDisc ? [206, 212, 218, 255] : [248, 249, 250, 255];
    for (let x = spX0; x <= spX1; x++) {
      setVoxelRaw(x, y, spZ, 14, col[0], col[1], col[2], 255, 2);
    }
  }
  fillBoxPart(...scBox(23, 24, 40, 47, 18, 18), 14, [241, 243, 245, 255], 0, 3);
  const ribLevels = [sc(40), sc(42), sc(45), sc(47)];
  const [rx0, rx1] = scSpan(17, 30);
  const [rz0, rz1] = scSpan(14, 17);
  for (const ry of ribLevels) {
    for (let x = rx0; x <= rx1; x++) {
      setVoxelRaw(x, ry, sc(13), 14, 241, 243, 245, 255, 3);
      if (x <= sc(21) || x >= sc(26)) {
        setVoxelRaw(x, ry, sc(18), 14, 241, 243, 245, 255, 3);
      }
    }
    for (let z = rz0; z <= rz1; z++) {
      setVoxelRaw(rx0, ry, z, 14, 233, 236, 239, 255, 3);
      setVoxelRaw(rx1, ry, z, 14, 233, 236, 239, 255, 3);
    }
  }
  fillBoxPart(...scBox(18, 29, 27, 28, 13, 14), 14, [233, 236, 239, 255], 0, 3);

  // 16. Lungs (Part 16) — follows waist_joint
  fillEllipsoidOrgan(19.8 * s, 43.5 * s, 16.0 * s, 2.2 * s, 4.2 * s, 2.0 * s, 16, [255, 135, 135, 255], 8);
  fillEllipsoidOrgan(27.8 * s, 43.5 * s, 16.0 * s, 2.2 * s, 4.2 * s, 2.0 * s, 16, [255, 135, 135, 255], 8);
  fillBoxPart(...scBox(23, 24, 47, 49, 15, 16), 16, [250, 176, 176, 255], 0, 4);

  // 15. Heart (Part 15) — follows waist_joint
  fillEllipsoidOrgan(24.5 * s, 43.0 * s, 16.2 * s, 2.3 * s, 2.7 * s, 1.9 * s, 15, [224, 49, 49, 255], 6);
  fillBoxPart(...scBox(23, 25, 46, 47, 16, 17), 15, [201, 42, 42, 255], 0, 4);
  setVoxelRaw(sc(22), sc(45), sc(17), 15, 59, 130, 246, 255, 0);

  // 20. 4D Hyper-Gland Core (Part 20) — follows waist_joint
  fillBoxPart(...scBox(22, 25, 37, 39, 15, 17), 20, [0, 245, 212, 255], 0, 10);
  fillBoxPart(...scBox(23, 24, 38, 38, 16, 16), 20, [241, 91, 181, 255], 0, 0);

  // 17. Stomach & Esophagus (Part 17) — follows waist_joint
  fillEllipsoidOrgan(26.2 * s, 34.8 * s, 16.0 * s, 2.5 * s, 2.2 * s, 1.8 * s, 17, [247, 131, 172, 255], 6);
  fillBoxPart(...scBox(25, 25, 37, 41, 15, 15), 17, [230, 73, 128, 255], 0, 3);

  // 18. Liver & Kidneys (Part 18) — follows waist_joint
  fillBoxPart(...scBox(18, 22, 34, 36, 15, 17), 18, [156, 54, 181, 255], 0, 6);
  fillBoxPart(...scBox(23, 23, 35, 36, 16, 17), 18, [156, 54, 181, 255], 0, 6);
  setVoxelRaw(sc(20), sc(34), sc(17), 18, 81, 207, 102, 255, 0);
  fillBoxPart(...scBox(19, 20, 32, 34, 14, 15), 18, [134, 46, 156, 255], 0, 4);
  fillBoxPart(...scBox(27, 28, 32, 34, 14, 15), 18, [134, 46, 156, 255], 0, 4);

  // 19. Coiled Intestines (Part 19) — follows waist_joint
  const [ix0, ix1] = scSpan(18, 29);
  const [iy0, iy1] = scSpan(28, 32);
  const [iz0, iz1] = scSpan(15, 17);
  for (let x = ix0; x <= ix1; x++) {
    for (let y = iy0; y <= iy1; y++) {
      for (let z = iz0; z <= iz1; z++) {
        const wave = (x + y * 2 + z) % 3;
        const r = wave === 0 ? 255 : 247;
        const g = wave === 0 ? 169 : 131;
        const b = wave === 0 ? 77 : 55;
        setVoxelRaw(x, y, z, 19, r, g, b, 255, 5);
      }
    }
  }
}

/**
 * Initializes the Complete Hyperbuild 4D Articulated Character scaled proportionally to `headSize`!
 * Default `headSize = 16` -> Head is 16x16x16, Upper/Lower Torso are 16x12x8 each,
 * Arms/Legs are 8x12x8 each, Workspace is 48x72x32.
 * If `headSize` is e.g. 8, 12, 20, or 24, the entire body, limbs, organs, and joints scale proportionally!
 */
export function initCharacterTemplate(headSize = engine.headSize || 16) {
  const H = Math.max(8, Math.min(28, Math.round(Number(headSize) || 16)));
  syncProportionalRigToHeadSize(H);
  const s = H / 16.0;
  const gx = Math.max(12, Math.round(48 * s));
  const gy = Math.max(18, Math.round(72 * s));
  const gz = Math.max(8, Math.round(32 * s));

  initEngine(gx, gy, gz);
  engine.headSize = H;
  engine.isCharacterMode = true;
  engine.activePartFilter = 0;
  engine.paintTargetPart = 0;
  engine.partHidden.fill(0);

  const scSpan = (v1, v2) => [Math.round(v1 * s), Math.max(Math.round(v1 * s), Math.round((v2 + 1) * s) - 1)];
  const scBox = (x1, x2, y1, y2, z1, z2) => {
    const [xs1, xs2] = scSpan(x1, x2);
    const [ys1, ys2] = scSpan(y1, y2);
    const [zs1, zs2] = scSpan(z1, z2);
    return [xs1, ys1, zs1, xs2, ys2, zs2];
  };
  const shellThickTorso = Math.max(1, Math.round(1 * s));
  const shellThickHead = Math.max(1, Math.round(2 * s));

  // Legs (4 outer parts: 8, 9, 10, 11)
  fillBoxPart(...scBox(16, 23, 2, 13, 12, 19), 9, [45, 70, 150, 255], 0, 6);   // 9. L-Leg Lower (follows l_knee_joint)
  fillBoxPart(...scBox(16, 23, 14, 25, 12, 19), 8, [55, 85, 175, 255], 0, 6);  // 8. L-Leg Upper (follows l_hip_joint)
  fillBoxPart(...scBox(24, 31, 2, 13, 12, 19), 11, [45, 70, 150, 255], 0, 6);  // 11. R-Leg Lower (follows r_knee_joint)
  fillBoxPart(...scBox(24, 31, 14, 25, 12, 19), 10, [55, 85, 175, 255], 0, 6); // 10. R-Leg Upper (follows r_hip_joint)
  // Boot soles
  fillBoxPart(...scBox(16, 23, 2, 4, 12, 19), 9, [30, 36, 50, 255], 0, 3);
  fillBoxPart(...scBox(24, 31, 2, 4, 12, 19), 11, [30, 36, 50, 255], 0, 3);

  // Torso (2 outer parts: 3 Lower Torso & 2 Upper Torso — hollow shell so internal organs fit inside!)
  fillBoxPart(...scBox(16, 31, 26, 37, 12, 19), 3, [0, 150, 165, 255], shellThickTorso, 6);
  fillBoxPart(...scBox(16, 31, 38, 49, 12, 19), 2, [0, 180, 195, 255], shellThickTorso, 6);
  // Belt accent on Lower Torso
  fillBoxPart(...scBox(16, 31, 26, 27, 19, 19), 3, [40, 48, 68, 255], 0, 2);
  fillBoxPart(...scBox(22, 25, 26, 27, 19, 19), 3, [255, 190, 11, 255], 0, 0);

  // Arms (4 outer parts: 4, 5, 6, 7)
  fillBoxPart(...scBox(8, 15, 26, 37, 12, 19), 5, [225, 170, 135, 255], 0, 6);  // 5. L-Arm Lower (follows l_elbow_joint)
  fillBoxPart(...scBox(8, 15, 38, 49, 12, 19), 4, [0, 165, 180, 255], 0, 6);    // 4. L-Arm Upper (follows l_shoulder_joint)
  fillBoxPart(...scBox(32, 39, 26, 37, 12, 19), 7, [225, 170, 135, 255], 0, 6); // 7. R-Arm Lower (follows r_elbow_joint)
  fillBoxPart(...scBox(32, 39, 38, 49, 12, 19), 6, [0, 165, 180, 255], 0, 6);   // 6. R-Arm Upper (follows r_shoulder_joint)

  // Head (Part 1: HxHxH cranial shell — follows neck_joint)
  fillBoxPart(...scBox(16, 31, 50, 65, 8, 23), 1, [235, 180, 145, 255], shellThickHead, 5);
  // Hair cap & back
  fillBoxPart(...scBox(16, 31, 63, 65, 8, 23), 1, [65, 40, 25, 255], 0, 4);
  fillBoxPart(...scBox(16, 31, 50, 65, 8, 9), 1, [65, 40, 25, 255], 0, 4);
  // Eyes on front face
  fillBoxPart(...scBox(18, 19, 56, 57, 23, 23), 1, [255, 255, 255, 255], 0, 0);
  fillBoxPart(...scBox(20, 21, 56, 57, 23, 23), 1, [40, 60, 160, 255], 0, 0);
  fillBoxPart(...scBox(26, 27, 56, 57, 23, 23), 1, [40, 60, 160, 255], 0, 0);
  fillBoxPart(...scBox(28, 29, 56, 57, 23, 23), 1, [255, 255, 255, 255], 0, 0);

  // Populate all 9 Volumetric 3D Internal Organs scaled proportionally
  populateInternalOrgans(H);

  updateCulling();
}

function isOccluder(x, y, z, selfPart) {
  if (!inBounds(x, y, z)) return false;
  const idx = getIndex(x, y, z);
  if (!engine.active[idx]) return false;
  const pid = engine.partId[idx];
  if (!isPartVisible(pid)) return false;
  if (isVoxelCutawayHidden(x, y, z, pid)) return false;
  const alpha = engine.color[idx * 4 + 3];
  if (alpha < 255) return false;
  if (engine.isCharacterMode && engine.xrayOuterShell && pid >= 1 && pid <= 11) {
    if (pid !== selfPart) return false;
  }
  if (engine.isCharacterMode && pid !== selfPart) return false;
  return true;
}

export function updateCulling() {
  if (!engine.active) return;
  const { gridX: gx, gridY: gy, gridZ: gz, active, partId, mask } = engine;
  let activeCount = 0;

  for (let z = 0; z < gz; z++) {
    for (let y = 0; y < gy; y++) {
      for (let x = 0; x < gx; x++) {
        const idx = z * gx * gy + y * gx + x;
        if (!active[idx]) {
          mask[idx] = 0;
          continue;
        }
        activeCount++;
        const pid = partId[idx];
        if (!isPartVisible(pid) || isVoxelCutawayHidden(x, y, z, pid)) {
          mask[idx] = 0;
          continue;
        }
        let m = 0;
        if (!isOccluder(x + 1, y, z, pid)) m |= 1;  // +X
        if (!isOccluder(x - 1, y, z, pid)) m |= 2;  // -X
        if (!isOccluder(x, y + 1, z, pid)) m |= 4;  // +Y
        if (!isOccluder(x, y - 1, z, pid)) m |= 8;  // -Y
        if (!isOccluder(x, y, z + 1, pid)) m |= 16; // +Z
        if (!isOccluder(x, y, z - 1, pid)) m |= 32; // -Z
        mask[idx] = m;
      }
    }
  }
  engine.activeVoxelCount = activeCount;
  engine.meshDirty = true;
}

/**
 * Fast 3D Voxel DDA Raycast (Amanatides & Woo)
 */
export function raycastVoxelDDA(rayOrigin, rayDir, maxDist = 260.0) {
  const { gridX: gx, gridY: gy, gridZ: gz, active, mask, partId } = engine;
  if (!active) return { hit: false };

  let tMin = 0.0;
  let tMax = maxDist;
  const boundsMax = [gx, gy, gz];

  for (let i = 0; i < 3; i++) {
    const o = rayOrigin[i];
    const d = rayDir[i];
    if (Math.abs(d) < 1e-8) {
      if (o < 0 || o > boundsMax[i]) return { hit: false };
    } else {
      let t1 = (0 - o) / d;
      let t2 = (boundsMax[i] - o) / d;
      if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
      if (t1 > tMin) tMin = t1;
      if (t2 < tMax) tMax = t2;
      if (tMin > tMax) return { hit: false };
    }
  }

  const startT = Math.max(0, tMin - 1e-4);
  const px = rayOrigin[0] + rayDir[0] * startT;
  const py = rayOrigin[1] + rayDir[1] * startT;
  const pz = rayOrigin[2] + rayDir[2] * startT;

  let ix = Math.min(gx - 1, Math.max(0, Math.floor(px)));
  let iy = Math.min(gy - 1, Math.max(0, Math.floor(py)));
  let iz = Math.min(gz - 1, Math.max(0, Math.floor(pz)));

  const stepX = rayDir[0] > 0 ? 1 : (rayDir[0] < 0 ? -1 : 0);
  const stepY = rayDir[1] > 0 ? 1 : (rayDir[1] < 0 ? -1 : 0);
  const stepZ = rayDir[2] > 0 ? 1 : (rayDir[2] < 0 ? -1 : 0);

  const tDeltaX = stepX !== 0 ? Math.abs(1 / rayDir[0]) : 1e30;
  const tDeltaY = stepY !== 0 ? Math.abs(1 / rayDir[1]) : 1e30;
  const tDeltaZ = stepZ !== 0 ? Math.abs(1 / rayDir[2]) : 1e30;

  let tMaxX = stepX > 0 ? (ix + 1 - px) * tDeltaX : (stepX < 0 ? (px - ix) * tDeltaX : 1e30);
  let tMaxY = stepY > 0 ? (iy + 1 - py) * tDeltaY : (stepY < 0 ? (py - iy) * tDeltaY : 1e30);
  let tMaxZ = stepZ > 0 ? (iz + 1 - pz) * tDeltaZ : (stepZ < 0 ? (pz - iz) * tDeltaZ : 1e30);

  let hitNorm = [0, 1, 0];
  if (tMin > 0) {
    const eps = 1e-3;
    if (Math.abs(px - 0) < eps) hitNorm = [-1, 0, 0];
    else if (Math.abs(px - gx) < eps) hitNorm = [1, 0, 0];
    else if (Math.abs(py - 0) < eps) hitNorm = [0, -1, 0];
    else if (Math.abs(py - gy) < eps) hitNorm = [0, 1, 0];
    else if (Math.abs(pz - 0) < eps) hitNorm = [0, 0, -1];
    else if (Math.abs(pz - gz) < eps) hitNorm = [0, 0, 1];
  }

  const maxSteps = gx + gy + gz + 8;
  for (let step = 0; step < maxSteps; step++) {
    if (inBounds(ix, iy, iz, gx, gy, gz)) {
      const idx = iz * gx * gy + iy * gx + ix;
      if (active[idx] && mask[idx] !== 0) {
        const pid = partId[idx];
        const skipOuterInXray =
          engine.isCharacterMode &&
          engine.xrayOuterShell &&
          engine.activePartFilter === 0 &&
          engine.paintTargetPart === 0 &&
          pid >= 1 &&
          pid <= 11;

        if (!skipOuterInXray && isPartVisible(pid) && !isVoxelCutawayHidden(ix, iy, iz, pid)) {
          return {
            hit: true,
            hitX: ix,
            hitY: iy,
            hitZ: iz,
            normX: hitNorm[0],
            normY: hitNorm[1],
            normZ: hitNorm[2],
            placeX: ix + hitNorm[0],
            placeY: iy + hitNorm[1],
            placeZ: iz + hitNorm[2],
          };
        }
      }
    }

    if (tMaxX < tMaxY) {
      if (tMaxX < tMaxZ) {
        ix += stepX;
        tMaxX += tDeltaX;
        hitNorm = [-stepX, 0, 0];
      } else {
        iz += stepZ;
        tMaxZ += tDeltaZ;
        hitNorm = [0, 0, -stepZ];
      }
    } else {
      if (tMaxY < tMaxZ) {
        iy += stepY;
        tMaxY += tDeltaY;
        hitNorm = [0, -stepY, 0];
      } else {
        iz += stepZ;
        tMaxZ += tDeltaZ;
        hitNorm = [0, 0, -stepZ];
      }
    }

    if (ix < 0 || ix >= gx || iy < 0 || iy >= gy || iz < 0 || iz >= gz) break;
  }

  let placeX = -1, placeY = -1, placeZ = -1;
  if (engine.hpState !== 0) {
    if (engine.hpState === 2 && Math.abs(rayDir[0]) > 1e-6) {
      const t = (engine.hpPos - rayOrigin[0]) / rayDir[0];
      if (t > 0) {
        const cy = Math.floor(rayOrigin[1] + rayDir[1] * t);
        const cz = Math.floor(rayOrigin[2] + rayDir[2] * t);
        if (cy >= 0 && cy < gy && cz >= 0 && cz < gz) { placeX = engine.hpPos; placeY = cy; placeZ = cz; }
      }
    } else if (engine.hpState === 1 && Math.abs(rayDir[1]) > 1e-6) {
      const t = (engine.hpPos - rayOrigin[1]) / rayDir[1];
      if (t > 0) {
        const cx = Math.floor(rayOrigin[0] + rayDir[0] * t);
        const cz = Math.floor(rayOrigin[2] + rayDir[2] * t);
        if (cx >= 0 && cx < gx && cz >= 0 && cz < gz) { placeX = cx; placeY = engine.hpPos; placeZ = cz; }
      }
    } else if (engine.hpState === 3 && Math.abs(rayDir[2]) > 1e-6) {
      const t = (engine.hpPos - rayOrigin[2]) / rayDir[2];
      if (t > 0) {
        const cx = Math.floor(rayOrigin[0] + rayDir[0] * t);
        const cy = Math.floor(rayOrigin[1] + rayDir[1] * t);
        if (cx >= 0 && cx < gx && cy >= 0 && cy < gy) { placeX = cx; placeY = cy; placeZ = engine.hpPos; }
      }
    }
  } else if (Math.abs(rayDir[1]) > 1e-6) {
    const t = (0 - rayOrigin[1]) / rayDir[1];
    if (t > 0) {
      const cx = Math.floor(rayOrigin[0] + rayDir[0] * t);
      const cz = Math.floor(rayOrigin[2] + rayDir[2] * t);
      if (cx >= 0 && cx < gx && cz >= 0 && cz < gz) {
        placeX = cx; placeY = 0; placeZ = cz;
      }
    }
  }

  return {
    hit: false,
    hitX: -1,
    hitY: -1,
    hitZ: -1,
    normX: 0,
    normY: 1,
    normZ: 0,
    placeX,
    placeY,
    placeZ,
  };
}

// ==================== UNDO / REDO SNAPSHOTS ====================
export function pushUndoSnapshot() {
  if (!engine.active) return;
  if (engine.undoStack.length >= 30) engine.undoStack.shift();
  engine.undoStack.push({
    active: new Uint8Array(engine.active),
    partId: new Uint8Array(engine.partId),
    color: new Uint8Array(engine.color),
  });
  engine.redoStack = [];
}

export function performUndo() {
  if (engine.undoStack.length === 0) return false;
  engine.redoStack.push({
    active: new Uint8Array(engine.active),
    partId: new Uint8Array(engine.partId),
    color: new Uint8Array(engine.color),
  });
  const snap = engine.undoStack.pop();
  engine.active.set(snap.active);
  engine.partId.set(snap.partId);
  engine.color.set(snap.color);
  updateCulling();
  return true;
}

export function performRedo() {
  if (engine.redoStack.length === 0) return false;
  engine.undoStack.push({
    active: new Uint8Array(engine.active),
    partId: new Uint8Array(engine.partId),
    color: new Uint8Array(engine.color),
  });
  const snap = engine.redoStack.pop();
  engine.active.set(snap.active);
  engine.partId.set(snap.partId);
  engine.color.set(snap.color);
  updateCulling();
  return true;
}

// ==================== DRAWING TOOLS & MIRROR SYMMETRY ====================
function resolveTargetPart(fallbackPartId = 1) {
  if (!engine.isCharacterMode) return 0;
  if (engine.paintTargetPart > 0) return engine.paintTargetPart;
  if (engine.activePartFilter > 0) return engine.activePartFilter;
  return fallbackPartId || 1;
}

function setSingleVoxelWithMirror(x, y, z, activeFlag, partId, rgba) {
  const applyAt = (vx, vy, vz, pId) => {
    if (!inBounds(vx, vy, vz)) return;
    const idx = getIndex(vx, vy, vz);
    engine.active[idx] = activeFlag ? 1 : 0;
    if (activeFlag) {
      engine.partId[idx] = pId;
      const c4 = idx * 4;
      engine.color[c4] = rgba[0];
      engine.color[c4 + 1] = rgba[1];
      engine.color[c4 + 2] = rgba[2];
      engine.color[c4 + 3] = rgba[3];
    }
  };

  applyAt(x, y, z, partId);
  if (engine.mirrorX) {
    const mx = engine.gridX - 1 - x;
    let mirrorPid = partId;
    if (partId === 4) mirrorPid = 6;
    else if (partId === 6) mirrorPid = 4;
    else if (partId === 5) mirrorPid = 7;
    else if (partId === 7) mirrorPid = 5;
    else if (partId === 8) mirrorPid = 10;
    else if (partId === 10) mirrorPid = 8;
    else if (partId === 9) mirrorPid = 11;
    else if (partId === 11) mirrorPid = 9;
    applyAt(mx, y, z, mirrorPid);
  }
}

export function applyBrushAt(cx, cy, cz, eraseMode, fallbackPartId, rgba) {
  const pid = resolveTargetPart(fallbackPartId);
  const rad = Math.floor((engine.brushSize - 1) / 2);
  const maxOff = engine.brushSize - 1 - rad;
  for (let dx = -rad; dx <= maxOff; dx++) {
    for (let dy = -rad; dy <= maxOff; dy++) {
      for (let dz = -rad; dz <= maxOff; dz++) {
        setSingleVoxelWithMirror(cx + dx, cy + dy, cz + dz, !eraseMode, pid, rgba);
      }
    }
  }
  updateCulling();
}

export function applyTool(sX, sY, sZ, eX, eY, eZ, tool, rgba, fallbackPartId = 1) {
  pushUndoSnapshot();
  const targetPart = resolveTargetPart(fallbackPartId);

  if (tool === TOOL_LINE) {
    const dx = eX - sX, dy = eY - sY, dz = eZ - sZ;
    const steps = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
    for (let i = 0; i <= steps; i++) {
      const t = steps === 0 ? 0 : i / steps;
      const x = Math.round(sX + t * dx);
      const y = Math.round(sY + t * dy);
      const z = Math.round(sZ + t * dz);
      setSingleVoxelWithMirror(x, y, z, true, targetPart, rgba);
    }
  } else if (tool === TOOL_SPHERE_3D) {
    const minX = Math.min(sX, eX), maxX = Math.max(sX, eX);
    const minY = Math.min(sY, eY), maxY = Math.max(sY, eY);
    const minZ = Math.min(sZ, eZ), maxZ = Math.max(sZ, eZ);
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2, cz = (minZ + maxZ) / 2;
    const rx = Math.max(0.5, (maxX - minX + 1) / 2);
    const ry = Math.max(0.5, (maxY - minY + 1) / 2);
    const rz = Math.max(0.5, (maxZ - minZ + 1) / 2);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const nx = (x - cx) / rx, ny = (y - cy) / ry, nz = (z - cz) / rz;
          if (nx * nx + ny * ny + nz * nz <= 1.05) {
            setSingleVoxelWithMirror(x, y, z, true, targetPart, rgba);
          }
        }
      }
    }
  } else {
    const minX = Math.min(sX, eX), maxX = Math.max(sX, eX);
    const minY = Math.min(sY, eY), maxY = Math.max(sY, eY);
    const minZ = Math.min(sZ, eZ), maxZ = Math.max(sZ, eZ);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          if (tool === TOOL_RECT_2D) {
            if (y !== sY) continue;
            if (x === minX || x === maxX || z === minZ || z === maxZ) {
              setSingleVoxelWithMirror(x, y, z, true, targetPart, rgba);
            }
          } else if (tool === TOOL_BOX_3D || tool === TOOL_BRUSH) {
            setSingleVoxelWithMirror(x, y, z, true, targetPart, rgba);
          }
        }
      }
    }
  }
  updateCulling();
}

// ==================== SELECTION & CLIPBOARD ====================
export function copySelection(deleteOriginal = false) {
  if (deleteOriginal) pushUndoSnapshot();
  const [sx, sy, sz] = engine.selStart;
  const [ex, ey, ez] = engine.selEnd;
  const minX = Math.min(sx, ex), maxX = Math.max(sx, ex);
  const minY = Math.min(sy, ey), maxY = Math.max(sy, ey);
  const minZ = Math.min(sz, ez), maxZ = Math.max(sz, ez);

  engine.clipSize = [maxX - minX + 1, maxY - minY + 1, maxZ - minZ + 1];
  engine.clipboard = [];

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        if (inBounds(x, y, z)) {
          const idx = getIndex(x, y, z);
          if (engine.active[idx] && isPartVisible(engine.partId[idx])) {
            const c4 = idx * 4;
            engine.clipboard.push({
              dx: x - minX,
              dy: y - minY,
              dz: z - minZ,
              partId: engine.partId[idx],
              color: [engine.color[c4], engine.color[c4 + 1], engine.color[c4 + 2], engine.color[c4 + 3]],
            });
            if (deleteOriginal) engine.active[idx] = 0;
          }
        }
      }
    }
  }
  if (deleteOriginal) updateCulling();
}

export function deleteSelection() {
  pushUndoSnapshot();
  const [sx, sy, sz] = engine.selStart;
  const [ex, ey, ez] = engine.selEnd;
  const minX = Math.min(sx, ex), maxX = Math.max(sx, ex);
  const minY = Math.min(sy, ey), maxY = Math.max(sy, ey);
  const minZ = Math.min(sz, ez), maxZ = Math.max(sz, ez);
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        if (inBounds(x, y, z)) {
          const idx = getIndex(x, y, z);
          if (isPartVisible(engine.partId[idx])) engine.active[idx] = 0;
        }
      }
    }
  }
  updateCulling();
}

export function fillSelection(rgba) {
  pushUndoSnapshot();
  const [sx, sy, sz] = engine.selStart;
  const [ex, ey, ez] = engine.selEnd;
  const minX = Math.min(sx, ex), maxX = Math.max(sx, ex);
  const minY = Math.min(sy, ey), maxY = Math.max(sy, ey);
  const minZ = Math.min(sz, ez), maxZ = Math.max(sz, ez);
  const pid = resolveTargetPart(1);
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (let z = minZ; z <= maxZ; z++) {
        if (inBounds(x, y, z)) {
          setSingleVoxelWithMirror(x, y, z, true, pid, rgba);
        }
      }
    }
  }
  updateCulling();
}

export function rotateClipboardY() {
  if (!engine.clipboard.length) return;
  const newW = engine.clipSize[2];
  const newD = engine.clipSize[0];
  for (const item of engine.clipboard) {
    const oldX = item.dx;
    const oldZ = item.dz;
    item.dx = newW - 1 - oldZ;
    item.dz = oldX;
  }
  engine.clipSize[0] = newW;
  engine.clipSize[2] = newD;
  engine.meshDirty = true;
}

export function commitPaste() {
  if (!engine.clipboard.length) return;
  pushUndoSnapshot();
  const [px, py, pz] = engine.pastePos;
  for (const item of engine.clipboard) {
    const wx = Math.round(px + item.dx);
    const wy = Math.round(py + item.dy);
    const wz = Math.round(pz + item.dz);
    if (inBounds(wx, wy, wz)) {
      const idx = getIndex(wx, wy, wz);
      engine.active[idx] = 1;
      engine.partId[idx] = engine.activePartFilter > 0 ? engine.activePartFilter : item.partId;
      const c4 = idx * 4;
      engine.color[c4] = item.color[0];
      engine.color[c4 + 1] = item.color[1];
      engine.color[c4 + 2] = item.color[2];
      engine.color[c4 + 3] = item.color[3];
    }
  }
  updateCulling();
}

// ==================== HT3D BINARY SERIALIZATION (C-STRUCT COMPATIBLE) ====================
export function serializeHT3DBuffer() {
  const { gridX: gx, gridY: gy, gridZ: gz, totalVoxels, active, mask, partId, color, isCharacterMode } = engine;
  const buf = new ArrayBuffer(20 + totalVoxels * 7);
  const view = new DataView(buf);
  view.setUint32(0, HT3D_MAGIC, true);
  view.setInt32(4, gx, true);
  view.setInt32(8, gy, true);
  view.setInt32(12, gz, true);
  view.setInt32(16, isCharacterMode ? 1 : 0, true);

  const bytes = new Uint8Array(buf, 20);
  for (let i = 0; i < totalVoxels; i++) {
    const o = i * 7;
    const c4 = i * 4;
    bytes[o] = active[i];
    bytes[o + 1] = mask[i];
    bytes[o + 2] = partId[i];
    bytes[o + 3] = color[c4];
    bytes[o + 4] = color[c4 + 1];
    bytes[o + 5] = color[c4 + 2];
    bytes[o + 6] = color[c4 + 3];
  }
  return buf;
}

export function deserializeHT3DBuffer(arrayBuffer) {
  if (!arrayBuffer || arrayBuffer.byteLength < 20) return false;
  const view = new DataView(arrayBuffer);
  const magic = view.getUint32(0, true);
  if (magic === HT3D_MAGIC) {
    const gx = view.getInt32(4, true);
    const gy = view.getInt32(8, true);
    const gz = view.getInt32(12, true);
    const charFlag = view.getInt32(16, true);
    if (gx < 4 || gx > 128 || gy < 4 || gy > 128 || gz < 4 || gz > 128) return false;

    initEngine(gx, gy, gz);
    engine.isCharacterMode = charFlag !== 0;
    if (engine.isCharacterMode) {
      const inferredHead = Math.max(8, Math.min(28, Math.round(gx / 3)));
      syncProportionalRigToHeadSize(inferredHead);
    }
    const total = gx * gy * gz;
    const bytes = new Uint8Array(arrayBuffer, 20);
    const maxRead = Math.min(total, Math.floor(bytes.byteLength / 7));
    for (let i = 0; i < maxRead; i++) {
      const o = i * 7;
      const c4 = i * 4;
      engine.active[i] = bytes[o];
      engine.mask[i] = bytes[o + 1];
      engine.partId[i] = bytes[o + 2];
      engine.color[c4] = bytes[o + 3];
      engine.color[c4 + 1] = bytes[o + 4];
      engine.color[c4 + 2] = bytes[o + 5];
      engine.color[c4 + 3] = bytes[o + 6];
    }
    updateCulling();
    return true;
  }
  return false;
}

// ==================== HYPERBUILD 4D (.HB) EXPORT & IMPORT FORMAT ====================
/**
 * Infers which body part ID (1..11) a voxel at (x, y, z) belongs to based on proportional head size bounds,
 * or resolves from `followJoint` name if provided.
 */
export function resolvePartIdFromJointOrCoords(x, y, z, followJoint, explicitPartId) {
  if (explicitPartId !== undefined && explicitPartId !== null && explicitPartId >= 0 && explicitPartId <= NUM_BODY_PARTS) {
    return Number(explicitPartId);
  }
  if (followJoint) {
    const cleanJ = String(followJoint).trim().toLowerCase();
    for (let p = 1; p <= NUM_BODY_PARTS; p++) {
      if (BODY_PART_SPECS[p].followJoint.toLowerCase() === cleanJ) {
        return p;
      }
    }
  }
  if (!engine.isCharacterMode) return 0;
  for (let p = 1; p <= NUM_OUTER_PARTS; p++) {
    const [bx, by, bz, bw, bh, bd] = BODY_PART_SPECS[p].bounds;
    if (x >= bx && x < bx + bw && y >= by && y < by + bh && z >= bz && z < bz + bd) {
      return p;
    }
  }
  return 1;
}

/**
 * Generates the complete Hyperbuild 4D `.hb` data structure containing:
 * 1. Character `headSize` (e.g. [16, 16, 16]) and proportional body scaling ratios (`bodyProportionsFromHead`)
 * 2. All skeletal `joints` with their 3D pivot coordinates and parent-child part bindings
 * 3. All `parts` (11 outer segments + 9 internal organs) and which joint each part follows (`followJoint`)
 * 4. Every active pixel/voxel (`voxels`) with its `x, y, z` coordinate, `color` (#RRGGBBAA & [r,g,b,a]),
 *    `partId`, `partName`, `followJoint`, and `jointOffset` ([dx, dy, dz] relative to the joint it follows).
 */
export function generateHyperbuildHBObject(projectName = 'hyperbuild_4d_character') {
  const { gridX: gx, gridY: gy, gridZ: gz, active, partId, color, isCharacterMode } = engine;
  const H = engine.isCharacterMode ? (engine.headSize || Math.max(8, Math.round(gx / 3))) : (engine.headSize || 16);
  if (engine.isCharacterMode) {
    syncProportionalRigToHeadSize(H);
  }
  const proportions = computeBodyProportionsFromHead(H);

  const partCounts = new Uint32Array(NUM_BODY_PARTS + 1);
  const voxels = [];

  for (let z = 0; z < gz; z++) {
    for (let y = 0; y < gy; y++) {
      for (let x = 0; x < gx; x++) {
        const idx = z * gx * gy + y * gx + x;
        if (!active[idx]) continue;
        const pid = partId[idx];
        if (pid <= NUM_BODY_PARTS) partCounts[pid]++;
        const c4 = idx * 4;
        const r = color[c4], g = color[c4 + 1], b = color[c4 + 2], a = color[c4 + 3];
        const hex = rgbaToHex(r, g, b, a);
        const spec = BODY_PART_SPECS[pid] || BODY_PART_SPECS[0];
        const jointInfo = getJointForPart(pid);
        const jPos = jointInfo.jointPos;

        voxels.push({
          x,
          y,
          z,
          color: hex,
          rgba: [r, g, b, a],
          partId: pid,
          part: spec.name,
          followJoint: jointInfo.jointId,
          jointOffset: [
            Number((x - jPos[0]).toFixed(2)),
            Number((y - jPos[1]).toFixed(2)),
            Number((z - jPos[2]).toFixed(2)),
          ],
        });
      }
    }
  }

  const parts = [];
  for (let p = 1; p <= NUM_BODY_PARTS; p++) {
    const spec = BODY_PART_SPECS[p];
    const jointInfo = getJointForPart(p);
    parts.push({
      partId: p,
      name: spec.name,
      category: spec.category,
      tissue: spec.tissue,
      followJoint: jointInfo.jointId,
      followJointName: jointInfo.jointName,
      jointPivot: jointInfo.jointPos,
      parentCavityPartId: spec.parentPart || null,
      bounds: [...spec.bounds],
      voxelCount: partCounts[p],
    });
  }

  return {
    format: HB_FORMAT_VERSION,
    extension: '.hb',
    engine: 'Hyperbuild 4D',
    projectName,
    isCharacterMode: !!isCharacterMode,
    headSize: [H, H, H],
    headCubeDimension: H,
    bodyProportionsFromHead: proportions,
    workspaceDimensions: [gx, gy, gz],
    totalVoxels: voxels.length,
    joints: CHAR_JOINTS.map((j) => ({
      jointId: j.id,
      name: j.name,
      pivot: [...j.pos],
      parentPartId: j.parentPart,
      childPartId: j.childPart,
      parentAnchor: j.scaledParentAnchor || [...j.parentAnchor],
      childAnchor: j.scaledChildAnchor || [...j.childAnchor],
    })),
    parts,
    voxels,
  };
}

export function serializeHBFile(projectName = 'hyperbuild_4d_character') {
  const hbObj = generateHyperbuildHBObject(projectName);
  return JSON.stringify(hbObj, null, 2);
}

export function buildHBPreviewSnippet(projectName = 'hyperbuild_4d_character') {
  const hb = generateHyperbuildHBObject(projectName);
  const sampleVoxels = hb.voxels.slice(0, 5).map(
    (v) => `  { "x": ${v.x}, "y": ${v.y}, "z": ${v.z}, "color": "${v.color}", "partId": ${v.partId}, "followJoint": "${v.followJoint}" }`
  );
  return [
    `// HYPERBUILD 4D (.hb) — ${projectName}.hb`,
    `"format": "${hb.format}",`,
    `"headSize": [${hb.headSize.join(', ')}] (Proportional Scale: ${hb.bodyProportionsFromHead.scaleFactor}x),`,
    `"bodyProportionsFromHead": {`,
    `  "head": [${hb.bodyProportionsFromHead.head.join('x')}], "fullTorso": [${hb.bodyProportionsFromHead.fullTorso.join('x')}],`,
    `  "armUpper": [${hb.bodyProportionsFromHead.armUpper.join('x')}], "legUpper": [${hb.bodyProportionsFromHead.legUpper.join('x')}]`,
    `},`,
    `"workspaceDimensions": [${hb.workspaceDimensions.join(', ')}],`,
    `"totalVoxels": ${hb.totalVoxels},`,
    `"voxels": [`,
    ...sampleVoxels,
    hb.voxels.length > 5 ? `  ... (+${hb.voxels.length - 5} more voxels with XYZ, Color & Joint Binding)` : '',
    `]`,
  ].filter(Boolean).join('\n');
}

/**
 * Imports a `.hb` file (supports JSON `.hb` object as well as line-based `.hb` text format)
 * and reconstructs the character head size, proportional body structure, joint hierarchy,
 * and every voxel's XYZ coordinate, color, partId, and joint binding!
 */
export function deserializeHBFile(rawContent) {
  if (!rawContent) return false;
  let text = '';
  if (typeof rawContent === 'string') {
    text = rawContent.trim();
  } else if (rawContent instanceof ArrayBuffer) {
    text = new TextDecoder('utf-8').decode(rawContent).trim();
  } else if (typeof rawContent === 'object') {
    text = JSON.stringify(rawContent);
  }
  if (!text) return false;

  // 1. Try JSON-based .hb structure (standard Hyperbuild 4D .hb format)
  if (text.startsWith('{')) {
    try {
      const data = JSON.parse(text);
      if (!data || (!Array.isArray(data.voxels) && !Array.isArray(data.pixels) && !data.headSize)) {
        return false;
      }

      // Extract headSize (e.g. [16, 16, 16] or number 16)
      let H = 16;
      if (Array.isArray(data.headSize) && data.headSize.length >= 1) {
        H = Math.max(8, Math.min(28, Math.round(Number(data.headSize[0]) || 16)));
      } else if (typeof data.headSize === 'number' || typeof data.headCubeDimension === 'number') {
        H = Math.max(8, Math.min(28, Math.round(Number(data.headSize || data.headCubeDimension) || 16)));
      }

      const props = computeBodyProportionsFromHead(H);
      let [gx, gy, gz] = props.workspaceDimensions;
      if (Array.isArray(data.workspaceDimensions) && data.workspaceDimensions.length === 3) {
        gx = Math.max(4, Math.min(128, Math.round(Number(data.workspaceDimensions[0]) || gx)));
        gy = Math.max(4, Math.min(128, Math.round(Number(data.workspaceDimensions[1]) || gy)));
        gz = Math.max(4, Math.min(128, Math.round(Number(data.workspaceDimensions[2]) || gz)));
      }

      const voxList = Array.isArray(data.voxels) ? data.voxels : (Array.isArray(data.pixels) ? data.pixels : []);

      // Ensure workspace is large enough to hold any voxel coordinates in the .hb file
      for (const v of voxList) {
        const vx = Number(v.x ?? (Array.isArray(v.xyz) ? v.xyz[0] : 0));
        const vy = Number(v.y ?? (Array.isArray(v.xyz) ? v.xyz[1] : 0));
        const vz = Number(v.z ?? (Array.isArray(v.xyz) ? v.xyz[2] : 0));
        if (vx + 1 > gx && vx + 1 <= 128) gx = vx + 1;
        if (vy + 1 > gy && vy + 1 <= 128) gy = vy + 1;
        if (vz + 1 > gz && vz + 1 <= 128) gz = vz + 1;
      }

      syncProportionalRigToHeadSize(H);

      // Update joint positions or part followJoint mappings if customized in the .hb file
      if (Array.isArray(data.joints)) {
        for (const jData of data.joints) {
          const jId = jData.jointId || jData.id;
          const targetJ = CHAR_JOINTS.find((j) => j.id === jId);
          if (targetJ && Array.isArray(jData.pivot || jData.pos) && (jData.pivot || jData.pos).length === 3) {
            const p = jData.pivot || jData.pos;
            targetJ.pos = [Number(p[0]), Number(p[1]), Number(p[2])];
          }
        }
      }

      if (Array.isArray(data.parts)) {
        for (const pData of data.parts) {
          const pid = Number(pData.partId ?? pData.id);
          if (pid >= 1 && pid <= NUM_BODY_PARTS && BODY_PART_SPECS[pid]) {
            if (pData.followJoint) BODY_PART_SPECS[pid].followJoint = String(pData.followJoint);
            if (Array.isArray(pData.bounds) && pData.bounds.length === 6) {
              BODY_PART_SPECS[pid].bounds = pData.bounds.map(Number);
            }
          }
        }
      }

      // If the .hb file specifies headSize but has an empty voxel list (e.g. a template .hb),
      // generate the proportional character structure for that headSize!
      if (voxList.length === 0 && (data.generateTemplateIfEmpty || data.headSize)) {
        initCharacterTemplate(H);
        return true;
      }

      initEngine(gx, gy, gz);
      engine.headSize = H;
      engine.isCharacterMode = data.isCharacterMode !== undefined ? !!data.isCharacterMode : true;

      for (const v of voxList) {
        const x = Math.round(Number(v.x ?? (Array.isArray(v.xyz) ? v.xyz[0] : -1)));
        const y = Math.round(Number(v.y ?? (Array.isArray(v.xyz) ? v.xyz[1] : -1)));
        const z = Math.round(Number(v.z ?? (Array.isArray(v.xyz) ? v.xyz[2] : -1)));
        if (!inBounds(x, y, z, gx, gy, gz)) continue;

        let rgba = [0, 210, 255, 255];
        if (Array.isArray(v.rgba) && v.rgba.length >= 3) {
          rgba = [
            Math.max(0, Math.min(255, Number(v.rgba[0]) || 0)),
            Math.max(0, Math.min(255, Number(v.rgba[1]) || 0)),
            Math.max(0, Math.min(255, Number(v.rgba[2]) || 0)),
            v.rgba[3] !== undefined ? Math.max(0, Math.min(255, Number(v.rgba[3]))) : 255,
          ];
        } else if (typeof v.color === 'string') {
          rgba = hexToRgba(v.color);
        } else if (Array.isArray(v.color) && v.color.length >= 3) {
          rgba = [
            Number(v.color[0]) || 0,
            Number(v.color[1]) || 0,
            Number(v.color[2]) || 0,
            v.color[3] !== undefined ? Number(v.color[3]) : 255,
          ];
        }

        const pid = resolvePartIdFromJointOrCoords(x, y, z, v.followJoint || v.joint, v.partId ?? v.part_id);
        setVoxelRaw(x, y, z, pid, rgba[0], rgba[1], rgba[2], rgba[3], 0);
      }

      updateCulling();
      return true;
    } catch {
      // Fall through to text line parser if not JSON
    }
  }

  // 2. Support line-based .hb format (e.g. HEAD_SIZE 16 16 16 / VOXEL x y z #RRGGBBAA partId followJoint)
  const lines = text.split(/\r?\n/);
  let H = 16;
  let customDims = null;
  const parsedVoxels = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;
    const tokens = line.split(/[\s,]+/);
    const cmd = tokens[0].toUpperCase();
    if (cmd === 'HEAD_SIZE' || cmd === 'HEAD') {
      H = Math.max(8, Math.min(28, parseInt(tokens[1], 10) || 16));
    } else if (cmd === 'GRID' || cmd === 'WORKSPACE') {
      customDims = [parseInt(tokens[1], 10) || 48, parseInt(tokens[2], 10) || 72, parseInt(tokens[3], 10) || 32];
    } else if (cmd === 'VOXEL' || cmd === 'PIXEL' || cmd === 'V') {
      const x = parseInt(tokens[1], 10);
      const y = parseInt(tokens[2], 10);
      const z = parseInt(tokens[3], 10);
      const colStr = tokens[4] || '#00D2FFFF';
      const pid = tokens[5] !== undefined && !Number.isNaN(parseInt(tokens[5], 10)) ? parseInt(tokens[5], 10) : undefined;
      const joint = tokens[6] || (pid === undefined ? tokens[5] : undefined);
      if (!Number.isNaN(x) && !Number.isNaN(y) && !Number.isNaN(z)) {
        parsedVoxels.push({ x, y, z, color: colStr, partId: pid, followJoint: joint });
      }
    }
  }

  if (parsedVoxels.length > 0) {
    syncProportionalRigToHeadSize(H);
    const props = computeBodyProportionsFromHead(H);
    const [gx, gy, gz] = customDims || props.workspaceDimensions;
    initEngine(gx, gy, gz);
    engine.headSize = H;
    engine.isCharacterMode = true;
    for (const v of parsedVoxels) {
      if (!inBounds(v.x, v.y, v.z, gx, gy, gz)) continue;
      const rgba = hexToRgba(v.color);
      const pid = resolvePartIdFromJointOrCoords(v.x, v.y, v.z, v.followJoint, v.partId);
      setVoxelRaw(v.x, v.y, v.z, pid, rgba[0], rgba[1], rgba[2], rgba[3], 0);
    }
    updateCulling();
    return true;
  }

  return false;
}

// ==================== HYPERBUILD 4D VOLUMETRIC PNG SHEET GENERATOR ====================
export function buildHyperbuildAtlasPixels(format = engine.exportFormat) {
  const { gridX: gx, gridY: gy, gridZ: gz, active, partId, color } = engine;

  const setPx = (buf, w, h, x, y, r, g, b, a) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = (y * w + x) * 4;
    buf[idx] = r;
    buf[idx + 1] = g;
    buf[idx + 2] = b;
    buf[idx + 3] = a;
  };

  if (format === 'raw-z-strip') {
    const w = gx * gz;
    const h = gy;
    const pixels = new Uint8ClampedArray(w * h * 4);
    for (let z = 0; z < gz; z++) {
      for (let y = 0; y < gy; y++) {
        for (let x = 0; x < gx; x++) {
          const idx = getIndex(x, y, z);
          if (active[idx] && isPartVisible(partId[idx])) {
            const c4 = idx * 4;
            if (color[c4 + 3] > 0) {
              setPx(pixels, w, h, z * gx + x, gy - 1 - y, color[c4], color[c4 + 1], color[c4 + 2], color[c4 + 3]);
            }
          }
        }
      }
    }
    return { width: w, height: h, pixels };
  }

  const w = 256;
  const h = 256;
  const pixels = new Uint8ClampedArray(w * h * 4);

  if (format === 'anatomical-20parts') {
    for (let p = 1; p <= 20; p++) {
      const spec = BODY_PART_SPECS[p];
      if (!spec) continue;
      const cellCol = (p - 1) % 5;
      const cellRow = Math.floor((p - 1) / 5);
      const baseX = cellCol * 51 + 2;
      const baseY = cellRow * 63 + 2;

      const borderCol = p >= 12 ? [180, 70, 220, 90] : [65, 130, 255, 90];
      for (let bx = 0; bx < 49; bx++) {
        setPx(pixels, w, h, baseX + bx, baseY, ...borderCol);
        setPx(pixels, w, h, baseX + bx, baseY + 60, ...borderCol);
      }
      for (let by = 0; by <= 60; by++) {
        setPx(pixels, w, h, baseX, baseY + by, ...borderCol);
        setPx(pixels, w, h, baseX + 48, baseY + by, ...borderCol);
      }

      const [minX, minY, minZ, sx, sy, sz] = spec.bounds || [0, 0, 0, 16, 16, 16];
      for (let zOff = 0; zOff < sz; zOff++) {
        const subCol = zOff % 3;
        const subRow = Math.floor(zOff / 3);
        const ox = baseX + 1 + subCol * Math.min(16, sx);
        const oy = baseY + 1 + subRow * Math.min(16, sy);
        if (oy - baseY >= 58) continue;

        for (let y = 0; y < sy; y++) {
          for (let x = 0; x < sx; x++) {
            const vx = minX + x, vy = minY + (sy - 1 - y), vz = minZ + zOff;
            if (inBounds(vx, vy, vz)) {
              const idx = getIndex(vx, vy, vz);
              if (active[idx] && partId[idx] === p) {
                const c4 = idx * 4;
                setPx(pixels, w, h, ox + x, oy + y, color[c4], color[c4 + 1], color[c4 + 2], color[c4 + 3]);
              }
            }
          }
        }
      }
    }
    return { width: w, height: h, pixels };
  }

  // Default ('hb-structure' preview & 'hyperbuild-volumetric'):
  // 256x256 Hyperbuild 4D Volumetric W-Layer + Z-Slice Atlas
  const renderVolumetricSliceTile = (dstX, dstY, zStart, zEnd, filterMode) => {
    for (let z = zStart; z <= zEnd; z++) {
      if (z < 0 || z >= gz) continue;
      for (let ty = 0; ty < 32; ty++) {
        for (let tx = 0; tx < 32; tx++) {
          const vx = Math.min(gx - 1, Math.floor(((8 + tx) / 48) * gx));
          const vy = Math.min(gy - 1, Math.floor(((65 - ty * 2) / 72) * gy));
          for (let dy = 0; dy < 2; dy++) {
            const cy = Math.max(0, vy - dy);
            if (!inBounds(vx, cy, z)) continue;
            const idx = getIndex(vx, cy, z);
            if (!active[idx]) continue;
            const pid = partId[idx];
            if (filterMode === 'outer' && pid >= 12) continue;
            if (filterMode === 'organs' && pid > 0 && pid < 12) continue;

            const c4 = idx * 4;
            setPx(pixels, w, h, dstX + tx, dstY + ty, color[c4], color[c4 + 1], color[c4 + 2], color[c4 + 3]);
            break;
          }
        }
      }
    }
  };

  const zStartBase = Math.max(0, Math.floor((8 / 32) * gz));
  for (let s = 0; s < 16; s++) {
    const col = s % 4;
    const row = Math.floor(s / 4);
    const zSlice = Math.min(gz - 1, zStartBase + Math.floor((s / 16) * Math.max(1, gz * 0.5)));
    renderVolumetricSliceTile(col * 32, row * 32, zSlice, zSlice, 'all');
    renderVolumetricSliceTile(128 + col * 32, row * 32, zSlice, zSlice, 'outer');
    renderVolumetricSliceTile(col * 32, 128 + row * 32, zSlice, zSlice, 'organs');
  }

  for (let orgIdx = 0; orgIdx < 9; orgIdx++) {
    const pid = 12 + orgIdx;
    const spec = BODY_PART_SPECS[pid];
    if (!spec) continue;
    const cellCol = orgIdx % 3;
    const cellRow = Math.floor(orgIdx / 3);
    const ox = 128 + cellCol * 42 + 2;
    const oy = 128 + cellRow * 40 + 2;
    const [minX, minY, minZ, sx, sy, sz] = spec.bounds;

    for (let z = 0; z < sz; z++) {
      const sliceX = ox + (z % 3) * 13;
      const sliceY = oy + Math.floor(z / 3) * 12;
      for (let y = 0; y < Math.min(12, sy); y++) {
        for (let x = 0; x < Math.min(12, sx); x++) {
          const vx = minX + x, vy = minY + (sy - 1 - y), vz = minZ + z;
          if (inBounds(vx, vy, vz)) {
            const idx = getIndex(vx, vy, vz);
            if (active[idx] && partId[idx] === pid) {
              const c4 = idx * 4;
              setPx(pixels, w, h, sliceX + x, sliceY + y, color[c4], color[c4 + 1], color[c4 + 2], color[c4 + 3]);
            }
          }
        }
      }
    }
  }

  for (let p = 1; p <= 20; p++) {
    const [r, g, b, a] = hexToRgba(BODY_PART_SPECS[p].color);
    for (let py = 250; py < 256; py++) {
      for (let px = 0; px < 6; px++) {
        setPx(pixels, w, h, 128 + (p - 1) * 6 + px, py, r, g, b, a);
      }
    }
  }

  return { width: w, height: h, pixels };
}

export function generateHyperbuild4DRigJSON(baseFilename = 'hyperbuild_4d_character') {
  const hbObj = generateHyperbuildHBObject(baseFilename);
  return JSON.stringify(
    {
      engineTarget: 'Hyperbuild_4D_Volumetric_Character_And_Organ_Rig',
      version: '4.1.0',
      hbStructureFile: `${baseFilename}.hb`,
      textureAtlasFile: `${baseFilename}.png`,
      atlasFormat: engine.exportFormat,
      headSize: hbObj.headSize,
      bodyProportionsFromHead: hbObj.bodyProportionsFromHead,
      workspaceDimensions: hbObj.workspaceDimensions,
      totalActiveVoxels: hbObj.totalVoxels,
      totalOuterBodyParts: NUM_OUTER_PARTS,
      totalInternalOrgans: NUM_ORGAN_PARTS,
      totalSkeletalJoints: NUM_JOINTS,
      wDimensionLayers: [
        { w: 0, name: 'Composite_3D_CrossSection', quadrantRect: [0, 0, 128, 128] },
        { w: 1, name: 'Outer_Epidermis_And_Apparel_Shell', quadrantRect: [128, 0, 128, 128] },
        { w: 2, name: 'Internal_3D_Organs_And_Skeletal_Cavity', quadrantRect: [0, 128, 128, 128] },
        { w: 3, name: 'Individual_Organ_Volumetric_Unwraps', quadrantRect: [128, 128, 128, 128] },
      ],
      parts: hbObj.parts,
      joints: hbObj.joints,
    },
    null,
    2
  );
}

export function generateHyperbuild4DSpecText(baseFilename = 'hyperbuild_4d_character') {
  const props = computeBodyProportionsFromHead(engine.headSize || 16);
  return [
    '================================================================================',
    'HYPERBUILD 4D VOLUMETRIC CHARACTER, JOINT RIG & .HB STRUCTURE SPECIFICATION',
    '================================================================================',
    `PROJECT NAME: ${baseFilename}`,
    `HYPERBUILD 4D STRUCTURE FILE: ${baseFilename}.hb (Head Size, Voxel XYZ, Colors & Joint Bindings)`,
    `VOLUMETRIC PNG SHEET: ${baseFilename}.png (Multi-Depth Cross-Section Atlas)`,
    `RIG & ORGAN METADATA: ${baseFilename}_rig_4d_organs.json`,
    `CHARACTER HEAD SIZE: ${props.headSize.join(' x ')} (Proportional Scale Factor: ${props.scaleFactor}x)`,
    `PROPORTIONAL TORSO: ${props.fullTorso.join(' x ')} | LIMBS: ${props.armUpper.join(' x ')}`,
    `WORKSPACE VOLUME: ${engine.gridX} x ${engine.gridY} x ${engine.gridZ} Voxels (${engine.activeVoxelCount} Active Voxels)`,
    '',
    '--- 1. HYPERBUILD 4D (.HB) PROPORTIONAL VOXEL & JOINT ARCHITECTURE ---',
    'Unlike hollow 2D surface skins, Hyperbuild 4D (.hb) characters store the exact',
    'Head Size, proportional body segment dimensions, every voxel XYZ coordinate,',
    'RGBA color, anatomical partId, and the exact skeletal joint (`followJoint`) that',
    'each body part and internal 3D organ follows.',
    '',
    '--- 2. THE 11 OUTER ARTICULATED BODY SEGMENTS & JOINT BINDINGS (PARTS 1..11) ---',
    ...BODY_PART_SPECS.slice(1, 12).map(
      (p) => `Part ${p.id}: ${p.name} | Follows Joint: ${p.followJoint} | Bounds: [${p.bounds.join(', ')}]`
    ),
    '',
    '--- 3. THE 9 VOLUMETRIC 3D INTERNAL ORGANS & JOINT BINDINGS (PARTS 12..20) ---',
    ...BODY_PART_SPECS.slice(12, 21).map(
      (p) =>
        `Part ${p.id}: ${p.name} | Inside Part ${p.parentPart} | Follows Joint: ${p.followJoint} | Bounds: [${p.bounds.join(', ')}]`
    ),
    '',
    '--- 4. THE 10 ARTICULATED SKELETAL JOINTS ---',
    ...CHAR_JOINTS.map(
      (j, idx) =>
        `${idx + 1}. ${j.name} (${j.id}) -> Pivot: (${j.pos.join(', ')}) | Parent Part ${j.parentPart} -> Child Part ${j.childPart}`
    ),
    '================================================================================',
  ].join('\n');
}

// ==================== 3D MATRIX MATH (COLUMN-MAJOR FOR WEBGL) ====================
function mat4Identity() {
  const out = new Float32Array(16);
  out[0] = 1; out[5] = 1; out[10] = 1; out[15] = 1;
  return out;
}

function mat4Perspective(fovRad, aspect, near, far) {
  const f = 1.0 / Math.tan(fovRad / 2);
  const nf = 1 / (near - far);
  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;
  return out;
}

function mat4LookAt(eye, center, up) {
  let zx = eye[0] - center[0], zy = eye[1] - center[1], zz = eye[2] - center[2];
  let len = Math.hypot(zx, zy, zz);
  if (len === 0) { zz = 1; } else { zx /= len; zy /= len; zz /= len; }

  let xx = up[1] * zz - up[2] * zy;
  let xy = up[2] * zx - up[0] * zz;
  let xz = up[0] * zy - up[1] * zx;
  len = Math.hypot(xx, xy, xz);
  if (len === 0) { xx = 0; xy = 0; xz = 0; } else { xx /= len; xy /= len; xz /= len; }

  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;

  const out = new Float32Array(16);
  out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0;
  out[4] = xy; out[5] = yy; out[6] = zy; out[7] = 0;
  out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0;
  out[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
  out[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
  out[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
  out[15] = 1;
  return out;
}

function mat4Multiply(a, b) {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[col * 4 + row] =
        a[0 * 4 + row] * b[col * 4 + 0] +
        a[1 * 4 + row] * b[col * 4 + 1] +
        a[2 * 4 + row] * b[col * 4 + 2] +
        a[3 * 4 + row] * b[col * 4 + 3];
    }
  }
  return out;
}

function mat4Invert(m) {
  const inv = new Float32Array(16);
  inv[0] = m[5]*m[10]*m[15] - m[5]*m[11]*m[14] - m[9]*m[6]*m[15] + m[9]*m[7]*m[14] + m[13]*m[6]*m[11] - m[13]*m[7]*m[10];
  inv[4] = -m[4]*m[10]*m[15] + m[4]*m[11]*m[14] + m[8]*m[6]*m[15] - m[8]*m[7]*m[14] - m[12]*m[6]*m[11] + m[12]*m[7]*m[10];
  inv[8] = m[4]*m[9]*m[15] - m[4]*m[11]*m[13] - m[8]*m[5]*m[15] + m[8]*m[7]*m[13] + m[12]*m[5]*m[11] - m[12]*m[7]*m[9];
  inv[12] = -m[4]*m[9]*m[14] + m[4]*m[10]*m[13] + m[8]*m[5]*m[14] - m[8]*m[6]*m[13] - m[12]*m[5]*m[10] + m[12]*m[6]*m[9];
  inv[1] = -m[1]*m[10]*m[15] + m[1]*m[11]*m[14] + m[9]*m[2]*m[15] - m[9]*m[3]*m[14] - m[13]*m[2]*m[11] + m[13]*m[3]*m[10];
  inv[5] = m[0]*m[10]*m[15] - m[0]*m[11]*m[14] - m[8]*m[2]*m[15] + m[8]*m[3]*m[14] + m[12]*m[2]*m[11] - m[12]*m[3]*m[10];
  inv[9] = -m[0]*m[9]*m[15] + m[0]*m[11]*m[13] + m[8]*m[1]*m[15] - m[8]*m[3]*m[13] - m[12]*m[1]*m[11] + m[12]*m[3]*m[9];
  inv[13] = m[0]*m[9]*m[14] - m[0]*m[10]*m[13] - m[8]*m[1]*m[14] + m[8]*m[2]*m[13] + m[12]*m[1]*m[10] - m[12]*m[2]*m[9];
  inv[2] = m[1]*m[6]*m[15] - m[1]*m[7]*m[14] - m[5]*m[2]*m[15] + m[5]*m[3]*m[14] + m[13]*m[2]*m[7] - m[13]*m[3]*m[6];
  inv[6] = -m[0]*m[6]*m[15] + m[0]*m[7]*m[14] + m[4]*m[2]*m[15] - m[4]*m[3]*m[14] - m[12]*m[2]*m[7] + m[12]*m[3]*m[6];
  inv[10] = m[0]*m[5]*m[15] - m[0]*m[7]*m[13] - m[4]*m[1]*m[15] + m[4]*m[3]*m[13] + m[12]*m[1]*m[7] - m[12]*m[3]*m[5];
  inv[14] = -m[0]*m[5]*m[14] + m[0]*m[6]*m[13] + m[4]*m[1]*m[14] - m[4]*m[2]*m[13] - m[12]*m[1]*m[6] + m[12]*m[2]*m[5];
  inv[3] = -m[1]*m[6]*m[11] + m[1]*m[7]*m[10] + m[5]*m[2]*m[11] - m[5]*m[3]*m[10] - m[9]*m[2]*m[7] + m[9]*m[3]*m[6];
  inv[7] = m[0]*m[6]*m[11] - m[0]*m[7]*m[10] - m[4]*m[2]*m[11] + m[4]*m[3]*m[10] + m[8]*m[2]*m[7] - m[8]*m[3]*m[6];
  inv[11] = -m[0]*m[5]*m[11] + m[0]*m[7]*m[9] + m[4]*m[1]*m[11] - m[4]*m[3]*m[9] - m[8]*m[1]*m[7] + m[8]*m[3]*m[5];
  inv[15] = m[0]*m[5]*m[10] - m[0]*m[6]*m[9] - m[4]*m[1]*m[10] + m[4]*m[2]*m[9] + m[8]*m[1]*m[6] - m[8]*m[2]*m[5];

  let det = m[0]*inv[0] + m[1]*inv[4] + m[2]*inv[8] + m[3]*inv[12];
  if (Math.abs(det) < 1e-12) return mat4Identity();
  det = 1.0 / det;
  for (let i = 0; i < 16; i++) inv[i] *= det;
  return inv;
}

function unprojectPoint(ndcX, ndcY, ndcZ, invVP) {
  const x = invVP[0]*ndcX + invVP[4]*ndcY + invVP[8]*ndcZ + invVP[12];
  const y = invVP[1]*ndcX + invVP[5]*ndcY + invVP[9]*ndcZ + invVP[13];
  const z = invVP[2]*ndcX + invVP[6]*ndcY + invVP[10]*ndcZ + invVP[14];
  const w = invVP[3]*ndcX + invVP[7]*ndcY + invVP[11]*ndcZ + invVP[15];
  const invW = Math.abs(w) > 1e-8 ? 1.0 / w : 1.0;
  return [x * invW, y * invW, z * invW];
}

function projectWorldToScreen(wx, wy, wz, vpMat, screenW, screenH) {
  const cx = vpMat[0]*wx + vpMat[4]*wy + vpMat[8]*wz + vpMat[12];
  const cy = vpMat[1]*wx + vpMat[5]*wy + vpMat[9]*wz + vpMat[13];
  const cw = vpMat[3]*wx + vpMat[7]*wy + vpMat[11]*wz + vpMat[15];
  if (cw <= 0.05) return null;
  const ndcX = cx / cw;
  const ndcY = cy / cw;
  return {
    x: (ndcX * 0.5 + 0.5) * screenW,
    y: (1.0 - (ndcY * 0.5 + 0.5)) * screenH,
  };
}

// ==================== BROWSER UI & WEBGL INITIALIZATION ====================
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.HyperTexEngine = {
    engine,
    initEngine,
    initCharacterTemplate,
    populateInternalOrgans,
    computeBodyProportionsFromHead,
    syncProportionalRigToHeadSize,
    getJointForPart,
    generateHyperbuildHBObject,
    serializeHBFile,
    deserializeHBFile,
    updateCulling,
    raycastVoxelDDA,
    buildHyperbuildAtlasPixels,
    generateHyperbuild4DRigJSON,
    generateHyperbuild4DSpecText,
    serializeHT3DBuffer,
    deserializeHT3DBuffer,
  };

  initBrowserApp();
}

function initBrowserApp() {
  const canvas = document.getElementById('gl-canvas');
  const gl = canvas.getContext('webgl', {
    antialias: true,
    alpha: false,
    depth: true,
    preserveDrawingBuffer: true,
  });

  const vsSource = `
    attribute vec3 aPos;
    attribute vec4 aColor;
    uniform mat4 uVP;
    varying vec4 vColor;
    void main() {
      gl_Position = uVP * vec4(aPos, 1.0);
      vColor = aColor;
    }
  `;
  const fsSource = `
    precision mediump float;
    varying vec4 vColor;
    void main() {
      gl_FragColor = vColor;
    }
  `;

  let prog = null, aPosLoc = 0, aColorLoc = 0, uVPLoc = null;
  let opaqueBuf = null, transBuf = null, edgeBuf = null, dynamicBuf = null;
  let opaqueVertCount = 0, transVertCount = 0, edgeVertCount = 0;

  if (gl) {
    const compileShader = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    aPosLoc = gl.getAttribLocation(prog, 'aPos');
    aColorLoc = gl.getAttribLocation(prog, 'aColor');
    uVPLoc = gl.getUniformLocation(prog, 'uVP');

    opaqueBuf = gl.createBuffer();
    transBuf = gl.createBuffer();
    edgeBuf = gl.createBuffer();
    dynamicBuf = gl.createBuffer();
  }

  let scratchOpaque = new Float32Array(600000 * 7);
  let scratchTrans = new Float32Array(300000 * 7);
  let scratchEdges = new Float32Array(500000 * 7);

  function ensureCapacity(arr, neededFloats) {
    if (arr.length >= neededFloats) return arr;
    return new Float32Array(Math.max(neededFloats, arr.length * 2));
  }

  function rebuildVoxelBuffers() {
    if (!gl || !engine.active) return;
    const { gridX: gx, gridY: gy, gridZ: gz, active, mask, partId, color, smoothShading, xrayOuterShell, isCharacterMode } = engine;

    let oPtr = 0;
    let tPtr = 0;
    let ePtr = 0;

    const pushQuad = (isTrans, x0, y0, z0, x1, y1, z1, x2, y2, z2, x3, y3, z3, r, g, b, a) => {
      if (isTrans) {
        if (tPtr + 42 >= scratchTrans.length) scratchTrans = ensureCapacity(scratchTrans, tPtr + 84000);
        const arr = scratchTrans;
        arr[tPtr++] = x0; arr[tPtr++] = y0; arr[tPtr++] = z0; arr[tPtr++] = r; arr[tPtr++] = g; arr[tPtr++] = b; arr[tPtr++] = a;
        arr[tPtr++] = x1; arr[tPtr++] = y1; arr[tPtr++] = z1; arr[tPtr++] = r; arr[tPtr++] = g; arr[tPtr++] = b; arr[tPtr++] = a;
        arr[tPtr++] = x2; arr[tPtr++] = y2; arr[tPtr++] = z2; arr[tPtr++] = r; arr[tPtr++] = g; arr[tPtr++] = b; arr[tPtr++] = a;
        arr[tPtr++] = x0; arr[tPtr++] = y0; arr[tPtr++] = z0; arr[tPtr++] = r; arr[tPtr++] = g; arr[tPtr++] = b; arr[tPtr++] = a;
        arr[tPtr++] = x2; arr[tPtr++] = y2; arr[tPtr++] = z2; arr[tPtr++] = r; arr[tPtr++] = g; arr[tPtr++] = b; arr[tPtr++] = a;
        arr[tPtr++] = x3; arr[tPtr++] = y3; arr[tPtr++] = z3; arr[tPtr++] = r; arr[tPtr++] = g; arr[tPtr++] = b; arr[tPtr++] = a;
      } else {
        if (oPtr + 42 >= scratchOpaque.length) scratchOpaque = ensureCapacity(scratchOpaque, oPtr + 140000);
        const arr = scratchOpaque;
        arr[oPtr++] = x0; arr[oPtr++] = y0; arr[oPtr++] = z0; arr[oPtr++] = r; arr[oPtr++] = g; arr[oPtr++] = b; arr[oPtr++] = a;
        arr[oPtr++] = x1; arr[oPtr++] = y1; arr[oPtr++] = z1; arr[oPtr++] = r; arr[oPtr++] = g; arr[oPtr++] = b; arr[oPtr++] = a;
        arr[oPtr++] = x2; arr[oPtr++] = y2; arr[oPtr++] = z2; arr[oPtr++] = r; arr[oPtr++] = g; arr[oPtr++] = b; arr[oPtr++] = a;
        arr[oPtr++] = x0; arr[oPtr++] = y0; arr[oPtr++] = z0; arr[oPtr++] = r; arr[oPtr++] = g; arr[oPtr++] = b; arr[oPtr++] = a;
        arr[oPtr++] = x2; arr[oPtr++] = y2; arr[oPtr++] = z2; arr[oPtr++] = r; arr[oPtr++] = g; arr[oPtr++] = b; arr[oPtr++] = a;
        arr[oPtr++] = x3; arr[oPtr++] = y3; arr[oPtr++] = z3; arr[oPtr++] = r; arr[oPtr++] = g; arr[oPtr++] = b; arr[oPtr++] = a;
      }

      if (engine.showWireframe && !isTrans) {
        if (ePtr + 56 >= scratchEdges.length) scratchEdges = ensureCapacity(scratchEdges, ePtr + 140000);
        const ea = scratchEdges;
        const er = 0.04, eg = 0.06, eb = 0.1, eAlpha = 0.25;
        ea[ePtr++] = x0; ea[ePtr++] = y0; ea[ePtr++] = z0; ea[ePtr++] = er; ea[ePtr++] = eg; ea[ePtr++] = eb; ea[ePtr++] = eAlpha;
        ea[ePtr++] = x1; ea[ePtr++] = y1; ea[ePtr++] = z1; ea[ePtr++] = er; ea[ePtr++] = eg; ea[ePtr++] = eb; ea[ePtr++] = eAlpha;
        ea[ePtr++] = x1; ea[ePtr++] = y1; ea[ePtr++] = z1; ea[ePtr++] = er; ea[ePtr++] = eg; ea[ePtr++] = eb; ea[ePtr++] = eAlpha;
        ea[ePtr++] = x2; ea[ePtr++] = y2; ea[ePtr++] = z2; ea[ePtr++] = er; ea[ePtr++] = eg; ea[ePtr++] = eb; ea[ePtr++] = eAlpha;
      }
    };

    for (let z = 0; z < gz; z++) {
      for (let y = 0; y < gy; y++) {
        for (let x = 0; x < gx; x++) {
          const idx = z * gx * gy + y * gx + x;
          const m = mask[idx];
          if (!active[idx] || m === 0) continue;

          const pid = partId[idx];
          const c4 = idx * 4;
          const br = color[c4] / 255;
          const bg = color[c4 + 1] / 255;
          const bb = color[c4 + 2] / 255;
          let ba = color[c4 + 3] / 255;

          if (color[c4 + 3] === 0) {
            if (ePtr + 56 < scratchEdges.length) {
              const ea = scratchEdges;
              ea[ePtr++] = x; ea[ePtr++] = y; ea[ePtr++] = z; ea[ePtr++] = 1; ea[ePtr++] = 0.2; ea[ePtr++] = 0.2; ea[ePtr++] = 0.6;
              ea[ePtr++] = x + 1; ea[ePtr++] = y + 1; ea[ePtr++] = z + 1; ea[ePtr++] = 1; ea[ePtr++] = 0.2; ea[ePtr++] = 0.2; ea[ePtr++] = 0.6;
            }
            continue;
          }

          const isOuterXray = isCharacterMode && xrayOuterShell && pid >= 1 && pid <= 11;
          if (isOuterXray) ba = 0.20;
          const isTrans = ba < 0.99;

          const sTop = smoothShading ? 1.05 : 1.0;
          const sBot = smoothShading ? 0.54 : 1.0;
          const sFrt = smoothShading ? 0.93 : 1.0;
          const sBck = smoothShading ? 0.78 : 1.0;
          const sRgt = smoothShading ? 0.85 : 1.0;
          const sLft = smoothShading ? 0.69 : 1.0;

          if (m & 4) {
            pushQuad(isTrans, x, y + 1, z, x, y + 1, z + 1, x + 1, y + 1, z + 1, x + 1, y + 1, z,
              Math.min(1, br * sTop), Math.min(1, bg * sTop), Math.min(1, bb * sTop), ba);
          }
          if (m & 8) {
            pushQuad(isTrans, x, y, z, x + 1, y, z, x + 1, y, z + 1, x, y, z + 1,
              br * sBot, bg * sBot, bb * sBot, ba);
          }
          if (m & 16) {
            pushQuad(isTrans, x, y, z + 1, x + 1, y, z + 1, x + 1, y + 1, z + 1, x, y + 1, z + 1,
              br * sFrt, bg * sFrt, bb * sFrt, ba);
          }
          if (m & 32) {
            pushQuad(isTrans, x + 1, y, z, x, y, z, x, y + 1, z, x + 1, y + 1, z,
              br * sBck, bg * sBck, bb * sBck, ba);
          }
          if (m & 1) {
            pushQuad(isTrans, x + 1, y, z + 1, x + 1, y, z, x + 1, y + 1, z, x + 1, y + 1, z + 1,
              br * sRgt, bg * sRgt, bb * sRgt, ba);
          }
          if (m & 2) {
            pushQuad(isTrans, x, y, z, x, y, z + 1, x, y + 1, z + 1, x, y + 1, z,
              br * sLft, bg * sLft, bb * sLft, ba);
          }
        }
      }
    }

    opaqueVertCount = oPtr / 7;
    transVertCount = tPtr / 7;
    edgeVertCount = ePtr / 7;

    gl.bindBuffer(gl.ARRAY_BUFFER, opaqueBuf);
    gl.bufferData(gl.ARRAY_BUFFER, scratchOpaque.subarray(0, oPtr), gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, transBuf);
    gl.bufferData(gl.ARRAY_BUFFER, scratchTrans.subarray(0, tPtr), gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, edgeBuf);
    gl.bufferData(gl.ARRAY_BUFFER, scratchEdges.subarray(0, ePtr), gl.DYNAMIC_DRAW);

    engine.meshDirty = false;
  }

  function bindInterleavedBuffer(buf) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 3, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(aColorLoc);
    gl.vertexAttribPointer(aColorLoc, 4, gl.FLOAT, false, 28, 12);
  }

  function pushLineSeg(arr, x0, y0, z0, x1, y1, z1, r, g, b, a) {
    arr.push(x0, y0, z0, r, g, b, a, x1, y1, z1, r, g, b, a);
  }

  function pushWireBox(arr, minX, minY, minZ, maxX, maxY, maxZ, r, g, b, a) {
    pushLineSeg(arr, minX, minY, minZ, maxX, minY, minZ, r, g, b, a);
    pushLineSeg(arr, maxX, minY, minZ, maxX, minY, maxZ, r, g, b, a);
    pushLineSeg(arr, maxX, minY, maxZ, minX, minY, maxZ, r, g, b, a);
    pushLineSeg(arr, minX, minY, maxZ, minX, minY, minZ, r, g, b, a);
    pushLineSeg(arr, minX, maxY, minZ, maxX, maxY, minZ, r, g, b, a);
    pushLineSeg(arr, maxX, maxY, minZ, maxX, maxY, maxZ, r, g, b, a);
    pushLineSeg(arr, maxX, maxY, maxZ, minX, maxY, maxZ, r, g, b, a);
    pushLineSeg(arr, minX, maxY, maxZ, minX, maxY, minZ, r, g, b, a);
    pushLineSeg(arr, minX, minY, minZ, minX, maxY, minZ, r, g, b, a);
    pushLineSeg(arr, maxX, minY, minZ, maxX, maxY, minZ, r, g, b, a);
    pushLineSeg(arr, maxX, minY, maxZ, maxX, maxY, maxZ, r, g, b, a);
    pushLineSeg(arr, minX, minY, maxZ, minX, maxY, maxZ, r, g, b, a);
  }

  // ==================== UI ELEMENTS & DOM WIRING ====================
  const startupScreen = document.getElementById('startup-screen');
  const backupScreen = document.getElementById('backup-screen');
  const import2DScreen = document.getElementById('import-2d-screen');
  const topHud = document.getElementById('top-hud');
  const bottomHotbarWrap = document.getElementById('bottom-hotbar-wrap');
  const charPartPanel = document.getElementById('char-part-panel');
  const sliceControlBar = document.getElementById('slice-control-bar');
  const pasteControlBar = document.getElementById('paste-control-bar');
  const crosshairEl = document.getElementById('crosshair');
  const statusToast = document.getElementById('status-toast');
  const hudCoordsText = document.getElementById('hud-coords-text');
  const fpsCounterEl = document.getElementById('fps-counter');

  let statusTimer = 0;
  function setStatus(msg) {
    if (statusToast) statusToast.textContent = msg;
    statusTimer = 4.0;
  }

  function syncAppStateDOM() {
    const st = engine.appState;
    document.body.dataset.state =
      st === STATE_STARTUP ? 'startup' : st === STATE_EDITOR ? 'editor' : st === STATE_BACKUP_LIST ? 'backups' : 'import2d';

    startupScreen.classList.toggle('hidden', st !== STATE_STARTUP);
    backupScreen.classList.toggle('hidden', st !== STATE_BACKUP_LIST);
    import2DScreen.classList.toggle('hidden', st !== STATE_IMPORT_2D);

    const inEditor = st === STATE_EDITOR;
    topHud.classList.toggle('hidden', !inEditor);
    bottomHotbarWrap.classList.toggle('hidden', !inEditor);
    charPartPanel.classList.toggle('hidden', !(inEditor && engine.isCharacterMode));
    sliceControlBar.classList.toggle('hidden', !(inEditor && engine.hpState > 0));
    pasteControlBar.classList.toggle('hidden', !(inEditor && engine.isPasting));
    crosshairEl.classList.toggle('hidden', !(inEditor && engine.isMouseLocked));
  }

  // ==================== PROPORTIONAL HEAD SIZE UI SYNC ====================
  function updateHeadProportionUI(headVal) {
    const H = Math.max(8, Math.min(28, Math.round(Number(headVal) || 16)));
    engine.headSize = H;
    const props = computeBodyProportionsFromHead(H);

    const startupHeadIn = document.getElementById('input-head-size');
    if (startupHeadIn && document.activeElement !== startupHeadIn) startupHeadIn.value = String(H);

    const invHeadIn = document.getElementById('inv-head-size-input');
    if (invHeadIn && document.activeElement !== invHeadIn) invHeadIn.value = String(H);

    document.querySelectorAll('.btn-head-preset').forEach((btn) => {
      btn.classList.toggle('active', Number(btn.dataset.hsize) === H);
    });

    const readout = document.getElementById('head-proportion-readout');
    if (readout) {
      readout.textContent = `Head ${H}×${H}×${H} → Proportional Body: Torso ${props.fullTorso.join('×')} · Limbs ${props.armUpper.join('×')} · Grid ${props.workspaceDimensions.join('×')}`;
    }

    const exportHeadLbl = document.getElementById('export-hb-head-label');
    if (exportHeadLbl) {
      exportHeadLbl.textContent = `${H}×${H}×${H}`;
    }
  }

  document.querySelectorAll('.btn-head-preset').forEach((btn) => {
    btn.addEventListener('click', () => {
      const H = parseInt(btn.dataset.hsize, 10) || 16;
      updateHeadProportionUI(H);
    });
  });

  document.getElementById('input-head-size')?.addEventListener('input', (e) => {
    updateHeadProportionUI(parseInt(e.target.value, 10) || 16);
  });

  document.getElementById('inv-head-size-input')?.addEventListener('input', (e) => {
    updateHeadProportionUI(parseInt(e.target.value, 10) || 16);
  });

  // ==================== AUTO-BACKUP SYSTEM (LOCALSTORAGE) ====================
  const BACKUP_STORAGE_KEY = 'hypertex3d_backups_v2';
  let backupList = [];

  function loadBackupsFromStorage() {
    try {
      const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
      if (raw) {
        backupList = JSON.parse(raw) || [];
      }
    } catch {
      backupList = [];
    }
    const countEl = document.getElementById('startup-backup-count');
    if (countEl) countEl.textContent = String(backupList.length);
  }

  function saveBackupSnapshot(manual = false) {
    if (!engine.active || engine.activeVoxelCount === 0) return;
    const sparse = [];
    for (let i = 0; i < engine.totalVoxels; i++) {
      if (engine.active[i]) {
        const c4 = i * 4;
        sparse.push(
          i,
          engine.partId[i],
          (engine.color[c4] << 24) | (engine.color[c4 + 1] << 16) | (engine.color[c4 + 2] << 8) | engine.color[c4 + 3]
        );
      }
    }

    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}  ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    backupList.unshift({
      id: Date.now() + '_' + Math.floor(Math.random() * 1000),
      timestamp: ts,
      sx: engine.gridX,
      sy: engine.gridY,
      sz: engine.gridZ,
      headSize: engine.headSize || 16,
      isCharMode: engine.isCharacterMode,
      voxelCount: engine.activeVoxelCount,
      sparse,
    });

    if (backupList.length > MAX_BACKUPS) backupList.length = MAX_BACKUPS;
    try {
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backupList));
    } catch {
      if (backupList.length > 8) {
        backupList.length = 8;
        try { localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(backupList)); } catch {}
      }
    }
    const countEl = document.getElementById('startup-backup-count');
    if (countEl) countEl.textContent = String(backupList.length);
    if (manual) setStatus(`Backup Snapshot Saved (${engine.activeVoxelCount} voxels)`);
  }

  function restoreBackupEntry(entry) {
    if (!entry) return;
    if (entry.headSize) updateHeadProportionUI(entry.headSize);
    initEngine(entry.sx, entry.sy, entry.sz);
    engine.isCharacterMode = !!entry.isCharMode;
    if (engine.isCharacterMode) {
      syncProportionalRigToHeadSize(entry.headSize || Math.max(8, Math.round(entry.sx / 3)));
    }
    const sp = entry.sparse || [];
    for (let i = 0; i < sp.length; i += 3) {
      const idx = sp[i];
      const pid = sp[i + 1];
      const rgba = sp[i + 2];
      if (idx >= 0 && idx < engine.totalVoxels) {
        engine.active[idx] = 1;
        engine.partId[idx] = pid;
        const c4 = idx * 4;
        engine.color[c4] = (rgba >>> 24) & 0xff;
        engine.color[c4 + 1] = (rgba >>> 16) & 0xff;
        engine.color[c4 + 2] = (rgba >>> 8) & 0xff;
        engine.color[c4 + 3] = rgba & 0xff;
      }
    }
    updateCulling();
    engine.cameraPos = [engine.gridX / 2, engine.gridY * 0.52, Math.max(engine.gridX, engine.gridZ) * 1.38];
    engine.cameraAngle = [-Math.PI / 2, -0.05];
    engine.appState = STATE_EDITOR;
    syncAppStateDOM();
    renderCharacterPartList();
    renderHotbarDOM();
    setStatus(`Restored Backup from ${entry.timestamp}`);
  }

  function renderBackupListDOM() {
    loadBackupsFromStorage();
    const container = document.getElementById('backup-list-grid');
    if (!container) return;
    container.innerHTML = '';

    if (backupList.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.style.color = '#ffd43b';
      emptyMsg.style.fontSize = '16px';
      emptyMsg.textContent = 'No backups found yet. Backups are saved automatically every 5 seconds while editing.';
      container.appendChild(emptyMsg);
      return;
    }

    backupList.forEach((b, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `backup-item-btn ${idx === 0 ? 'latest' : ''}`;
      const modeStr = b.isCharMode ? `HYPERBUILD 4D CHAR (Head ${b.headSize || 16}³)` : 'CUSTOM XYZ';
      btn.innerHTML = `
        <span>#${String(idx + 1).padStart(2, '0')} | ${b.timestamp} | Size: ${b.sx}×${b.sy}×${b.sz}</span>
        <span>${modeStr} (${b.voxelCount || 0} vox)</span>
      `;
      btn.addEventListener('click', () => restoreBackupEntry(b));
      container.appendChild(btn);
    });
  }

  // ==================== CHARACTER & INTERNAL ORGANS PANEL ====================
  function renderCharacterPartList() {
    const container = document.getElementById('part-list-container');
    if (!container) return;
    container.innerHTML = '';

    const targetLabel = document.getElementById('active-paint-part-label');
    if (targetLabel) {
      const activeId = engine.paintTargetPart || engine.activePartFilter;
      if (activeId > 0 && BODY_PART_SPECS[activeId]) {
        const sp = BODY_PART_SPECS[activeId];
        targetLabel.textContent = `${sp.name} → [${sp.followJoint}]`;
      } else {
        targetLabel.textContent = `Auto / Surface (Head ${engine.headSize}³)`;
      }
    }

    for (let i = 1; i <= NUM_BODY_PARTS; i++) {
      const spec = BODY_PART_SPECS[i];
      const isOrgan = i >= 12;
      if (engine.partTabFilter === 'outer' && isOrgan) continue;
      if (engine.partTabFilter === 'organs' && !isOrgan) continue;

      const row = document.createElement('div');
      row.className = 'part-row';

      const isSolo = engine.activePartFilter === i;
      const isHid = !!engine.partHidden[i];

      const soloBtn = document.createElement('button');
      soloBtn.type = 'button';
      soloBtn.className = `btn-part-solo ${isOrgan ? 'organ-row' : ''} ${isSolo ? 'solo-active' : ''} ${isHid ? 'part-muted' : ''}`;
      soloBtn.title = `Follows Joint: ${spec.followJoint}`;
      soloBtn.innerHTML = `
        <span class="part-swatch-dot" style="background:${spec.color}"></span>
        <span>${spec.name} <small style="opacity:0.7">[${spec.followJoint}]</small></span>
      `;
      soloBtn.addEventListener('click', () => {
        if (engine.activePartFilter === i) {
          engine.activePartFilter = 0;
          engine.paintTargetPart = 0;
        } else {
          engine.activePartFilter = i;
          engine.paintTargetPart = i;
          engine.partHidden[i] = 0;
        }
        updateCulling();
        renderCharacterPartList();
      });

      const visBtn = document.createElement('button');
      visBtn.type = 'button';
      visBtn.className = `btn-part-vis ${isHid ? 'vis-off' : 'vis-on'}`;
      visBtn.textContent = isHid ? 'HIDDEN' : 'SHOW';
      visBtn.setAttribute('aria-label', `${isHid ? 'Show' : 'Hide'} ${spec.name}`);
      visBtn.addEventListener('click', () => {
        engine.partHidden[i] = engine.partHidden[i] ? 0 : 1;
        if (engine.partHidden[i] && engine.activePartFilter === i) {
          engine.activePartFilter = 0;
        }
        updateCulling();
        renderCharacterPartList();
      });

      row.appendChild(soloBtn);
      row.appendChild(visBtn);
      container.appendChild(row);
    }

    const showAllBtn = document.getElementById('btn-show-all-parts');
    if (showAllBtn) {
      showAllBtn.classList.toggle('active', engine.activePartFilter === 0);
    }
  }

  const charHeader = document.getElementById('char-panel-header');
  let isDraggingPanel = false;
  let panelDragOff = [0, 0];

  if (charHeader) {
    charHeader.addEventListener('mousedown', (e) => {
      if (e.target.closest('button')) return;
      isDraggingPanel = true;
      const rect = charPartPanel.getBoundingClientRect();
      panelDragOff = [e.clientX - rect.left, e.clientY - rect.top];
    });
  }

  window.addEventListener('mousemove', (e) => {
    if (!isDraggingPanel) return;
    const pw = charPartPanel.offsetWidth || 280;
    const ph = charPartPanel.offsetHeight || 420;
    const nx = Math.max(4, Math.min(window.innerWidth - pw - 4, e.clientX - panelDragOff[0]));
    const ny = Math.max(50, Math.min(window.innerHeight - ph - 4, e.clientY - panelDragOff[1]));
    charPartPanel.style.left = `${nx}px`;
    charPartPanel.style.top = `${ny}px`;
    charPartPanel.style.right = 'auto';
  });

  window.addEventListener('mouseup', () => {
    isDraggingPanel = false;
  });

  document.getElementById('btn-collapse-char-panel')?.addEventListener('click', () => {
    const body = document.getElementById('char-panel-body');
    const btn = document.getElementById('btn-collapse-char-panel');
    if (body) {
      const hidden = body.classList.toggle('hidden');
      if (btn) btn.textContent = hidden ? '+' : '-';
    }
  });

  document.querySelectorAll('.part-filter-tabs .tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.part-filter-tabs .tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      engine.partTabFilter = btn.dataset.tab || 'all';
      renderCharacterPartList();
    });
  });

  document.getElementById('btn-show-all-parts')?.addEventListener('click', () => {
    engine.activePartFilter = 0;
    engine.paintTargetPart = 0;
    engine.partHidden.fill(0);
    updateCulling();
    renderCharacterPartList();
    setStatus('All 11 Outer Parts & 9 Internal Organs Visible');
  });

  document.getElementById('btn-peel-outer-skin')?.addEventListener('click', () => {
    engine.activePartFilter = 0;
    let anyOuterVisible = false;
    for (let i = 1; i <= 11; i++) {
      if (!engine.partHidden[i]) anyOuterVisible = true;
    }
    for (let i = 1; i <= 11; i++) {
      engine.partHidden[i] = anyOuterVisible ? 1 : 0;
    }
    for (let i = 12; i <= 20; i++) {
      engine.partHidden[i] = 0;
    }
    updateCulling();
    renderCharacterPartList();
    setStatus(anyOuterVisible ? 'Outer Skin Hidden — Showing 9 Internal 3D Organs & Skeleton!' : 'Outer Body Shell Restored');
  });

  document.getElementById('btn-toggle-joints')?.addEventListener('click', (e) => {
    engine.showJointsOverlay = !engine.showJointsOverlay;
    const btn = e.currentTarget;
    btn.classList.toggle('active', engine.showJointsOverlay);
    btn.textContent = engine.showJointsOverlay ? '10 JOINTS RIG: VISIBLE' : '10 JOINTS RIG: HIDDEN';
  });

  document.getElementById('btn-toggle-organ-pulse')?.addEventListener('click', (e) => {
    engine.organPulseAnim = !engine.organPulseAnim;
    const btn = e.currentTarget;
    btn.classList.toggle('active', engine.organPulseAnim);
    btn.textContent = engine.organPulseAnim ? '4D ORGAN PULSE: ON' : '4D ORGAN PULSE: OFF';
  });

  // ==================== BOTTOM HOTBAR RENDERING ====================
  const TOOL_SHORT_NAMES = ['BRUSH', '2D RECT', '3D LINE', 'SELECT', 'PICKER', 'ERASER', '3D BOX', 'SPHERE'];

  function renderHotbarDOM() {
    const bar = document.getElementById('hotbar-slots');
    if (!bar) return;
    bar.innerHTML = '';

    for (let i = 0; i < 10; i++) {
      const slot = document.createElement('button');
      slot.type = 'button';
      slot.className = `hotbar-slot ${engine.selColorIdx === i ? 'selected' : ''}`;
      const keyNum = i === 9 ? 0 : i + 1;

      if (i === 0) {
        slot.style.background = '#c85f14';
        slot.setAttribute('aria-label', `Slot 1 Tool ${TOOL_SHORT_NAMES[engine.currentTool]}`);
        slot.innerHTML = `<span class="slot-key">[1]</span><span class="slot-label">${TOOL_SHORT_NAMES[engine.currentTool]}</span>`;
        slot.addEventListener('click', () => openModal('tools-popup'));
      } else if (i === 1) {
        const hpNames = ['PLANE', 'Y-SLICE', 'X-SLICE', 'Z-SLICE'];
        slot.style.background = engine.hpState > 0 ? '#1b6e3d' : '#782832';
        slot.setAttribute('aria-label', `Slot 2 Hyperplane ${hpNames[engine.hpState]}`);
        slot.innerHTML = `<span class="slot-key">[2]</span><span class="slot-label">${hpNames[engine.hpState]}</span>`;
        slot.addEventListener('click', () => cycleHyperplane());
      } else if (i === 2) {
        slot.style.background = '#232837';
        slot.setAttribute('aria-label', 'Slot 3 Air Invisible Collider');
        slot.innerHTML = `<span class="slot-key">[3]</span><span class="slot-label">AIR/INV</span>`;
        slot.addEventListener('click', () => {
          engine.selColorIdx = 2;
          engine.currentTool = TOOL_BRUSH;
          renderHotbarDOM();
        });
      } else if (i === 3) {
        const [r, g, b, a] = engine.hotbar[3];
        slot.style.background = `rgba(${r},${g},${b},${a / 255})`;
        slot.setAttribute('aria-label', 'Slot 4 Custom Color Palette');
        slot.innerHTML = `<span class="slot-palette-strip"></span><span class="slot-key">[4]</span><span class="slot-label">PALETTE</span>`;
        slot.addEventListener('click', () => {
          engine.selColorIdx = 3;
          if (engine.currentTool === TOOL_ERASER || engine.currentTool === TOOL_PICKER) {
            engine.currentTool = TOOL_BRUSH;
          }
          renderHotbarDOM();
          openSlot4PaletteModal();
        });
      } else {
        const [r, g, b, a] = engine.hotbar[i];
        slot.style.background = `rgba(${r},${g},${b},${a / 255})`;
        slot.setAttribute('aria-label', `Slot ${keyNum} Color Swatch`);
        slot.innerHTML = `<span class="slot-key">[${keyNum}]</span><span class="slot-label">COLOR</span>`;
        slot.addEventListener('click', () => {
          engine.selColorIdx = i;
          if (engine.currentTool === TOOL_ERASER || engine.currentTool === TOOL_PICKER) {
            engine.currentTool = TOOL_BRUSH;
          }
          renderHotbarDOM();
        });
      }

      bar.appendChild(slot);
    }
  }

  function cycleHyperplane() {
    engine.hpState = (engine.hpState + 1) % 4;
    const slider = document.getElementById('slice-slider');
    const label = document.getElementById('slice-axis-label');
    if (engine.hpState === 1) {
      engine.hpPos = Math.floor(engine.gridY / 2);
      if (slider) { slider.max = String(engine.gridY - 1); slider.value = String(engine.hpPos); }
      if (label) label.textContent = `Y-SLICE POS: ${engine.hpPos}`;
    } else if (engine.hpState === 2) {
      engine.hpPos = Math.floor(engine.gridX / 2);
      if (slider) { slider.max = String(engine.gridX - 1); slider.value = String(engine.hpPos); }
      if (label) label.textContent = `X-SLICE POS: ${engine.hpPos}`;
    } else if (engine.hpState === 3) {
      engine.hpPos = Math.floor(engine.gridZ / 2);
      if (slider) { slider.max = String(engine.gridZ - 1); slider.value = String(engine.hpPos); }
      if (label) label.textContent = `Z-SLICE POS: ${engine.hpPos}`;
    }
    updateCulling();
    syncAppStateDOM();
    renderHotbarDOM();
  }

  document.getElementById('slice-slider')?.addEventListener('input', (e) => {
    engine.hpPos = parseInt(e.target.value, 10) || 0;
    const names = ['3D', 'Y-SLICE', 'X-SLICE', 'Z-SLICE'];
    const label = document.getElementById('slice-axis-label');
    if (label) label.textContent = `${names[engine.hpState]} POS: ${engine.hpPos}`;
    updateCulling();
  });

  document.getElementById('btn-slice-dec')?.addEventListener('click', () => {
    engine.hpPos = Math.max(0, engine.hpPos - 1);
    const slider = document.getElementById('slice-slider');
    if (slider) slider.value = String(engine.hpPos);
    const names = ['3D', 'Y-SLICE', 'X-SLICE', 'Z-SLICE'];
    const label = document.getElementById('slice-axis-label');
    if (label) label.textContent = `${names[engine.hpState]} POS: ${engine.hpPos}`;
    updateCulling();
  });

  document.getElementById('btn-slice-inc')?.addEventListener('click', () => {
    const maxDim = engine.hpState === 1 ? engine.gridY - 1 : engine.hpState === 2 ? engine.gridX - 1 : engine.gridZ - 1;
    engine.hpPos = Math.min(maxDim, engine.hpPos + 1);
    const slider = document.getElementById('slice-slider');
    if (slider) slider.value = String(engine.hpPos);
    const names = ['3D', 'Y-SLICE', 'X-SLICE', 'Z-SLICE'];
    const label = document.getElementById('slice-axis-label');
    if (label) label.textContent = `${names[engine.hpState]} POS: ${engine.hpPos}`;
    updateCulling();
  });

  document.getElementById('chk-slice-cull')?.addEventListener('change', (e) => {
    engine.sliceCullAbove = e.target.checked;
    updateCulling();
  });

  document.getElementById('btn-slice-exit')?.addEventListener('click', () => {
    engine.hpState = 0;
    updateCulling();
    syncAppStateDOM();
    renderHotbarDOM();
  });

  // ==================== STARTUP SCREEN HANDLERS ====================
  const inputXEl = document.getElementById('input-x');
  const inputYEl = document.getElementById('input-y');
  const inputZEl = document.getElementById('input-z');

  document.querySelectorAll('.btn-step').forEach((btn) => {
    btn.addEventListener('click', () => {
      const axis = btn.dataset.axis;
      const delta = parseInt(btn.dataset.delta, 10) || 0;
      const target = axis === 'x' ? inputXEl : axis === 'y' ? inputYEl : inputZEl;
      if (target) {
        const cur = parseInt(target.value, 10) || 32;
        target.value = String(Math.max(4, Math.min(128, cur + delta)));
      }
    });
  });

  document.querySelectorAll('.btn-preset-dim').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [x, y, z] = (btn.dataset.dims || '32,32,32').split(',').map(Number);
      if (inputXEl) inputXEl.value = String(x);
      if (inputYEl) inputYEl.value = String(y);
      if (inputZEl) inputZEl.value = String(z);
    });
  });

  function startCustomXYZWorkspace() {
    const sx = parseInt(inputXEl?.value, 10) || 32;
    const sy = parseInt(inputYEl?.value, 10) || 32;
    const sz = parseInt(inputZEl?.value, 10) || 32;
    initEngine(sx, sy, sz);
    const cx = Math.floor(engine.gridX / 2);
    const cz = Math.floor(engine.gridZ / 2);
    fillBoxPart(Math.max(0, cx - 4), 0, Math.max(0, cz - 4), Math.min(engine.gridX - 1, cx + 3), 1, Math.min(engine.gridZ - 1, cz + 3), 0, [0, 180, 216, 255], 0, 6);
    updateCulling();

    engine.cameraPos = [engine.gridX / 2, engine.gridY * 0.48, Math.max(engine.gridX, engine.gridZ) * 1.35];
    engine.cameraAngle = [-Math.PI / 2, -0.18];
    engine.appState = STATE_EDITOR;
    syncAppStateDOM();
    renderHotbarDOM();
    setStatus(`Initialized ${engine.gridX}×${engine.gridY}×${engine.gridZ} Voxel Workspace`);
  }

  function startCharacterStudio() {
    const H = parseInt(document.getElementById('input-head-size')?.value, 10) || engine.headSize || 16;
    updateHeadProportionUI(H);
    initCharacterTemplate(H);
    const s = H / 16.0;
    engine.cameraPos = [24.0 * s, 34.0 * s, 96.0 * s];
    engine.cameraAngle = [-Math.PI / 2, -0.02];
    engine.appState = STATE_EDITOR;
    syncAppStateDOM();
    renderCharacterPartList();
    renderHotbarDOM();
    setStatus(`Hyperbuild 4D Character (Head ${H}×${H}×${H}) + Proportional Body & 9 Internal Organs Loaded!`);
  }

  document.getElementById('btn-confirm-xyz')?.addEventListener('click', startCustomXYZWorkspace);
  document.getElementById('btn-design-character')?.addEventListener('click', startCharacterStudio);
  document.getElementById('btn-startup-import-hb')?.addEventListener('click', () => {
    document.getElementById('load-hb-input')?.click();
  });
  document.getElementById('btn-startup-backup')?.addEventListener('click', () => {
    engine.prevStateBeforeBackup = STATE_STARTUP;
    engine.appState = STATE_BACKUP_LIST;
    renderBackupListDOM();
    syncAppStateDOM();
  });

  // ==================== TOP HUD CONTROLS ====================
  const fileMenuBtn = document.getElementById('btn-file-menu');
  const fileMenuDropdown = document.getElementById('file-menu-dropdown');

  fileMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHid = fileMenuDropdown.classList.toggle('hidden');
    fileMenuBtn.setAttribute('aria-expanded', String(!isHid));
  });

  window.addEventListener('click', () => {
    fileMenuDropdown?.classList.add('hidden');
    fileMenuBtn?.setAttribute('aria-expanded', 'false');
  });

  fileMenuDropdown?.querySelectorAll('button[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.action;
      fileMenuDropdown.classList.add('hidden');
      if (act === 'export-hb') {
        engine.exportFormat = 'hb-structure';
        openExportModal();
      } else if (act === 'import-hb') {
        document.getElementById('load-hb-input')?.click();
      } else if (act === 'save-project') {
        downloadHBFile('hyperbuild_4d_character.hb');
      } else if (act === 'save-as') {
        openModal('saveas-popup');
      } else if (act === 'export-png') {
        openExportModal();
      } else if (act === 'import-png') {
        openImport2DScreen();
      } else if (act === 'load-project') {
        document.getElementById('load-ht3d-input')?.click();
      } else if (act === 'open-backups') {
        engine.prevStateBeforeBackup = STATE_EDITOR;
        engine.appState = STATE_BACKUP_LIST;
        renderBackupListDOM();
        syncAppStateDOM();
      } else if (act === 'new-resize') {
        engine.appState = STATE_STARTUP;
        syncAppStateDOM();
      }
    });
  });

  document.getElementById('btn-quick-export-hb')?.addEventListener('click', () => {
    engine.exportFormat = 'hb-structure';
    openExportModal();
  });

  document.getElementById('btn-quick-import-hb')?.addEventListener('click', () => {
    document.getElementById('load-hb-input')?.click();
  });

  document.getElementById('btn-import-hb-file-screen')?.addEventListener('click', () => {
    document.getElementById('load-hb-input')?.click();
  });

  document.getElementById('btn-sidebar-load-hb')?.addEventListener('click', () => {
    document.getElementById('load-hb-input')?.click();
  });

  document.getElementById('btn-open-backup')?.addEventListener('click', () => {
    engine.prevStateBeforeBackup = STATE_EDITOR;
    engine.appState = STATE_BACKUP_LIST;
    renderBackupListDOM();
    syncAppStateDOM();
  });

  document.getElementById('btn-backup-back')?.addEventListener('click', () => {
    engine.appState = engine.prevStateBeforeBackup;
    syncAppStateDOM();
  });

  document.getElementById('btn-force-backup-now')?.addEventListener('click', () => {
    saveBackupSnapshot(true);
    renderBackupListDOM();
  });

  document.getElementById('btn-toggle-shading')?.addEventListener('click', (e) => {
    engine.smoothShading = !engine.smoothShading;
    engine.meshDirty = true;
    const btn = e.currentTarget;
    btn.textContent = engine.smoothShading ? 'SHADING: ON' : 'SHADING: OFF';
    btn.className = `btn-hud ${engine.smoothShading ? 'btn-green' : 'btn-slate'}`;
  });

  document.getElementById('btn-toggle-edges')?.addEventListener('click', (e) => {
    engine.showWireframe = !engine.showWireframe;
    engine.meshDirty = true;
    const btn = e.currentTarget;
    btn.textContent = engine.showWireframe ? 'EDGES: ON' : 'EDGES: OFF';
  });

  document.getElementById('btn-toggle-xray')?.addEventListener('click', (e) => {
    engine.xrayOuterShell = !engine.xrayOuterShell;
    updateCulling();
    const btn = e.currentTarget;
    btn.textContent = engine.xrayOuterShell ? 'X-RAY SHELL: ON' : 'X-RAY SHELL: OFF';
    btn.className = `btn-hud ${engine.xrayOuterShell ? 'btn-orange' : 'btn-purple'}`;
    setStatus(
      engine.xrayOuterShell
        ? 'X-Ray Shell ON: Outer Body Translucent — Inspecting & Sculpting 9 Internal 3D Organs!'
        : 'X-Ray Shell OFF: Solid Outer Body'
    );
  });

  document.getElementById('btn-toggle-cutaway')?.addEventListener('click', (e) => {
    engine.cutawayMode = (engine.cutawayMode + 1) % 3;
    updateCulling();
    const names = ['CUTAWAY: OFF', 'CUTAWAY: FRONT', 'CUTAWAY: SAGITTAL'];
    const btn = e.currentTarget;
    btn.textContent = names[engine.cutawayMode];
    btn.className = `btn-hud ${engine.cutawayMode > 0 ? 'btn-orange' : 'btn-slate'}`;
    setStatus(
      engine.cutawayMode === 0
        ? 'Anatomical Cutaway Disabled'
        : `${names[engine.cutawayMode]} — Outer Shell Opened to Expose Internal 3D Organs!`
    );
  });

  document.getElementById('btn-toggle-mirror')?.addEventListener('click', (e) => {
    engine.mirrorX = !engine.mirrorX;
    const btn = e.currentTarget;
    btn.textContent = engine.mirrorX ? 'MIRROR X: ON' : 'MIRROR X: OFF';
    btn.className = `btn-hud ${engine.mirrorX ? 'btn-green' : 'btn-slate'}`;
  });

  document.getElementById('btn-undo')?.addEventListener('click', () => {
    if (performUndo()) setStatus('Undo Applied');
  });

  document.getElementById('btn-redo')?.addEventListener('click', () => {
    if (performRedo()) setStatus('Redo Applied');
  });

  // ==================== MODALS & POPUPS LOGIC ====================
  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach((m) => m.classList.add('hidden'));
  }

  function openModal(id) {
    closeAllModals();
    document.getElementById(id)?.classList.remove('hidden');
  }

  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-close');
      if (target) document.getElementById(target)?.classList.add('hidden');
    });
  });

  document.querySelectorAll('.btn-tool-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-tool-item').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      engine.currentTool = parseInt(btn.dataset.tool, 10) || 0;
      closeAllModals();
      renderHotbarDOM();
    });
  });

  document.querySelectorAll('.btn-brush-sz').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-brush-sz').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      engine.brushSize = parseInt(btn.dataset.bsize, 10) || 1;
    });
  });

  // ==================== COLOR PICKER CANVASES (SLOT [4] & INVENTORY [E]) ====================
  const SWATCH_PRESETS = [
    '#E63946', '#FB5607', '#FFBE0B', '#06D6A0', '#118AB2', '#3A86FF', '#8338EC', '#FF006E',
    '#EBB491', '#C38764', '#6E462D', '#412819', '#F8F9FA', '#ADB5BD', '#495057', '#14181E',
    '#F06595', '#E03131', '#FF8787', '#F783AC', '#9C36B5', '#FFA94D', '#00F5D4', '#4DABF7',
  ];

  const slot4SwatchesGrid = document.getElementById('slot4-swatches-grid');
  if (slot4SwatchesGrid) {
    SWATCH_PRESETS.forEach((hex) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch-btn';
      b.style.background = hex;
      b.setAttribute('aria-label', `Select Swatch ${hex}`);
      b.addEventListener('click', () => {
        const rgba = hexToRgba(hex);
        rgba[3] = engine.currentAlpha;
        engine.hotbar[3] = rgba;
        engine.selColorIdx = 3;
        const [h, s, v] = rgbToHsv(rgba[0], rgba[1], rgba[2]);
        engine.pickerHue = h;
        engine.pickerSV = [s, v];
        syncPaletteControlsUI();
        renderHotbarDOM();
      });
      slot4SwatchesGrid.appendChild(b);
    });
  }

  function drawHueBarCanvas(canvasEl, curHue) {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    const w = canvasEl.width, h = canvasEl.height;
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#ff0000');
    grad.addColorStop(0.17, '#ffff00');
    grad.addColorStop(0.33, '#00ff00');
    grad.addColorStop(0.5, '#00ffff');
    grad.addColorStop(0.67, '#0000ff');
    grad.addColorStop(0.83, '#ff00ff');
    grad.addColorStop(1, '#ff0000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const cx = (curHue / 360) * w;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 3, 1, 6, h - 2);
  }

  function drawSVBoxCanvas(canvasEl, hue, sv) {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    const w = canvasEl.width, h = canvasEl.height;
    const [r, g, b] = hsvToRgb(hue, 1, 1);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, w, h);

    const whiteGrad = ctx.createLinearGradient(0, 0, w, 0);
    whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
    whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, w, h);

    const blackGrad = ctx.createLinearGradient(0, 0, 0, h);
    blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
    blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, w, h);

    const cx = sv[0] * w;
    const cy = (1 - sv[1]) * h;
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function syncPaletteControlsUI() {
    const targetSlot = engine.selColorIdx >= 3 ? engine.selColorIdx : 3;
    const [r, g, b, a] = engine.hotbar[targetSlot];
    const hex = rgbaToHex(r, g, b, a);

    drawHueBarCanvas(document.getElementById('slot4-hue-canvas'), engine.pickerHue);
    drawSVBoxCanvas(document.getElementById('slot4-sv-canvas'), engine.pickerHue, engine.pickerSV);
    drawHueBarCanvas(document.getElementById('inv-hue-canvas'), engine.pickerHue);
    drawSVBoxCanvas(document.getElementById('inv-sv-canvas'), engine.pickerHue, engine.pickerSV);

    const prevBox = document.getElementById('slot4-preview-box');
    if (prevBox) prevBox.style.background = `rgba(${r},${g},${b},${a / 255})`;

    const s4Hex = document.getElementById('slot4-hex-input');
    if (s4Hex && document.activeElement !== s4Hex) s4Hex.value = hex;
    const invHex = document.getElementById('inv-hex-input');
    if (invHex && document.activeElement !== invHex) invHex.value = hex;

    const s4AlphaVal = document.getElementById('slot4-alpha-val');
    if (s4AlphaVal) s4AlphaVal.textContent = String(a);
    const s4AlphaRange = document.getElementById('slot4-alpha-range');
    if (s4AlphaRange) s4AlphaRange.value = String(a);

    const invAlphaVal = document.getElementById('inv-alpha-val');
    if (invAlphaVal) invAlphaVal.textContent = String(a);
    const invAlphaRange = document.getElementById('inv-alpha-range');
    if (invAlphaRange) invAlphaRange.value = String(a);

    renderInventoryHotbarGrid();
  }

  function wireHSVCanvases(hueCanvasId, svCanvasId, forceSlot3) {
    const hueC = document.getElementById(hueCanvasId);
    const svC = document.getElementById(svCanvasId);
    let draggingHue = false, draggingSV = false;

    const updateFromHue = (e) => {
      const rect = hueC.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      engine.pickerHue = x * 360;
      const slot = forceSlot3 ? 3 : Math.max(3, engine.selColorIdx);
      const [r, g, b] = hsvToRgb(engine.pickerHue, engine.pickerSV[0], engine.pickerSV[1]);
      engine.hotbar[slot] = [r, g, b, engine.currentAlpha];
      syncPaletteControlsUI();
      renderHotbarDOM();
    };

    const updateFromSV = (e) => {
      const rect = svC.getBoundingClientRect();
      const sx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const sy = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
      engine.pickerSV = [sx, sy];
      const slot = forceSlot3 ? 3 : Math.max(3, engine.selColorIdx);
      const [r, g, b] = hsvToRgb(engine.pickerHue, sx, sy);
      engine.hotbar[slot] = [r, g, b, engine.currentAlpha];
      syncPaletteControlsUI();
      renderHotbarDOM();
    };

    hueC?.addEventListener('mousedown', (e) => { draggingHue = true; updateFromHue(e); });
    svC?.addEventListener('mousedown', (e) => { draggingSV = true; updateFromSV(e); });
    window.addEventListener('mousemove', (e) => {
      if (draggingHue) updateFromHue(e);
      if (draggingSV) updateFromSV(e);
    });
    window.addEventListener('mouseup', () => { draggingHue = false; draggingSV = false; });
  }

  wireHSVCanvases('slot4-hue-canvas', 'slot4-sv-canvas', true);
  wireHSVCanvases('inv-hue-canvas', 'inv-sv-canvas', false);

  document.getElementById('slot4-alpha-range')?.addEventListener('input', (e) => {
    engine.currentAlpha = parseInt(e.target.value, 10) || 0;
    engine.hotbar[3][3] = engine.currentAlpha;
    syncPaletteControlsUI();
    renderHotbarDOM();
  });

  document.getElementById('inv-alpha-range')?.addEventListener('input', (e) => {
    engine.currentAlpha = parseInt(e.target.value, 10) || 0;
    const slot = Math.max(3, engine.selColorIdx);
    engine.hotbar[slot][3] = engine.currentAlpha;
    syncPaletteControlsUI();
    renderHotbarDOM();
  });

  document.getElementById('slot4-hex-input')?.addEventListener('change', (e) => {
    const rgba = hexToRgba(e.target.value);
    engine.hotbar[3] = rgba;
    engine.currentAlpha = rgba[3];
    syncPaletteControlsUI();
    renderHotbarDOM();
  });

  document.getElementById('inv-hex-input')?.addEventListener('change', (e) => {
    const rgba = hexToRgba(e.target.value);
    const slot = Math.max(3, engine.selColorIdx);
    engine.hotbar[slot] = rgba;
    engine.currentAlpha = rgba[3];
    syncPaletteControlsUI();
    renderHotbarDOM();
  });

  function openSlot4PaletteModal() {
    const [r, g, b, a] = engine.hotbar[3];
    engine.currentAlpha = a;
    const [h, s, v] = rgbToHsv(r, g, b);
    engine.pickerHue = h;
    engine.pickerSV = [s, v];
    openModal('slot4-palette-popup');
    syncPaletteControlsUI();
  }

  function renderInventoryHotbarGrid() {
    const grid = document.getElementById('inv-hotbar-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < 10; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `hotbar-slot ${engine.selColorIdx === i ? 'selected' : ''}`;
      btn.style.width = '100%';
      if (i < 3) {
        btn.style.background = '#2b303c';
        btn.textContent = i === 0 ? 'TOOL' : i === 1 ? 'PLN' : 'AIR';
      } else {
        const [r, g, b, a] = engine.hotbar[i];
        btn.style.background = `rgba(${r},${g},${b},${a / 255})`;
        btn.textContent = i === 3 ? 'PAL [4]' : `[${i === 9 ? 0 : i + 1}]`;
      }
      if (i >= 2) {
        btn.addEventListener('click', () => {
          engine.selColorIdx = i;
          if (i >= 3) {
            const [r, g, b, a] = engine.hotbar[i];
            engine.currentAlpha = a;
            const [h, s, v] = rgbToHsv(r, g, b);
            engine.pickerHue = h;
            engine.pickerSV = [s, v];
          }
          syncPaletteControlsUI();
          renderHotbarDOM();
        });
      }
      grid.appendChild(btn);
    }
  }

  document.getElementById('btn-inv-eyedropper')?.addEventListener('click', () => {
    engine.currentTool = TOOL_PICKER;
    closeAllModals();
    renderHotbarDOM();
    setStatus('Eyedropper Active: Click any voxel to sample its Color & Anatomical Part');
  });

  document.getElementById('btn-speed-dec')?.addEventListener('click', () => {
    engine.moveSpeed = Math.max(0.3, +(engine.moveSpeed - 0.3).toFixed(2));
    const el = document.getElementById('inv-speed-val');
    if (el) el.textContent = `${Math.round(engine.moveSpeed * 100)}%`;
  });

  document.getElementById('btn-speed-inc')?.addEventListener('click', () => {
    engine.moveSpeed = Math.min(10.0, +(engine.moveSpeed + 0.3).toFixed(2));
    const el = document.getElementById('inv-speed-val');
    if (el) el.textContent = `${Math.round(engine.moveSpeed * 100)}%`;
  });

  document.getElementById('btn-regen-char-full')?.addEventListener('click', () => {
    const H = parseInt(document.getElementById('inv-head-size-input')?.value, 10) || engine.headSize || 16;
    updateHeadProportionUI(H);
    initCharacterTemplate(H);
    const s = H / 16.0;
    engine.cameraPos = [23.0 * s, 34.0 * s, 82.0 * s];
    closeAllModals();
    renderCharacterPartList();
    setStatus(`Rebuilt Proportional Hyperbuild 4D Character (Head ${H}×${H}×${H}) + All 9 Internal Organs!`);
  });

  document.getElementById('btn-regen-organs-only')?.addEventListener('click', () => {
    pushUndoSnapshot();
    populateInternalOrgans(engine.headSize);
    updateCulling();
    closeAllModals();
    renderCharacterPartList();
    setStatus('Regenerated All 9 Volumetric 3D Internal Organs!');
  });

  // ==================== SELECTION & PASTE ACTIONS ====================
  document.getElementById('btn-sel-copy')?.addEventListener('click', () => {
    copySelection(false);
    closeAllModals();
    engine.isPasting = true;
    engine.pastePos = [...engine.selStart];
    syncAppStateDOM();
    setStatus(`Copied ${engine.clipboard.length} Voxels — Use Gizmo/Buttons to Position & Press ENTER`);
  });

  document.getElementById('btn-sel-move')?.addEventListener('click', () => {
    copySelection(true);
    closeAllModals();
    engine.isPasting = true;
    engine.pastePos = [...engine.selStart];
    syncAppStateDOM();
    setStatus(`Cut ${engine.clipboard.length} Voxels — Move & Press ENTER to Stamp`);
  });

  document.getElementById('btn-sel-rotate')?.addEventListener('click', () => {
    copySelection(true);
    rotateClipboardY();
    engine.pastePos = [...engine.selStart];
    commitPaste();
    closeAllModals();
    setStatus('Rotated Selected Voxels 90° on Y-Axis');
  });

  document.getElementById('btn-sel-fill')?.addEventListener('click', () => {
    fillSelection(engine.hotbar[engine.selColorIdx]);
    closeAllModals();
    setStatus('Filled Selection Volume');
  });

  document.getElementById('btn-sel-delete')?.addEventListener('click', () => {
    deleteSelection();
    closeAllModals();
    setStatus('Deleted Selected Voxels');
  });

  document.querySelectorAll('#paste-control-bar [data-nudge]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [dx, dy, dz] = btn.dataset.nudge.split(',').map(Number);
      engine.pastePos[0] += dx;
      engine.pastePos[1] += dy;
      engine.pastePos[2] += dz;
    });
  });

  document.getElementById('btn-paste-rotate')?.addEventListener('click', () => rotateClipboardY());
  document.getElementById('btn-paste-commit')?.addEventListener('click', () => {
    commitPaste();
    engine.isPasting = false;
    syncAppStateDOM();
    setStatus('Committed Clipboard Voxels to Workspace');
  });
  document.getElementById('btn-paste-cancel')?.addEventListener('click', () => {
    engine.isPasting = false;
    syncAppStateDOM();
  });

  // ==================== EXPORT HYPERBUILD 4D (.HB) & VOLUMETRIC SHEET MODAL ====================
  function getCleanExportBaseName() {
    const inp = document.getElementById('export-filename-input');
    return (inp?.value || 'hyperbuild_4d_character').replace(/\.(hb|png|json|txt|ht3d)$/i, '').trim() || 'hyperbuild_4d_character';
  }

  function renderExportPreviewCanvas() {
    const previewCanvas = document.getElementById('export-preview-canvas');
    const dimsLabel = document.getElementById('export-sheet-dims-label');
    const hbSnippetEl = document.getElementById('export-hb-live-snippet');
    const headLbl = document.getElementById('export-hb-head-label');
    if (!previewCanvas) return;

    const H = engine.headSize || 16;
    if (headLbl) headLbl.textContent = `${H}×${H}×${H}`;

    const { width, height, pixels } = buildHyperbuildAtlasPixels(engine.exportFormat);
    previewCanvas.width = width;
    previewCanvas.height = height;
    const ctx = previewCanvas.getContext('2d');
    const imgData = new ImageData(pixels, width, height);
    ctx.putImageData(imgData, 0, 0);

    const base = getCleanExportBaseName();
    if (hbSnippetEl) {
      hbSnippetEl.textContent = buildHBPreviewSnippet(base);
    }

    if (dimsLabel) {
      const modeTitle =
        engine.exportFormat === 'hb-structure'
          ? `HYPERBUILD 4D STRUCTURE (.hb) — HEAD ${H}×${H}×${H}`
          : engine.exportFormat === 'hyperbuild-volumetric'
          ? 'HYPERBUILD 4D VOLUMETRIC ORGAN ATLAS'
          : engine.exportFormat === 'anatomical-20parts'
          ? '20-PART ANATOMICAL SLICE SHEET'
          : 'RAW 3D Z-SLICE STRIP';
      dimsLabel.textContent = `${modeTitle} (${width}×${height} PREVIEW)`;
    }
  }

  function openExportModal() {
    openModal('export-popup');
    document.querySelectorAll('.btn-export-mode').forEach((b) => {
      b.classList.toggle('active', b.dataset.emode === engine.exportFormat);
    });
    renderExportPreviewCanvas();
  }

  document.querySelectorAll('.btn-export-mode').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-export-mode').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      engine.exportFormat = btn.dataset.emode || 'hb-structure';
      renderExportPreviewCanvas();
    });
  });

  document.getElementById('export-filename-input')?.addEventListener('input', () => {
    const hbSnippetEl = document.getElementById('export-hb-live-snippet');
    if (hbSnippetEl) hbSnippetEl.textContent = buildHBPreviewSnippet(getCleanExportBaseName());
  });

  function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function downloadHBFile(filenameOrBase) {
    const base = filenameOrBase.replace(/\.hb$/i, '').trim() || 'hyperbuild_4d_character';
    const hbContent = serializeHBFile(base);
    triggerBlobDownload(new Blob([hbContent], { type: 'application/json' }), `${base}.hb`);
    saveBackupSnapshot(false);
    setStatus(`Exported Hyperbuild 4D (.hb) File: ${base}.hb (Head ${engine.headSize}³ | ${engine.activeVoxelCount} Voxels)`);
  }

  function downloadExportPNG(baseName) {
    renderExportPreviewCanvas();
    const previewCanvas = document.getElementById('export-preview-canvas');
    previewCanvas?.toBlob((blob) => {
      if (blob) triggerBlobDownload(blob, `${baseName}.png`);
    }, 'image/png');
  }

  function downloadExportJSON(baseName) {
    const jsonStr = generateHyperbuild4DRigJSON(baseName);
    triggerBlobDownload(new Blob([jsonStr], { type: 'application/json' }), `${baseName}_rig_4d_organs.json`);
  }

  function downloadExportTXT(baseName) {
    const txtStr = generateHyperbuild4DSpecText(baseName);
    triggerBlobDownload(new Blob([txtStr], { type: 'text/plain' }), `${baseName}_hyperbuild_spec.txt`);
  }

  document.getElementById('btn-download-hb-primary')?.addEventListener('click', () => {
    const base = getCleanExportBaseName();
    downloadHBFile(base);
    closeAllModals();
  });

  document.getElementById('btn-download-all-export')?.addEventListener('click', () => {
    const base = getCleanExportBaseName();
    downloadHBFile(base);
    setTimeout(() => downloadExportPNG(base), 100);
    setTimeout(() => downloadExportJSON(base), 220);
    setTimeout(() => downloadExportTXT(base), 340);
    closeAllModals();
    setStatus(`Exported Hyperbuild 4D .hb + Volumetric PNG + Organ Rig JSON + Spec: ${base}`);
  });

  document.getElementById('btn-download-png-only')?.addEventListener('click', () => {
    const base = getCleanExportBaseName();
    downloadExportPNG(base);
    setStatus(`Exported Hyperbuild 4D PNG Sheet: ${base}.png`);
  });

  document.getElementById('btn-download-json-only')?.addEventListener('click', () => {
    const base = getCleanExportBaseName();
    downloadExportJSON(base);
    setStatus(`Exported Hyperbuild 4D Organ Rig: ${base}_rig_4d_organs.json`);
  });

  document.getElementById('btn-download-txt-only')?.addEventListener('click', () => {
    const base = getCleanExportBaseName();
    downloadExportTXT(base);
    setStatus(`Exported Hyperbuild 4D Engine Spec: ${base}_hyperbuild_spec.txt`);
  });

  // ==================== SAVE / LOAD .HB & .HT3D PROJECT FILES ====================
  function downloadHT3DFile(filename) {
    if (filename.toLowerCase().endsWith('.hb')) {
      downloadHBFile(filename);
      return;
    }
    const cleanName = filename.endsWith('.ht3d') ? filename : `${filename}.ht3d`;
    const buf = serializeHT3DBuffer();
    triggerBlobDownload(new Blob([buf], { type: 'application/octet-stream' }), cleanName);
    saveBackupSnapshot(false);
    setStatus(`Saved HT3D Binary Project: ${cleanName}`);
  }

  document.getElementById('btn-saveas-confirm')?.addEventListener('click', () => {
    const inp = document.getElementById('saveas-filename-input');
    const fname = (inp?.value || 'hyperbuild_4d_character.hb').trim();
    if (fname.toLowerCase().endsWith('.ht3d')) {
      downloadHT3DFile(fname);
    } else {
      downloadHBFile(fname);
    }
    closeAllModals();
  });

  function loadHBFileIntoStudio(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (deserializeHBFile(reader.result)) {
        updateHeadProportionUI(engine.headSize);
        const s = (engine.headSize || 16) / 16.0;
        engine.cameraPos = [engine.gridX / 2, engine.gridY * 0.48, Math.max(engine.gridX, engine.gridZ) * 1.45 * Math.max(1, s * 0.8)];
        engine.cameraAngle = [-Math.PI / 2, -0.02];
        engine.appState = STATE_EDITOR;
        closeAllModals();
        syncAppStateDOM();
        renderCharacterPartList();
        renderHotbarDOM();
        setStatus(
          `Imported Hyperbuild 4D (.hb): ${file.name} — Head ${engine.headSize}×${engine.headSize}×${engine.headSize} | Grid ${engine.gridX}×${engine.gridY}×${engine.gridZ} | ${engine.activeVoxelCount} Voxels`
        );
      } else {
        setStatus(`Failed to parse .hb file: ${file.name}`);
      }
    };
    reader.readAsText(file);
  }

  document.getElementById('load-hb-input')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) loadHBFileIntoStudio(file);
    e.target.value = '';
  });

  document.getElementById('load-ht3d-input')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.name.toLowerCase().endsWith('.hb') || file.name.toLowerCase().endsWith('.json')) {
      loadHBFileIntoStudio(file);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (deserializeHT3DBuffer(reader.result)) {
        updateHeadProportionUI(engine.headSize);
        engine.appState = STATE_EDITOR;
        syncAppStateDOM();
        renderCharacterPartList();
        renderHotbarDOM();
        setStatus(`Loaded Project: ${file.name} (${engine.gridX}×${engine.gridY}×${engine.gridZ})`);
      } else if (deserializeHBFile(reader.result)) {
        updateHeadProportionUI(engine.headSize);
        engine.appState = STATE_EDITOR;
        syncAppStateDOM();
        renderCharacterPartList();
        renderHotbarDOM();
        setStatus(`Imported Hyperbuild 4D (.hb): ${file.name}`);
      } else {
        setStatus('Invalid .ht3d / .hb file format');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  });

  // ==================== 2D PNG CROP & IMPORT SCREEN ====================
  const importPreviewCanvas = document.getElementById('import-preview-canvas');
  const cropXIn = document.getElementById('crop-x');
  const cropYIn = document.getElementById('crop-y');
  const cropWIn = document.getElementById('crop-w');
  const cropHIn = document.getElementById('crop-h');
  const cropDepthIn = document.getElementById('crop-depth');

  let importedOffscreenCanvas = document.createElement('canvas');
  let cropRect = { x: 0, y: 0, w: 32, h: 32 };
  let isCropDragging = false;
  let cropDragOrigin = [0, 0];

  function generateSampleOrganSpriteCanvas() {
    const { width, height, pixels } = buildHyperbuildAtlasPixels('hyperbuild-volumetric');
    importedOffscreenCanvas.width = width;
    importedOffscreenCanvas.height = height;
    importedOffscreenCanvas.getContext('2d').putImageData(new ImageData(pixels, width, height), 0, 0);
    cropRect = { x: 0, y: 128, w: 64, h: 64 };
    syncCropInputs();
    drawImport2DCanvas();
  }

  function syncCropInputs() {
    if (cropXIn) cropXIn.value = String(Math.round(cropRect.x));
    if (cropYIn) cropYIn.value = String(Math.round(cropRect.y));
    if (cropWIn) cropWIn.value = String(Math.max(1, Math.round(cropRect.w)));
    if (cropHIn) cropHIn.value = String(Math.max(1, Math.round(cropRect.h)));
  }

  function drawImport2DCanvas() {
    if (!importPreviewCanvas) return;
    const iw = importedOffscreenCanvas.width || 64;
    const ih = importedOffscreenCanvas.height || 64;
    importPreviewCanvas.width = iw;
    importPreviewCanvas.height = ih;
    const ctx = importPreviewCanvas.getContext('2d');
    ctx.clearRect(0, 0, iw, ih);
    ctx.drawImage(importedOffscreenCanvas, 0, 0);

    ctx.fillStyle = 'rgba(230, 57, 70, 0.28)';
    ctx.fillRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
    ctx.strokeStyle = '#ff2a4b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cropRect.x + 0.5, cropRect.y + 0.5, cropRect.w, cropRect.h);
  }

  function openImport2DScreen() {
    generateSampleOrganSpriteCanvas();
    engine.appState = STATE_IMPORT_2D;
    syncAppStateDOM();
  }

  [cropXIn, cropYIn, cropWIn, cropHIn].forEach((inp) => {
    inp?.addEventListener('input', () => {
      cropRect.x = Math.max(0, parseInt(cropXIn.value, 10) || 0);
      cropRect.y = Math.max(0, parseInt(cropYIn.value, 10) || 0);
      cropRect.w = Math.max(1, parseInt(cropWIn.value, 10) || 1);
      cropRect.h = Math.max(1, parseInt(cropHIn.value, 10) || 1);
      drawImport2DCanvas();
    });
  });

  importPreviewCanvas?.addEventListener('mousedown', (e) => {
    const rect = importPreviewCanvas.getBoundingClientRect();
    const scaleX = importPreviewCanvas.width / rect.width;
    const scaleY = importPreviewCanvas.height / rect.height;
    const px = Math.floor((e.clientX - rect.left) * scaleX);
    const py = Math.floor((e.clientY - rect.top) * scaleY);
    isCropDragging = true;
    cropDragOrigin = [px, py];
    cropRect = { x: px, y: py, w: 1, h: 1 };
    syncCropInputs();
    drawImport2DCanvas();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isCropDragging || engine.appState !== STATE_IMPORT_2D) return;
    const rect = importPreviewCanvas.getBoundingClientRect();
    const scaleX = importPreviewCanvas.width / rect.width;
    const scaleY = importPreviewCanvas.height / rect.height;
    const px = Math.max(0, Math.min(importPreviewCanvas.width, Math.floor((e.clientX - rect.left) * scaleX)));
    const py = Math.max(0, Math.min(importPreviewCanvas.height, Math.floor((e.clientY - rect.top) * scaleY)));
    cropRect.x = Math.min(cropDragOrigin[0], px);
    cropRect.y = Math.min(cropDragOrigin[1], py);
    cropRect.w = Math.max(1, Math.abs(px - cropDragOrigin[0]));
    cropRect.h = Math.max(1, Math.abs(py - cropDragOrigin[1]));
    syncCropInputs();
    drawImport2DCanvas();
  });

  window.addEventListener('mouseup', () => {
    isCropDragging = false;
  });

  document.getElementById('import-file-input')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadImageFileIntoCropper(file);
  });

  function loadImageFileIntoCropper(file) {
    const img = new Image();
    img.onload = () => {
      importedOffscreenCanvas.width = img.width;
      importedOffscreenCanvas.height = img.height;
      importedOffscreenCanvas.getContext('2d').drawImage(img, 0, 0);
      cropRect = { x: 0, y: 0, w: Math.min(64, img.width), h: Math.min(64, img.height) };
      syncCropInputs();
      drawImport2DCanvas();
      engine.appState = STATE_IMPORT_2D;
      syncAppStateDOM();
    };
    img.src = URL.createObjectURL(file);
  }

  document.getElementById('btn-load-sample-organ-sheet')?.addEventListener('click', () => {
    generateSampleOrganSpriteCanvas();
  });

  function convertCropToClipboard() {
    const ctx = importedOffscreenCanvas.getContext('2d');
    const sx = Math.max(0, Math.floor(cropRect.x));
    const sy = Math.max(0, Math.floor(cropRect.y));
    const rw = Math.max(1, Math.min(importedOffscreenCanvas.width - sx, Math.floor(cropRect.w)));
    const rh = Math.max(1, Math.min(importedOffscreenCanvas.height - sy, Math.floor(cropRect.h)));
    const zDepth = Math.max(1, Math.min(32, parseInt(cropDepthIn?.value, 10) || 1));

    const data = ctx.getImageData(sx, sy, rw, rh).data;
    engine.clipboard = [];
    const targetPid = resolveTargetPart(1);

    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        const i4 = (y * rw + x) * 4;
        const a = data[i4 + 3];
        if (a > 10) {
          for (let z = 0; z < zDepth; z++) {
            engine.clipboard.push({
              dx: x,
              dy: rh - 1 - y,
              dz: z,
              partId: targetPid,
              color: [data[i4], data[i4 + 1], data[i4 + 2], a],
            });
          }
        }
      }
    }

    engine.clipSize = [rw, rh, zDepth];
    engine.appState = STATE_EDITOR;
    engine.isPasting = engine.clipboard.length > 0;
    engine.pastePos = [
      Math.max(0, Math.floor((engine.gridX - rw) / 2)),
      Math.max(0, Math.floor((engine.gridY - rh) / 2)),
      Math.max(0, Math.floor((engine.gridZ - zDepth) / 2)),
    ];
    syncAppStateDOM();
    setStatus(`Imported ${engine.clipboard.length} Voxels from 2D Crop — Position & Press ENTER`);
  }

  document.getElementById('btn-import-confirm')?.addEventListener('click', convertCropToClipboard);
  document.getElementById('btn-import-cancel')?.addEventListener('click', () => {
    engine.appState = STATE_EDITOR;
    syncAppStateDOM();
  });

  // Drag & Drop .hb, .ht3d, or .png directly onto window
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    const lowName = file.name.toLowerCase();
    if (lowName.endsWith('.hb') || lowName.endsWith('.json')) {
      loadHBFileIntoStudio(file);
    } else if (lowName.endsWith('.ht3d')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (deserializeHT3DBuffer(reader.result)) {
          updateHeadProportionUI(engine.headSize);
          engine.appState = STATE_EDITOR;
          syncAppStateDOM();
          renderCharacterPartList();
          renderHotbarDOM();
          setStatus(`Loaded Dropped Project: ${file.name}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (file.type.startsWith('image/')) {
      loadImageFileIntoCropper(file);
    }
  });

  // ==================== 3D CAMERA & VIEWPORT INTERACTION ====================
  const keysDown = {};
  let mouseNDC = [0, 0];
  let isRightOrbiting = false;
  let lastMousePos = [0, 0];
  let isToolDragging = false;
  let dragStartVoxel = [0, 0, 0];
  let currentHoverVoxel = { hit: false, hitX: -1, hitY: -1, hitZ: -1, placeX: -1, placeY: -1, placeZ: -1 };

  function getLookForward() {
    const [yaw, pitch] = engine.cameraAngle;
    return [
      Math.cos(pitch) * Math.cos(yaw),
      Math.sin(pitch),
      Math.cos(pitch) * Math.sin(yaw),
    ];
  }

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  canvas.addEventListener('mousedown', (e) => {
    if (engine.appState !== STATE_EDITOR) return;
    lastMousePos = [e.clientX, e.clientY];

    if (e.button === 2 && !engine.isMouseLocked) {
      isRightOrbiting = true;
      return;
    }

    const isEraseAction =
      engine.currentTool === TOOL_ERASER ||
      (e.button === 0 && e.shiftKey && !engine.isMouseLocked) ||
      (e.button === 0 && engine.isMouseLocked);

    const isPlaceOrToolAction =
      (!engine.isMouseLocked && e.button === 0 && !e.shiftKey && engine.currentTool !== TOOL_ERASER) ||
      (engine.isMouseLocked && e.button === 2);

    if (engine.isPasting && e.button === 0) {
      if (currentHoverVoxel.placeX >= 0) {
        engine.pastePos = [currentHoverVoxel.placeX, currentHoverVoxel.placeY, currentHoverVoxel.placeZ];
      }
      return;
    }

    if (isEraseAction) {
      if (currentHoverVoxel.hit) {
        pushUndoSnapshot();
        applyBrushAt(currentHoverVoxel.hitX, currentHoverVoxel.hitY, currentHoverVoxel.hitZ, true, 0, [0, 0, 0, 0]);
      }
      return;
    }

    if (isPlaceOrToolAction) {
      if (engine.currentTool === TOOL_PICKER) {
        if (currentHoverVoxel.hit) {
          const idx = getIndex(currentHoverVoxel.hitX, currentHoverVoxel.hitY, currentHoverVoxel.hitZ);
          const c4 = idx * 4;
          const slot = Math.max(3, engine.selColorIdx);
          engine.hotbar[slot] = [engine.color[c4], engine.color[c4 + 1], engine.color[c4 + 2], engine.color[c4 + 3]];
          const sampledPart = engine.partId[idx];
          if (engine.isCharacterMode && sampledPart > 0) {
            engine.paintTargetPart = sampledPart;
            renderCharacterPartList();
          }
          engine.currentTool = TOOL_BRUSH;
          renderHotbarDOM();
          setStatus(`Sampled Color & Part: ${BODY_PART_SPECS[sampledPart]?.name || 'Voxel'}`);
        }
        return;
      }

      if (engine.currentTool === TOOL_BRUSH) {
        const tx = currentHoverVoxel.placeX;
        const ty = currentHoverVoxel.placeY;
        const tz = currentHoverVoxel.placeZ;
        if (inBounds(tx, ty, tz)) {
          pushUndoSnapshot();
          const hitPid = currentHoverVoxel.hit
            ? engine.partId[getIndex(currentHoverVoxel.hitX, currentHoverVoxel.hitY, currentHoverVoxel.hitZ)]
            : 1;
          applyBrushAt(tx, ty, tz, false, hitPid, engine.hotbar[engine.selColorIdx]);
        }
      } else {
        const sx = currentHoverVoxel.hit ? currentHoverVoxel.hitX : currentHoverVoxel.placeX;
        const sy = currentHoverVoxel.hit ? currentHoverVoxel.hitY : currentHoverVoxel.placeY;
        const sz = currentHoverVoxel.hit ? currentHoverVoxel.hitZ : currentHoverVoxel.placeZ;
        if (inBounds(sx, sy, sz)) {
          isToolDragging = true;
          dragStartVoxel = [sx, sy, sz];
        }
      }
    }
  });

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseNDC = [
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -(((e.clientY - rect.top) / rect.height) * 2 - 1),
    ];

    if (engine.isMouseLocked || isRightOrbiting) {
      const dx = engine.isMouseLocked ? e.movementX : e.clientX - lastMousePos[0];
      const dy = engine.isMouseLocked ? e.movementY : e.clientY - lastMousePos[1];
      engine.cameraAngle[0] += dx * 0.0045;
      engine.cameraAngle[1] = Math.max(-1.5, Math.min(1.5, engine.cameraAngle[1] - dy * 0.0045));
    }
    lastMousePos = [e.clientX, e.clientY];
  });

  window.addEventListener('mouseup', () => {
    isRightOrbiting = false;
    if (isToolDragging) {
      isToolDragging = false;
      const ex = currentHoverVoxel.hit ? currentHoverVoxel.hitX : currentHoverVoxel.placeX;
      const ey = currentHoverVoxel.hit ? currentHoverVoxel.hitY : currentHoverVoxel.placeY;
      const ez = currentHoverVoxel.hit ? currentHoverVoxel.hitZ : currentHoverVoxel.placeZ;
      if (inBounds(ex, ey, ez)) {
        if (engine.currentTool === TOOL_SELECT) {
          engine.selStart = [...dragStartVoxel];
          engine.selEnd = [ex, ey, ez];
          const dx = Math.abs(engine.selEnd[0] - engine.selStart[0]) + 1;
          const dy = Math.abs(engine.selEnd[1] - engine.selStart[1]) + 1;
          const dz = Math.abs(engine.selEnd[2] - engine.selStart[2]) + 1;
          const lbl = document.getElementById('select-dims-label');
          if (lbl) lbl.textContent = `Selected Box: ${dx}×${dy}×${dz} Voxels`;
          openModal('select-popup');
        } else {
          const hitPid = currentHoverVoxel.hit
            ? engine.partId[getIndex(currentHoverVoxel.hitX, currentHoverVoxel.hitY, currentHoverVoxel.hitZ)]
            : 1;
          applyTool(
            dragStartVoxel[0],
            dragStartVoxel[1],
            dragStartVoxel[2],
            ex,
            ey,
            ez,
            engine.currentTool,
            engine.hotbar[engine.selColorIdx],
            hitPid
          );
        }
      }
    }
  });

  canvas.addEventListener(
    'wheel',
    (e) => {
      if (engine.appState !== STATE_EDITOR) return;
      e.preventDefault();
      const fwd = getLookForward();
      const step = -Math.sign(e.deltaY) * 3.2 * engine.moveSpeed;
      engine.cameraPos[0] += fwd[0] * step;
      engine.cameraPos[1] += fwd[1] * step;
      engine.cameraPos[2] += fwd[2] * step;
    },
    { passive: false }
  );

  // ==================== KEYBOARD SHORTCUTS ====================
  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    const isInputFocused = tag === 'INPUT' || tag === 'TEXTAREA';

    if (e.key === 'Escape') {
      closeAllModals();
      if (engine.isPasting) {
        engine.isPasting = false;
        syncAppStateDOM();
      } else if (engine.appState === STATE_BACKUP_LIST) {
        engine.appState = engine.prevStateBeforeBackup;
        syncAppStateDOM();
      } else if (engine.appState === STATE_IMPORT_2D) {
        engine.appState = STATE_EDITOR;
        syncAppStateDOM();
      }
      if (document.pointerLockElement) document.exitPointerLock?.();
      engine.isMouseLocked = false;
      syncAppStateDOM();
      return;
    }

    if (engine.appState === STATE_STARTUP && e.key === 'Enter' && !isInputFocused) {
      startCustomXYZWorkspace();
      return;
    }

    if (engine.appState === STATE_IMPORT_2D && e.key === 'Enter' && !isInputFocused) {
      convertCropToClipboard();
      return;
    }

    if (isInputFocused) return;

    keysDown[e.code] = true;

    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
      e.preventDefault();
      if (performUndo()) setStatus('Undo Applied');
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyY') {
      e.preventDefault();
      if (performRedo()) setStatus('Redo Applied');
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
      e.preventDefault();
      downloadHBFile('hyperbuild_4d_character.hb');
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV' && engine.clipboard.length > 0) {
      e.preventDefault();
      engine.isPasting = true;
      engine.pastePos = [Math.floor(engine.gridX / 2), Math.floor(engine.gridY / 2), Math.floor(engine.gridZ / 2)];
      syncAppStateDOM();
      return;
    }

    if (engine.appState !== STATE_EDITOR) return;

    if (engine.isPasting) {
      if (e.key === 'Enter') {
        commitPaste();
        engine.isPasting = false;
        syncAppStateDOM();
        setStatus('Committed Clipboard Paste');
        return;
      }
      if (e.code === 'KeyR' || e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        rotateClipboardY();
        return;
      }
    }

    if (e.code === 'KeyQ') {
      engine.isMouseLocked = !engine.isMouseLocked;
      if (engine.isMouseLocked) {
        canvas.requestPointerLock?.();
      } else {
        document.exitPointerLock?.();
      }
      syncAppStateDOM();
    } else if (e.code === 'KeyE') {
      const invModal = document.getElementById('inventory-popup');
      if (invModal?.classList.contains('hidden')) {
        openModal('inventory-popup');
        syncPaletteControlsUI();
      } else {
        closeAllModals();
      }
    } else if (e.code === 'Digit1') {
      openModal('tools-popup');
    } else if (e.code === 'Digit2') {
      cycleHyperplane();
    } else if (e.code === 'Digit3') {
      engine.selColorIdx = 2;
      engine.currentTool = TOOL_BRUSH;
      renderHotbarDOM();
    } else if (e.code === 'Digit4') {
      engine.selColorIdx = 3;
      engine.currentTool = TOOL_BRUSH;
      renderHotbarDOM();
      openSlot4PaletteModal();
    } else if (e.code >= 'Digit5' && e.code <= 'Digit9') {
      engine.selColorIdx = parseInt(e.code.replace('Digit', ''), 10) - 1;
      engine.currentTool = TOOL_BRUSH;
      renderHotbarDOM();
    } else if (e.code === 'Digit0') {
      engine.selColorIdx = 9;
      engine.currentTool = TOOL_BRUSH;
      renderHotbarDOM();
    }
  });

  window.addEventListener('keyup', (e) => {
    keysDown[e.code] = false;
  });

  document.addEventListener('pointerlockchange', () => {
    engine.isMouseLocked = document.pointerLockElement === canvas;
    syncAppStateDOM();
  });

  // ==================== MAIN RENDER & UPDATE LOOP ====================
  loadBackupsFromStorage();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('autostart') === '1') {
    startCharacterStudio();
  } else {
    initCharacterTemplate(16);
    updateHeadProportionUI(16);
    syncAppStateDOM();
  }

  let lastTime = performance.now();
  let lastBackupCheck = performance.now();
  let frameCount = 0;
  let fpsTimer = performance.now();
  const jointLabelsLayer = document.getElementById('joint-labels-layer');

  function renderFrame(now) {
    requestAnimationFrame(renderFrame);

    const dt = Math.min(0.1, (now - lastTime) / 1000);
    lastTime = now;
    frameCount++;

    if (now - fpsTimer >= 500) {
      const fps = Math.round((frameCount * 1000) / (now - fpsTimer));
      if (fpsCounterEl) fpsCounterEl.textContent = `${fps} FPS`;
      frameCount = 0;
      fpsTimer = now;
    }

    if (statusTimer > 0) {
      statusTimer -= dt;
      if (statusTimer <= 0 && statusToast) statusToast.textContent = '';
    }

    if (engine.appState === STATE_EDITOR && now - lastBackupCheck >= 5000) {
      saveBackupSnapshot(false);
      lastBackupCheck = now;
    }

    if (engine.appState !== STATE_EDITOR) return;

    const dpr = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent) ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.floor(window.innerWidth * dpr);
    const ch = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== cw || canvas.height !== ch) {
      canvas.width = cw;
      canvas.height = ch;
    }

    const anyModalOpen = Array.from(document.querySelectorAll('.modal-backdrop')).some((m) => !m.classList.contains('hidden'));
    if (!anyModalOpen) {
      const [yaw] = engine.cameraAngle;
      const moveFwd = [Math.cos(yaw), 0, Math.sin(yaw)];
      const moveRight = [-moveFwd[2], 0, moveFwd[0]];
      const speed = dt * 16.0 * engine.moveSpeed;

      if (keysDown['KeyW'] || keysDown['ArrowUp']) {
        engine.cameraPos[0] += moveFwd[0] * speed;
        engine.cameraPos[2] += moveFwd[2] * speed;
      }
      if (keysDown['KeyS'] || keysDown['ArrowDown']) {
        engine.cameraPos[0] -= moveFwd[0] * speed;
        engine.cameraPos[2] -= moveFwd[2] * speed;
      }
      if (keysDown['KeyD']) {
        engine.cameraPos[0] += moveRight[0] * speed;
        engine.cameraPos[2] += moveRight[2] * speed;
      }
      if (keysDown['KeyA']) {
        engine.cameraPos[0] -= moveRight[0] * speed;
        engine.cameraPos[2] -= moveRight[2] * speed;
      }
      if (keysDown['Space']) engine.cameraPos[1] += speed;
      if (keysDown['ShiftLeft'] && engine.isMouseLocked) engine.cameraPos[1] -= speed;
    }

    const fwd = getLookForward();
    const target = [
      engine.cameraPos[0] + fwd[0],
      engine.cameraPos[1] + fwd[1],
      engine.cameraPos[2] + fwd[2],
    ];
    const aspect = cw / Math.max(1, ch);
    const projMat = mat4Perspective((60 * Math.PI) / 180, aspect, 0.1, 600.0);
    const viewMat = mat4LookAt(engine.cameraPos, target, [0, 1, 0]);
    const vpMat = mat4Multiply(projMat, viewMat);

    let rayOrigin = [...engine.cameraPos];
    let rayDir = [...fwd];
    if (!engine.isMouseLocked) {
      const invVP = mat4Invert(vpMat);
      const nearPt = unprojectPoint(mouseNDC[0], mouseNDC[1], -1.0, invVP);
      const farPt = unprojectPoint(mouseNDC[0], mouseNDC[1], 1.0, invVP);
      const dx = farPt[0] - nearPt[0], dy = farPt[1] - nearPt[1], dz = farPt[2] - nearPt[2];
      const len = Math.hypot(dx, dy, dz) || 1;
      rayOrigin = nearPt;
      rayDir = [dx / len, dy / len, dz / len];
    }

    currentHoverVoxel = raycastVoxelDDA(rayOrigin, rayDir);

    const tx = currentHoverVoxel.hit ? currentHoverVoxel.hitX : currentHoverVoxel.placeX;
    const ty = currentHoverVoxel.hit ? currentHoverVoxel.hitY : currentHoverVoxel.placeY;
    const tz = currentHoverVoxel.hit ? currentHoverVoxel.hitZ : currentHoverVoxel.placeZ;
    const hpNames = ['3D CUBE', 'Y-SLICE', 'X-SLICE', 'Z-SLICE'];
    let hoveredPartStr = '';
    if (currentHoverVoxel.hit && engine.isCharacterMode) {
      const pid = engine.partId[getIndex(currentHoverVoxel.hitX, currentHoverVoxel.hitY, currentHoverVoxel.hitZ)];
      if (pid > 0 && BODY_PART_SPECS[pid]) {
        hoveredPartStr = ` | ${BODY_PART_SPECS[pid].name} [${BODY_PART_SPECS[pid].followJoint}]`;
      }
    }
    if (hudCoordsText) {
      hudCoordsText.textContent = `XYZ: [${tx >= 0 ? tx : '-'}, ${ty >= 0 ? ty : '-'}, ${tz >= 0 ? tz : '-'}] (${engine.gridX}×${engine.gridY}×${engine.gridZ} | Head ${engine.headSize}³) | ${hpNames[engine.hpState]} | Voxels: ${engine.activeVoxelCount}${hoveredPartStr}`;
    }

    if (!gl) return;
    if (engine.meshDirty) rebuildVoxelBuffers();

    gl.viewport(0, 0, cw, ch);
    gl.clearColor(0.063, 0.078, 0.118, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(prog);
    gl.uniformMatrix4fv(uVPLoc, false, vpMat);

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    if (opaqueVertCount > 0) {
      bindInterleavedBuffer(opaqueBuf);
      gl.drawArrays(gl.TRIANGLES, 0, opaqueVertCount);
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    if (engine.showWireframe && edgeVertCount > 0) {
      bindInterleavedBuffer(edgeBuf);
      gl.drawArrays(gl.LINES, 0, edgeVertCount);
    }

    if (transVertCount > 0) {
      gl.depthMask(false);
      bindInterleavedBuffer(transBuf);
      gl.drawArrays(gl.TRIANGLES, 0, transVertCount);
      gl.depthMask(true);
    }

    const dynLines = [];
    const { gridX: gx, gridY: gy, gridZ: gz } = engine;

    pushWireBox(dynLines, 0, 0, 0, gx, gy, gz, 0.25, 0.65, 1.0, 0.28);

    for (let x = 0; x <= gx; x += 2) pushLineSeg(dynLines, x, 0, 0, x, 0, gz, 0.5, 0.58, 0.72, 0.22);
    for (let z = 0; z <= gz; z += 2) pushLineSeg(dynLines, 0, 0, z, gx, 0, z, 0.5, 0.58, 0.72, 0.22);

    if (engine.mirrorX) {
      pushWireBox(dynLines, gx / 2 - 0.02, 0, 0, gx / 2 + 0.02, gy, gz, 1.0, 0.3, 0.7, 0.45);
    }

    if (engine.hpState === 1) {
      for (let i = 0; i <= gx; i += 2) pushLineSeg(dynLines, i, engine.hpPos, 0, i, engine.hpPos, gz, 0.2, 0.95, 0.4, 0.65);
      for (let k = 0; k <= gz; k += 2) pushLineSeg(dynLines, 0, engine.hpPos, k, gx, engine.hpPos, k, 0.2, 0.95, 0.4, 0.65);
    } else if (engine.hpState === 2) {
      for (let i = 0; i <= gy; i += 2) pushLineSeg(dynLines, engine.hpPos, i, 0, engine.hpPos, i, gz, 0.95, 0.25, 0.25, 0.65);
    } else if (engine.hpState === 3) {
      for (let i = 0; i <= gx; i += 2) pushLineSeg(dynLines, i, 0, engine.hpPos, i, gy, engine.hpPos, 0.25, 0.55, 1.0, 0.65);
    }

    if (!engine.isPasting) {
      if (isToolDragging) {
        const cx = currentHoverVoxel.hit ? currentHoverVoxel.hitX : currentHoverVoxel.placeX;
        const cy = currentHoverVoxel.hit ? currentHoverVoxel.hitY : currentHoverVoxel.placeY;
        const cz = currentHoverVoxel.hit ? currentHoverVoxel.hitZ : currentHoverVoxel.placeZ;
        if (cx >= 0) {
          const minX = Math.min(dragStartVoxel[0], cx), maxX = Math.max(dragStartVoxel[0], cx) + 1;
          const minY = Math.min(dragStartVoxel[1], cy), maxY = Math.max(dragStartVoxel[1], cy) + 1;
          const minZ = Math.min(dragStartVoxel[2], cz), maxZ = Math.max(dragStartVoxel[2], cz) + 1;
          const col = engine.currentTool === TOOL_SELECT ? [0.3, 1.0, 0.4, 0.95] : [1.0, 0.65, 0.1, 0.95];
          pushWireBox(dynLines, minX - 0.03, minY - 0.03, minZ - 0.03, maxX + 0.03, maxY + 0.03, maxZ + 0.03, ...col);
        }
      } else {
        if (currentHoverVoxel.hit) {
          const { hitX: hx, hitY: hy, hitZ: hz } = currentHoverVoxel;
          pushWireBox(dynLines, hx - 0.03, hy - 0.03, hz - 0.03, hx + 1.03, hy + 1.03, hz + 1.03, 1.0, 0.9, 0.15, 0.95);
        }
        if (inBounds(currentHoverVoxel.placeX, currentHoverVoxel.placeY, currentHoverVoxel.placeZ)) {
          const { placeX: px, placeY: py, placeZ: pz } = currentHoverVoxel;
          pushWireBox(dynLines, px, py, pz, px + 1, py + 1, pz + 1, 0.0, 0.85, 1.0, 0.65);
        }
      }
    } else if (engine.clipboard.length > 0) {
      const [px, py, pz] = engine.pastePos;
      const [sx, sy, sz] = engine.clipSize;
      pushWireBox(dynLines, px, py, pz, px + sx, py + sy, pz + sz, 0.2, 1.0, 0.5, 0.95);
      for (const item of engine.clipboard) {
        const vx = px + item.dx, vy = py + item.dy, vz = pz + item.dz;
        pushWireBox(
          dynLines,
          vx + 0.08,
          vy + 0.08,
          vz + 0.08,
          vx + 0.92,
          vy + 0.92,
          vz + 0.92,
          item.color[0] / 255,
          item.color[1] / 255,
          item.color[2] / 255,
          0.85
        );
      }
    }

    if (dynLines.length > 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, dynamicBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dynLines), gl.STREAM_DRAW);
      bindInterleavedBuffer(dynamicBuf);
      gl.drawArrays(gl.LINES, 0, dynLines.length / 7);
    }

    if (engine.isCharacterMode && engine.showJointsOverlay) {
      const jointLines = [];
      for (const j of CHAR_JOINTS) {
        const [jx, jy, jz] = j.pos;
        const r = 0.65;
        pushWireBox(jointLines, jx - r, jy - r, jz - r, jx + r, jy + r, jz + r, 1.0, 0.82, 0.1, 0.95);
        pushLineSeg(jointLines, jx - r * 1.4, jy, jz, jx + r * 1.4, jy, jz, 1.0, 0.55, 0.0, 1.0);
        pushLineSeg(jointLines, jx, jy - r * 1.4, jz, jx, jy + r * 1.4, jz, 1.0, 0.55, 0.0, 1.0);
        pushLineSeg(jointLines, jx, jy, jz - r * 1.4, jx, jy, jz + r * 1.4, 1.0, 0.55, 0.0, 1.0);
      }
      gl.disable(gl.DEPTH_TEST);
      gl.bindBuffer(gl.ARRAY_BUFFER, dynamicBuf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(jointLines), gl.STREAM_DRAW);
      bindInterleavedBuffer(dynamicBuf);
      gl.drawArrays(gl.LINES, 0, jointLines.length / 7);
      gl.enable(gl.DEPTH_TEST);
    }

    if (jointLabelsLayer) {
      if (engine.isCharacterMode && engine.showJointsOverlay && !anyModalOpen) {
        jointLabelsLayer.innerHTML = '';
        for (const j of CHAR_JOINTS) {
          const sp = projectWorldToScreen(j.pos[0], j.pos[1], j.pos[2], vpMat, window.innerWidth, window.innerHeight);
          if (sp && sp.x >= 0 && sp.x <= window.innerWidth && sp.y >= 46 && sp.y <= window.innerHeight - 60) {
            const tag = document.createElement('span');
            const isLeft = j.id.startsWith('l_');
            const isCenter = j.id === 'neck_joint' || j.id === 'waist_joint';
            tag.className = `joint-tag${isLeft ? ' joint-tag-left' : isCenter ? ' joint-tag-top' : ''}`;
            tag.style.left = `${Math.round(sp.x)}px`;
            tag.style.top = `${Math.round(sp.y)}px`;
            tag.textContent = j.name;
            jointLabelsLayer.appendChild(tag);
          }
        }
      } else if (jointLabelsLayer.children.length > 0) {
        jointLabelsLayer.innerHTML = '';
      }
    }
  }

  requestAnimationFrame(renderFrame);
}
