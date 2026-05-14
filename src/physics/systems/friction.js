import * as vec2 from '../math/Vector2';

const temp = vec2.create();

export function applySlidingFriction(ball, surface, dt) {
  const speed = vec2.length(ball.velocity);

  if (speed < 1e-5) {
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    return;
  }

  // get direction of velocity
  vec2.normalize(temp, ball.velocity);

  // sliding friction opposite to motion
  temp.x *= -1;
  temp.y *= -1;

  // F = μmg
  const frictionForce = surface.muSliding * ball.mass * surface.gravity;

  // a = F/m
  const deceleration = frictionForce / ball.mass;

  // Δv = a * dt (delta time)
  const deltaSpeed = deceleration * dt;

  // prevent reversing direction
  const nextSpeed = Math.max(0, speed - deltaSpeed);

  vec2.scale(
    ball.velocity,
    temp,
    nextSpeed
  );

  // restore correct direction
  ball.velocity.x *= -1;
  ball.velocity.y *= -1;
}