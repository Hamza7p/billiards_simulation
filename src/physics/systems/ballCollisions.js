import * as vec3 from '../math/Vector3';
import { 
    computeContactVelocity,
    computeContactDirections,
    applyImpulse,
    mergeImpulse,
} from '@/physics/systems/helpers';

export function resolveBallCollisions(balls) {
  const pending = balls.map(() => []);

  for (let i = 0; i < balls.length; i++) {
    if (balls[i].pocketed) continue;

    for (let j = i + 1; j < balls.length; j++) {
      if (balls[j].pocketed) continue;

      const collision = _resolvePair(balls[i], balls[j]);

      if (!collision) continue;

      const { j1, rc1, j2, rc2 } = collision;

      pending[i].push({j: j1, rc: rc1});
      pending[j].push({j: j2, rc: rc2});
    }
  }

  for (let i = 0; i < balls.length; i++)
    for (const impulse of pending[i])
      applyImpulse(balls[i], impulse.j, impulse.rc);
}

function _resolvePair(ball1, ball2) {
  const R = ball1.radius;
  const m = ball1.mass;
  const e = 0.93;
  const mu = 0.2;

  const n = vec3.create();
  if (!_detectBallsContact(ball1, ball2, n)) return;

  const rc1 = vec3.create();
  const rc2 = vec3.create();

  vec3.scale(rc1, n, R);
  vec3.scale(rc2, n, -R);

  const vc1 = computeContactVelocity(ball1, rc1);
  const vc2 = computeContactVelocity(ball2, rc2);
  
  const vc = vec3.create();
  vec3.sub(vc, vc1, vc2);

  const { vt, t } = computeContactDirections(vc, n);

  const jn = 0.5 * m * (1 + e) * vec3.dot(vc, n);
  const jt = Math.min(Math.abs(jn) * mu, 1/7 * m * vec3.length(vt));
  const j1 = mergeImpulse(-jn, n, -jt, t);
  const j2 = mergeImpulse(jn, n, jt, t);

  return {j1, rc1, j2, rc2};
}


function _detectBallsContact(ball1, ball2, n) {
  const d = vec3.create();
  vec3.sub(d, ball2.position, ball1.position);

  const dist = vec3.length(d);
  const minDist = 2 * ball1.radius;

  if (dist >= minDist) return false;

  vec3.normalize(n, d);

  const overlap = vec3.create();
  vec3.scale(overlap, n, (minDist - dist) / 2);

  vec3.sub(ball1.position, ball1.position, overlap);
  vec3.add(ball2.position, ball2.position, overlap);

  return true;
}