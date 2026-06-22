import { integrateMotion, integrateOrientation } from '../physics/systems/motion';
import { applyFriction, settleBall } from '../physics/systems/friction';
import { resolveTableCollisions } from '../physics/systems/collisions';

export function updateSimulation({ world, surface, dt }) {
  for (const ball of world.balls) {
    applyFriction(ball, surface, dt);

    const speed = Math.hypot(ball.velocity.x, ball.velocity.y);
    ball.distanceTraveled += speed * dt;

    integrateMotion(ball, dt);
    integrateOrientation(ball, dt);

    resolveTableCollisions(ball);

    settleBall(ball);
  }
}
