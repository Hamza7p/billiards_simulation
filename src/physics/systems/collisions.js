import * as vec3 from '../math/Vector3';
import {
  POCKET_CENTERS,
  CUSHION_HEIGHT,
  findPocketAt,
  findCushionWallAt,
  isBallOffTable,
} from '@/simulation/tableCollision';
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

  if (Math.abs(ball.velocity.z) < 0.1) {
    ball.velocity.z = 0;
  } else if (ball.velocity.z < 0) {
    ball.velocity.z *= -eFloor;
  }
}

// ─── Cushion ──────────────────────────────────────────────────────────────
export function resolveCushionCollision(ball, eCushion) {
  if (ball.pocketed) return;

  const R = ball.radius;
  const m = ball.mass;
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

  const jn = -m * (1 + eCushion) * vec3.dot(vc, n);
  const jt = -Math.min(Math.abs(jn) * mu, 2/7 * m * vec3.length(vt));
  const j = mergeImpulse(jn, n, jt, t);

  applyImpulse(ball, j, rc);
}

// ─── Pocket capture ───────────────────────────────────────────────────────
// A ball is captured either by reaching a real pocket mouth, or by escaping
// through a cushion gap beyond the cloth edge — both count as falling in,
// never as jumping off the table.
export function resolvePocketCapture(ball) {
  if (ball.pocketed) return;

  const pocket = findPocketAt(ball.position) || _pocketBeyondGap(ball);
  if (!pocket) return;

  ball.pocketed   = true;
  ball.pocketedBy = pocket;
  ball.pocketedAt = Date.now();

  ball.position.x = pocket.x;
  ball.position.y = pocket.y;
  ball.position.z = -0.25;

  vec3.zero(ball.velocity);
  vec3.zero(ball.angularVelocity);
}

// ─── Off-table jump ───────────────────────────────────────────────────────
export function resolveJumpedBall(ball) {
  if (ball.pocketed) return false;

  // Already claimed by a pocket (mouth or gap) this tick — not a jump.
  if (findPocketAt(ball.position)) return false;
  if (!isBallOffTable(ball)) return false;

  ball.jumpedOff   = true;
  ball.jumpedOffAt = Date.now();
  vec3.zero(ball.velocity);
  vec3.zero(ball.angularVelocity);
  return true;
}

// ─── Ball return (respawn) ─────────────────────────────────────────────────
// Purely mechanical: puts a pocketed-or-jumped ball back into play at
// `respawnPosition`. It does NOT decide which balls should be returned —
// that's the caller's job (e.g. only ever call this for the cue ball, or
// for object balls specifically because they jumped off).
export function resolveBallReturn(ball, respawnPosition) {
  if (!ball.pocketed && !ball.jumpedOff) return false;

  ball.position.x = respawnPosition.x;
  ball.position.y = respawnPosition.y;
  ball.position.z = respawnPosition.z ?? 0;

  vec3.zero(ball.velocity);
  vec3.zero(ball.angularVelocity);

  ball.pocketed   = false;
  ball.pocketedBy = null;
  ball.jumpedOff  = false;

  return true;
}

// ─── Internal ─────────────────────────────────────────────────────────────
function _detectCushionContact(ball, n) {
  if (ball.pocketed) return false;

  // Ball has hopped high enough to clear the physical cushion top — let it
  // fly over instead of bouncing off an invisible 2D wall (jump shots).
  if (ball.position.z >= CUSHION_HEIGHT) return false;

  const R = ball.radius;
  const p = ball.position;

  const wall = findCushionWallAt(p, R);
  if (!wall) return false; // clear of every rail, or inside a pocket-mouth gap

  const sign = Math.sign(wall.value);

  if (wall.axis === 'y') {
    n.x = 0; n.y = sign;
    p.y = wall.value - sign * R;
  } else {
    n.x = sign; n.y = 0;
    p.x = wall.value - sign * R;
  }

  return true;
}

function _pocketBeyondGap(ball) {
  if (!isBallOffTable(ball)) return null;
  if (findCushionWallAt(ball.position, ball.radius)) return null; // still on a real cushion

  return _nearestPocket(ball.position);
}

function _nearestPocket(position) {
  let nearest = null;
  let bestDistance = Infinity;

  for (const pocket of POCKET_CENTERS) {
    const distance = Math.hypot(position.x - pocket.x, position.y - pocket.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      nearest = pocket;
    }
  }

  return nearest;
}