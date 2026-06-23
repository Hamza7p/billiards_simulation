import * as vec3 from '../math/Vector3';

/**
 * Compute cue strike impulse and contact offset from aim, elevation, and contact point.
 * @returns {{ impulse: object, contactOffset: object, cueDirection: object }}
 */
export function computeStrike(ball, controls) {
  const θ = controls.aimDeg * Math.PI / 180;
  const φ = controls.cueElevDeg * Math.PI / 180;
  const R = ball.radius;
  const J = controls.shotImpulse;

  const d = vec3.create(
    Math.cos(φ) * Math.cos(θ),
    Math.cos(φ) * Math.sin(θ),
    Math.sin(φ),
  );

  const impulse = vec3.create();
  vec3.scale(impulse, d, J);

  const worldUp = vec3.create(0, 0, 1);

  const side = vec3.create();
  vec3.cross(side, d, worldUp);
  vec3.normalize(side, side);

  const upCue = vec3.create();
  vec3.cross(upCue, side, d);
  vec3.normalize(upCue, upCue);

  let a = controls.contactX;
  let b = controls.contactY;

  const mag = Math.sqrt(a*a + b*b);

  if (mag > 1) {
    a /= mag;
    b /= mag;
  }

  const c = Math.sqrt(Math.max(0, 1 - a*a - b*b));

  const r = vec3.create();
  vec3.addScaled(r, r, d, -c*R);
  vec3.addScaled(r, r, side, a*R);
  vec3.addScaled(r, r, upCue, b*R);

  return {impulse, r};
}