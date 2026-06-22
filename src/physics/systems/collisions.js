import { PHYSICS, TABLE } from '@/config/constants';

export function resolveTableCollisions(ball) {
  const r = ball.radius;
  const e = PHYSICS.railRestitution;

  if (ball.position.x + r > TABLE.maxX) {
    ball.position.x = TABLE.maxX - r;
    ball.velocity.x *= -e;
  }

  if (ball.position.x - r < TABLE.minX) {
    ball.position.x = TABLE.minX + r;
    ball.velocity.x *= -e;
  }

  if (ball.position.y + r > TABLE.maxY) {
    ball.position.y = TABLE.maxY - r;
    ball.velocity.y *= -e;
  }

  if (ball.position.y - r < TABLE.minY) {
    ball.position.y = TABLE.minY + r;
    ball.velocity.y *= -e;
  }
}
