import { integrateMotion } from '../physics/systems/motion';
import { applySlidingFriction } from '../physics/systems/friction';
import * as vec2 from '@/physics/math/Vector2';

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

    // calc distance traveled for each ball 
    const speed = vec2.length(ball.velocity);
    ball.distanceTraveled += speed * dt;

    integrateMotion(
      ball,
      dt
    );
  }
}