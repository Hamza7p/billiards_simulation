// tableCollision.js
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for table boundaries used by the physics system.
// All values are in PHYSICS space (2D: x = long axis, y = short axis).
// Import these constants into your collision resolver instead of hard-coding.
// ─────────────────────────────────────────────────────────────────────────────

// simulation/tableCollision.js
import { CLOTH_LENGTH, CLOTH_WIDTH, BALL } from '@/global/constants.js';
import { POCKET_POSITIONS, POCKET_GAP, RAIL_WIDTH } from '@/render/objects/createTable.js';


// ── Play-field boundaries (inner cloth edge) ──────────────────────────────
export const TABLE_BOUNDS = {
  minX: -CLOTH_LENGTH / 2,
  maxX:  CLOTH_LENGTH / 2,
  minY: -CLOTH_WIDTH  / 2,
  maxY:  CLOTH_WIDTH  / 2,
};

// ── Pocket positions in physics 2D space ──────────────────────────────────
// createTable exports POCKET_POSITIONS as [x, z] in Three.js space.
// Physics space: x → x, z → -y  (because Three Z is negated)
export const POCKET_CENTERS = POCKET_POSITIONS.map(([tx, tz]) => ({
  x:      tx,
  y:     -tz,
  radius: BALL.radius * 3.2,   // capture radius — tune to feel
}));

// ── Cushion segments in physics 2D space ─────────────────────────────────
// Each segment is an axis-aligned wall the ball can bounce off.
// { axis: 'x'|'y', value, from, to }

const halfL = CLOTH_LENGTH / 2;
const halfW = CLOTH_WIDTH  / 2;
const G     = POCKET_GAP;
const CP    = RAIL_WIDTH * 0.5;   // corner pocket x/y extent

export const CUSHION_WALLS = [
  // Long cushions (parallel to X) — back rail (y = -halfW) split by side pocket
  { axis:'y', value: -halfW, xFrom: -halfL + CP + G, xTo: -G          },
  { axis:'y', value: -halfW, xFrom:  G,               xTo:  halfL - CP - G },
  // Long cushions — front rail (y = +halfW)
  { axis:'y', value:  halfW, xFrom: -halfL + CP + G, xTo: -G          },
  { axis:'y', value:  halfW, xFrom:  G,               xTo:  halfL - CP - G },
  // Short cushions (parallel to Y) — left and right
  { axis:'x', value: -halfL, yFrom: -halfW + CP + G, yTo: halfW - CP - G  },
  { axis:'x', value:  halfL, yFrom: -halfW + CP + G, yTo: halfW - CP - G  },
];

// ── Collision resolvers ───────────────────────────────────────────────────

/**
 * Resolve ball vs cushion walls.
 * Mutates ball.position and ball.velocity.
 * Call once per physics tick after motion integration.
 *
 * @param {Object} ball   — { position:{x,y}, velocity:{x,y}, radius }
 * @param {number} restitution — cushion bounce coefficient (0.6–0.75 typical)
 */
export function resolveCushionCollisions(ball, restitution = 0.65) {
  const r = ball.radius;

  for (const wall of CUSHION_WALLS) {
    if (wall.axis === 'y') {
      // ball must be within the wall's X range
      if (ball.position.x < wall.xFrom - r || ball.position.x > wall.xTo + r) continue;

      const inner = wall.value > 0
        ? wall.value - r   // front rail — ball must stay below
        : wall.value + r;  // back  rail — ball must stay above

      if (wall.value > 0 && ball.position.y > inner) {
        ball.position.y  = inner;
        ball.velocity.y  = -Math.abs(ball.velocity.y) * restitution;
      } else if (wall.value < 0 && ball.position.y < inner) {
        ball.position.y  = inner;
        ball.velocity.y  =  Math.abs(ball.velocity.y) * restitution;
      }
    } else {
      // axis === 'x'
      if (ball.position.y < wall.yFrom - r || ball.position.y > wall.yTo + r) continue;

      const inner = wall.value > 0
        ? wall.value - r
        : wall.value + r;

      if (wall.value > 0 && ball.position.x > inner) {
        ball.position.x  = inner;
        ball.velocity.x  = -Math.abs(ball.velocity.x) * restitution;
      } else if (wall.value < 0 && ball.position.x < inner) {
        ball.position.x  = inner;
        ball.velocity.x  =  Math.abs(ball.velocity.x) * restitution;
      }
    }
  }
}

/**
 * Check if a ball has fallen into a pocket.
 * Returns the pocket object if captured, null otherwise.
 *
 * @param {Object} ball — { position:{x,y}, radius }
 */
export function checkPocketCapture(ball) {
  for (const pocket of POCKET_CENTERS) {
    const dx = ball.position.x - pocket.x;
    const dy = ball.position.y - pocket.y;
    if (Math.hypot(dx, dy) < pocket.radius) {
      return pocket;
    }
  }
  return null;
}

/**
 * Check if a ball has jumped off the table.
 *
 * @param {Object} ball — { position:{x,y,z}, radius }  (z = height in physics)
 */
export function isBallOffTable(ball) {
  const r = ball.radius;
  return (
    ball.position.x < TABLE_BOUNDS.minX - r ||
    ball.position.x > TABLE_BOUNDS.maxX + r ||
    ball.position.y < TABLE_BOUNDS.minY - r ||
    ball.position.y > TABLE_BOUNDS.maxY + r
  );
}