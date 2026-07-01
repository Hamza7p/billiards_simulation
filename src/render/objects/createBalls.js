import * as THREE from 'three';
import { BALL, SURFACE_Y, CUE_BALL_START } from '@/global/constants.js';
import { calcRackPositions, RACK_ORDER } from '@/global/ballsTriangle';


// ─── Shared texture loader ─────────────────────────────────────────────────
const loader = new THREE.TextureLoader();

function loadBallTexture(num) {
  const t = loader.load(`textures/poolballs${num}.png`);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS      = THREE.RepeatWrapping;
  t.wrapT      = THREE.ClampToEdgeWrapping;
  t.repeat.set(1, 1);
  return t;
}

function ballMaterial(num) {
  return new THREE.MeshStandardMaterial({
    map:       loadBallTexture(num),
    roughness: 0.05,
    metalness: 0.02,
    envMapIntensity: 1.0,
  });
}

function cueBallMaterial() {
  // procedural white ball with a red contact-point marker at the texture centre
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f8f8f0';
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

  const tex = new THREE.CanvasTexture(canvas);

  return new THREE.MeshStandardMaterial({
    map:       tex,
    roughness: 0.04,
    metalness: 0.02,
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────
export function createBalls(scene, radius = BALL.radius) {
  const geo = new THREE.SphereGeometry(radius, 32, 32);
  const ballY = SURFACE_Y + radius + 0.0002;

  // ── Rack balls ────────────────────────────────────────────────────────
  const positions = calcRackPositions();
  const rackMeshes = [];

  RACK_ORDER.forEach((num, i) => {
    const mesh = new THREE.Mesh(geo, ballMaterial(num));
    mesh.position.set(positions[i].x, ballY, positions[i].y);
    mesh.castShadow    = true;
    mesh.receiveShadow = true;
    mesh.userData.ballNumber = num;
    mesh.userData.isSolid    = num <= 7;
    mesh.userData.isStripe   = num >= 9 && num <= 15;
    mesh.userData.is8Ball    = num === 8;
    scene.add(mesh);
    rackMeshes.push(mesh);
  });

  // ── Cue ball ──────────────────────────────────────────────────────────
  const cueBall = new THREE.Mesh(geo, cueBallMaterial());
  cueBall.position.set(CUE_BALL_START.x, ballY, CUE_BALL_START.y);
  cueBall.castShadow    = true;
  cueBall.receiveShadow = true;
  cueBall.userData.ballNumber = 0;
  cueBall.userData.isCueBall  = true;
  scene.add(cueBall);

  return {
    cueBall,
    rack:   rackMeshes,
    all:    [cueBall, ...rackMeshes],   // index 0 = cue ball always
  };
}