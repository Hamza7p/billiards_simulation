import * as vec3 from '../math/Vector3';
import { PHYSICS, CLOTH_LENGTH, CLOTH_WIDTH, BALL } from '@/global/constants';
import { computeContactVelocity, applyImpulse } from '@/physics/systems/helpers';
import { POCKET_CENTERS } from '@/simulation/tableCollision';

// ─── Floor ────────────────────────────────────────────────────────────────
export function resolveFloorCollision(ball) {
  if (ball.position.z >= 0) return;

  ball.position.z = 0;

  if (Math.abs(ball.velocity.z) < 0.1) {
    ball.velocity.z = 0;
  } else if (ball.velocity.z < 0) {
    ball.velocity.z *= -0.3;
  }
}

// ─── Cushion ──────────────────────────────────────────────────────────────
export function resolveCushionCollision(ball, restitution = PHYSICS.railRestitution) {
  if (ball.pocketed) return;

  const R = ball.radius;
  const m = ball.mass;
  const e = restitution ?? PHYSICS.railRestitution;
  const mu = 0.2;

  const n = vec3.create();

  if (!_detectCushionContact(ball, n)) return;

  n.z = 0.1;
  vec3.normalize(n, n);

  const rc = vec3.create();
  vec3.scale(rc, n, R);

  const vc = computeContactVelocity(ball, rc);

  const vn = vec3.create();
  const vt = vec3.create();
  vec3.scale(vn, n, vec3.dot(vc, n));
  vec3.sub(vt, vc, vn);

  const t = vec3.create();
  vec3.normalize(t, vt);
  vec3.negate(t, t);

  const jn = -m * (1 + e) * vec3.dot(vc, n);
  const jt = Math.min(Math.abs(jn) * mu, (2 / 7) * m * vec3.length(vt));

  const j = vec3.create();
  vec3.scale(j, n, jn);
  vec3.addScaled(j, j, t, jt);

  applyImpulse(ball, j, rc);
}

// ─── Pocket capture ───────────────────────────────────────────────────────
export function resolvePocketCapture(ball) {
  if (ball.pocketed) return;

  for (const pocket of POCKET_CENTERS) {
    const dx = ball.position.x - pocket.x;
    const dy = ball.position.y - pocket.y;

    if (Math.hypot(dx, dy) < pocket.radius) {
      ball.pocketed  = true;
      ball.pocketedBy = pocket;

      // pull toward pocket centre then drop
      ball.position.x = pocket.x;
      ball.position.y = pocket.y;
      ball.position.z = -0.25;  // drop below table surface

      vec3.zero(ball.velocity);
      vec3.zero(ball.angularVelocity);
      return;
    }
  }
}

// ─── Ball-to-ball collision ───────────────────────────────────────────────
export function resolveBallCollisions(balls, restitution = PHYSICS.ballRestitution ?? 0.95) {
  for (let i = 0; i < balls.length; i++) {
    if (balls[i].pocketed) continue;

    for (let j = i + 1; j < balls.length; j++) {
      if (balls[j].pocketed) continue;

      _resolvePair(balls[i], balls[j], restitution);
    }
  }
}

function _resolvePair(a, b, restitution = PHYSICS.ballRestitution ?? 0.95) {
  const dx = b.position.x - a.position.x;
  const dy = b.position.y - a.position.y;
  const dz = b.position.z - a.position.z;
  const dist = Math.hypot(dx, dy, dz);
  const minDist = a.radius + b.radius;

  if (dist >= minDist || dist < 1e-10) return;

  // normalise
  const nx = dx / dist;
  const ny = dy / dist;

  // positional correction — push apart
  const overlap = (minDist - dist) / 2;
  a.position.x -= nx * overlap;
  a.position.y -= ny * overlap;
  b.position.x += nx * overlap;
  b.position.y += ny * overlap;

  // relative velocity along normal
  const dvx = b.velocity.x - a.velocity.x;
  const dvy = b.velocity.y - a.velocity.y;
  const dvn = dvx * nx + dvy * ny;

  // already separating
  if (dvn > 0) return;

  const e  = restitution ?? PHYSICS.ballRestitution ?? 0.95;
  const ma = a.mass;
  const mb = b.mass;
  const j  = -(1 + e) * dvn / (1 / ma + 1 / mb);

  a.velocity.x -= (j / ma) * nx;
  a.velocity.y -= (j / ma) * ny;
  b.velocity.x += (j / mb) * nx;
  b.velocity.y += (j / mb) * ny;
}

// ─── Off-table jump ───────────────────────────────────────────────────────
export function resolveJumpedBall(ball) {
  if (ball.pocketed) return false;

  const r = ball.radius;
  const p = ball.position;

  const outX = p.x < -(CLOTH_LENGTH / 2) - r || p.x > (CLOTH_LENGTH / 2) + r;
  const outY = p.y < -(CLOTH_WIDTH  / 2) - r || p.y > (CLOTH_WIDTH  / 2) + r;

  if (outX || outY) {
    // freeze in place — game logic layer handles re-spotting
    ball.jumpedOff = true;
    vec3.zero(ball.velocity);
    vec3.zero(ball.angularVelocity);
    return true;
  }

  return false;
}

// ─── Internal ─────────────────────────────────────────────────────────────
function _detectCushionContact(ball, n) {
  if (ball.pocketed) return false;

  const R   = ball.radius;
  const p   = ball.position;
  const hL  = CLOTH_LENGTH / 2;
  const hW  = CLOTH_WIDTH  / 2;

  // Skip if near a pocket mouth (avoid false cushion bounce inside pocket)
  for (const pocket of POCKET_CENTERS) {
    if (Math.hypot(p.x - pocket.x, p.y - pocket.y) < pocket.radius * 1.2) {
      return false;
    }
  }

  if (p.x + R > hL)  { n.x = -1; p.x =  hL - R; return true; }
  if (p.x - R < -hL) { n.x =  1; p.x = -hL + R; return true; }
  if (p.y + R > hW)  { n.y = -1; p.y =  hW - R; return true; }
  if (p.y - R < -hW) { n.y =  1; p.y = -hW + R; return true; }

  return false;
}