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