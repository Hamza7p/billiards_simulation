import { integrateMotion } from '../physics/systems/motion';
import { applySlidingFriction } from '../physics/systems/friction';

export function updateSimulation({
  world,
  surface,
  dt,
}) {
  for (const ball of world.balls) {
    applySlidingFriction(
      ball,
      surface,
      dt
    );

    integrateMotion(
      ball,
      dt
    );
  }
}