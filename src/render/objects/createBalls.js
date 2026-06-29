import * as THREE from 'three';
import { BALL, TABLE } from '@/config/constants.js';

export function createBalls(scene) {
  const balls = [];
  const bR = BALL.radius;
  const bY = TABLE.surfaceY + bR + 0.001;

  const textureLoader = new THREE.TextureLoader();

  const rack = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col <= row; col++) {
      rack.push([0.78 + row * bR * 2.05, (col - row / 2) * bR * 2.05]);
    }
  }

  rack.forEach(function (p, i) {
    if (i >= 15) return;

    const ballNum = i + 1;
    
    const ballTexture = textureLoader.load(`textures/poolballs${ballNum}.png`);
    
    ballTexture.wrapS = THREE.RepeatWrapping;
    ballTexture.wrapT = THREE.ClampToEdgeWrapping;

    ballTexture.repeat.set(2, 1);

    ballTexture.colorSpace = THREE.SRGBColorSpace;

    const bGeo = new THREE.SphereGeometry(bR, 32, 32);
    const bMat = new THREE.MeshStandardMaterial({
      map: ballTexture,
      roughness: 0.05,
      metalness: 0.02,
    });

    const ball = new THREE.Mesh(bGeo, bMat);
    ball.position.set(p[0], bY, -p[1]);
    ball.castShadow = true;
    
    scene.add(ball);
    balls.push(ball);
  });


  const cueBallGeo = new THREE.SphereGeometry(bR, 32, 32);
  const cueBallTexture = createCueBallTexture();
  
  const cueBallMat = new THREE.MeshStandardMaterial({
    map: cueBallTexture,
    roughness: 0.04,
    metalness: 0.02
  });

  const cueBall = new THREE.Mesh(cueBallGeo, cueBallMat);
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

function createCueBallTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#fefefe';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#8b0000'; 
  
  const points = [
    [0.25, 0.25], [0.75, 0.25],
    [0.5, 0.5],   [0.0, 0.5],
    [0.25, 0.75], [0.75, 0.75]
  ];

  const dotRadius = 24; 

  points.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(canvas.width * x, canvas.height * y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  });

  return new THREE.CanvasTexture(canvas);
}