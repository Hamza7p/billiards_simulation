import * as THREE from 'three';
import { BALL_COLORS, BALL, TABLE } from '@/config/constants.js';

export function createBalls(scene) {
  const balls = [];

  const bR = BALL.radius;
  const bY = TABLE.surfaceY + bR + 0.001;

  // تشكيلة المثلث - 15 كرة
  const rack = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col <= row; col++) {
      rack.push([0.78 + row * bR * 2.05, (col - row / 2) * bR * 2.05]);
    }
  }

  // إنشاء كرات التشكيلة
  rack.forEach(function (p, i) {
    if (i >= 15) return;

    const bGeo = new THREE.SphereGeometry(bR, 24, 18);
    const bMat = new THREE.MeshStandardMaterial({
      color: BALL_COLORS[i],
      roughness: 0.06,
      metalness: 0.08
    });
    const ball = new THREE.Mesh(bGeo, bMat);
    ball.position.set(p[0], bY, p[1]);
    ball.castShadow = true;
    scene.add(ball);
    balls.push(ball);
  });

  // كرة الضرب البيضاء
  const cueBall = new THREE.Mesh(
    new THREE.SphereGeometry(bR, 24, 18),
    new THREE.MeshStandardMaterial({
      color: 0xfefefe,
      roughness: 0.05,
      metalness: 0.04
    })
  );
  cueBall.position.set(-0.90, bY, 0);
  cueBall.castShadow = true;
  scene.add(cueBall);
  balls.push(cueBall);

  return {
    all: balls,
    cueBall: cueBall,
    rack: balls.slice(0, 15)
  };
}
