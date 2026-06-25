import { Quaternion } from 'three';
import * as vec3 from '../math/Vector3';

export function integrateMotion(ball, dt) {
  vec3.addScaled(
    ball.position,
    ball.position,
    ball.velocity,
    dt
  );
}

export function integrateOrientation(ball, dt) {
  const omegaLength = vec3.length(ball.angularVelocity);

  if (omegaLength < 0.0001) return;

  const θ = omegaLength * dt;
  const axis = vec3.create();
  vec3.normalize(axis, ball.angularVelocity);

  const dq = new Quaternion().setFromAxisAngle(axis, θ);

  ball.orientation.premultiply(dq);
  ball.orientation.normalize();
}
