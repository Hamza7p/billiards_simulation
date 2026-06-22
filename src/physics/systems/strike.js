import * as vec3 from '../math/Vector3';

const forward = vec3.create();
const right = vec3.create();
const up = vec3.create();
const impulseDir = vec3.create();
const baseContact = vec3.create();
const tangentOffset = vec3.create();
const contactOffset = vec3.create();
const impulse = vec3.create();

/**
 * Compute cue strike impulse and contact offset from aim, elevation, and contact point.
 * @returns {{ impulse: object, contactOffset: object, cueDirection: object }}
 */
export function computeStrike(ball, controls) {
  const aimRad = controls.aimDeg * Math.PI / 180;
  const elevRad = controls.cueElevDeg * Math.PI / 180;
  const r = ball.radius;

  vec3.set(forward, Math.cos(aimRad), Math.sin(aimRad), 0);
  vec3.set(up, 0, 0, 1);
  vec3.cross(right, forward, up);
  vec3.normalize(right, right);

  // Impulse direction: cue pushes ball along aim, modulated by elevation
  vec3.set(
    impulseDir,
    Math.cos(elevRad) * forward.x,
    Math.cos(elevRad) * forward.y,
    -Math.sin(elevRad)
  );
  vec3.normalize(impulseDir, impulseDir);

  // Contact point on sphere surface (local offsets: x=side, y=follow/draw, z=height)
  vec3.copy(baseContact, impulseDir);
  vec3.scale(baseContact, baseContact, r);

  vec3.zero(tangentOffset);
  vec3.addScaled(tangentOffset, tangentOffset, right, controls.contactX * r * 0.85);
  vec3.addScaled(tangentOffset, tangentOffset, forward, controls.contactY * r * 0.85);
  vec3.addScaled(tangentOffset, tangentOffset, up, controls.contactZ * r * 0.85);

  vec3.add(contactOffset, baseContact, tangentOffset);
  vec3.normalize(contactOffset, contactOffset);
  vec3.scale(contactOffset, contactOffset, r);

  vec3.scale(impulse, impulseDir, controls.shotImpulse);

  return {
    impulse,
    contactOffset,
    cueDirection: vec3.clone(impulseDir),
  };
}
