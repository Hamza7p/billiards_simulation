import * as THREE from 'three';
import { COLORS , BALL } from '@/config/constants.js';

export function createBall(scene) {
  const group = new THREE.Group();

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(BALL.radius, 32, 32),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
    })
  );

  group.add(ball);

  const markerGeometry = new THREE.SphereGeometry(
    BALL.radius * 0.12,
    16,
    16
  );

  const markers = [
    { pos: [ BALL.radius, 0, 0], color: 0xff0000 }, // +X
    { pos: [-BALL.radius, 0, 0], color: 0x880000 },

    { pos: [0, BALL.radius, 0], color: 0x00ff00 }, // +Y
    { pos: [0,-BALL.radius, 0], color: 0x008800 },

    { pos: [0, 0, BALL.radius], color: 0x0000ff }, // +Z
    { pos: [0, 0,-BALL.radius], color: 0x000088 },
  ];

  for (const m of markers) {
    const marker = new THREE.Mesh(
      markerGeometry,
      new THREE.MeshStandardMaterial({
        color: m.color,
      })
    );

    marker.position.set(...m.pos);
    group.add(marker);
  }

  group.position.z = BALL.radius;

  scene.add(group);

  return group;
}