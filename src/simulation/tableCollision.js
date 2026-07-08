// tableCollision.js
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for table/physics GEOMETRY (bounds, cushions,
// pockets). Everything here is derived from the exact constants used to draw
// the table in createTable.js, so collisions always match what is rendered.
// Collision RESOLUTION (impulses, capture, jump handling) lives entirely in
// collisions.js — this file only exposes geometry + lookup helpers.
// Physics 2D space: x = long axis, y = short axis, where physics.y = -three.z.
// ─────────────────────────────────────────────────────────────────────────────

import { CLOTH_LENGTH, CLOTH_WIDTH } from '@/global/constants.js';
import { POCKET_POSITIONS, POCKET_GAP, RAIL_WIDTH, POCKET_RADIUS, RAIL_HEIGHT } from '@/render/objects/createTable.js';

// The real drawn cushion height — a ball whose bottom clears this can fly
// over the rail instead of bouncing off it (jump shots).
export const CUSHION_HEIGHT = RAIL_HEIGHT;

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
// radius is the real drawn pocket radius — single source of truth for both
// the visual mouth and the capture test.
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
 * if none — either clear of every rail, or inside a pocket-mouth gap.
 * Range and penetration are checked together for each wall so a wall on the
 * far side of the table can never be matched by mistake.
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
 * True once the ball has passed beyond the cloth boundary.
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