import * as THREE from 'three';

export function createLights(scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));

  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(2, 2, 5);
  scene.add(dir);
}