import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import { TABLE } from '@/config/constants';
import { TABLE_LAYOUT } from './tableLayout.js';

const EDGE_RADIUS = 0.03;
const FELT_THICKNESS = 0.008;
const DIAMOND_RADIUS = 0.006;

const BODY_MATERIAL =
  new THREE.MeshStandardMaterial({
    color: 0x001111, 
    roughness: 0.45,
    metalness: 0.45,
  });

const FELT_MATERIAL =
  new THREE.MeshStandardMaterial({
    color: 0x0d4ddb,
    roughness: 0.96,
    metalness: 0,
    emissive: 0x001325,
    emissiveIntensity: 0.03,
  });

const RUBBER_MATERIAL =
  new THREE.MeshStandardMaterial({
    color: 0x1f1f1f,
    roughness: 0.92,
    metalness: 0.02,
  });

const METAL_MATERIAL =
  new THREE.MeshStandardMaterial({
    color: 0x242424,
    roughness: 0.25,
    metalness: 0.7,
  });


function createFelt() {

  const shape = new THREE.Shape();

  const hw = TABLE.width / 2;
  const hh = TABLE.height / 2;

  shape.moveTo(-hw, -hh);
  shape.lineTo(hw, -hh);
  shape.lineTo(hw, hh);
  shape.lineTo(-hw, hh);
  shape.closePath();


  
  
  // for (const pocket of TABLE_LAYOUT.pockets) {
  //   const hole = new THREE.Path();

  //   hole.absellipse(
  //     pocket.x,
  //     pocket.y,
  //     TABLE.pocketRadius,
  //     TABLE.pocketRadius,
  //     0,
  //     Math.PI * 2
  //   );

  //   shape.holes.push(hole);
  // }

  const geometry =
    new THREE.ExtrudeGeometry(shape, {
      depth: FELT_THICKNESS,
      bevelEnabled: false,
    });

  const mesh = new THREE.Mesh(
      geometry,
      FELT_MATERIAL
    );

  mesh.position.z = TABLE.thickness;

  return mesh;
}

function createBody() {

  const outerWidth = TABLE.width + TABLE.railWidth * 2;
  const outerHeight = TABLE.height + TABLE.railWidth * 2;

  const body =
    new THREE.Mesh(
      new RoundedBoxGeometry(
        outerWidth,
        outerHeight,
        TABLE.thickness,
        8,
        EDGE_RADIUS
      ),
      BODY_MATERIAL
    );

  body.position.z = TABLE.thickness / 2;

  return body;
}

function createPocketLiners(group) {
  const linerGeometry =
    new THREE.CylinderGeometry(
      TABLE.pocketRadius,
      TABLE.pocketRadius,
      TABLE.pocketDepth,
      32
    );

  for (const pocket of TABLE_LAYOUT.pockets) {
    const liner =
      new THREE.Mesh(
        linerGeometry,
        METAL_MATERIAL
      );

    liner.rotation.x =
      Math.PI / 2;

    liner.position.set(
      pocket.x,
      pocket.y,
      TABLE.surfaceZ -
        TABLE.pocketDepth / 2
    );

    group.add(liner);
  }
}

function createCushionGeometry(length) {
  
    const profile = new THREE.Shape();

    profile.moveTo(0, 0);
    profile.lineTo(
        TABLE.railWidth * 0.8,
        0
    );

  profile.lineTo(
    TABLE.railWidth,
    TABLE.cushionHeight
  );

  profile.lineTo(
    0,
    TABLE.cushionHeight
  );

  profile.closePath();

  return new THREE.ExtrudeGeometry(
    profile,
    {
      depth: length,
      bevelEnabled: false,
    }
  );
}

function createCushions(group) {
  
    const sideLength = TABLE.height * 0.45;

  const topLength = TABLE.width * 0.45;

  const horizontalGeo = createCushionGeometry(topLength);

  const verticalGeo = createCushionGeometry(sideLength);

  const cushions = [
    {
      geo: horizontalGeo,
      pos: [
        -TABLE.width * 0.27,
        TABLE.height / 2,
      ],
      rot: [0, 0, Math.PI / 2],
    },

    {
      geo: horizontalGeo,
      pos: [
        TABLE.width * 0.27,
        TABLE.height / 2,
      ],
      rot: [0, 0, Math.PI / 2],
    },

    {
      geo: horizontalGeo,
      pos: [
        -TABLE.width * 0.27,
        -TABLE.height / 2,
      ],
      rot: [0, 0, -Math.PI / 2],
    },

    {
      geo: horizontalGeo,
      pos: [
        TABLE.width * 0.27,
        -TABLE.height / 2,
      ],
      rot: [0, 0, -Math.PI / 2],
    },

    {
      geo: verticalGeo,
      pos: [
        TABLE.width / 2,
        0,
      ],
      rot: [0, 0, Math.PI],
    },

    {
      geo: verticalGeo,
      pos: [
        -TABLE.width / 2,
        0,
      ],
      rot: [0, 0, 0],
    },
  ];

  for (const cushion of cushions) {
    const mesh =
      new THREE.Mesh(
        cushion.geo,
        RUBBER_MATERIAL
      );

    mesh.position.set(
      cushion.pos[0],
      cushion.pos[1],
      TABLE.surfaceZ
    );

    mesh.rotation.set(
      ...cushion.rot
    );

    group.add(mesh);
  }
}

function createDiamonds(group) {
  const geo =
    new THREE.CylinderGeometry(
      DIAMOND_RADIUS,
      DIAMOND_RADIUS,
      0.002,
      12
    );

  const mat =
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });

  const count = 3;

  for (let i = 1; i <= count; i++) {
    const offset =
      (TABLE.width / 4) * i;

    const top =
      new THREE.Mesh(geo, mat);

    top.rotation.x =
      Math.PI / 2;

    top.position.set(
      -TABLE.width / 2 + offset,
      TABLE.height / 2 +
        TABLE.railWidth * 0.8,
      TABLE.surfaceZ + 0.01
    );

    group.add(top);

    const bottom =
      top.clone();

    bottom.position.y *= -1;

    group.add(bottom);
  }
}

export function createTable(scene) {

  const table = new THREE.Group();

  table.add(
    createBody()
  );

  table.add(
    createFelt()
  );

  // createPocketLiners(table);

//   createCushions(table);

  // createDiamonds(table);

  scene.add(table);

  return table;
}