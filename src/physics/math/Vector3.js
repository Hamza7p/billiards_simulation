/**
 * 3D vector
 */

export function create(x = 0, y = 0, z = 0) {
  return { x, y, z };
}

export function clone(v) {
  return { x: v.x, y: v.y, z: v.z };
}

export function copy(out, v) {
  out.x = v.x;
  out.y = v.y;
  out.z = v.z;
  return out;
}

export function set(out, x, y, z) {
  out.x = x;
  out.y = y;
  out.z = z;
  return out;
}

export function add(out, a, b) {
  out.x = a.x + b.x;
  out.y = a.y + b.y;
  out.z = a.z + b.z;
  return out;
}

export function sub(out, a, b) {
  out.x = a.x - b.x;
  out.y = a.y - b.y;
  out.z = a.z - b.z;
  return out;
}

export function scale(out, v, s) {
  out.x = v.x * s;
  out.y = v.y * s;
  out.z = v.z * s;
  return out;
}

export function addScaled(out, a, b, s) {
  out.x = a.x + b.x * s;
  out.y = a.y + b.y * s;
  out.z = a.z + b.z * s;
  return out;
}

export function negate(out, v) {
  out.x = -v.x;
  out.y = -v.y;
  out.z = -v.z;
  return out;
}

export function dot(a, b) {
  return (
    a.x * b.x +
    a.y * b.y +
    a.z * b.z
  );
}

export function cross(out, a, b) {
  const ax = a.x;
  const ay = a.y;
  const az = a.z;

  const bx = b.x;
  const by = b.y;
  const bz = b.z;

  out.x = ay * bz - az * by;
  out.y = az * bx - ax * bz;
  out.z = ax * by - ay * bx;

  return out;
}

export function lengthSq(v) {
  return (
    v.x * v.x +
    v.y * v.y +
    v.z * v.z
  );
}

export function length(v) {
  return Math.hypot(
    v.x,
    v.y,
    v.z
  );
}

export function distanceSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;

  return (
    dx * dx +
    dy * dy +
    dz * dz
  );
}

export function distance(a, b) {
  return Math.sqrt(
    distanceSq(a, b)
  );
}

export function normalize(out, v) {
  const len = length(v);

  if (len < 1e-20) {
    out.x = 0;
    out.y = 0;
    out.z = 0;
    return out;
  }

  const inv = 1 / len;

  out.x = v.x * inv;
  out.y = v.y * inv;
  out.z = v.z * inv;

  return out;
}

export function equals(a, b, eps = 1e-8) {
  return (
    Math.abs(a.x - b.x) < eps &&
    Math.abs(a.y - b.y) < eps &&
    Math.abs(a.z - b.z) < eps
  );
}

export function zero(out) {
  out.x = 0;
  out.y = 0;
  out.z = 0;
  return out;
}

export function isZero(v, eps = 1e-8) {
  return lengthSq(v) < eps * eps;
}