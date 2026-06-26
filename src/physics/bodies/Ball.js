
/*import { BALL, START_POINT } from '@/config/constants.js';
import * as vec2 from '../math/Vector2.js';
*/
/** options
 * @param {object} [opts]
 

////**** */
import * as vec3 from '../math/Vector3.js';  // بدلاً من vec2
import { BALL, START_POINT } from '@/config/constants.js';

export const Ball = (opts = {}) => ({
  mass: opts.mass ?? BALL.mass,
  radius: opts.radius ?? BALL.radius,
  position: opts.position != null ? vec3.clone(opts.position) : vec3.create(START_POINT.x, START_POINT.y, 0),
  velocity: opts.velocity != null ? vec3.clone(opts.velocity) : vec3.create(0, 0, 0),
  angularVelocity: { x: 0, y: 0, z: 0 },
  force: vec3.create(0, 0, 0),
});