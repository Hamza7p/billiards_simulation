import * as THREE from 'three';
import { SURFACE_Y, BALL, CLOTH_LENGTH, CLOTH_WIDTH } from '@/global/constants';
import { POCKET_CENTERS } from '@/simulation/tableCollision';

// ── Mini-simulator constants ───────────────────────────────────────────────
const SIM_DT          = 1 / 240;
const MAX_STEPS       = 6000;
const MAX_BOUNCES     = 2;       // stop after this many wall bounces
const STOP_SPEED      = 0.04;
const MU_ROLLING      = 0.016;
const GRAVITY         = 9.81;
const POCKET_R        = BALL.radius * 3.2;

// ── Materials ─────────────────────────────────────────────────────────────
const MAT_NORMAL = new THREE.LineDashedMaterial({
  color:       0x4fc3f7,
  dashSize:    0.035,
  gapSize:     0.022,
  transparent: true,
  opacity:     0.7,
  depthWrite:  false,
});

const MAT_BOUNCE = new THREE.LineDashedMaterial({
  color:       0xf5a623,
  dashSize:    0.025,
  gapSize:     0.02,
  transparent: true,
  opacity:     0.55,
  depthWrite:  false,
});

const MAT_AIR = new THREE.LineDashedMaterial({
  color:       0xff6b6b,
  dashSize:    0.02,
  gapSize:     0.012,
  transparent: true,
  opacity:     0.5,
  depthWrite:  false,
});

const Y_CLOTH = SURFACE_Y + 0.004;

// ── Physics mini-sim (2-D + Z for elevation) ──────────────────────────────
function simulate(startPos, aimDeg, elevDeg, impulse, ballMass, ballRadius) {
  const aimRad  = (aimDeg  * Math.PI) / 180;
  const elevRad = (elevDeg * Math.PI) / 180;

  // Initial velocity in physics space (x, y, z)
  // physics X  = Three X
  // physics Y  = Three -Z
  // physics Z  = Three Y  (height)
  let speed  = impulse / ballMass;
  let vx     =  speed * Math.cos(elevRad) * Math.cos(aimRad);
  let vy     =  speed * Math.cos(elevRad) * Math.sin(aimRad);
  let vz     =  speed * Math.sin(elevRad);           // upward if elevated

  // State
  let px = startPos.x,  py = startPos.y,  pz = 0;
  let vX = vx,          vY = vy,          vZ = vz;

  const hL = CLOTH_LENGTH / 2;
  const hW = CLOTH_WIDTH  / 2;

  // Segments: array of { points: Vector3[], type: 'normal'|'bounce'|'air' }
  const segments = [];
  let   current  = { points: [], type: 'normal' };
  current.points.push(new THREE.Vector3(px, SURFACE_Y + ballRadius, -py));

  let bounces = 0;
  let airborne = false;

  for (let step = 0; step < MAX_STEPS; step++) {
    // Rolling friction on surface
    if (pz <= 0) {
      const spd = Math.hypot(vX, vY);
      if (spd > STOP_SPEED) {
        const dec = MU_ROLLING * GRAVITY * SIM_DT;
        const f   = Math.max(0, spd - dec) / spd;
        vX *= f;
        vY *= f;
      } else {
        vX = 0; vY = 0;
        break;
      }
    }

    // Gravity on Z when airborne
    if (pz > 0 || vZ > 0) {
      vZ -= GRAVITY * SIM_DT;
      airborne = true;
    }

    // Integrate
    px += vX * SIM_DT;
    py += vY * SIM_DT;
    pz += vZ * SIM_DT;

    // Floor landing
    if (pz < 0) {
      pz = 0;
      if (vZ < -0.5) vZ *= -0.3;   // small bounce
      else           vZ  = 0;
      if (airborne) {
        // switch segment type back to normal
        segments.push(current);
        current  = { points: [], type: 'normal' };
        airborne = false;
      }
    }

    // Three.js world position for this sample
    const threeY = SURFACE_Y + ballRadius + pz;
    const pt = new THREE.Vector3(px, threeY, -py);

    // Pocket check
    let pocketed = false;
    for (const pk of POCKET_CENTERS) {
      if (Math.hypot(px - pk.x, py - pk.y) < POCKET_R) {
        current.points.push(pt);
        pocketed = true;
        break;
      }
    }
    if (pocketed) break;

    // Wall bounces
    let bounced = false;
    if (px + ballRadius > hL) {
      px = hL - ballRadius;
      vX = -Math.abs(vX) * 0.65;
      bounced = true;
    } else if (px - ballRadius < -hL) {
      px = -hL + ballRadius;
      vX =  Math.abs(vX) * 0.65;
      bounced = true;
    }
    if (py + ballRadius > hW) {
      py = hW - ballRadius;
      vY = -Math.abs(vY) * 0.65;
      bounced = true;
    } else if (py - ballRadius < -hW) {
      py = -hW + ballRadius;
      vY =  Math.abs(vY) * 0.65;
      bounced = true;
    }

    if (bounced) {
      bounces++;
      current.points.push(pt);
      segments.push(current);
      current = { points: [pt], type: bounces >= MAX_BOUNCES ? 'bounce' : 'normal' };
      if (bounces > MAX_BOUNCES) break;
    } else {
      current.type = airborne ? 'air' : (bounces > 0 ? 'bounce' : 'normal');
      current.points.push(pt);
    }
  }

  if (current.points.length > 1) segments.push(current);
  return segments;
}

// ── Line builder ──────────────────────────────────────────────────────────
function buildLine(points, mat) {
  const geo  = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geo, mat);
  line.computeLineDistances();   // required for dashes
  return line;
}

// ── Public ────────────────────────────────────────────────────────────────
export function createTrajectory(scene) {
  let lines = [];

  function _clear() {
    lines.forEach(l => {
      scene.remove(l);
      l.geometry.dispose();
    });
    lines = [];
  }

  /**
   * @param {object} cueBallPhysPos   — { x, y }  physics 2-D position
   * @param {object} controls         — { aimDeg, cueElevDeg, shotImpulse, ballMass, ballRadius }
   */
  function update(cueBallPhysPos, controls) {
    _clear();

    const segments = simulate(
      cueBallPhysPos,
      controls.aimDeg,
      controls.cueElevDeg,
      controls.shotImpulse,
      controls.ballMass,
      controls.ballRadius,
    );

    for (const seg of segments) {
      if (seg.points.length < 2) continue;
      const mat  = seg.type === 'air' ? MAT_AIR
                 : seg.type === 'bounce' ? MAT_BOUNCE
                 : MAT_NORMAL;
      const line = buildLine(seg.points, mat);
      scene.add(line);
      lines.push(line);
    }
  }

  function hide() {
    _clear();
  }

  return { update, hide };
}