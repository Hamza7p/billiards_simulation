import { integrateMotion, integrateOrientation } from '../physics/systems/motion';
import { applyForces, settleBall }               from '../physics/systems/forces';
import { resolveBallCollisions } from '@/physics/systems/ballCollisions';
import {
  resolveFloorCollision,
  resolveCushionCollision,
  resolvePocketCapture,
  resolveJumpedBall,
} from '../physics/systems/collisions';

export function updateSimulation({ world, surface, dt, controls }) {
  // 1. per-ball forces + motion
  for (const ball of world.balls) {
    if (ball.pocketed || ball.jumpedOff) continue;

    applyForces(ball, surface, dt);

    const speed = Math.hypot(ball.velocity.x, ball.velocity.y);
    ball.distanceTraveled += speed * dt;

    integrateMotion(ball, dt);
    integrateOrientation(ball, dt);

    resolveFloorCollision(ball, controls.eFloor);
    resolveCushionCollision(ball, controls.eCushion);
    resolvePocketCapture(ball);
    resolveJumpedBall(ball);
    settleBall(ball);
  }

  // 2. ball-to-ball (after all positions updated)
  resolveBallCollisions(world.balls, controls?.eBall ?? 0.93);
}