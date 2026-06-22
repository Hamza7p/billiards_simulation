import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { COLORS, SIZES, TABLE } from '@/config/constants.js';


export function createTable(scene) {
  const group = new THREE.Group();

  const width = TABLE.width;
  const height = TABLE.height;
  const cushionH = TABLE.cushionHeight;

  const outerW = TABLE.width + TABLE.railWidth * 2;
  const outerH = TABLE.height + TABLE.railWidth * 2;
  const bodyHeight = TABLE.thickness * 0.72;
  const railHeight = TABLE.thickness * 0.28;
  const feltHeight = 0.01;

  const skirtMat = new THREE.MeshStandardMaterial({
    color: 0x111318,
    roughness: 0.42,
    metalness: 0.08,
    envMapIntensity: 0.5,
  });

  const railMat = new THREE.MeshStandardMaterial({
    color: COLORS.tableRail,
    roughness: 0.28,
    metalness: 0.1,
    envMapIntensity: 0.7,
  });

  const feltMat = new THREE.MeshStandardMaterial({
    color: COLORS.table,
    roughness: 0.92,
    metalness: 0.02,
    emissive: 0x001e39,
    emissiveIntensity: 0.02,
  });

  const pocketMat = new THREE.MeshStandardMaterial({
    color: COLORS.pocket,
    roughness: 1,
    metalness: 0,
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x1a1e21,
    roughness: 0.24,
    metalness: 0.18,
    envMapIntensity: 0.8,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: COLORS.tableWoodAccent,
    roughness: 0.36,
    metalness: 0.2,
  });

  const body = new THREE.Mesh(
    new RoundedBoxGeometry(outerW, outerH, bodyHeight, 10, SIZES.tableEdgeRadius),
    skirtMat
  );p
  body.position.z = bodyHeight / 2 - 0.01;
  group.add(body);

  const topRail = new THREE.Mesh(
    new RoundedBoxGeometry(outerW, outerH, railHeight, 10, SIZES.tableEdgeRadius * 0.7),
    railMat
  );
  topRail.position.z = bodyHeight + railHeight / 2 - 0.01;
  group.add(topRail);

  const felt = new THREE.Mesh(
    new THREE.BoxGeometry(width - 0.015, height - 0.015, feltHeight),
    feltMat
  );
  felt.position.z = bodyHeight + feltHeight / 2 + 0.01;
  group.add(felt);

  const cushionDepth = TABLE.railWidth * 0.5;
  const cushionRadius = 0.02;
  const cushions = [
    {
      geometry: new RoundedBoxGeometry(width + cushionDepth * 2, cushionDepth, cushionH, 6, cushionRadius),
      position: [0, height / 2 + cushionDepth / 2, bodyHeight + railHeight - cushionH / 2 - 0.01],
    },
    {
      geometry: new RoundedBoxGeometry(width + cushionDepth * 2, cushionDepth, cushionH, 6, cushionRadius),
      position: [0, -height / 2 - cushionDepth / 2, bodyHeight + railHeight - cushionH / 2 - 0.01],
    },
    {
      geometry: new RoundedBoxGeometry(cushionDepth, height, cushionH, 6, cushionRadius),
      position: [width / 2 + cushionDepth / 2, 0, bodyHeight + railHeight - cushionH / 2 - 0.01],
    },
    {
      geometry: new RoundedBoxGeometry(cushionDepth, height, cushionH, 6, cushionRadius),
      position: [-width / 2 - cushionDepth / 2, 0, bodyHeight + railHeight - cushionH / 2 - 0.01],
    },
  ];

  for (const cushion of cushions) {
    const mesh = new THREE.Mesh(cushion.geometry, accentMat);
    mesh.position.set(...cushion.position);
    group.add(mesh);
  }

  const pocketDepth = TABLE.pocketDepth;
  const pocketHoleGeo = new THREE.CylinderGeometry(SIZES.pocketRadius * 0.92, SIZES.pocketRadius * 0.92, pocketDepth, 32, 1, true);
  const pocketLipGeo = new THREE.TorusGeometry(SIZES.pocketRadius * 0.88, 0.013, 10, 32);

  for (const pocketPoint of TABLE.pocketPositions) {
    const pocketHole = new THREE.Mesh(pocketHoleGeo, pocketMat);
    pocketHole.rotation.x = Math.PI / 2;
    pocketHole.position.set(pocketPoint.x, pocketPoint.y, bodyHeight + 0.01);
    group.add(pocketHole);

    const pocketLip = new THREE.Mesh(pocketLipGeo, rimMat);
    pocketLip.rotation.x = Math.PI / 2;
    pocketLip.position.set(pocketPoint.x, pocketPoint.y, bodyHeight + 0.015);
    group.add(pocketLip);
  }

  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xfafafa });
  const markerGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.002, 16);
  const markerPositions = [
    [0, height / 2 + cushionDepth / 1.2, bodyHeight + railHeight + 0.005],
    [0, -height / 2 - cushionDepth / 1.2, bodyHeight + railHeight + 0.005],
    [width / 2 + cushionDepth / 4, 0, bodyHeight + railHeight + 0.005],
    [-width / 2 - cushionDepth / 4, 0, bodyHeight + railHeight + 0.005],
  ];
  for (const pos of markerPositions) {
    const marker = new THREE.Mesh(markerGeo, markerMaterial);
    marker.rotation.x = Math.PI / 2;
    marker.position.set(...pos);
    group.add(marker);
  }

  const logoMaterial = new THREE.MeshBasicMaterial({ color: 0xf5f5f5 });
  const logoGeo = new THREE.PlaneGeometry(width * 0.42, 0.1);
  const logo = new THREE.Mesh(logoGeo, logoMaterial);
  logo.position.set(0, -height / 2 - cushionDepth - 0.015, bodyHeight * 0.4);
  logo.rotation.x = -Math.PI / 2;
  group.add(logo);

  scene.add(group);
  return group;
}
