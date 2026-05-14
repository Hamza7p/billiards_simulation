/**
 *  2D vector .
 */

export function create(x = 0, y = 0) {
  return { x, y };
}

export function clone(v) {
  return { x: v.x, y: v.y };
}

export function copy(out, v) {
  out.x = v.x;
  out.y = v.y;
  return out;
}

export function set(out, x, y) {
  out.x = x;
  out.y = y;
  return out;
}

export function add(out, a, b) {
  out.x = a.x + b.x;
  out.y = a.y + b.y;
  return out;
}

export function sub(out, a, b) {
  out.x = a.x - b.x;
  out.y = a.y - b.y;
  return out;
}

export function scale(out, v, s) {
  out.x = v.x * s;
  out.y = v.y * s;
  return out;
}

export function addScaled(out, a, b, s) {
  out.x = a.x + b.x * s;
  out.y = a.y + b.y * s;
  return out;
}

export function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

export function lengthSq(v) {
  return v.x * v.x + v.y * v.y;
}

export function length(v) {
  return Math.hypot(v.x, v.y);
}

export function normalize(out, v) {
  const len = length(v);
  if (len < 1e-20) { // 1e-20 = 0.00000000000000000001 , check for near-zero length to avoid division by zero
    out.x = 0;
    out.y = 0;
    return out;
  }
  const inv = 1 / len; // multiply is faster than divide, so we compute the inverse of the length once and then multiply
  out.x = v.x * inv;
  out.y = v.y * inv;
  return out;
}
