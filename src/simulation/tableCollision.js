// tableCollision.js
//───────────────────────────────────────────────────────────────────────────

import { CLOTH_LENGTH, CLOTH_WIDTH } from '@/global/constants.js';
import { POCKET_POSITIONS, POCKET_GAP, RAIL_WIDTH, POCKET_RADIUS } from '@/render/objects/createTable.js';

const halfL = CLOTH_LENGTH / 2;
const halfW = CLOTH_WIDTH  / 2;
const G     = POCKET_GAP;
const CP    = RAIL_WIDTH * 0.5;

// ── Play-field boundaries (inner cloth edge) ──────────────────────────────
export const TABLE_BOUNDS = {
  minX: -halfL,
  maxX:  halfL,
  minY: -halfW,
  maxY:  halfW,
};

// ── Pockets, mapped into physics space ─────────────────────────────────────
// radius is the real drawn pocket radius — the single source of truth for
// both the visual mouth and the capture test.
export const POCKET_CENTERS = POCKET_POSITIONS.map(([tx, tz]) => ({
  x: tx,
  y: -tz,
  radius: POCKET_RADIUS,
}));

// ── Cushion walls, cut back exactly where createTable.js leaves a pocket
// gap in the rails. The bounce plane sits at the cloth edge.
export const CUSHION_WALLS = [
  { axis: 'y', value: -halfW, xFrom: -halfL + CP + G, xTo: -G },
  { axis: 'y', value: -halfW, xFrom:  G,               xTo:  halfL - CP - G },
  { axis: 'y', value:  halfW, xFrom: -halfL + CP + G, xTo: -G },
  { axis: 'y', value:  halfW, xFrom:  G,               xTo:  halfL - CP - G },
  { axis: 'x', value: -halfL, yFrom: -halfW + CP + G, yTo:  halfW - CP - G },
  { axis: 'x', value:  halfL, yFrom: -halfW + CP + G, yTo:  halfW - CP - G },
];

/**
 * Returns the pocket whose mouth contains `position`, or null.
 * @param {{x:number, y:number}} position
 */
export function findPocketAt(position) {
  for (const pocket of POCKET_CENTERS) {
    const dx = position.x - pocket.x;
    const dy = position.y - pocket.y;
    if (Math.hypot(dx, dy) < pocket.radius) return pocket;
  }
  return null;
}

/**
 * Returns the cushion wall that `position` is actually penetrating, or null
 * if none (either clear of every rail, or inside a pocket-mouth gap).
 * Range and penetration are checked together for each wall — a wall is only
 * ever returned if the ball is both within its span AND crossing its plane,
 * so a wall on the far side of the table can never be matched by mistake.
 * @param {{x:number, y:number}} position
 * @param {number} radius — ball radius
 */
export function findCushionWallAt(position, radius) {
  for (const wall of CUSHION_WALLS) {
    const sign = Math.sign(wall.value);

    if (wall.axis === 'y') {
      if (position.x < wall.xFrom - radius || position.x > wall.xTo + radius) continue;
      const penetrated = sign > 0 ? position.y + radius > wall.value : position.y - radius < wall.value;
      if (penetrated) return wall;
    } else {
      if (position.y < wall.yFrom - radius || position.y > wall.yTo + radius) continue;
      const penetrated = sign > 0 ? position.x + radius > wall.value : position.x - radius < wall.value;
      if (penetrated) return wall;
    }
  }
  return null;
}

/**
 * True once the ball has passed beyond the table edge without being
 * captured by a pocket (e.g. it jumped or was pushed off the felt).
 * @param {Object} ball — { position:{x,y}, radius }
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