import * as THREE from 'three';

export function createLights(scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 0.18));

  const hemi = new THREE.HemisphereLight(0xf6f5ff, 0x0d1a1a, 0.35);
  hemi.position.set(0, 3, 0);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xfff7e0, 1.05);
  key.position.set(2.5, -3.5, 4.5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 10;
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xc8e1ff, 0.35);
  fill.position.set(-2.5, 2.5, 3);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, 0.18);
  rim.position.set(0, 3, -1);
  scene.add(rim);
}
