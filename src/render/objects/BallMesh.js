import * as THREE from 'three';
import { COLORS , BALL } from '@/config/constants.js';

export function createBall(scene) {
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(BALL.radius, 32, 32),
    new THREE.MeshStandardMaterial({
      color: COLORS.ball,
    })
  );
  ball.position.z = BALL.radius;
  scene.add(ball);
  return ball;
}