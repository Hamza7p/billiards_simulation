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
  ball.orientation.x += ball.angularVelocity.x * dt;
  ball.orientation.y += ball.angularVelocity.y * dt;
  ball.orientation.z += ball.angularVelocity.z * dt;
}
