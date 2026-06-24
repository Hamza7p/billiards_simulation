import * as vec3 from '../math/Vector3';
import { PHYSICS } from '@/config/constants';

export function applyFriction(ball, surface, dt) {
  const vc = computeContactVelocity(ball);
  const g = surface.gravity;
  const direction = vec3.create();

  const slipSpeed = vec3.length(vc);

  // Sliding
  if (slipSpeed > PHYSICS.slipThreshold) {
    vec3.normalize(direction, vc);
    updateVelocity(ball, g, surface.muSliding, direction, dt);
    updateAngularVelocity(ball, g, surface.muSliding, direction, dt);
  }

  // Rolling
  else {
    vec3.normalize(direction, ball.velocity);
    updateVelocity(ball, g, surface.muRolling, direction, dt);
    ball.angularVelocity.x = -ball.velocity.y / ball.radius;
    ball.angularVelocity.y = ball.velocity.x / ball.radius;
  }

  // Side Spin
  ball.angularVelocity.z *= 1 - surface.spinDamping;
}

function computeContactVelocity(ball) {
  const rc = vec3.create(0, 0, -ball.radius);

  const wrc = vec3.create();
  vec3.cross(wrc, ball.angularVelocity, rc);

  const vc = vec3.create();
  vec3.add(vc, ball.velocity, wrc);

  return vc;
}

export function updateVelocity(ball, g, mu, direction, dt) {
  const acceleration = vec3.create();
  vec3.scale(acceleration, direction, -mu * g);

  vec3.addScaled(ball.velocity, ball.velocity, acceleration, dt);
}

export function updateAngularVelocity(ball, g, mu, direction, dt) {
  const R = ball.radius;
  const rc = vec3.create(0, 0, -R);

  const rcs = vec3.create();
  vec3.cross(rcs, rc, direction);

  const angularAcc = vec3.create();
  vec3.scale(angularAcc, rcs, (-5 * mu * g) / (2 * R * R));

  vec3.addScaled(ball.angularVelocity, ball.angularVelocity, angularAcc, dt);
}

export function settleBall(ball) {
  const speed = vec3.length(ball.velocity);
  const spin = vec3.length(ball.angularVelocity);

  if (speed < PHYSICS.stopSpeed)
    vec3.zero(ball.velocity);

  if (spin < PHYSICS.stopAngular)
    vec3.zero(ball.angularVelocity);

  else if (Math.abs(ball.angularVelocity.z) < PHYSICS.stopAngular)
    ball.angularVelocity.z = 0;
}
