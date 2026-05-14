import * as vec2 from '../math/Vector2';

// x += v * dt (delta time) 
export function integrateMotion(ball, dt) {
  vec2.addScaled(
    ball.position,
    ball.position,
    ball.velocity,
    dt
  );
}