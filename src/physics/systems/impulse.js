import * as vec2 from '../math/Vector2';

// Δv = J / m
export function applyImpulse(ball, impulse) {
  vec2.addScaled(
    ball.velocity,
    ball.velocity,
    impulse,
    1 / ball.mass
  );
}