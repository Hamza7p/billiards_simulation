
import * as THREE from 'three';
import { COLORS, BALL } from '@/config/constants.js';

// دالة لإنشاء كرة بلون معين (افتراضي أبيض)
export function createBall(scene, color = null) {
  const ballColor = color !== null ? color : COLORS.ball;
  
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(BALL.radius, 64, 64),
    new THREE.MeshStandardMaterial({
      color: ballColor,
      roughness: 0.3,
      metalness: 0.1,
    })
  );
  ball.castShadow = true;
  ball.receiveShadow = true;
  ball.position.z = BALL.radius;
  scene.add(ball);
  return ball;
}