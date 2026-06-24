import { PHYSICS, TABLE } from '@/config/constants';

export function resolveTableCollisions(ball) {
  const r = ball.radius;
  const e = PHYSICS.railRestitution;

  const maxX = TABLE.width / 2;
  const minX = -TABLE.width / 2;
  const maxY = TABLE.height / 2;
  const minY = -TABLE.height / 2;

  if (ball.position.x + r > maxX) {
    ball.position.x = maxX - r;
    ball.velocity.x *= -e;
  }

  if (ball.position.x - r < minX) {
    ball.position.x = minX + r;
    ball.velocity.x *= -e;
  }

  if (ball.position.y + r > maxY) {
    ball.position.y = maxY - r;
    ball.velocity.y *= -e;
  }

  if (ball.position.y - r < minY) {
    ball.position.y = minY + r;
    ball.velocity.y *= -e;
  }
}
