import * as THREE from 'three';
import { SURFACE_Y, BALL } from '@/global/constants';

// ─── Master taper ──────────────────────────────────────────────────────────

const TIP_R      = 0.0065;
const BUTT_R     = 0.0185;
const CUE_TOTAL  = 1.00; //1.47;
const SEGMENTS   = 24;
const HIT_ANIM_MS = 200;

// Section lengths (must sum to CUE_TOTAL)
const FERRULE_H = 0.022;
const SHAFT_LEN = CUE_TOTAL * 0.575;
const RING_H    = 0.012;
const WRAP_LEN  = CUE_TOTAL * 0.178;
const BUTT_LEN  = CUE_TOTAL * 0.207;
const CAP_H     = 0.018;

// Cumulative Y at each joint
const Y0 = 0;
const Y1 = Y0 + FERRULE_H;
const Y2 = Y1 + SHAFT_LEN;
const Y3 = Y2 + RING_H;
const Y4 = Y3 + WRAP_LEN;
const Y5 = Y4 + RING_H;
const Y6 = Y5 + BUTT_LEN;

// Radius at any Y — single source of truth
const R = y => TIP_R + (BUTT_R - TIP_R) * (y / CUE_TOTAL);

// ─── Procedural texture helpers ────────────────────────────────────────────
function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function toTexture(canvas, repeat = [1, 1]) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.needsUpdate = true;
  return t;
}

// ── Maple wood shaft ─────────────────────────────────────────────────────
function mapleAlbedo() {
  const [c, ctx] = makeCanvas(512, 128);
  // warm cream base
  const grd = ctx.createLinearGradient(0, 0, 512, 0);
  grd.addColorStop(0,    '#f0dfa8');
  grd.addColorStop(0.3,  '#eedda2');
  grd.addColorStop(0.55, '#f5e6b4');
  grd.addColorStop(0.8,  '#e8d498');
  grd.addColorStop(1,    '#f0dfa8');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 512, 128);

  // fine grain lines
  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 512;
    const w = 0.4 + Math.random() * 1.2;
    ctx.strokeStyle = Math.random() > 0.5 ? '#c8a96e' : '#d4bc84';
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + (Math.random()-0.5)*8, 32, x + (Math.random()-0.5)*8, 96, x + (Math.random()-0.5)*6, 128);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return toTexture(c, [4, 1]);
}

function mapleRoughness() {
  const [c, ctx] = makeCanvas(256, 64);
  ctx.fillStyle = '#888';
  ctx.fillRect(0, 0, 256, 64);
  ctx.globalAlpha = 0.25;
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#aaa' : '#666';
    ctx.fillRect(Math.random()*256, Math.random()*64, 1+Math.random()*3, 64);
  }
  ctx.globalAlpha = 1;
  return toTexture(c, [4, 1]);
}

function mapleNormal() {
  const [c, ctx] = makeCanvas(256, 64);
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, 256, 64);
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 256;
    ctx.strokeStyle = '#6060ff';
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x + (Math.random()-0.5)*4, 64);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return toTexture(c, [4, 1]);
}

// ── Irish Linen wrap ─────────────────────────────────────────────────────
function linenAlbedo() {
  const [c, ctx] = makeCanvas(256, 256);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 256, 256);
  // weave pattern
  ctx.globalAlpha = 0.18;
  for (let y = 0; y < 256; y += 3) {
    for (let x = 0; x < 256; x += 3) {
      const shade = ((x + y) % 6 === 0) ? '#555' : '#333';
      ctx.fillStyle = shade;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  ctx.globalAlpha = 1;
  return toTexture(c, [3, 6]);
}

function linenNormal() {
  const [c, ctx] = makeCanvas(128, 128);
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, 128, 128);
  ctx.globalAlpha = 0.3;
  for (let y = 0; y < 128; y += 4) {
    for (let x = 0; x < 128; x += 4) {
      const v = ((x + y) % 8 === 0) ? '#6868ff' : '#9898ff';
      ctx.fillStyle = v;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  ctx.globalAlpha = 1;
  return toTexture(c, [3, 6]);
}

function linenRoughness() {
  const [c, ctx] = makeCanvas(128, 128);
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(0, 0, 128, 128);
  ctx.globalAlpha = 0.3;
  for (let y = 0; y < 128; y += 3) {
    for (let x = 0; x < 128; x += 3) {
      ctx.fillStyle = Math.random() > 0.5 ? '#ddd' : '#aaa';
      ctx.fillRect(x, y, 2, 2);
    }
  }
  ctx.globalAlpha = 1;
  return toTexture(c, [3, 6]);
}

// ── Rosewood butt ─────────────────────────────────────────────────────────
function rosewoodAlbedo() {
  const [c, ctx] = makeCanvas(512, 128);
  const grd = ctx.createLinearGradient(0, 0, 512, 0);
  grd.addColorStop(0,    '#2a0e08');
  grd.addColorStop(0.2,  '#5c1a10');
  grd.addColorStop(0.45, '#3d1209');
  grd.addColorStop(0.7,  '#6b2215');
  grd.addColorStop(1,    '#2a0e08');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 512, 128);

  // dark grain streaks
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 512;
    ctx.strokeStyle = Math.random() > 0.5 ? '#180805' : '#7a2a18';
    ctx.lineWidth = 0.5 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(
      x + (Math.random()-0.5)*12, 40,
      x + (Math.random()-0.5)*12, 88,
      x + (Math.random()-0.5)*10, 128
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return toTexture(c, [3, 1]);
}

function rosewoodRoughness() {
  const [c, ctx] = makeCanvas(256, 64);
  ctx.fillStyle = '#505050';
  ctx.fillRect(0, 0, 256, 64);
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#777' : '#333';
    ctx.fillRect(Math.random()*256, 0, 1 + Math.random()*2, 64);
  }
  ctx.globalAlpha = 1;
  return toTexture(c, [3, 1]);
}

// ── Brass ring ────────────────────────────────────────────────────────────
function brassAlbedo() {
  const [c, ctx] = makeCanvas(64, 64);
  const grd = ctx.createLinearGradient(0, 0, 0, 64);
  grd.addColorStop(0,   '#c8922a');
  grd.addColorStop(0.3, '#e8b84b');
  grd.addColorStop(0.6, '#d4a030');
  grd.addColorStop(1,   '#a87020');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 64, 64);
  // subtle polish marks
  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 10; i++) {
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, Math.random()*64); ctx.lineTo(64, Math.random()*64);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return toTexture(c);
}

