import * as THREE from 'three';
import { COLORS, SIZES } from '@/config/constants.js';

export function createTable(scene) {
  const table = new THREE.Mesh(
    new THREE.PlaneGeometry(SIZES.tableWidth, SIZES.tableHeight),
    new THREE.MeshLambertMaterial({
      color: COLORS.table,
    })
  );
  scene.add(table);
}