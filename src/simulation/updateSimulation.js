import { integrateMotion, integrateOrientation } from '../physics/systems/motion';
import { applyForces, settleBall }               from '../physics/systems/forces';
import {
  resolveFloorCollision,
  resolveCushionCollision,
  resolvePocketCapture,
  resolveBallCollisions,
  resolveJumpedBall,
} from '../physics/systems/collisions';

export function updateSimulation({ world, surface, dt }) {
  // 1. per-ball forces + motion
  for (const ball of world.balls) {
    if (ball.pocketed || ball.jumpedOff) continue;

    applyForces(ball, surface, dt);

    const speed = Math.hypot(ball.velocity.x, ball.velocity.y);
    ball.distanceTraveled += speed * dt;

    integrateMotion(ball, dt);
    integrateOrientation(ball, dt);

    resolveFloorCollision(ball);
    resolveCushionCollision(ball);
    resolvePocketCapture(ball);
    resolveJumpedBall(ball);
    settleBall(ball);
  }

  // 2. ball-to-ball (after all positions updated)
  resolveBallCollisions(world.balls);
}