// ── Ivory ferrule / inlay ─────────────────────────────────────────────────
function ivoryAlbedo() {
  const [c, ctx] = makeCanvas(64, 64);
  ctx.fillStyle = '#f2ebd4';
  ctx.fillRect(0, 0, 64, 64);
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = '#c8b890';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(Math.random()*64, 0); ctx.lineTo(Math.random()*64, 64);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return toTexture(c);
}

// ── Leather tip ───────────────────────────────────────────────────────────
function leatherAlbedo() {
  const [c, ctx] = makeCanvas(64, 64);
  ctx.fillStyle = '#2c3a4a';
  ctx.fillRect(0, 0, 64, 64);
  ctx.globalAlpha = 0.15;
  for (let y = 0; y < 64; y += 2) {
    for (let x = 0; x < 64; x += 2) {
      if (Math.random() > 0.6) {
        ctx.fillStyle = '#1a2530';
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  ctx.globalAlpha = 1;
  return toTexture(c);
}

// ─── Material factory ──────────────────────────────────────────────────────
function makeMaterials() {
  return {
    shaft: new THREE.MeshStandardMaterial({
      map:         mapleAlbedo(),
      normalMap:   mapleNormal(),
      roughnessMap: mapleRoughness(),
      roughness:   0.35,
      metalness:   0.0,
    }),
    wrap: new THREE.MeshStandardMaterial({
      map:         linenAlbedo(),
      normalMap:   linenNormal(),
      roughnessMap: linenRoughness(),
      roughness:   0.92,
      metalness:   0.0,
    }),
    butt: new THREE.MeshStandardMaterial({
      map:         rosewoodAlbedo(),
      roughnessMap: rosewoodRoughness(),
      roughness:   0.42,
      metalness:   0.05,
    }),
    brass: new THREE.MeshStandardMaterial({
      map:       brassAlbedo(),
      roughness: 0.25,
      metalness: 0.85,
    }),
    ivory: new THREE.MeshStandardMaterial({
      map:       ivoryAlbedo(),
      roughness: 0.3,
      metalness: 0.0,
    }),
    leather: new THREE.MeshStandardMaterial({
      map:       leatherAlbedo(),
      roughness: 0.88,
      metalness: 0.0,
    }),
  };
}

// ─── Segment helper ────────────────────────────────────────────────────────
// Creates a cylinder whose radii are taken from the master taper at yBot/yTop.
// Position is centred at mid-Y so the group origin stays at Y=0 (tip).
function seg(yBot, yTop, mat, radialSegs = SEGMENTS) {
  const geo  = new THREE.CylinderGeometry(R(yTop), R(yBot), yTop - yBot, radialSegs, 1);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = (yBot + yTop) / 2;
  mesh.castShadow = true;
  return mesh;
}

// ─── Full cue mesh ────────────────────────────────────────────────────────
function buildCueMesh(mat) {
  const group = new THREE.Group();

  // 1. Leather tip dome — caps the tip end
  const tipDome = new THREE.Mesh(
    new THREE.SphereGeometry(R(Y0), SEGMENTS, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    mat.leather
  );
  tipDome.rotation.x = Math.PI;
  tipDome.position.y = Y0;
  tipDome.castShadow = true;
  group.add(tipDome);

  // 2. Ferrule — ivory  (R(Y0) → R(Y1), seamless)
  group.add(seg(Y0, Y1, mat.ivory));

  // 3. Shaft — maple  (R(Y1) → R(Y2))
  group.add(seg(Y1, Y2, mat.shaft, 32));

  // 4. Brass ring — shaft / wrap joint  (R(Y2) → R(Y3))
  group.add(seg(Y2, Y3, mat.brass));

  // 5. Linen wrap  (R(Y3) → R(Y4))
  group.add(seg(Y3, Y4, mat.wrap));

  // 6. Brass ring — wrap / butt joint  (R(Y4) → R(Y5))
  group.add(seg(Y4, Y5, mat.brass));

  // 7. Rosewood butt  (R(Y5) → R(Y6))
  group.add(seg(Y5, Y6, mat.butt));

  // 8. Brass butt cap — slightly narrower end
  const capGeo = new THREE.CylinderGeometry(R(Y6) * 0.70, R(Y6), CAP_H, SEGMENTS);
  const cap    = new THREE.Mesh(capGeo, mat.brass);
  cap.position.y = Y6 + CAP_H / 2;
  cap.castShadow = true;
  group.add(cap);

  return group;
}

// ─── Public API ───────────────────────────────────────────────────────────
export function createCue(scene) {
  const mat = makeMaterials();
  const cue = buildCueMesh(mat);
  cue.visible = false;
  scene.add(cue);

  let animating = false;

  // Convert physics 2-D position → Three.js world Vector3
  function physToWorld(physPos) {
    return new THREE.Vector3(physPos.x, SURFACE_Y + BALL.radius, -physPos.y);
  }

  function _pose(ballWorldPos, aimDeg, elevDeg, pullback, ballRadius = BALL.radius) {
    const aimRad  = (aimDeg  * Math.PI) / 180;
    const elevRad = (elevDeg * Math.PI) / 180;

    // tip position: behind ball along aim direction
    const tipX = ballWorldPos.x - Math.cos(aimRad) * pullback;
    const tipZ = ballWorldPos.z + Math.sin(aimRad) * pullback;
    const tipY = SURFACE_Y + ballRadius;

    cue.position.set(tipX, tipY, tipZ);
    cue.rotation.set(0, 0, 0);
    // yaw: aim around world Y
    cue.rotation.y = aimRad;
    // pitch: elevation around cue's local Z
    cue.rotateZ(-elevRad + Math.PI/2 + 0.01);
  }

  /**
   * Call every frame while isMoving === false.
   * @param {THREE.Vector3} ballWorldPos
   * @param {number} aimDeg
   * @param {number} elevDeg
   * @param {number} impulse
   */
  function update(ballWorldPos, aimDeg, elevDeg, impulse, ballRadius = BALL.radius) {
    if (animating) return;
    cue.visible = true;
    const MIN_GAP = ballRadius + 0.014;
    const pullback = MIN_GAP + impulse * 0.048;
    _pose(ballWorldPos, aimDeg, elevDeg, pullback, ballRadius);
  }

  /**
   * Strike animation: cue lunges toward ball then hides.
   * @param {THREE.Vector3} ballWorldPos
   * @param {number} aimDeg
   * @param {number} elevDeg
   * @param {number} impulse
   * @param {Function} onComplete   — fire actual physics shoot() here
   */
  function playStrike(ballWorldPos, aimDeg, elevDeg, impulse, onComplete, ballRadius = BALL.radius) {
    if (animating) return;
    animating = true;

    const MIN_GAP   = ballRadius + 0.014;
    const startPull = MIN_GAP + impulse * 0.048;
    const endPull   = MIN_GAP * 0.2;   // tip almost touches ball

    const t0 = performance.now();

    function tick(now) {
      const raw = Math.min((now - t0) / HIT_ANIM_MS, 1);
      const eased = raw * raw;   // ease-in: accelerate toward ball
      const pull  = startPull + (endPull - startPull) * eased;
      _pose(ballWorldPos, aimDeg, elevDeg, pull, ballRadius);

      if (raw < 1) {
        requestAnimationFrame(tick);
      } else {
        cue.visible = false;
        animating   = false;
        onComplete?.();
      }
    }

    requestAnimationFrame(tick);
  }

  function hide() {
    if (!animating) 
      cue.visible = false;
  }

  function dispose() {
    Object.values(mat).forEach(m => {
      m.map?.dispose();
      m.normalMap?.dispose();
      m.roughnessMap?.dispose();
      m.dispose();
    });
    cue.traverse(o => o.geometry?.dispose());
    scene.remove(cue);
  }

  return { update, playStrike, hide, dispose, physToWorld };
}