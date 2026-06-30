import * as THREE from 'three';
import { COLORS } from '@/global/constants.js';

export function createAimLine(scene) {
  const dir = new THREE.Vector3(1, 0, 0); // Default direction
  const origin = new THREE.Vector3(0, 0, 0); // Will be updated
  const length = 1; // Will be updated
  const color = COLORS.aim;
  const headLength = 0.1;
  const headWidth = 0.05;

  const aimArrow = new THREE.ArrowHelper(dir, origin, length, color, headLength, headWidth);

  aimArrow.visible = false; // Initially hidden

  scene.add(aimArrow);

  return aimArrow;
}

