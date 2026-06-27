import * as THREE from 'three';
import { TABLE, MATERIALS, TABLE_POCKETS } from '@/config/constants.js';
import netImage from '@/assets/imgs/net.png';

export function createTable(scene) {
  const T = new THREE.Group();

  // half of table dimensions
  const TL = TABLE.length /2; 
  const TW = TABLE.width /2;  
  const TH = TABLE.thickness /2;

  const RW = TABLE.railWidth;
  const RH = TABLE.railHeight;
  const PR = TABLE.pocketRadius;
  const GAP = TABLE.pocketGap;
  const BY = TABLE.surfaceY;

  // materials
  const matBody = new THREE.MeshStandardMaterial(MATERIALS.body);
  const matCloth = new THREE.MeshStandardMaterial(MATERIALS.cloth);
  const matRail = new THREE.MeshStandardMaterial(MATERIALS.rail);
  const matBlack = new THREE.MeshStandardMaterial(MATERIALS.black);
  const matRing = new THREE.MeshStandardMaterial(MATERIALS.ring);
  const matCorner = new THREE.MeshStandardMaterial(MATERIALS.corner);
  const matTrim = new THREE.MeshStandardMaterial(MATERIALS.trim);

  // 1. table body
  const bodyMesh = new THREE.Mesh(new THREE.BoxGeometry(TL * 2, TH * 2, TW * 2), matBody);
  bodyMesh.receiveShadow = true;
  bodyMesh.castShadow = true;
  T.add(bodyMesh);

  // bottom surface
  const bot = new THREE.Mesh(new THREE.BoxGeometry(TL * 2 + 0.04, 0.02, TW * 2 + 0.04), matBody);
  bot.position.y = -TH - 0.01;
  T.add(bot);

  // trim metal strip around the body
  const trimH = 0.013;
  [
    [TL * 2 + 0.01, trimH, 0.015, 0, 0, -(TW + 0.008)],
    [TL * 2 + 0.01, trimH, 0.015, 0, 0, TW + 0.008],
    [0.015, trimH, TW * 2 + 0.01, -(TL + 0.008), 0, 0],
    [0.015, trimH, TW * 2 + 0.01, TL + 0.008, 0, 0]
  ].forEach(function (p) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(p[0], p[1], p[2]), matTrim);
    m.position.set(p[3], p[4], p[5]);
    T.add(m);
  });

  // 2. cloth felt
  const clothLength = (TL - RW) * 2;
  const clothWidth = (TW - RW) * 2;
  const clothMesh = new THREE.Mesh(new THREE.PlaneGeometry(clothLength, clothWidth), matCloth);
  clothMesh.rotation.x = -Math.PI / 2;
  // cloth y position
  clothMesh.position.y = BY + 0.001;
  clothMesh.receiveShadow = true;
  T.add(clothMesh);

  // 3. rails cushions — cut at each pocket
  const railY = BY + RH / 2;

  // ── The two long edges (X extension) ──
  const zSides = [-(TW - RW / 2), TW - RW / 2];

  zSides.forEach(function (rz) {
    const xCornerL = -TL + RW * 0.6;
    const xCornerR = TL - RW * 0.6;
    const xMid = 0;

    // west piece
    const s1 = xCornerL + GAP;
    const e1 = xMid - GAP;
    const len1 = e1 - s1;
    if (len1 > 0.01) {
      const rm1 = new THREE.Mesh(new THREE.BoxGeometry(len1, RH, RW), matRail);
      rm1.position.set(s1 + len1 / 2, railY, rz);
      rm1.castShadow = true;
      T.add(rm1);
    }

    // north piece
    const s2 = xMid + GAP;
    const e2 = xCornerR - GAP;
    const len2 = e2 - s2;
    if (len2 > 0.01) {
      const rm2 = new THREE.Mesh(new THREE.BoxGeometry(len2, RH, RW), matRail);
      rm2.position.set(s2 + len2 / 2, railY, rz);
      rm2.castShadow = true;
      T.add(rm2);
    }
  });

  // ── The two short edges (Z extension) ──
  const xSides = [-(TL - RW / 2), TL - RW / 2];

  xSides.forEach(function (rx) {

    const zCornerB = -TW + RW * 0.6;
    const zCornerF = TW - RW * 0.6;
    const sZ = zCornerB + GAP;
    const eZ = zCornerF - GAP;
    const lenZ = eZ - sZ;

    if (lenZ > 0.01) {
      const rm = new THREE.Mesh(new THREE.BoxGeometry(RW, RH, lenZ), matRail);
      rm.position.set(rx, railY, sZ + lenZ / 2);
      rm.castShadow = true;
      T.add(rm);
    }
  });

  // ──The four corner blocks ── black pieces above pockets
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) {
    const cx = s[0] * (TL - RW / 2);
    const cz = s[1] * (TW - RW / 2);
    const cb = new THREE.Mesh(new THREE.BoxGeometry(RW, RH, RW), matCorner);
    cb.position.set(cx, railY, cz);
    cb.rotation.y = Math.PI / 4;
    cb.castShadow = true;
    // T.add(cb);
  });

  // 4. pockets
  TABLE_POCKETS.forEach(function (pk) {
    const px = pk[0];
    const pz = pk[1];



    // texture for pocket
    const textureLoader = new THREE.TextureLoader();
    const netTexture = textureLoader.load(netImage);

    netTexture.colorSpace = THREE.SRGBColorSpace;
    netTexture.wrapS = THREE.RepeatWrapping;
    netTexture.wrapT = THREE.RepeatWrapping;
    netTexture.repeat.set(2, 2);

    const netMaterial = new THREE.MeshStandardMaterial({
      map: netTexture,
      roughness: 0.9,
      metalness: 0.05,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    }); 

    // net disc on the cloth surface
    // for the sake of concavity, but it's very small
    const topD = new THREE.Mesh(new THREE.CircleGeometry(PR * 1.08, 32), netMaterial);
    const concaveDepth = 0.0015;
    const positions = topD.geometry.attributes.position;
    const radius = PR * 1.08;
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const y = positions.getY(i);

      const r = Math.sqrt(x * x + y * y);
      const falloff = 1 - Math.min(r / radius, 1);
      positions.setZ(i, -concaveDepth * falloff);
    }
    positions.needsUpdate = true;

    topD.rotation.x = -Math.PI / 2;
    topD.position.set(px, BY + 0.002, pz);
    T.add(topD);



    // internal leather ring
    const rimG = new THREE.TorusGeometry(PR, 0.016, 10, 36);
    const rim = new THREE.Mesh(rimG, matCorner);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(px, BY + 0.003, pz);
    // T.add(rim);

    // external metal ring
    const outerG = new THREE.TorusGeometry(PR + 0.018, 0.01, 8, 36);
    const outer = new THREE.Mesh(outerG, matRing);
    outer.rotation.x = Math.PI / 2;
    outer.position.set(px, BY + 0.002, pz);
    T.add(outer);

    // deep conical cup
    const cupG = new THREE.CylinderGeometry(PR * 0.95, PR * 0.4, 0.2, 28, 1, true);
    const cup = new THREE.Mesh(cupG, matBlack);
    cup.position.set(px, BY - 0.1, pz);
    T.add(cup);

    // bottom of the pit
    const baseG = new THREE.CircleGeometry(PR * 0.38, 24);
    const base = new THREE.Mesh(baseG, matBlack);
    base.rotation.x = Math.PI / 2;
    base.position.set(px, BY - 0.195, pz);
    T.add(base);
  });

  scene.add(T);
  return T;
}