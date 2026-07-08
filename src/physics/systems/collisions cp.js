import * as vec3 from '../math/Vector3';
import { PHYSICS, CLOTH_LENGTH, CLOTH_WIDTH } from '@/global/constants';
import { POCKET_CENTERS, getPocketRegion } from '@/simulation/tableCollision';
import { 
    computeContactVelocity,
    computeContactDirections,
    applyImpulse,
    mergeImpulse,
} from '@/physics/systems/helpers';

// ─── Floor ────────────────────────────────────────────────────────────────
export function resolveFloorCollision(ball) {
  if (ball.position.z >= 0) return;

  ball.position.z = 0;

  if (Math.abs(ball.velocity.z) < 0.1)
    ball.velocity.z = 0;

  else if (ball.velocity.z < 0) {
    const e = 0.3;
    ball.velocity.z *= -e;
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
    const region = getPocketRegion(pocket);
    const dx = ball.position.x - region.center.x;
    const dy = ball.position.y - region.center.y;
    const distance = Math.hypot(dx, dy);

    if (distance < region.mouthRadius) {
      ball.pocketed = true;
      ball.pocketedBy = pocket;
      ball.pocketedAt = Date.now();

      ball.position.x = region.center.x;
      ball.position.y = region.center.y;
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
  const halfL = CLOTH_LENGTH / 2;
  const halfW = CLOTH_WIDTH / 2;

  const outX = p.x < -halfL - r || p.x > halfL + r;
  const outY = p.y < -halfW - r || p.y > halfW + r;

  if (outX || outY) {
    ball.jumpedOff = true;
    ball.jumpedOffAt = Date.now();
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