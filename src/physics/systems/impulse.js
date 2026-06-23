import * as vec3 from '../math/Vector3';
import calculateInertia from '../metrics/inertia';

const torque = vec3.create();

/** Δv = J/m, Δω = (r × J) / I */
export function applyImpulseAtContact(ball, impulse, contactOffset) {
  const invMass = 1 / ball.mass;
  const invI = 1 / calculateInertia(ball.mass, ball.radius);

  vec3.addScaled(ball.velocity, ball.velocity, impulse, invMass);

  vec3.cross(torque, contactOffset, impulse);
  vec3.addScaled(ball.angularVelocity, ball.angularVelocity, torque, invI);
}
