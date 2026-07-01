import * as vec3 from '../math/Vector3';
import calculateInertia from '../metrics/inertia';

export function applyImpulse(ball, j, rc) {
  const invI = 1 / calculateInertia(ball.mass, ball.radius);

  const torque = vec3.create();
  vec3.cross(torque, rc, j);

  vec3.addScaled(ball.velocity, ball.velocity, j, 1 / ball.mass);
  vec3.addScaled(ball.angularVelocity, ball.angularVelocity, torque, invI);
}

export function computeContactVelocity(ball, rc) {
  const wrc = vec3.create();
  vec3.cross(wrc, ball.angularVelocity, rc);

  const vc = vec3.create();
  vec3.add(vc, ball.velocity, wrc);

  return vc;
}

export function mergeImpulse(jn, n, jt, t) {
  const j = vec3.create();
  vec3.scale(j, n, jn);
  vec3.addScaled(j, j, t, jt);
  return j;
}

export function computeContactDirections(vc, n) {
  const vn = vec3.create();
  const vt = vec3.create();
  const t = vec3.create();

  vec3.scale(vn, n, vec3.dot(vc, n));
  vec3.sub(vt, vc, vn);

  vec3.normalize(t, vt);
  vec3.negate(t, t);

  return { vt, t };
}