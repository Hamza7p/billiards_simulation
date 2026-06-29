import { integrateMotion, integrateOrientation } from '../physics/systems/motion';
import { applyForces, settleBall } from '../physics/systems/forces';
import { resolveFloorCollision, resolveCushionCollision } from '../physics/systems/collisions';

export function updateSimulation({ world, surface, dt }) {
  for (const ball of world.balls) {
    applyForces(ball, surface, dt);

    const speed = Math.hypot(ball.velocity.x, ball.velocity.y);
    ball.distanceTraveled += speed * dt;

    integrateMotion(ball, dt);
    integrateOrientation(ball, dt);

    resolveFloorCollision(ball);
    resolveCushionCollision(ball);

    settleBall(ball);
  }
}
