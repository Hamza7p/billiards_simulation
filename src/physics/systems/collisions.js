import * as vec3 from '../math/Vector3';
import { PHYSICS, TABLE } from '@/config/constants';
import { computeContactVelocity, applyImpulse } from '@/physics/systems/helpers';

export function resolveFloorCollision(ball) {
  if (ball.position.z >= 0) return;

  ball.position.z = 0;

  if (Math.abs(ball.velocity.z) < 0.1)
    ball.velocity.z = 0;

  else if (ball.velocity.z < 0) {
    const e = 0.3;
    ball.velocity.z *= -e;
  }
}

export function resolveCushionCollision(ball) {
  const R = ball.radius;
  const m = ball.mass;
  const e = PHYSICS.railRestitution;
  const mu = 0.2;

  const n = vec3.create();
  const t = vec3.create();

  if (!detectCushionContact(ball, n))
    return;
  
  n.z = 0.1;
  vec3.normalize(n, n);

  const rc = vec3.create();
  vec3.scale(rc, n, R);

  const vc = computeContactVelocity(ball, rc);
  const vn = vec3.create();
  const vt = vec3.create();

  vec3.scale(vn, n, vec3.dot(vc, n));
  vec3.sub(vt, vc, vn);

  vec3.normalize(t, vt);
  vec3.negate(t, t);

  const jn = -m * (1 + e) * vec3.dot(vc, n);
  const jt = Math.min(Math.abs(jn) * mu, 2/7 * m * vec3.length(vt));
  const j = mergeImpulse(jn, n, jt, t);

  applyImpulse(ball, j, rc);
}

function detectCushionContact(ball, n) {
  const R = ball.radius;
  const p = ball.position;
  
  const halfLength = TABLE.length / 2;
  const halfWidth = TABLE.width / 2;

  if (p.x + R > halfLength) {
    n.x = -1;
    p.x = halfLength - R;
    return true;
  }
  if (p.x - R < -halfLength) {
    n.x = 1;
    p.x = -halfLength + R;
    return true;
  }
  if (p.y + R > halfWidth) {
    n.y = -1; 
    p.y = halfWidth - R;
    return true;
  }
  if (p.y - R < -halfWidth) {
    n.y = 1;
    p.y = -halfWidth + R;
    return true;
  }

  return false;
}

function mergeImpulse(jn, n, jt, t) {
  const j = vec3.create();
  vec3.scale(j, n, jn);
  vec3.addScaled(j, j, t, jt);
  return j;
}
