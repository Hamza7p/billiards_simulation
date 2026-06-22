import * as THREE from 'three';
import { COLORS, TABLE_SURFACE_Z } from '@/config/constants.js';

export function createCue(scene) {
  const group = new THREE.Group();
  group.visible = false;

  const shaftMat = new THREE.MeshStandardMaterial({
    color: COLORS.cue,
    roughness: 0.6,
    metalness: 0.1,
  });

  const tipMat = new THREE.MeshStandardMaterial({
    color: COLORS.cueTip,
    roughness: 0.4,
    metalness: 0,
  });

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.01, 0.7, 12),
    shaftMat
  );
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = 0.35;
  group.add(shaft);

  const tip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.008, 0.04, 12),
    tipMat
  );
  tip.rotation.x = Math.PI / 2;
  tip.position.z = 0.02;
  group.add(tip);

  scene.add(group);

  return group;
}

/**
 * Position and orient the cue stick at the contact point.
 */
export function updateCue(cue, ball, cueDirection, contactOffset) {
  const centerZ = TABLE_SURFACE_Z + ball.radius;

  const contactWorld = new THREE.Vector3(
    ball.position.x + contactOffset.x,
    ball.position.y + contactOffset.y,
    centerZ + contactOffset.z
  );

  const dir = new THREE.Vector3(
    -cueDirection.x,
    -cueDirection.y,
    -cueDirection.z
  ).normalize();

  cue.position.copy(contactWorld);
  cue.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    dir
  );
}
