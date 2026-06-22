import * as vec3 from '../math/Vector3';

const contactRadius = vec3.create();
const omegaCrossR = vec3.create();

/** Rolling resistance + spin damping + gentle alignment toward pure rolling. */
export function applyRollingResistance(ball, surface, dt) {
  const speed = Math.hypot(ball.velocity.x, ball.velocity.y);
  const r = ball.radius;

  if (speed > 1e-8) {
    const decel = surface.muRolling * surface.gravity * dt;
    const newSpeed = Math.max(0, speed - decel);
    const scale = newSpeed / speed;
    ball.velocity.x *= scale;
    ball.velocity.y *= scale;
  } else {
    ball.velocity.x = 0;
    ball.velocity.y = 0;
  }

  const damp = Math.max(0, 1 - surface.spinDamping * dt);
  ball.angularVelocity.x *= damp;
  ball.angularVelocity.y *= damp;
  ball.angularVelocity.z *= damp;

  vec3.set(contactRadius, 0, 0, -r);
  vec3.cross(omegaCrossR, ball.angularVelocity, contactRadius);

  const residualSlipX = ball.velocity.x + omegaCrossR.x;
  const residualSlipY = ball.velocity.y + omegaCrossR.y;
  const alignStrength = 8 * dt;

  ball.angularVelocity.x += residualSlipY / r * alignStrength;
  ball.angularVelocity.y -= residualSlipX / r * alignStrength;
}
