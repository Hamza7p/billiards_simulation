import * as vec3 from '../math/Vector3';
import { CLOTH_LENGTH, CLOTH_WIDTH } from '@/global/constants';
import { POCKET_CENTERS } from '@/simulation/tableCollision';
import { 
    computeContactVelocity,
    computeContactDirections,
    applyImpulse,
    mergeImpulse,
} from '@/physics/systems/helpers';
import { playWallHitSound } from '@/render/helpers/sounds';

// ─── Floor ────────────────────────────────────────────────────────────────
export function resolveFloorCollision(ball, eFloor) {
  if (ball.position.z >= 0) return;

  ball.position.z = 0;

  if (Math.abs(ball.velocity.z) < 0.1)
    ball.velocity.z = 0;

  else if (ball.velocity.z < 0) {
    ball.velocity.z *= -eFloor;
  }
}

// ─── Cushion ──────────────────────────────────────────────────────────────
export function resolveCushionCollision(ball, eCushion) {
  if (ball.pocketed) return;

  const R = ball.radius;
  const m = ball.mass;
  const e = eCushion;
  const mu = 0.2;

  const n = vec3.create();

  if (!_detectCushionContact(ball, n)) return;

  playWallHitSound();

  n.z = 0.1;
  vec3.normalize(n, n);

  const rc = vec3.create();
  vec3.scale(rc, n, R);

  const vc = computeContactVelocity(ball, rc);
  const { vt, t } = computeContactDirections(vc, n);

  const jn = -m * (1 + e) * vec3.dot(vc, n);
  const jt = -Math.min(Math.abs(jn) * mu, 2/7 * m * vec3.length(vt));
  const j = mergeImpulse(jn, n, jt, t);

  applyImpulse(ball, j, rc);
}

// ─── Pocket capture ───────────────────────────────────────────────────────
export function resolvePocketCapture(ball) {
  if (ball.pocketed) return;

  for (const pocket of POCKET_CENTERS) {
    const dx = ball.position.x - pocket.x;
    const dy = ball.position.y - pocket.y;
    const distance = Math.hypot(dx, dy);

    if (distance < pocket.mouthRadius) {
      ball.pocketed = true;
      ball.pocketedBy = pocket;
      ball.pocketedAt = Date.now();

      ball.position.x = pocket.x;
      ball.position.y = pocket.y;
      ball.position.z = -0.25;

      vec3.zero(ball.velocity);
      vec3.zero(ball.angularVelocity);
      return;
    }
  }
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

  if (p.x + R > hL)  { n.x =  1; p.x =  hL - R; return true; }
  if (p.x - R < -hL) { n.x = -1; p.x = -hL + R; return true; }
  if (p.y + R > hW)  { n.y =  1; p.y =  hW - R; return true; }
  if (p.y - R < -hW) { n.y = -1; p.y = -hW + R; return true; }

  return false;
}