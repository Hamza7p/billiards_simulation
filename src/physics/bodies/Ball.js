
import { BALL, START_POINT } from '@/config/constants.js';
import * as vec2 from '../math/Vector2.js';

/** options
 * @param {object} [opts]
 */
export const Ball = ( opts = {}) => ({
        mass:   opts.mass ?? BALL.mass,
        radius: opts.radius ?? BALL.radius,
        position: opts.position != null ? vec2.clone(opts.position) : vec2.create(START_POINT.x, START_POINT.y),
        velocity: opts.velocity != null ? vec2.clone(opts.velocity) : vec2.create(0, 0),
        angularVelocity: { x: 0, y: 0, z: 0 },
        force: vec2.create(0, 0),
        distanceTraveled: 0,
    }
);