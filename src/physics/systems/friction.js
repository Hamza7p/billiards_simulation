import * as vec3 from '../math/Vector3';
import calculateInertia from '../metrics/inertia';
import { PHYSICS } from '@/config/constants';
import { applyRollingResistance } from './rolling';

const contactRadius = vec3.create();
const omegaCrossR = vec3.create();
const frictionImpulse = vec3.create();
const torque = vec3.create();

export function applyFriction(ball, surface, dt) {
  const r = ball.radius;
  const I = calculateInertia(ball.mass, r);
  const invI = 1 / I;
  const invMass = 1 / ball.mass;
  const eps = PHYSICS.slipThreshold;

  vec3.set(contactRadius, 0, 0, -r);
  vec3.cross(omegaCrossR, ball.angularVelocity, contactRadius);

  const slipX = ball.velocity.x + omegaCrossR.x;
  const slipY = ball.velocity.y + omegaCrossR.y;
  const slipSpeed = Math.hypot(slipX, slipY);

  if (slipSpeed > eps) {
    const maxImpulse = surface.muSliding * ball.mass * surface.gravity * dt;
    const slipHatX = slipX / slipSpeed;
    const slipHatY = slipY / slipSpeed;
    const impulseMag = Math.min(maxImpulse, ball.mass * slipSpeed);

    vec3.set(
      frictionImpulse,
      -slipHatX * impulseMag,
      -slipHatY * impulseMag,
      0
    );

    vec3.addScaled(ball.velocity, ball.velocity, frictionImpulse, invMass);

    vec3.cross(torque, contactRadius, frictionImpulse);
    ball.angularVelocity.x += torque.x * invI;
    ball.angularVelocity.y += torque.y * invI;
    ball.angularVelocity.z += torque.z * invI;
  } else {
    applyRollingResistance(ball, surface, dt);
  }
}

export function settleBall(ball) {
  const speed = Math.hypot(ball.velocity.x, ball.velocity.y);
  const spin = vec3.length(ball.angularVelocity);

  if (speed < PHYSICS.stopSpeed && spin < PHYSICS.stopAngular) {
    vec3.zero(ball.velocity);
    vec3.zero(ball.angularVelocity);
  }
}
