import * as THREE from 'three';

export function createLights(scene) {
  // General ambient light
  const ambientLight = new THREE.AmbientLight(0xfffaf0, 1.8); // أبيض دافئ قوي
  scene.add(ambientLight);

  // diffus light
  const hemisphereLight = new THREE.HemisphereLight(
    0xfff5e0, // sky color
    0xffeedd, // earth color
    0.8
  );
  scene.add(hemisphereLight);

  // First direction light ( left side)
  const overheadLight1 = new THREE.DirectionalLight(0xfffaea, 1.4);
  overheadLight1.position.set(-1, 6, 0); 
  overheadLight1.target.position.set(-1, 0, 0);
  overheadLight1.castShadow = true; 
  scene.add(overheadLight1);
  scene.add(overheadLight1.target);

  // Second direction light ( right side)
  const overheadLight2 = new THREE.DirectionalLight(0xfffaea, 1.4);
  overheadLight2.position.set(1, 6, 0);
  overheadLight2.target.position.set(1, 0, 0);
  overheadLight2.castShadow = true; 
  scene.add(overheadLight2);
  scene.add(overheadLight2.target);

  // Front ligth for remove shadow
  const fillLight = new THREE.DirectionalLight(0xfff8f0, 0.5);
  fillLight.position.set(0, 2, 5);
  fillLight.castShadow = true;
  scene.add(fillLight);
}



// export function createLights(scene) {

//   scene.add(new THREE.AmbientLight(0x0a1520, 2.4));

//   var spotPositions = [[0,3.4,0,3.0], [-1.6,2.9,0,1.8], [1.6,2.9,0,1.8], [2, 4, -2, 0.3]];
//   spotPositions.forEach(function(sp) {
//     var spot = new THREE.SpotLight(0xd0deff, sp[3], 9, Math.PI/5.5, 0.55, 1.3);
//     spot.position.set(sp[0], sp[1], sp[2]);
//     spot.target.position.set(sp[0], 0, sp[2]);
//     spot.castShadow = true;
//     spot.shadow.mapSize.width = 512;
//     spot.shadow.mapSize.height = 512;
//     scene.add(spot);
//     scene.add(spot.target);
//   });

//   var pl1 = new THREE.PointLight(0x2060b0, 0.55, 12);
//   pl1.position.set(-3, 1.5, -2); scene.add(pl1);
//   var pl2 = new THREE.PointLight(0x102030, 0.35, 10);
//   pl2.position.set(3, 1.0, 2); scene.add(pl2);

// }