import * as vec3 from '../math/Vector3';
import calculateInertia from './inertia';
import { BALL, START_POINT, SURFACE } from '@/config/constants';

const contactRadius = vec3.create();
const omegaCrossR = vec3.create();

function slipSpeed(ball) {
  vec3.set(contactRadius, 0, 0, -ball.radius);
  vec3.cross(omegaCrossR, ball.angularVelocity, contactRadius);
  return Math.hypot(
    ball.velocity.x + omegaCrossR.x,
    ball.velocity.y + omegaCrossR.y
  );
}

export function calculateMetrics({ ball, surface, simulationTime }) {
  const speed = Math.hypot(ball.velocity.x, ball.velocity.y);
  const spin = vec3.length(ball.angularVelocity);
  const slip = slipSpeed(ball);
  const I = calculateInertia(ball.mass, ball.radius);

  const momentum = ball.mass * speed;
  const kineticEnergy = 0.5 * ball.mass * speed * speed;
  const rotationalEnergy = 0.5 * I * spin * spin;
  const frictionForce = surface.muSliding * ball.mass * surface.gravity;

  return {
    speed,
    spin,
    slipSpeed: slip,
    momentum,
    kineticEnergy,
    rotationalEnergy,
    frictionForce,
    acceleration: frictionForce / ball.mass,
    distanceTraveled: ball.distanceTraveled ?? 0,
    simulationTime,
    position: {
      x: ball.position.x,
      y: ball.position.y,
      z: ball.position.z,
    },
  };
}

export function initialMetrics() {
  const frictionForce =
    (SURFACE.muSliding ?? 0) *
    (SURFACE.gravity ?? 0) *
    (BALL.mass ?? 0);

  return {
    speed: 0,
    spin: 0,
    slipSpeed: 0,
    momentum: 0,
    kineticEnergy: 0,
    rotationalEnergy: 0,
    frictionForce,
    acceleration: frictionForce / (BALL.mass ?? 1),
    distanceTraveled: 0,
    simulationTime: 0,
    position: {
      x: START_POINT.x,
      y: START_POINT.y,
      z: START_POINT.z,
    },
  };
}
