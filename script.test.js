import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  engine,
  BODY_PART_SPECS,
  CHAR_JOINTS,
  computeBodyProportionsFromHead,
  syncProportionalRigToHeadSize,
  getJointForPart,
  initCharacterTemplate,
  generateHyperbuildHBObject,
  serializeHBFile,
  deserializeHBFile,
  getIndex,
  setVoxelRaw,
} from './script.js';

test('Proportional body scaling follows headSize (e.g. 16x16x16, 8x8x8, 24x24x24)', () => {
  const p16 = computeBodyProportionsFromHead(16);
  assert.deepEqual(p16.headSize, [16, 16, 16]);
  assert.deepEqual(p16.fullTorso, [16, 24, 8]);
  assert.deepEqual(p16.armUpper, [8, 12, 8]);
  assert.deepEqual(p16.legUpper, [8, 12, 8]);
  assert.deepEqual(p16.workspaceDimensions, [48, 72, 32]);

  const p8 = computeBodyProportionsFromHead(8);
  assert.deepEqual(p8.headSize, [8, 8, 8]);
  assert.deepEqual(p8.fullTorso, [8, 12, 4]);
  assert.deepEqual(p8.armUpper, [4, 6, 4]);
  assert.deepEqual(p8.workspaceDimensions, [24, 36, 16]);

  const p24 = computeBodyProportionsFromHead(24);
  assert.deepEqual(p24.headSize, [24, 24, 24]);
  assert.deepEqual(p24.fullTorso, [24, 36, 12]);
  assert.deepEqual(p24.armUpper, [12, 18, 12]);
  assert.deepEqual(p24.workspaceDimensions, [72, 108, 48]);
});

test('Every body part and internal organ is bound to a valid skeletal joint', () => {
  syncProportionalRigToHeadSize(16);
  const jointIds = new Set(CHAR_JOINTS.map((j) => j.id));
  for (let id = 1; id <= 20; id++) {
    const spec = BODY_PART_SPECS[id];
    assert.ok(spec, `Part ${id} should exist`);
    assert.ok(
      jointIds.has(spec.followJoint),
      `Part ${id} (${spec.name}) followJoint ${spec.followJoint} must be a valid joint`
    );
    const jInfo = getJointForPart(id);
    assert.equal(jInfo.jointId, spec.followJoint);
    assert.equal(jInfo.jointPos.length, 3);
  }
});

test('.hb export includes headSize, proportional body specs, joint bindings, and per-voxel XYZ + color + followJoint', () => {
  initCharacterTemplate(16);
  const hbStr = serializeHBFile('test_hyperbuild_char');
  const hb = JSON.parse(hbStr);

  assert.equal(hb.extension, '.hb');
  assert.equal(hb.engine, 'Hyperbuild 4D');
  assert.deepEqual(hb.headSize, [16, 16, 16]);
  assert.equal(hb.headCubeDimension, 16);
  assert.deepEqual(hb.workspaceDimensions, [48, 72, 32]);
  assert.ok(Array.isArray(hb.joints) && hb.joints.length === 10);
  assert.ok(Array.isArray(hb.parts) && hb.parts.length === 20);
  assert.ok(Array.isArray(hb.voxels) && hb.voxels.length > 1000);
  assert.equal(hb.totalVoxels, hb.voxels.length);

  // Verify sample voxel structure has x, y, z, color, rgba, partId, followJoint, jointOffset
  const sample = hb.voxels[0];
  assert.equal(typeof sample.x, 'number');
  assert.equal(typeof sample.y, 'number');
  assert.equal(typeof sample.z, 'number');
  assert.match(sample.color, /^#[0-9A-F]{8}$/);
  assert.equal(typeof sample.partId, 'number');
  assert.equal(typeof sample.followJoint, 'string');
  assert.ok(sample.followJoint.endsWith('_joint'));
  assert.equal(sample.jointOffset.length, 3);
});

test('.hb import reconstructs character structure, headSize proportions, voxel XYZ, colors, and joint bindings', () => {
  // 1. Create a character with headSize 8 (24x36x16 workspace)
  initCharacterTemplate(8);
  assert.equal(engine.headSize, 8);
  assert.equal(engine.gridX, 24);
  assert.equal(engine.gridY, 36);
  assert.equal(engine.gridZ, 16);

  const exportedStr = serializeHBFile('scaled_8_char');

  // Switch engine to 16 headSize so we can verify import resets back to 8
  initCharacterTemplate(16);
  assert.equal(engine.headSize, 16);
  assert.equal(engine.gridX, 48);

  // Import the 8x8x8 headSize .hb structure
  const ok = deserializeHBFile(exportedStr);
  assert.equal(ok, true);
  assert.equal(engine.headSize, 8);
  assert.equal(engine.gridX, 24);
  assert.equal(engine.gridY, 36);
  assert.equal(engine.gridZ, 16);
  assert.ok(engine.activeVoxelCount > 200);

  // 2. Test importing a custom hand-crafted .hb payload with explicit voxels & joint names
  const customHB = {
    format: 'HYPERBUILD_4D_HB_V1',
    extension: '.hb',
    headSize: [16, 16, 16],
    voxels: [
      { x: 20, y: 55, z: 12, color: '#FF1155FF', partId: 1, followJoint: 'neck_joint' },
      { x: 10, y: 40, z: 15, color: '#22CCFFFF', partId: 4, followJoint: 'l_shoulder_joint' },
      { x: 26, y: 8, z: 16, color: '#33FF77FF', partId: 11, followJoint: 'r_knee_joint' },
    ],
  };
  const ok2 = deserializeHBFile(JSON.stringify(customHB));
  assert.equal(ok2, true);
  assert.equal(engine.headSize, 16);
  assert.equal(engine.activeVoxelCount, 3);

  const idx1 = getIndex(20, 55, 12);
  assert.equal(engine.active[idx1], 1);
  assert.equal(engine.partId[idx1], 1);
  assert.equal(getJointForPart(engine.partId[idx1]).jointId, 'neck_joint');
  assert.deepEqual(
    [engine.color[idx1 * 4], engine.color[idx1 * 4 + 1], engine.color[idx1 * 4 + 2], engine.color[idx1 * 4 + 3]],
    [255, 17, 85, 255]
  );

  const idx2 = getIndex(10, 40, 15);
  assert.equal(engine.active[idx2], 1);
  assert.equal(engine.partId[idx2], 4);
  assert.equal(getJointForPart(engine.partId[idx2]).jointId, 'l_shoulder_joint');

  const idx3 = getIndex(26, 8, 16);
  assert.equal(engine.active[idx3], 1);
  assert.equal(engine.partId[idx3], 11);
  assert.equal(getJointForPart(engine.partId[idx3]).jointId, 'r_knee_joint');
});

test('Codebase contains zero references to removed words', () => {
  const files = ['index.html', 'script.js', 'style.css', 'metadata.json', 'README.md'];
  const forbidden = [/4d\s*miner/i, /4dminer/i, /minecraft/i];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const pattern of forbidden) {
      assert.equal(
        pattern.test(content),
        false,
        `File ${file} must not match forbidden pattern ${pattern}`
      );
    }
  }
});
