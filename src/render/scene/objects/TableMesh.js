
import * as THREE from 'three';
import { COLORS, SIZES, TABLE } from '@/config/constants.js';

export function createTable(scene) {

  // ========================
  // سطح الطاولة الأخضر
  // ========================
  const felt = new THREE.Mesh(
    new THREE.PlaneGeometry(SIZES.tableWidth, SIZES.tableHeight),
    new THREE.MeshLambertMaterial({ color: COLORS.table })
  );
  felt.receiveShadow = true;
  scene.add(felt);

  // ========================
  // الحواف الأربعة (رمادي)
  // ========================
  const railColor = 0x808080;
  const railH = 0.06;   // سماكة الحافة
  const railT = 0.05;   // ارتفاع الحافة

  const railMat = new THREE.MeshLambertMaterial({ color: railColor });

  // الحافة اليمنى
  const rightRail = new THREE.Mesh(
    new THREE.BoxGeometry(railH, SIZES.tableHeight, railT),
    railMat
  );
  rightRail.position.set(TABLE.maxX + railH / 2, 0, railT / 2);
  scene.add(rightRail);

  // الحافة اليسرى
  const leftRail = new THREE.Mesh(
    new THREE.BoxGeometry(railH, SIZES.tableHeight, railT),
    railMat
  );
  leftRail.position.set(TABLE.minX - railH / 2, 0, railT / 2);
  scene.add(leftRail);

  // الحافة العليا
  const topRail = new THREE.Mesh(
    new THREE.BoxGeometry(SIZES.tableWidth + railH * 2, railH, railT),
    railMat
  );
  topRail.position.set(0, TABLE.maxY + railH / 2, railT / 2);
  scene.add(topRail);

  // الحافة السفلى
  const bottomRail = new THREE.Mesh(
    new THREE.BoxGeometry(SIZES.tableWidth + railH * 2, railH, railT),
    railMat
  );
  bottomRail.position.set(0, TABLE.minY - railH / 2, railT / 2);
  scene.add(bottomRail);

  // ========================
  // الجيوب (6 جيوب سوداء)
  // ========================
  const pocketMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  const pocketGeo = new THREE.CircleGeometry(0.06, 16);

  const pockets = [
    // زوايا
    [TABLE.minX, TABLE.minY],
    [TABLE.maxX, TABLE.minY],
    [TABLE.minX, TABLE.maxY],
    [TABLE.maxX, TABLE.maxY],
    // أوساط
    [0, TABLE.minY],
    [0, TABLE.maxY],
  ];

  pockets.forEach(([x, y]) => {
    const pocket = new THREE.Mesh(pocketGeo, pocketMat);
    pocket.position.set(x, y, 0.001);
    scene.add(pocket);
  });

  // ========================
  // إطار خشبي خارجي (بني)
  // ========================
  const woodMat = new THREE.MeshLambertMaterial({ color: 0x5c3d1e });
  const woodT = 0.04;
  const woodW = 0.15;

  // إطار سفلي
  const frameBottom = new THREE.Mesh(
    new THREE.BoxGeometry(SIZES.tableWidth + woodW * 2, woodW, woodT),
    woodMat
  );
  frameBottom.position.set(0, TABLE.minY - railH - woodW / 2, woodT / 2);
  scene.add(frameBottom);

  // إطار علوي
  const frameTop = new THREE.Mesh(
    new THREE.BoxGeometry(SIZES.tableWidth + woodW * 2, woodW, woodT),
    woodMat
  );
  frameTop.position.set(0, TABLE.maxY + railH + woodW / 2, woodT / 2);
  scene.add(frameTop);

  // إطار يميني
  const frameRight = new THREE.Mesh(
    new THREE.BoxGeometry(woodW, SIZES.tableHeight + woodW * 2, woodT),
    woodMat
  );
  frameRight.position.set(TABLE.maxX + railH + woodW / 2, 0, woodT / 2);
  scene.add(frameRight);

  // إطار يساري
  const frameLeft = new THREE.Mesh(
    new THREE.BoxGeometry(woodW, SIZES.tableHeight + woodW * 2, woodT),
    woodMat
  );
  frameLeft.position.set(TABLE.minX - railH - woodW / 2, 0, woodT / 2);
  scene.add(frameLeft);

  // ========================
  // أرجل الطاولة
  // ========================
  const legMat = new THREE.MeshLambertMaterial({ color: 0x3d2b1f });
  const legGeo = new THREE.BoxGeometry(0.1, 0.1, 0.4);

  const legPositions = [
    [TABLE.minX + 0.1, TABLE.minY + 0.1],
    [TABLE.maxX - 0.1, TABLE.minY + 0.1],
    [TABLE.minX + 0.1, TABLE.maxY - 0.1],
    [TABLE.maxX - 0.1, TABLE.maxY - 0.1],
  ];

  legPositions.forEach(([x, y]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, y, -0.2);
    scene.add(leg);
  });
}

