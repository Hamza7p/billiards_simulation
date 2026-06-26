import * as vec3 from '../math/Vector3.js';

// Δv = J / m
export function applyImpulse(ball, impulse) {
  vec3.addScaled(
    ball.velocity,
    ball.velocity,
    impulse,
    1 / ball.mass
  );
}
//  هي كودي انا سارة